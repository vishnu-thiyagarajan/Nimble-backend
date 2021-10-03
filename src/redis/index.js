require("dotenv").config();
const Redis = require("ioredis");

module.exports = function(){
    const redis = new Redis({
        port: 17598,
        host: process.env.REDIS_STRING, 
        family: 4,
        password: process.env.REDIS_PASSWORD,
        db: 0,
    });

    redis.on("connect",()=>{
        console.log("Redis is connected ...")
    })
    
    redis.on("error",()=>{
        console.log("Error Connecting Reddis ...")
    })
} 