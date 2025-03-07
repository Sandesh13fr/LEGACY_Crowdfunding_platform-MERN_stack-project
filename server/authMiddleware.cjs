const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { MongoClient, ObjectId } = require('mongodb');
const http = require('http');
const socketIo = require('socket.io');
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config({ path: './config.env' });

// Validate environment variables
const requiredEnvVars = ['ATLAS_URI', 'JWT_SECRET', 'GOOGLE_CLIENT_ID'];
requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

// Create a new OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "https://legacymd.vercel.app",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors({
  origin: "https://legacymd.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

// MongoDB connection
const client = new MongoClient(process.env.ATLAS_URI);
let dbCollections = {};

async function connectDb() {
  if (!dbCollections.users || !dbCollections.campaigns || !dbCollections.messages) {
    await client.connect();
    dbCollections.users = client.db('User').collection('users'); // Remove the space
    dbCollections.campaigns = client.db('Campaigns').collection('campaigns');
    dbCollections.messages = client.db('User').collection('messages'); // Remove the space
  }
  return dbCollections;
}

// Auth middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Authentication failed' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Authentication failed' });
    req.userId = decoded.userId;
    next();
  });
};

// Setup file upload storage
const uploadPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ storage });
const memoryStorage = multer.memoryStorage();
const uploadMemory = multer({ storage: memoryStorage });

app.use('/uploads', express.static(uploadPath));

// Google auth verification function
async function verifyGoogleToken(token) {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    return ticket.getPayload();
  } catch (error) {
    console.error('Error verifying Google token:', error);
    return null;
  }
}

