const jwt = require('jsonwebtoken');
const {PrismaClient} = require("@prisma/client")

const prisma = new PrismaClient();

const hospitalAuth = async(req, res, next)=>{
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).json({message: "No token provided"})
    }

    const token = authHeader.split(' ')[1]
    try {
        const decoded= jwt.verify(token, process.env.JWT_SECRET)
        // check if user exists and is a hospital
        const hospital = await prisma.hospital.findUnique({where: {id: decoded.id}})
        
        if(!hospital){
            return res.status(401).json({message: "Unauthorized access"})
        }
        req.hospital = hospital; // attach hospital info to request

        next();

    } catch (error) {
        return res.status(401).json({message: "Invalid token"})
    }

}

module.exports = hospitalAuth;