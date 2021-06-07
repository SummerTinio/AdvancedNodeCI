const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');

//use this to clear Redis cache after creating a new blogpost.
// const cleanCache = require('../middlewares/cleanCache').cleanCache;
const { clearHash } = require('../services/cache');

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
    const blogs = await Blog.find({ _user: req.user.id }).cache({ key: req.user.id });
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
    console.log('CLEARING YO HASH!');
    console.log(req.user.id);
    clearHash(req.user.id);
  });
};
