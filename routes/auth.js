const express = require('express');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');  
const router = express.Router();

// Configura multer per il caricamento delle immagini
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads');
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Endpoint per il caricamento delle immagini del profilo
router.post('/upload', upload.single('profileImage'), async (req, res) => {
  try {
    const userId = req.body.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    user.profileImage = `/uploads/${req.file.filename}`;
    await user.save();

    res.status(200).send({ message: 'Profile image uploaded successfully', profileImage: user.profileImage });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).send({ error: 'Error uploading profile image' });
  }
});

// Endpoint per ottenere il profilo utente
router.get('/profile/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }
    res.status(200).send(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).send({ error: 'Error fetching user profile' });
  }
});

// Endpoint per aggiornare il profilo utente
router.put('/profile/:userId', async (req, res) => {
  try {
    const { displayName, email } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    user.displayName = displayName || user.displayName;
    user.email = email || user.email;
    await user.save();

    res.status(200).send({ message: 'User profile updated successfully' });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).send({ error: 'Error updating user profile' });
  }
});

// Registrazione
router.post('/register', async (req, res) => {
  const { username, password, email } = req.body;
  console.log('Registering user:', username);

  try {
    const newUser = new User({
      username,
      password,
      email
    });

    await newUser.save();
    res.status(201).send({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send({ error: 'Error registering user' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('Attempting to login:', username);

  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.log('User not found:', username);
      return res.status(400).send({ error: 'Invalid credentials - user not found' });
    }

    console.log('User found:', user);
    console.log('Provided password:', password);
    console.log('Stored hash:', user.password);

    const isMatch = user.comparePassword(password);
    console.log('Password match (manual):', isMatch);

    if (!isMatch) {
      console.log('Invalid password for user:', username);
      return res.status(400).send({ error: 'Invalid credentials - invalid password' });
    }

    res.status(200).send({ message: 'Login successful', token: 'fake-jwt-token', userId: user._id });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).send({ error: 'Error logging in user' });
  }
});

module.exports = router;
