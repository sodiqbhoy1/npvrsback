const express = require("express");
const router = express.Router();
const superAdminController = require("../controllers/superAdminController")
const superAdminAuth = require("../middlewares/superAdminAuth")
// register route
router.post("/register", superAdminController.registerSuperAdmin)

// login route
router.post("/login", superAdminController.loginSuperAdmin)


// 

// get all pending hospitals but only logged in admin can see 
router.get("/hospitals/pending", superAdminAuth, superAdminController.getPendingHospitals)

// get all hospitals (all status)
router.get("/hospitals", superAdminAuth, superAdminController.getAllHospital)

// approve hospital registration
router.put("/hospitals/:hospitalId/approve", superAdminAuth, superAdminController.approveHospital)

module.exports = router;