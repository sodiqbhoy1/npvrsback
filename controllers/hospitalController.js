const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ...existing code...

// register new hospital but status will be pending by default

const registerHospital = async (req, res) => {
  const { name, email, password, phone, address } = req.body;

  // generate a unique 10 digits for hospital id
  function generateHospitalId() {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
  }

  try {
    // check if hospital is already registered using the email
    const existingHospital = await prisma.hospital.findUnique({
      where: { email },
    });

    if (existingHospital) {
      return res.status(400).json({ message: "Hospital already registered" });
    }
    let hospitalId;
    let exists = true;
    while (exists) {
      hospitalId = generateHospitalId();
      const hospital = await prisma.hospital.findUnique({
        where: { hospitalId },
      });
      if (!hospital) exists = false;
    }
    // hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // create new hospital
    const newHospital = await prisma.hospital.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        address,
        hospitalId,
      },
    });

    // Send confirmation email after successful registration
    const nodemailer = require("nodemailer");
    const sendHospitalConfirmationEmail = async (email, name) => {
      try {
        const transporter = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASSWORD,
          },
        });

        const emailTemplate = `
                                <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333; background-color: #f7f7f7; padding: 50px 20px;">
                                    <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                                        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eee;">
                                            <h1 style="font-size: 24px; color: #2c3e50; margin: 0;">Hospital Registration Received</h1>
                                        </div>
                                        <div style="padding: 20px 0;">
                                            <p>Dear ${name},</p>
                                            <p>Thank you for registering <strong>${name}</strong> with our Hospital Management System.</p>
                                            <p>Your application has been received and is currently under review by our team. You will receive an email notification once the review process is complete.</p>
                                            <p><strong>Next Steps:</strong></p>
                                            <ul>
                                                <li>Our team will verify your hospital credentials</li>
                                                <li>You will receive approval/rejection notification via email</li>
                                                <li>If approved, you can log in using your hospital email and start using the system</li>
                                            </ul>
                                            <p>Thank you for choosing our platform!</p>
                                            <p>Best regards,<br>The Hospital Management Team</p>
                                        </div>
                                        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999;">
                                            <p>&copy; ${new Date().getFullYear()} Hospital Management System. All rights reserved.</p>
                                        </div>
                                    </div>
                                </div>
                        `;

        await transporter.sendMail({
          from: "Hospital Management <noreply@hospitalmanagement.com>",
          to: email,
          subject: "Hospital Registration Received - Under Review",
          html: emailTemplate,
        });
      } catch (error) {
        console.error("Error sending confirmation email:", error);
      }
    };

    // Call the email function after registration
    sendHospitalConfirmationEmail(email, name);
    res.status(201).json({ message: "Hospital registered successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error registering hospital" });
  }
};

// login hospital function
const hospitalLogin = async (req, res)=>{
    const {email, password} = req.body;
    try {
        // check if hospital exist with their email
        const existingHospital = await prisma.hospital.findUnique({where: {email}})

        if(!existingHospital){
            return res.status(400).json({message: "Incorrect login credentials"})
        }
// check if approved
if (!existingHospital.approved) {
    return res.status(403).json({ message: "Hospital not approved" });
}
// compare the password
const isMatch = await bcrypt.compare(password, existingHospital.password)
if(!isMatch){
    return res.status(400).json({message: "Incorrect login credentials"})
}

// generate jwt token
const token = jwt.sign({
    id: existingHospital.id, email:existingHospital.email
}, process.env.JWT_SECRET, { expiresIn: "1h" })

res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ message: "Error logging in hospital" });
    }
}

// fetch hospital profile
const getHospitalProfile = async (req, res) => {
  try {
    const h = req.hospital; // set by hospitalAuth
    if (!h) return res.status(401).json({ message: 'Unauthorized' });

    // Return safe, flat fields only
    return res.status(200).json({
      id: h.id,
      hospitalId: h.hospitalId,
      name: h.name,
      email: h.email,
      phone: h.phone,
      address: h.address,
      approved: h.approved,
      createdAt: h.createdAt,
      updatedAt: h.updatedAt
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching hospital profile' });
  }
}

// register patients to your hospital
const registerPatient = async (req, res) => {
  const { name, address, dateOfBirth, bloodGroup, phone,underlyingSickness, gender } = req.body;
  const hospitalId = req.hospital.id;

  try {
    // Helper: generate a unique 6-digit patientId (string) with DB uniqueness check
    const generateUniquePatientId = async (maxAttempts = 10) => {
      const makeCandidate = () => Math.floor(100000 + Math.random() * 900000).toString(); // 100000-999999
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const candidate = makeCandidate();
        const existing = await prisma.patient.findUnique({ where: { patientId: candidate } });
        if (!existing) return candidate;
      }
      throw new Error('Failed to generate unique patientId after multiple attempts');
    };

    const patientId = await generateUniquePatientId();
    // create the patient
    const newPatient = await prisma.patient.create({
      data: {
        patientId,
        name,
        address,
        dateOfBirth: new Date(dateOfBirth),
        bloodGroup,
        phone,
        underlyingSickness,
        gender,
        hospital: { connect: { id: hospitalId } },
      },
    });
    res.status(201).json({ message: "Patient registered successfully", patient: newPatient });
  } catch (error) {
    res.status(500).json({ message: "Error registering patient" });
  }
};

// function to fetch patients of a hospital

const getHospitalPatients = async (req, res) => {
  try {
    const hospitalId = req.hospital.id;
    const patients = await prisma.patient.findMany({
      where: { hospitalId },
    });
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ message: "Error fetching hospital patients" });
  }
};

