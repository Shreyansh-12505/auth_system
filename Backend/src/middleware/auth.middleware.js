import jwt from "jsonwebtoken"

const verifyToken = async (req,res,next)=>{
   const token = req.cookies["access-token"];
   if(!token){
    return res.status(401).json({
        message:"No token found"
    })
   }
   try {
        const decoded=jwt.verify(token,process.env.ACCESS_TOKEN);
        req.user=decoded;
        next();

   } catch (error) {
    res.status(401).json({error:"invalid or expired access token"})
   }
}

export default verifyToken
