const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');

const Blog = mongoose.model('Blog');

module.exports = app => {
  app.get('/api/blogs/:id', requireLogin, async (req, res) => {
    const blog = await Blog.findOne({
      _user: req.user.id,
      _id: req.params.id
    });

    res.send(blog);
  });

  // all Redis-instance logic inside route handler
  app.get('/api/blogs', requireLogin, async (req, res) => {
    const redis = require('redis');
    const redisUrl = 'redis://127.0.0.1:6379'
    const client = redis.createClient(redisUrl);

    const util = require('util'); // util fxns from Node native lib -- promisify
    client.get = util.promisify(client.get);

    const cachedBlogs = await client.get(req.user.id)

    // if existing query exists in Redis cache, immediately sends back cached data & returns
    if (cachedBlogs) {  // Data pulled out from Redis is JSON!
      console.log('Serving from Cache! Not touching MongoDB at all.');
      return res.send(JSON.parse(cachedBlogs)); // backend API sends data back as JSON -- no need to parse before sending
    }

    // if query was made for 1st time, finds data from MongoDB, sends it as a response, & caches it in Redis
    // Mongoose Queries like Blog.find( ) will return an array of objects
    const blogs = await Blog.find({ _user: req.user.id }); // query we're gonna cache
    client.set(req.user.id, JSON.stringify(blogs)); // JSON.stringify's data before sending to Redis
    console.log('Serving from MongoDB!');
    res.send(blogs);
  });

  app.post('/api/blogs', requireLogin, async (req, res) => {
    const { title, content } = req.body;

    const blog = new Blog({
      title,
      content,
      _user: req.user.id
    });

    try {
      await blog.save();
      res.send(blog);
    } catch (err) {
      res.send(400, err);
    }
  });
};