// **Signup Route**
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const { users } = await connectDb();

    const existingUser  = await users.findOne({ email });
    if (existingUser ) return res.status(400).json({ error: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await users.insertOne({ name, email, password: hashedPassword });

    return res.status(201).json({ message: 'Signup successful' });
  } catch (error) {
    console.error('Error signing up:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// **Signin Route**
app.post('/api/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { users } = await connectDb();

    const user = await users.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

    return res.json({
      message: 'Signin successful',
      token,
      user: {
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture || '',
      },
    });
  } catch (error) {
    console.error('Error signing in:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// **Google Authentication Route**
app.post('/api/google-auth', async (req, res) => {
  try {
    const { credential } = req.body;
    const payload = await verifyGoogleToken(credential);
    if (!payload) return res.status(400).json({ error: 'Invalid Google token' });

    const { email, name, sub: googleId, picture } = payload;
    const { users } = await connectDb();

    let user = await users.findOne({ email });
    if (!user) {
      const newUser  = { googleId, email, name, profilePicture: picture };
      await users.insertOne(newUser );
      user = newUser ;
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

    return res.json({
      message: 'Google authentication successful',
      token,
      user: {
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture || '',
      },
    });
  } catch (error) {
    console.error('Error during Google authentication:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// **Profile Update Route**
app.put('/api/profile/update', authMiddleware, upload.single('profilePicture'), async (req, res) => {
  try {
    const { name, password } = req.body;
    const userId = req.userId;
    const { users } = await connectDb();

    const user = await users.findOne({ _id: new ObjectId(userId) });
    if (!user) return res.status(404).json({ error: 'User  not found' });

    const updateData = {};
    if (name) updateData.name = name;
    if (password) updateData.password = await bcrypt.hash(password, 10);
    if (req.file) updateData.profilePicture = `http://localhost:5000/uploads/${req.file.filename}`;

    await users.updateOne({ _id: new ObjectId(userId) }, { $set: updateData });

    const updatedUser  = await users.findOne({ _id: new ObjectId(userId) });
    return res.json({
      message: 'Profile updated successfully',
      user: {
        name: updatedUser .name,
        email: updatedUser .email,
        profilePicture: updatedUser .profilePicture || '',
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// **Get Profile Route**
app.get('/api/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { users } = await connectDb();

    const user = await users.findOne({ _id: new ObjectId(userId) });
    if (!user) return res.status(404).json({ error: 'User  not found' });

    return res.json({
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture || '',
    });
  } catch (error) {
    console.error('Error getting profile:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// **Create Campaign Route**
app.post('//api/campaigns', authMiddleware, uploadMemory.single('poster'), async (req, res) => {
  try {
    const { title, description, goal, deadline } = req.body;
    const userId = req.userId;
    const { campaigns } = await connectDb();

    if (!title || !description || !goal || !deadline) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime()) || deadlineDate <= new Date()) {
      return res.status(400).json({ error: 'Invalid deadline date' });
    }

    if (!req.file) return res.status(400).json({ error: 'No poster image uploaded' });

    const poster = req.file.buffer.toString('base64');
    const newCampaign = {
      userId: new ObjectId(userId),
      title,
      description,
      goal: parseFloat(goal),
      deadline: deadlineDate,
      poster,
      createdAt: new Date(),
      donations: [],
    };

    await campaigns.insertOne(newCampaign);
    return res.status(201).json({ message: 'Campaign created successfully' });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// **Get Campaigns Route**
app.get('//api/campaigns', async (req, res) => {
  try {
    const { campaigns } = await connectDb();
    const campaignsList = await campaigns.find().toArray();
    return res.json(campaignsList);
  } catch (error) {
    console.error('Error getting campaigns:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// **Delete Campaign Route**
app.delete('//api/campaigns/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { campaigns } = await connectDb();

    const campaign = await campaigns.findOne({ _id: new ObjectId(id), userId: new ObjectId(userId) });
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    await campaigns.deleteOne({ _id: new ObjectId(id), userId: new ObjectId(userId) });
    return res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// **Update Campaign Route**
app.put('//api/campaigns/:id', authMiddleware, uploadMemory.single('poster'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, goal, deadline } = req.body;
    const userId = req.userId;
    const { campaigns } = await connectDb();

    if (!title || !description || !goal || !deadline) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime()) || deadlineDate <= new Date()) {
      return res.status(400).json({ error: 'Invalid deadline date' });
    }

    const campaign = await campaigns.findOne({ _id: new ObjectId(id), userId: new ObjectId(userId) });
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    const updateData = {
      title,
      description,
      goal: parseFloat(goal),
      deadline: deadlineDate,
    };

    if (req.file) {
      const poster = req.file.buffer.toString('base64');
      updateData.poster = poster;
    }

    await campaigns.updateOne({ _id: new ObjectId(id), userId: new ObjectId(userId) }, { $set: updateData });
    return res.json({ message: 'Campaign updated successfully' });
  } catch (error) {
    console.error('Error updating campaign:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// **Donate to Campaign Route**
app.post('//api/campaigns/:id/donate', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    const userId = req.userId;
    const { campaigns } = await connectDb();

    if (!amount) return res.status(400).json({ error: 'Missing required fields' });

    const campaign = await campaigns.findOne({ _id: new ObjectId(id) });
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    const newDonation = {
      userId: new ObjectId(userId),
      amount: parseFloat(amount),
      createdAt: new Date(),
    };

    await campaigns.updateOne({ _id: new ObjectId(id) }, { $push: { donations: newDonation } });
    return res.json({ message: 'Donation successful' });
  } catch (error) {
    console.error('Error donating to campaign:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// **Get Campaign Donations Route**
app.get('//api/campaigns/:id/donations', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { campaigns } = await connectDb();

    const campaign = await campaigns.findOne({ _id: new ObjectId(id), userId: new ObjectId(userId) });
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    return res.json(campaign.donations);
  } catch (error) {
    console.error('Error getting campaign donations:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// **Create Message Route**
app.post('/api/messages', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.userId;
    const { messages } = await connectDb();

    if (!text) return res.status(400).json({ error: 'Missing required fields' });

    const newMessage = {
      userId: new ObjectId(userId),
      text,
      createdAt: new Date(),
    };

    await messages.insertOne(newMessage);
    return res.status(201).json({ message: 'Message created successfully' });
  } catch (error) {
    console.error('Error creating message:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// **Get Messages Route**
// app.get('/api/messages', authMiddleware, async (req, res) => {
//   try {
//     const { messages } = await connectDb();
//     const messagesList = await messages.find().toArray();
//     return res.json(messagesList);
//   } catch (error) {
//     console.error('Error getting messages:', error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// **Socket.IO Connection**
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });

  socket.on('chat message', (msg) => {
    console.log('message: ' + msg);
    io.emit('chat message', msg); // Broadcast the message to all connected clients
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});