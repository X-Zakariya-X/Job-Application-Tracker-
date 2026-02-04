const express = require("express"); // Importing express
const mongoose = require("mongoose"); // Importing mongoose
const dotenv = require("dotenv"); // Importing dotenv for environment variables
const cors = require("cors"); // Importing cors for handling CORS issues

// Import routes
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');

dotenv.config(); // Configuring dotenv to use environment variables

const app = express(); // Creating an instance of express

app.use(cors()); // Using cors middleware to handle CORS issues
app.use(express.json()); // Using express.json() middleware to parse JSON requests
app.use('/uploads', express.static('uploads')); // Serving static files from the 'uploads' directory

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ message: 'Job Application Tracker API is running!' });
});

mongoose.connect(process.env.MONGO_URI, { // Connecting to MongoDB using mongoose
  // Removed deprecated options that are no longer needed in modern Mongoose versions
}).then(() => {
  console.log("Connected to MongoDB"); // Logging successful connection to MongoDB
  app.listen(process.env.PORT || 5000, () => { // Starting the server
    console.log(`Server is running on port ${process.env.PORT || 5000}`);
  });
}).catch((error) => {
  console.error("MongoDB connection error:", error); // Logging any connection errors
  process.exit(1); // Exiting the process if connection fails
});

