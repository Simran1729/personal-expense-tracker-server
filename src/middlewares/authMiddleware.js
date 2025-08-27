const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) =>{
    try{
        const authHeader = req.headers["authorization"];
        if (!authHeader) {
            return res.status(401).json({
                message: "Authorization header missing"
            });
        }

        const token = authHeader.split(" ")[1];

        if(!token){
            return res.status(401).json({
                "message" : "Authorization token not found, can't authenticate user"
            })
        }

        try{
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
            return next();
        }catch(err){
            return res.status(401).json({
                "message" : "Invalid token, please login again"
            })
        }
    } catch(err){
        console.error("Auth middleware error:", err);
        return res.status(500).json({
            "message" : "Internal server error in authMiddleware"
        })
    }
}

module.exports = authMiddleware;