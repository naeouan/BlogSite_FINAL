const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const salt = bcrypt.genSaltSync(10);
const secret = process.env.JWT_SECRET;
const PORT = process.env.PORT || 4000;

// CORS config
const allowedOrigins = ['http://localhost:3000', 'https://blogsite-final.onrender.com'];
app.use(cors({
  credentials: true,
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
}));
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: err.message });
  }
  next(err);
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Upload setup
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use('/uploads', express.static(uploadsDir));
const uploadMiddleware = multer({ dest: 'uploads/' });

// DB connect
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

// Auth middleware
function authMiddleware(req, res, next) {
  const { token } = req.cookies;
  if (!token) return res.status(401).json({ message: 'No token' });

  jwt.verify(token, secret, {}, (err, info) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = info;
    next();
  });
}

// Register
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Missing fields' });

  try {
    const userDoc = await User.create({
      username,
      password: bcrypt.hashSync(password, salt),
    });
    res.status(201).json(userDoc);
  } catch (e) {
    if (e.code === 11000) {
      res.status(400).json({ message: 'Username taken' });
    } else {
      res.status(500).json({ message: 'Error creating user' });
    }
  }
});

// Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const userDoc = await User.findOne({ username });
  if (!userDoc) return res.status(400).json({ message: 'User not found' });

  const passOk = bcrypt.compareSync(password, userDoc.password);
  if (!passOk) return res.status(400).json({ message: 'Wrong credentials' });

  jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
    if (err) throw err;
    res.cookie('token', token, { httpOnly: true }).json({
      id: userDoc._id,
      username,
    });
  });
});

// Profile
app.get('/profile', authMiddleware, (req, res) => {
  res.json(req.user);
});

// Logout
app.post('/logout', (req, res) => {
  res.cookie('token', '', { expires: new Date(0) }).json('ok');
});

// Create post
app.post('/post', authMiddleware, uploadMiddleware.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'File missing' });

    const { originalname, path: filePath } = req.file;
    const ext = originalname.split('.').pop();
    const newPath = `${filePath}.${ext}`;
    fs.renameSync(filePath, newPath);

    const { title, summary, content } = req.body;

    const postDoc = await Post.create({
      title,
      summary,
      content,
      cover: newPath,
      author: req.user.id,
    });
    res.status(201).json(postDoc);
  } catch (e) {
    res.status(500).json({ message: 'Error creating post' });
  }
});

// Update post
app.put('/post', authMiddleware, uploadMiddleware.single('file'), async (req, res) => {
  try {
    const { id, title, summary, content } = req.body;
    const postDoc = await Post.findById(id);
    if (!postDoc) return res.status(404).json({ message: 'Post not found' });

    if (postDoc.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    let newPath = null;
    if (req.file) {
      const { originalname, path: filePath } = req.file;
      const ext = originalname.split('.').pop();
      newPath = `${filePath}.${ext}`;
      fs.renameSync(filePath, newPath);
    }

    postDoc.title = title;
    postDoc.summary = summary;
    postDoc.content = content;
    if (newPath) postDoc.cover = newPath;

    await postDoc.save();
    res.json(postDoc);
  } catch (e) {
    res.status(500).json({ message: 'Error updating post' });
  }
});

// Get all posts
app.get('/post', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', ['username'])
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(posts);
  } catch (e) {
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// Get single post
app.get('/post/:id', async (req, res) => {
  try {
    const postDoc = await Post.findById(req.params.id).populate('author', ['username']);
    if (!postDoc) return res.status(404).json({ message: 'Post not found' });
    res.json(postDoc);
  } catch (e) {
    res.status(500).json({ message: 'Error fetching post' });
  }
});

// Delete post
app.delete('/post/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Not found' });

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not the author' });
    }

    await post.deleteOne();
    res.status(200).json({ message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ message: 'Error deleting post' });
  }
});

// Serve React app (if built)
const reactBuildPath = path.join(__dirname, '..', 'client', 'build');
if (fs.existsSync(reactBuildPath)) {
  app.use(express.static(reactBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(reactBuildPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
