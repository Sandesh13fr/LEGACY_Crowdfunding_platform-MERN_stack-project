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

// Create a new OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "https://legacymd.vercel.app", // Update this to match your Vite frontend URL
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors({
  origin: "https://legacymd.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add these headers for Cross-Origin isolation
app.use((req, res, next) => {
  res.header('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.header('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});
app.use(express.json());

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Server</title>
        <style>
          body { font-family: Arial, sans-serif; background: #f9f9f9; padding: 20px; }
          h1 { color: green; }
          p { color: #333; }
        </style>
      </head>
      <body>
        <h1>Server is running on port ${process.env.PORT || 5000}</h1>
        <p>No errors reported.</p>
        <p>Notes: ${process.env.NOTES || 'None'}</p>
      </body>
    </html>
  `);
});

// MongoDB connection
const Db = process.env.ATLAS_URI; // MongoDB connection string
const client = new MongoClient(Db);

// Connect to MongoDB once and reuse the connection
let usersCollection, campaignsCollection, messagesCollection;
async function connectDb() {
  if (!usersCollection || !campaignsCollection || !messagesCollection) {
    await client.connect();
    usersCollection = client.db('User').collection('users');
    campaignsCollection = client.db('Campaigns').collection('campaigns');
    messagesCollection = client.db('User').collection('messages');
  }
  return { usersCollection, campaignsCollection, messagesCollection };
}

// Auth middleware
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Authentication failed' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

// Setup file upload storage
// Create uploads directory if it doesn't exist
const uploadPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

// Set up storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

// Memory storage for campaign poster images
const memoryStorage = multer.memoryStorage();
const uploadMemory = multer({ storage: memoryStorage });

// Serve static files from the uploads directory
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
    const { usersCollection } = await connectDb();

    // Check if the user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Hash the password and store user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { name, email, password: hashedPassword };
    await usersCollection.insertOne(newUser);

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
    const { usersCollection } = await connectDb();

    // Check user
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

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

    // Verify the Google token
    const payload = await verifyGoogleToken(credential);
    if (!payload) {
      return res.status(400).json({ error: 'Invalid Google token' });
    }

    const { email, name, sub: googleId, picture } = payload;
    const { usersCollection } = await connectDb();

    // Check if user already exists
    let user = await usersCollection.findOne({ email });
    if (!user) {
      // Create a new user
      const newUser = {
        googleId,
        email,
        name,
        profilePicture: picture,
      };
      await usersCollection.insertOne(newUser);
      user = newUser;
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

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
    const { usersCollection } = await connectDb();

    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let updateData = {};
    if (name) {
      updateData.name = name;
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    if (req.file) {
      updateData.profilePicture = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );

    const updatedUser = await usersCollection.findOne({ _id: new ObjectId(userId) });
    return res.json({
      message: 'Profile updated successfully',
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        profilePicture: updatedUser.profilePicture || '',
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
    const { usersCollection } = await connectDb();

    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

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
app.post('/api/campaigns', authMiddleware, uploadMemory.single('poster'), async (req, res) => {
  try {
    const { title, description, goal, deadline } = req.body;
    const userId = req.userId;
    const { campaignsCollection } = await connectDb();

    // Validate the request body
    if (!title || !description || !goal || !deadline) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Convert the deadline to a Date object
    const deadlineDate = new Date(deadline);

    // Check if the deadline is a valid date
    if (isNaN(deadlineDate.getTime())) {
      return res.status(400).json({ error: 'Invalid deadline date' });
    }

    // Check if the deadline is in the future
    if (deadlineDate <= new Date()) {
      return res.status(400).json({ error: 'Deadline must be in the future' });
    }

    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No poster image uploaded' });
    }

    // Convert the file buffer to a base64 string
    const poster = req.file.buffer.toString('base64');

    // Create a new campaign
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

    // Insert the campaign into the database
    await campaignsCollection.insertOne(newCampaign);

    // Respond with the new campaign
    return res.status(201).json({ message: 'Campaign created successfully' });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// **Get Campaigns Route**
app.get('/api/campaigns', async (req, res) => {
  try {
    const { campaignsCollection } = await connectDb();

    // Find all campaigns
    const campaigns = await campaignsCollection.find().toArray();

    // Respond with the campaigns
    return res.json(campaigns);
  } catch (error) {
    console.error('Error getting campaigns:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// **Delete Campaign Route**
app.delete('/api/campaigns/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { campaignsCollection } = await connectDb();

    // Find the campaign
    const campaign = await campaignsCollection.findOne({ _id: new ObjectId(id), userId: new ObjectId(userId) });
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Delete the campaign
    await campaignsCollection.deleteOne({ _id: new ObjectId(id), userId: new ObjectId(userId) });

    // Respond with a success message
    return res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// **Update Campaign Route**
app.put('/api/campaigns/:id', authMiddleware, uploadMemory.single('poster'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, goal, deadline } = req.body;
    const userId = req.userId;
    const { campaignsCollection } = await connectDb();

    // Validate the request body
    if (!title || !description || !goal || !deadline) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Convert the deadline to a Date object
    const deadlineDate = new Date(deadline);

    // Check if the deadline is a valid date
    if (isNaN(deadlineDate.getTime())) {
      return res.status(400).json({ error: 'Invalid deadline date' });
    }

    // Check if the deadline is in the future
    if (deadlineDate <= new Date()) {
      return res.status(400).json({ error: 'Invalid deadline date' });
    }

    // Find the campaign
    const campaign = await campaignsCollection.findOne({ _id: new ObjectId(id), userId: new ObjectId(userId) });
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Update the campaign
    let updateData = {
      title,
      description,
      goal: parseFloat(goal),
      deadline: deadlineDate,
    };

    // Check if a file was uploaded
    if (req.file) {
      // Convert the file buffer to a base64 string
      const poster = req.file.buffer.toString('base64');
      updateData.poster = poster;
    }

    // Update the campaign in the database
    await campaignsCollection.updateOne(
      { _id: new ObjectId(id), userId: new ObjectId(userId) },
      { $set: updateData }
    );

    // Respond with a success message
    return res.json({ message: 'Campaign updated successfully' });
  } catch (error) {
    console.error('Error updating campaign:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// **Donate to Campaign Route**
app.post('/api/campaigns/:id/donate', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    const userId = req.userId;
    const { campaignsCollection } = await connectDb();

    // Validate the request body
    if (!amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find the campaign
    const campaign = await campaignsCollection.findOne({ _id: new ObjectId(id) });
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Create a new donation
    const newDonation = {
      userId: new ObjectId(userId),
      amount: parseFloat(amount),
      createdAt: new Date(),
    };

    // Update the campaign with the new donation
    await campaignsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $push: { donations: newDonation } }
    );

    // Respond with a success message
    return res.json({ message: 'Donation successful' });
  } catch (error) {
    console.error('Error donating to campaign:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// **Get Campaign Donations Route**
app.get('/api/campaigns/:id/donations', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { campaignsCollection } = await connectDb();

    // Find the campaign
    const campaign = await campaignsCollection.findOne({ _id: new ObjectId(id), userId: new ObjectId(userId) });
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Respond with the donations
    return res.json(campaign.donations);
  } catch (error) {
    console.error('Error getting campaign donations:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Add near the top of your server.cjs
async function ensureCollections() {
  await client.connect();
  const db = client.db('User');
  if (!await db.listCollections({name: 'messages'}).hasNext()) {
    await db.createCollection('messages');
    console.log('Created messages collection');
  }
}

// Call this at startup
ensureCollections().catch(console.error);

// **Create Message Route**
app.post('/api/messages', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.userId;
    const { messagesCollection } = await connectDb();

    if (!text) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newMessage = {
      userId: new ObjectId(userId),
      text,
      timestamp: new Date().toISOString(), // Use ISO string for a valid timestamp
    };

    await messagesCollection.insertOne(newMessage);
    return res.status(201).json({ message: 'Message created successfully' });
  } catch (error) {
    console.error('Error creating message:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// **Get Messages Route**
app.get('/api/messages', authMiddleware, async (req, res) => {
  try {
    // Change from "messages" to "messagesCollection" to match your connectDb() function
    const { messagesCollection } = await connectDb();
    const messageList = await messagesCollection.find().toArray();
    res.json(messageList);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// **Socket.IO Connection**
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('sendMessage', async (msg) => {
    try {
      if (!msg || !msg.text) return;
      const { messagesCollection } = await connectDb();
      const newMessage = {
        text: msg.text,
        sender: msg.sender || 'Anonymous',
        timestamp: new Date().toISOString(), // Valid ISO timestamp
      };
      await messagesCollection.insertOne(newMessage);
      io.emit('chat message', newMessage);
    } catch (error) {
      console.error('Error inserting message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});