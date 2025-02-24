const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const port = 3000;
// Initialize Express
const app = express();
app.use(express.json());
app.use(cors());
// CORS Configuration - Allow multiple origins
const allowedOrigins = ['http://127.0.0.1:5500', 'http://localhost:4000','http://localhost:3000', 'http://localhost:5000'];

app.use(express.static(__dirname));
app.use(express.urlencoded({extended:true}))
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
app.get('/', (req,res) =>{
    res.sendFile(path.join(__dirname , 'rent-out-form.html'));
})
// Ensure the uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}
// MongoDB connection
mongoose.connect('mongodb://localhost:27017/rent-out-form-database',{
    useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error: ', err));


// Vehicle Schema
const vehicleSchema = new mongoose.Schema({
  ownerName: String,
  vehicleType: String,
  vehicleName: String,
  vehicleNumberPlate: String,
  startTime: String,
  endTime: String,
  date: String,
  vehicleImages: [String],
  pickupAddress: String,
  areaPinCode: String,
  landmark: String,
  fuelType: String,
  phoneNo: String,
  email: String,
  license: String,
  aadhar: String,
  status: { type: String, default: 'pending' }
  });
const Vehicle = mongoose.model('Vehicle',vehicleSchema);

// Set up Multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  const upload = multer({ storage });

  // POST route for vehicle details submission
app.post('/api/rentout', upload.fields([
    { name: 'vehicleImages', maxCount: 7 },
    { name: 'license', maxCount: 1 },
    { name: 'aadhar', maxCount: 1 }
  ]), async (req, res) => {
    console.log('Received request on /api/rentout'); // Log request
    console.log('Body:', req.body); // Check body data
    // console.log('Files:', req.files); // Check files data
    try {
      console.log('Received request:', req.body);
      const { ownerName, vehicleType, vehicleName, vehicleNumberPlate, startTime, endTime, date, pickupAddress, areaPinCode, landmark, fuelType, phoneNo, email , status} = req.body;
      const vehicleImages = req.files['vehicleImages'].map(file => file.path);
      const license = req.files['license'][0].path;
      const aadhar = req.files['aadhar'][0].path;
      const vehicle = new Vehicle({
        ownerName,
        vehicleType,
        vehicleName,
        vehicleNumberPlate,
        startTime,
        endTime,
        date,
        vehicleImages,
        pickupAddress,
        areaPinCode,
        landmark,
        fuelType,
        phoneNo,
        email,
        license,
        aadhar,
      });
  
      await vehicle.save();
      res.status(200).json({ message: 'Vehicle details uploaded successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  });
  // GET route to fetch all vehicle data
app.get('/api/vehicles', async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch vehicle data', error });
  }
});

// PUT route to update the status of a vehicle
app.put('/api/vehicles/:id', async (req, res) => {
  const { id } = req.params; // Extract vehicle ID from the request parameters
  const { status } = req.body; // Extract new status from request body

  try {
    const vehicle = await Vehicle.findByIdAndUpdate(
      id,
      { status },
      { new: true } // Return the updated document
    );

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.status(200).json({ message: 'Status updated successfully', vehicle });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});


// New route to fetch only approved vehicles
app.get('/api/vehicles/approved', async (req, res) => {
  try {
    const approvedVehicles = await Vehicle.find({ status: 'approved' });
    res.status(200).json(approvedVehicles);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch approved vehicles', error });
  }
});

  // Start the server
  app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
  });