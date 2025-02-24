const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const bodyParser = require('body-parser');
const port = 5000;
const app = express();
app.use(express.static(__dirname));
app.use(express.urlencoded({extended:true}))
// app.use(cors());
const allowedOrigins = ['http://127.0.0.1:5500', 'http://localhost:4000','http://localhost:3000', 'http://localhost:5000'];
app.use(cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like Postman or server-side requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
      allowedHeaders: 'Content-Type, Authorization', // Allow specific headers
      methods: ['GET', 'POST'],
  }));
app.use(bodyParser.json());
app.use(express.json()); // To parse JSON data
app.get('/', (req,res) =>{
    res.sendFile(path.join(__dirname , 'form.html'))
})
// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/form-database', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Define User Schema
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: {type: String , required: true, unique: true},
    password: { type: String, required: true },
    // confirm_password: {type: String, required: true},
});
const User = mongoose.model('User', UserSchema);

// Signup Route
app.post('/signup', async (req, res) => {
    // console.log(req.body);
    const { name, email, phone, password} = req.body;
    console.log(req.body);
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email is already registered' });
        }
    
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
    //  create new user
    const newUser = new User({
        name,
        email,
        phone,
        password: hashedPassword
    });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
} catch (err) {
    console.error('Error creating user' , err);
    res.status(500).json({ error: 'Server error' });
}
});

// Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        res.status(200).json({ message: 'Login successful',user});
    } catch (error) {
        res.status(500).json({ message: 'Error logging in' });
    }
});
app.listen(port, () => {
    console.log('Server is running on port: 5000');
});