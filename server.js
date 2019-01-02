//server.js

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
// var countries = require('./public/countries.js');
//var main = require('./public')
const request = require('request');
var dirKey = 'AIzaSyBna-nft5cxYdVqD4vHCgurCqhi3B9zNhY';
//var appKey = pcXqHp3KG3jmtgNJ
app.use(express.static('./public'))

app.use(bodyParser.urlencoded({
    extended: true
}))

app.use(bodyParser.json())

app.get('/apiDirections', function(req, res) {
  var dirUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${req.query.origin}&destination=${req.query.destination}&key=${dirKey}`
  //var eventUrl = `http://api.eventful.com/json/events/search?app_key=pcXqHp3KG3jmtgNJ&keywords=${req.query.keywords}&location=${req.query.location}&date=${req.query.date}`
  request(dirUrl, function(err, response, body) {
    console.log("started API request");
    res.send(body)
  })
})

app.get('/apiTrail', function(req, res) {
  var trailUrl = `https://www.hikingproject.com/data/get-trails?lat=${req.query.lat}&lon=${req.query.lon}&maxDistance=10&key=200192113-0e12500ca3d4423414d88aaa658cda2e`
  request(trailUrl, function(err, response, body) {
    console.log("started API request");
    res.send(body)
  })
})

app.get('/apiEvent', function(req, res) {
  //var eventUrl = `http://api.eventful.com/json/events/search?app_key=pcXqHp3KG3jmtgNJ&q=music&l=Boulder+Denver&t=This+weekend`
  var eventUrl = `http://api.eventful.com/json/events/search?keywords=${req.query.keywords}&location=${req.query.location}&date=${req.query.date}&sort_order=popularity&page_size=14&app_key=pcXqHp3KG3jmtgNJ`
  request(eventUrl, function(err, response, body) {
    console.log("started API request");
    res.send(body)
  })
})

// app.get('/hop', function(request, response) {
//   response.sendFile('HopToIt/public/index.html', {
//     root: '../'
//   })
// })

app.get('/getPlaceId', function(req, res) {
  var geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${req.query.latlng}&key=AIzaSyCOK8unHwKjh44byRIfMgAuRBpoH63_CqE`
  request(geoUrl, function(err, response, body) {
    console.log("started API request");
    //console.log("req.query="+req.query);
    console.log(body)
    res.send(body)
  })
})

app.listen(8080, function() {
  console.log('The app is running on 8080');
});
