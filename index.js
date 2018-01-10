const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');

// modules
// const jiffify = require('./app/jiffify');
const run = require('./app/dist/run');

app.use(bodyParser.urlencoded({
  extended: true
}));

var port = process.env.PORT || 8082;

var server = app.listen(port, function() {
  console.log('Listening on port %d', server.address().port);
  console.log('http://localhost:' + port);
});

app.use(express.static(__dirname + '/client'));


app.get('/', function(req,res) {
  res.sendFile((path.join(__dirname + '/client/index.html')));
});

app.post('/postCode', function(req,res) {
  console.log("Received new POST request at /postCode");  
  var jiffified = run.parseCode(req.body.code);

  if (jiffified) {
    console.log('Sending back object');
    res.send(jiffified);    
  } else {
    res.send('Could not be jiffied')
  }
});
