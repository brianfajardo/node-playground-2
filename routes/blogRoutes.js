const mongoose = require('mongoose')
const util = require('util')

const requireLogin = require('../middlewares/requireLogin')
const Blog = mongoose.model('Blog')

// Redis
const redis = require('redis')
const redisURL = 'redis://127.0.0.1:6379' // Default URL
const redisClient = redis.createClient(redisURL)

module.exports = app => {
  app.get('/api/blogs/:id', requireLogin, async (req, res) => {
    const blog = await Blog.findOne({
      _user: req.user.id,
      _id: req.params.id
    })

    res.send(blog)
  })

  app.get('/api/blogs', requireLogin, async (req, res) => {
    // Wrapping Redis client.get with util.promisify to return a Promise instead of a callback.
    redisClient.get = util.promisify(redisClient.get)

    // Do we have any cached data in redis related to this query?
    const cachedBlogs = await redisClient.get(req.user.id)

    // If yes, then respond to the request right away from cache and return
    if (cachedBlogs) return res.status(200).send(JSON.parse(cachedBlogs))

    // If not, fetch data from database
    const blogs = await Blog.find({ _user: req.user.id })

    // Respond to the request
    res.status(200).send(blogs)

    // Update our cache
    redisClient.set(req.user.id, JSON.stringify(blogs))
  })

  app.post('/api/blogs', requireLogin, async (req, res) => {
    const { title, content } = req.body

    const blog = new Blog({
      title,
      content,
      _user: req.user.id
    })

    try {
      await blog.save()
      res.send(blog)
    } catch (err) {
      res.send(400, err)
    }
  })
}
