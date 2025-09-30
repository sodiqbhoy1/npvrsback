require("dotenv").config();
const express = require("express");
const superAdminRoutes = require("./routes/superAdminRoutes")
const HospitalRoutes = require("./routes/hospitalRoutes")
const cors = require("cors");
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
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
