const redis = require("redis");
const RedisServer = require("redis-server");
 
// Simply pass the port that you want a Redis server to listen on.
const server = new RedisServer(6379);
 
server.open((err) => {
    if (err === null) {
        console.log("connected ...");
    }
});
// const client = redis.createClient();

// client.on("error", function(error) {
//   console.error(error);
// });

// client.on("connect",()=>{
//     console.log("redis connected ...")
// })
