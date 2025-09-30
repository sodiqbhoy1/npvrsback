const express = require('express')
const  router = express.Router();

const hospitalController = require("../controllers/hospitalController")
const hospitalAuth = require('../middlewares/hospitalAuth');

// Register a new hospital
router.post("/register", hospitalController.registerHospital)

    // login hospital route
    router.post("/login", hospitalController.hospitalLogin);
    // fetch hospital profile (protected)
    router.get("/profile", hospitalAuth, hospitalController.getHospitalProfile);
    // register patients to your hospital (protected)
    router.post("/patients/register", hospitalAuth, hospitalController.registerPatient);
    // fetch patients of the hospital (protected)
    router.get("/patients", hospitalAuth, hospitalController.getHospitalPatients);

    // record a patient visit (by public patientId) (protected)
    router.post('/patients/:patientId/visits', hospitalAuth, hospitalController.createVisit);
    // list visits for a patient (protected)
    router.get('/patients/:patientId/visits', hospitalAuth, hospitalController.getPatientVisits);
    // get single visit by id (protected)
    router.get('/visits/:id', hospitalAuth, hospitalController.getVisitById);
    // add a prescription to a visit (protected)
    router.post('/visits/:visitId/prescriptions', hospitalAuth, hospitalController.addPrescription);

module.exports = router;