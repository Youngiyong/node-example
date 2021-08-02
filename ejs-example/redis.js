require('dotenv').config()
var redis = require('redis');
var redisClient = redis.createClient(process.env.redis_port, process.env.redis_url);

redisClient.auth(process.env.redis_pwd, function (err) {
    if (err) throw err;
});

redisClient.on('error', function(err) {
    console.log('Redis error: ' + err);
});



module.exports = redisClient;