const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// register super admin

const registerSuperAdmin = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // check if user already exists
    const existingAdmin = await prisma.superAdmin.findUnique({
      where: { email },
    });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create the superadmin
    const newAdmin = await prisma.superAdmin.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
    res.status(201).json({ message: "Super Admin registered successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error registetring super admin" });
  }
};

// login for super admin
const loginSuperAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // check if admin exist with their email
    const existingAdmin = await prisma.superAdmin.findUnique({
      where: { email },
    });
    if (!existingAdmin) {
      return res.status(400).json({ message: "Incorrect login credentials" });
    }

    // compare the password
    const isMatch = await bcrypt.compare(password, existingAdmin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect login credentials" });
    }

    // generate jwt token
    const token = jwt.sign(
      { id: existingAdmin.id, email: existingAdmin.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {}
};

// ==============================================================
// HOSPITAL MANAGEMENT FUNCTIONS (SUPER ADMIN ONLY)
// ==============================================================

// get all hospitals pending approval

const getPendingHospitals = async (req, res) => {
  try {
    const pendingHospitals = await prisma.hospital.findMany({
      where: { approved: false },
    });
    res.status(200).json(pendingHospitals);
  } catch (error) {
    res.status(500).json({ error: "Error fetching pending hospitals" });
  }
};

// get all hospital (all status)

const getAllHospital = async (req, res) => {
  try {
    const allHospitals = await prisma.hospital.findMany();
    if (!allHospitals || allHospitals.length === 0) {
      return res.status(404).json({ message: "No hospitals found" });
    }
    res.status(200).json(allHospitals);
  } catch (error) {
    res.status(500).json({ error: "Error fetching all hospitals" });
  }
};

// approve hospital registration
const approveHospital = async (req, res) => {
  const { hospitalId } = req.params;

  try {
    const hospital = await prisma.hospital.findUnique({
      where: { hospitalId },
    });
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }
    const updatedHospital = await prisma.hospital.update({
      where: { hospitalId },
      data: {
        approved: true,
        approval_note:
          "Congratulations! Your hospital registration request has been approved. Please log in with your credentials to access your dashboard.",
      },
    });
    res
      .status(200)
      .json({
        message: "Hospital approved successfully",
        hospital: updatedHospital,
      });
  } catch (error) {
    res.status(500).json({ message: "Error approving hospital" });
  }
};

module.exports = {
  registerSuperAdmin,
  loginSuperAdmin,
  getPendingHospitals,
  getAllHospital,
  approveHospital,
};
