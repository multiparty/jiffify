const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');

// modules
const jiffify = require('./app/jiffify');

app.use(bodyParser.urlencoded({
  extended: true
}));

var server = app.listen(8081, function() {
  console.log('Listening on port %d', server.address().port);
});

app.use(express.static(__dirname + '/static'));

app.get('/', function(req,res) {
  res.sendFile((path.join(__dirname + '/static/index.html')));
});

app.post('/postCode', function(req,res) {
  var translatedCode = jiffify.parseCode(req.body.code);

  if (translatedCode) {
    res.send(translatedCode);    
  } else {
    // console.log('could not be jiffified');
    res.send('Could not be jiffied')
    // res.sendStatus(200).send("Code could not be jiffified!");
  }
});
