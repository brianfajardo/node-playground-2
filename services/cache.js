const mongoose = require('mongoose')
const util = require('util')
const redis = require('redis')

const redisURL = 'redis://127.0.0.1:6379' // Default URL
const redisClient = redis.createClient(redisURL)

// Wrapping Redis client.hget with util.promisify to return a Promise instead of a callback.
redisClient.hget = util.promisify(redisClient.hget)

// Store reference to the original exec function.
const exec = mongoose.Query.prototype.exec

// Create a chainable and toggleable caching method on the mongoose Query prototype.
mongoose.Query.prototype.cache = function(options = {}) {
  this._cache = true

  if (!options.key) {
    options.key = 'defaultKey'
  }

  this._primaryCacheKey = JSON.stringify(options.key)
  return this
}

// Monkey patching the Mongoose query exec function to extend it with caching 👍
mongoose.Query.prototype.exec = async function() {
  if (!this._cache) {
    // Invoke the default query exec function without caching
    return exec.apply(this, arguments)
  }

  const secondaryCacheKey = getJsonStringCacheKey.call(this)
  const cachedValue = await redisClient.hget(
    this._primaryCacheKey,
    secondaryCacheKey
  )

  if (cachedValue) {
    console.log('Data retrieved from cache')
    return getHydratedMongooseDocs.call(this, cachedValue)
  }

  // If a cached value does not alredy exist, fetch query results from the database and cache it.
  const result = await exec.apply(this, arguments)

  setCache.call(this, secondaryCacheKey, result)

  return result
}

// Create a serialized, unique, and stringified caching key using the query builder and collection name.
function getJsonStringCacheKey() {
  return JSON.stringify({
    ...this.getQuery(),
    collection: this.mongooseCollection.name
  })
}

function getHydratedMongooseDocs(cachedValue) {
  const cacheModel = JSON.parse(cachedValue)
  const mongooseDoc = getMongooseDocument.call(this, cacheModel)
  return mongooseDoc
}

// Cached values may be a single model instance OBJECT or an ARRAY of model objects.
// We need to handle both cases and rehydrate the model (return the cached value(s) as mongoose model(s)).
function getMongooseDocument(cacheModel) {
  const cacheIsArray = Array.isArray(cacheModel)

  if (cacheIsArray) {
    return cacheModel.map(cacheData => new this.model(cacheData))
  } else {
    return new this.model(cacheModel)
  }
}

// Handle setting cache
function setCache(secondaryCacheKey, value, expirationSeconds = 10) {
  redisClient.hset(
    this._primaryCacheKey,
    secondaryCacheKey,
    JSON.stringify(value),
    'EX',
    expirationSeconds
  )
}

// In this project, priamryCacheKey is the req.user.id for convenience
function clearCache(primaryCacheKey) {
  redisClient.del(JSON.stringify(primaryCacheKey))
  console.log(`cleared cache of primaryCacheKey: ${primaryCacheKey}`)
}

module.exports = {
  clearCache
}
