const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const superAdminAuth = async (req, res, next) => {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		return res.status(401).json({ message: 'No token provided' });
	}
	const token = authHeader.split(' ')[1];
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		// Check if user exists and is a super admin
		const admin = await prisma.superAdmin.findUnique({ where: { id: decoded.id } });
		if (!admin) {
			return res.status(403).json({ message: 'Access denied' });
		}
		req.admin = admin; // Attach admin info to request
		next();
	} catch (err) {
		return res.status(401).json({ message: 'Invalid token' });
	}
};

module.exports = superAdminAuth;
