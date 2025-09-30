require("dotenv").config();
const express = require("express");
const superAdminRoutes = require("./routes/superAdminRoutes")
const HospitalRoutes = require("./routes/hospitalRoutes")
const cors = require("cors");
const { initializeDatabase } = require("./config/db");
const app = express();

// Enable CORS
app.use(cors());
// Middleware
app.use(express.json());

// super admin route entry point
app.use('/api/superadmin', superAdminRoutes)

// hospital routes entry point
app.use('/api/hospital', HospitalRoutes)


// Start server
const PORT = process.env.PORT || 5000;

// Initialize database and start server
const startServer = async () => {
  console.log('🚀 Starting HealthNet Backend...');
  
  // Test database connection before starting server
  await initializeDatabase();
  
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log('🏥 HealthNet Backend is ready!');
  });
};

startServer().catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
