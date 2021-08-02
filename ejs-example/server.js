require('dotenv').config()
const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const http = require('http').createServer(app);
const io = require('socket.io').listen(http);
// app.use(session({secret : 'rkskekfk1', resave : true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session()); 

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true})) 

// var session = require('express-session');
var redis = require('redis');
var redisStore = require('connect-redis')(session);
var client = redis.createClient(6379, process.env.redis_url);

app.use(session(
  {
      secret: 'test',
      store: new redisStore({
          client: client,
          ttl: 260               //Redis 세션 유지 시간
      }),
      saveUninitialized: false,  
      resave: false
  }
));
// app.use(session({
//     store: redisStore({
//         client: redis,
//         host: process.env.redis_url,
//         port: 6379,
//         prefix : "session:",
//         db : 0,
//         saveUninitialized: false,
//         resave: false
//     }),
//     secret: 'seo',
//     cookie: { maxAge: 2592000000 }
// }));

var db;
MongoClient.connect(process.env.db_url, { useUnifiedTopology: true }, function(err, client){
    if (err) return console.log(err);

    db = client.db('test');

    http.listen(process.env.port, function(){
      console.log('listening on 8080')
    });
  })

let multer = require('multer');
var storage = multer.diskStorage({

  destination : function(req, file, cb){
    cb(null, './resource/images')
  },
  filename : function(req, file, cb){
    cb(null, file.originalname )
  }

});
var path = require('path');

var upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
            return callback(new Error('PNG, JPG only upload'))
        }
        callback(null, true)
    },
    limits:{
        fileSize: 1024 * 102400
    }
});

app.get('/upload', function(req, res){
    res.render('upload.ejs')
  }); 

app.post('/upload', upload.single('profile'), function(req, res){
    res.send('업로드 완료')
});

app.get('/images/:imagename', function(req, res){
  res.sendFile( __dirname + '/resource/images/' + req.params.imagename )
})

app.get('/', function(req, res){

  res.sendFile(__dirname + '/index.html')

  //  if(req.session.key) { 
  //    res.redirect('/admin'); 
  //   } else 
  //     res.sendFile(__dirname + '/index.html')
});

app.get('/mypage', loginCheck, function (req, res) {
    console.log(req.user);
    redisClient.get("id" , (err , result) => { 
      console.log(result) 
    });

    res.render('mypage.ejs', { user : req.user})
})
  
function loginCheck(req, res, next) {

  //   if (req.user) {
  //     next()
  //   } else {
  //     res.send('로그인해라')
  //   }
   }

app.get('/login', function(req, res){
    res.sendFile(__dirname + '/login.html')
});

app.get('/membership', function(req, res){
    res.sendFile(__dirname + '/membership.html')
});

app.post('/memberadd', function(req, res){
    db.collection('users').insertOne({id : req.body.id, password: req.body.password
        ,name : req.body.name, tel : req.body.tel }, function(){});
    res.status(200).send("success")
})

app.get('/boards', function(req, res){
    db.collection('boards').find().toArray(function(err, result){
      console.log(result)
      res.render('boards.ejs', { boards : result })
    })
})

// passport.use(new LocalStrategy({
//     usernameField: 'id',
//     passwordField: 'password',
//     session: true,
//     passReqToCallback: false,
//   }, function (id, password, done) {
//     console.log('51',id, password);

//     db.collection('users').findOne({ id: id }, function (err, result) {
//         if (err) return done(err)
//         if (!result) return done(null, false, { message: '존재하지 않는 아이디' })
//         if (password == result.password) {
//           return done(null, result)
//         } else {
//           return done(null, false, { message: '비번 틀림' })
//         }
//     })
//   }));

app.post('/loginCheck', function(req, res){

    if(req.session.key){
      console.log("세션 키 존재")
      res.redirect("/")
    } else{
      req.session.key = req.body.id;
      console.log("세션 저장 완료")
      res.redirect("/")
    }
    
  });

passport.serializeUser(function (user, done) {
    done(null, user.id)
});
  
passport.deserializeUser(function (user, done) {
    db.collection('users').findOne({ id: user }, function (err, result) {
      done(null, result)
    })
}); 
  
  app.get('/fail', function(req, res){
    res.render('fail.ejs')
})

app.get('/chat', function(req,res){
    res.render('chat.ejs')
});

io.on('connection', function(socket){
    console.log('연결 확인');
    socket.on('test', function(data){
      console.log(data);
      io.emit('spread', data);
    });
});
  
  
var chat1 = io.of('/chat1');
chat1.on('connection', function(socket){
    console.log('채팅방1에 연결되었어요');
    socket.on('test', function(data){
    console.log(data);
    chat1.emit('spread', data);
    });
});

  
io.on('connection', function(socket){
    console.log('연결되었어요');
  
    socket.on('인삿말', function(data){
      console.log(data);
      io.emit('퍼트리기', data);
    });
  });
  

  var chat1 = io.of('/채팅방1');
  chat1.on('connection', function(socket){
    console.log('채팅방1에 연결되었어요');
  
    socket.on('인삿말', function(data){
      console.log(data);
      chat1.emit('퍼트리기', data);
    });
  });