// record a patient visit with vitals and optional notes/diagnosis
const createVisit = async (req, res) => {
  try {
    const hospitalId = req.hospital.id;
    const { patientId: patientPublicId } = req.params; // six-digit public ID
    const {
      visitDate,
      bloodPressure,
      weight,
      temperature,
      heartRate,
      respirationRate,
      symptoms,
      diagnosis,
      notes,
      prescriptions // optional array [{drugName, dosage, frequency, duration, instructions, prescribedBy}]
    } = req.body;

    // Resolve patient by public patientId and ensure it belongs to this hospital
    const patient = await prisma.patient.findFirst({
      where: { patientId: patientPublicId, hospitalId },
      select: { id: true }
    });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const visit = await prisma.visit.create({
      data: {
        visitDate: visitDate ? new Date(visitDate) : undefined,
        bloodPressure,
        weight: typeof weight === 'number' ? weight : undefined,
        temperature: typeof temperature === 'number' ? temperature : undefined,
        heartRate: typeof heartRate === 'number' ? heartRate : undefined,
        respirationRate: typeof respirationRate === 'number' ? respirationRate : undefined,
        symptoms,
        diagnosis,
        notes,
        patient: { connect: { id: patient.id } },
        hospital: { connect: { id: hospitalId } }
      }
    });

    // Optionally add prescriptions in a separate call
    if (Array.isArray(prescriptions) && prescriptions.length > 0) {
      const data = prescriptions
        .filter(p => p && p.drugName)
        .map(p => ({
          visitId: visit.id,
          drugName: String(p.drugName),
          dosage: p.dosage ?? null,
          frequency: p.frequency ?? null,
          duration: p.duration ?? null,
          instructions: p.instructions ?? null,
          prescribedBy: p.prescribedBy ?? null
        }));
      if (data.length > 0) {
        await prisma.prescription.createMany({ data });
      }
    }

    // Return visit with prescriptions
    const full = await prisma.visit.findUnique({
      where: { id: visit.id },
      include: { prescriptions: true }
    });
    return res.status(201).json({ message: 'Visit recorded', visit: full });
  } catch (error) {
    return res.status(500).json({ message: 'Error recording visit' });
  }
};

// list visits for a patient (by public patientId)
const getPatientVisits = async (req, res) => {
  try {
    const hospitalId = req.hospital.id;
    const { patientId: patientPublicId } = req.params;

    const patient = await prisma.patient.findFirst({
      where: { patientId: patientPublicId, hospitalId },
      select: { id: true }
    });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const visits = await prisma.visit.findMany({
      where: { patientId: patient.id, hospitalId },
      include: { prescriptions: true },
      orderBy: { visitDate: 'desc' }
    });
    return res.status(200).json(visits);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching visits' });
  }
};

// get a single visit by ID (ensure it belongs to hospital)
const getVisitById = async (req, res) => {
  try {
    const hospitalId = req.hospital.id;
    const { id } = req.params; // numeric visit id
    const visitId = Number(id);
    if (Number.isNaN(visitId)) return res.status(400).json({ message: 'Invalid visit id' });

    const visit = await prisma.visit.findFirst({
      where: { id: visitId, hospitalId },
      include: {
        prescriptions: true,
        patient: { select: { patientId: true, name: true } }
      }
    });
    if (!visit) return res.status(404).json({ message: 'Visit not found' });
    return res.status(200).json(visit);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching visit' });
  }
};

// add a prescription to a visit
const addPrescription = async (req, res) => {
  try {
    const hospitalId = req.hospital.id;
    const { visitId } = req.params;
    const vId = Number(visitId);
    if (Number.isNaN(vId)) return res.status(400).json({ message: 'Invalid visit id' });

    // Ensure visit belongs to hospital
    const visit = await prisma.visit.findFirst({ where: { id: vId, hospitalId }, select: { id: true } });
    if (!visit) return res.status(404).json({ message: 'Visit not found' });

    const { drugName, dosage, frequency, duration, instructions, prescribedBy } = req.body;
    if (!drugName) return res.status(400).json({ message: 'drugName is required' });

    const rx = await prisma.prescription.create({
      data: {
        visitId: visit.id,
        drugName: String(drugName),
        dosage: dosage ?? null,
        frequency: frequency ?? null,
        duration: duration ?? null,
        instructions: instructions ?? null,
        prescribedBy: prescribedBy ?? null
      }
    });
    return res.status(201).json({ message: 'Prescription added', prescription: rx });
  } catch (error) {
    return res.status(500).json({ message: 'Error adding prescription' });
  }
};

module.exports = { registerHospital, hospitalLogin, getHospitalProfile, registerPatient, getHospitalPatients, createVisit, getPatientVisits, getVisitById, addPrescription };