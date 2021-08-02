const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended : true }));

const MongoClient = require('mongodb').MongoClient;

var db;
MongoClient.connect('mongodb://3.34.2.253:27018/', { useUnifiedTopology: true }, function(error, client){
    if (error) return console.log(error);

    db = client.db('todoapp');

    db.collection('post').insertOne({이름 : 'sy', 나이 : 35}, function(){
        console.log('저장완료')
    });
    //서버띄우는 코드 여기로 옮기기
    app.listen('8080', function(){
      console.log('listening on 8080')
    });
  })

// app.listen(8080, function(){
//     console.log('listening on 8080')
// });

app.get('/pet', function(req, res){
    res.send('펫 쇼핑할 수 있는 사이트입니다.');
});

app.get('/beauty', function(req, res){
    res.send('뷰티 쇼핑할 수 있는 사이트입니다.');
});

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html')
});

app.get('/write', function(req, res){
    res.sendFile(__dirname + '/write.html')
});

app.post('/add', (req, res) => {
    res.send('으잉?')
    console.log(req.body.title)
})