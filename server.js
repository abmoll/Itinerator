//server.js

var express = require('express')
var app = express()
var bodyParser = require('body-parser')
const request = require('request');

app.use(express.static('./public'))

app.use(bodyParser.urlencoded({
    extended: true
}))

app.use(bodyParser.json())

app.get('/api', function(req, res) {
  console.log(req.query);
  var breweryUrl = `http://api.brewerydb.com/v2/locations?locality=${req.query.locality}&region=${req.query.region}&key=58bc55fe9138082bf63a6f6ff8c1c861`;
  request(breweryUrl, function(err, response, body) {
    console.log("started API request");
    res.send(body)
  })
})

app.listen(80, function() {
  console.log('The app is running on 8080');
});
