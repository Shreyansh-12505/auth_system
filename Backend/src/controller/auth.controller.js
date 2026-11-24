import userModel from "../model/auth.models.js"
import jwt from "jsonwebtoken"
import bcrypt, { genSalt } from "bcrypt"

async function register(req,res) {
    try {
         const {username,password,email} = req.body;
    
const user=await userModel.findOne({
    $or:[
        {email},
        {username}
    ]
})
if(user){
     return res.status(400).json({
        message:"User already exist"
     })
}
 const salt=await genSalt(10);
 const hashPass=await bcrypt.hash(password,salt);  //providing extra safety 
 const newUser=await userModel.create({
    username,
    email,
    password:hashPass
 })
    return res.status(201).json({
        message:"User registered successfully",
        newUser
    })
    } catch (error) {
        return res.status(500).json({error:"server error during registration "})
        }
    
}

async function login(req,res) {
    const {username,email,password}=req.body;
    try {   
       const user=await userModel.findOne({
              email
})
if(!user){
     return res.status(400).json({
        message:"User already exist"
     })
}
const isMatch=await bcrypt.compare(password,user.password)   
  if(!isMatch){
    return res.status(400).json({message:"invalid password"})
  }
  //dual token strategy

  const accessToken=jwt.sign({
    userId: user._id
  },
process.env.ACCESS_TOKEN,
{
    expiresIn:'15m'
})

 const refreshToken=jwt.sign({
    userId:user._id
 },
 process.env.REFRESH_TOKEN,
 {
    expiresIn:'7d'
 }
)

res.cookie("access-token",accessToken,{
    httpOnly:true,//JS CONVERT READ THIS TOKEN
    secure:process.env.NODE_ENV==="production",
    sameSite:"strict",   //or can be lax
    maxAge: 15 * 60 * 1000
})
res.cookie("refresh-token",refreshToken,{
     httpOnly:true,//JS CONVERT READ THIS TOKEN
     maxAge:7 * 24 * 60 * 60 * 1000
})

user.refreshToken=refreshToken;
await user.save();

return res.status(201).json({
    message:"user loggedin successfully"
})
    } catch (error) {
        res.status(500).json({error:"internal server error during login"})
    }
}

async function logout(req,res) {
    const cookies=req.cookies;
    const rt = cookies?.["refresh-token"];
    if(rt){
        const user=await userModel.findOne({refreshToken:rt});
        if(user){
            user.refreshToken=null;   //clearing the DB
            await user.save();
        }
    }
    res.clearCookie("access-token",
        {httpOnly:true,
            sameSite:"strict" ,
       secure: process.env.NODE_ENV==="production"
        }
    );
    res.clearCookie("refresh-token",
         {httpOnly:true,
            sameSite:"strict" ,
           secure: process.env.NODE_ENV==="production"
        }
    );
    return res.status(201).json({
        message:"user loggedout successfully"
    })
}

async function refresh(req,res) {
    try {   
        const incomingToken=req.cookies?.["refresh-token"];
        if(!incomingToken){
            return res.status(401).json({message:"token not found..please login again"})
        }
        const decoded=jwt.verify(incomingToken,process.env.REFRESH_TOKEN);
        if(!decoded){
            return res.status(401).json({
                message:"refresh token expired or not verified"
            })
        }
        const user=await userModel.findById(decoded.userId);
         if(!user || user.refreshToken!==incomingToken){
            return res.status(403).json({
                message:"session revoked plss login.."
            })
         }
         const newAccessToken=jwt.sign({
            userId:user._id
         },
        process.env.ACCESS_TOKEN,
        {
            expiresIn:'15m'
        }
        )
    res.cookie("access-token",newAccessToken,{
        httpOnly:true,
        maxAge:15 * 60 * 1000  //15mins
    })

return res.status(200).json({message:"new access token generated.."})

    } catch (error) {
        return res.status(500).json({
            error:"server error"
        })
    }
}


async function dashboard(req,res){
    try {
        const userId=req.user.userId
        const user=await userModel.findById(userId).select("-password");
        res.status(200).json({
            message:`welcome back ${user.username}`,
            user
        })
    } catch (error) {
        return res.status(500).json(
            {error:"server error"}
        )
    }
}

export  {register,login,logout,refresh,dashboard}
