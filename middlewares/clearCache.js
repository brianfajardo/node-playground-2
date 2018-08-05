const { clearCache } = require('../services/cache')

// clearCache should be ran AFTER a route is done doing its work.
// We make this middleware an async/await function to delay it from being invoked
// before the route is done doing work.

// The async/await allows us to handle the case where the request handler has asynchronous
// code inside of it.

// Example: User adds a new blog post. We do not want the clearCache middleware to be invoked
// before the route is called. We want to delay the clearing of cache until after
// the new data is saved to the database.

module.exports = async (req, res, next) => {
  await next()
  clearCache(req.user.id)
}
