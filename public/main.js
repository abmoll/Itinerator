//var GoogleMapsJsAPI = AIzaSyCOK8unHwKjh44byRIfMgAuRBpoH63_CqE
//var dirKey = AIzaSyBna-nft5cxYdVqD4vHCgurCqhi3B9zNhY;
//var GoogleMapsPlacesAPI = AIzaSyAGzhtIF6wqZ96WemXVfDdg3TerD_TYyiU
//var eventfulKey = pcXqHp3KG3jmtgNJ
//var API = http://api.eventful.com/json/events/search?...&location=San+Diego
//var hikingProjectAPI = 200192113-0e12500ca3d4423414d88aaa658cda2e
//var calcRoute = require('./calcRoute')
//var countries = require('./countries');
var map, places, infoWindow;
var index = 0;
var markers = [];
var marker = [];
var allMarkers = [];
var autocomplete;
var trip = [];
var tripIcons = [];
var waypoint = [];
var origin;
var destination;
var oPlaceId;
var dPlaceId;
var request = {};
var mode;
var countryRestrict = {
  'country': 'us'
};
var MARKER_PATH = 'https://developers.google.com/maps/documentation/javascript/images/marker_green';
var hostnameRegexp = new RegExp('^https?://.+?/');
var countries = {
  'au': {
    center: {
      lat: -25.3,
      lng: 133.8
    },
    zoom: 4
  },
  'br': {
    center: {
      lat: -16.5,
      lng: -51.9
    },
    zoom: 4
  },
  'ca': {
    center: {
      lat: 62,
      lng: -110.0
    },
    zoom: 3
  },
  'fr': {
    center: {
      lat: 46.9,
      lng: 2.2
    },
    zoom: 6
  },
  'de': {
    center: {
      lat: 51.2,
      lng: 10.4
    },
    zoom: 5
  },
  'mx': {
    center: {
      lat: 23.6,
      lng: -102.5
    },
    zoom: 4
  },
  'nz': {
    center: {
      lat: -40.9,
      lng: 174.9
    },
    zoom: 5
  },
  'it': {
    center: {
      lat: 41.9,
      lng: 12.6
    },
    zoom: 5
  },
  'za': {
    center: {
      lat: -30.6,
      lng: 22.9
    },
    zoom: 5
  },
  'es': {
    center: {
      lat: 40,
      lng: -4.7
    },
    zoom: 6
  },
  'pt': {
    center: {
      lat: 39.4,
      lng: -8.2
    },
    zoom: 6
  },
  'us': {
    center: {
      lat: 37.1,
      lng: -95.7
    },
    zoom: 4
  },
  'uk': {
    center: {
      lat: 54.8,
      lng: -4.6
    },
    zoom: 5
  }
};

// initialize map on webpage
function initMap() {
   directionsService = new google.maps.DirectionsService();
   directionsDisplay = new google.maps.DirectionsRenderer();
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: countries['us'].zoom,
    center: countries['us'].center,
    mapTypeControl: false,
    panControl: false,
    zoomControl: false,
    streetViewControl: false
  });
  directionsDisplay.setMap(map);
  directionsDisplay.setPanel(document.getElementById('listing'));
}

$(document).ready(function() {

//   $('#leftBtn').hover(
//  function() {
//     $('#leftBtn').collapse('show');
//   }, function() {
//     $('#leftBtn').collapse('hide');
//   }
// );

  function calcRoute(directionsService,directionsDisplay) {
      // define the request for directionsService
      if (oPlaceId == true && dPlaceId == true) {
            request = {
              origin: {
                'placeId': origin
              },
              destination: {
                'placeId': destination
              },
              waypoints: waypoint,
              travelMode: mode
              // dirType.value toUpperCase() document.getElementById('dirType').text
            };
      }
      if (oPlaceId == true && dPlaceId == false) {
            request = {
              origin: {
                'placeId': origin
              },
              destination: destination,
              waypoints: waypoint,
              travelMode: mode
            };
      }
      if (oPlaceId == false && dPlaceId == true) {
            request = {
              origin: origin,
              destination: {
                'placeId': destination
              },
              waypoints: waypoint,
              travelMode: mode
            };
      }
      if (oPlaceId == false && dPlaceId == false) {
            request = {
              origin: origin,
              destination: destination,
              waypoints: waypoint,
              travelMode: mode
            };
      }

        directionsService.route(request, function(result, status) {

          if (status == 'OK') {
              directionsDisplay.setDirections(result);
              showSteps(result);
              //showSteps(result, markerArray, stepDisplay, map);
          }

          function showSteps(result) {
            //var myRoute = result.routes[0].legs[0];
            for (var i = 0; i < result.routes[0].legs.length; i++) {
                // for every leg, place marker, and add text to marker info window
                result.routes[0].legs[i].start_address = markers[i].placeResult.name;
                result.routes[0].legs[i].end_address = markers[i+1].placeResult.name;
                console.log("result.routes[0]:" + JSON.stringify(result.routes[0]));
          }
        }
        });
  }

  $("#getDirections").click(function(event) {
    //directions is an array of trip lat,lng
    event.preventDefault();
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('listing'));
    var x = $("#dirType option:selected").text();
    mode = x.toUpperCase();

   if (mode =="WALKING" || mode =="DRIVING") {
    clearResults();
    getDirections(trip);
    // var longitude = place2.geometry.location.lng()
    calcRoute(directionsService,directionsDisplay);
    clearMarkers();
   }
    else {alert("Please select travel mode")}

  })

  function getDirections(trip) {
    //var url = 'https://maps.googleapis.com/maps/api/directions/json?origin=Disneyland&destination=Universal+Studios+Hollywood4&key=${dirKey}';
    // iterate through the trip array to get lat/lng or place id, then define origin, dest, & waypoints
    waypoint = [];
    console.log("trip: " + JSON.stringify(trip));
    if (trip[0].hasOwnProperty('place_id')) {
      origin = trip[0].place_id;
      oPlaceId = true;

    } else {
        origin = trip[0].geometry.location.lat + ',' + trip[0].geometry.location.lng;
        oPlaceId = false;
      }

    if (trip.length > 2) {
      for (var i = 1; i < trip.length-1; i++) {

        if (trip[i].hasOwnProperty('place_id')) {
          waypoint.push({
            location: {'placeId': trip[i].place_id},
            stopover: true
          })
        }
        else {
            waypoint.push({
              location: trip[i].geometry.location.lat + ',' + trip[i].geometry.location.lng,
              stopover: true
            })
        }
      }
    }
    if (trip[trip.length - 1].hasOwnProperty('place_id')) {
      destination = trip[trip.length - 1].place_id;
      dPlaceId = true;
    } else {
      destination = trip[trip.length - 1].geometry.location.lat + ',' + trip[trip.length - 1].geometry.location.lng;
      dPlaceId = false;
      }
  }

  // pop-up window for a place
  infoWindow = new google.maps.InfoWindow({
    content: document.getElementById('info-content')
  });

  // Create the autocomplete object and associate it with the UI input control.
  // Restrict the search to the default country, and to place type "cities".
  autocomplete = new google.maps.places.Autocomplete(
    /** @type {!HTMLInputElement} */
    (
      document.getElementById('autocomplete')), {
      types: ['(cities)'],
      componentRestrictions: countryRestrict
    });
  places = new google.maps.places.PlacesService(map);

  // ** add event listener for placeType when placeType changes, get autoComplete city **
  autocomplete.addListener('place_changed', onPlaceChanged);

  // Add a DOM event listener to react when the user selects a country.
  document.getElementById('country').addEventListener('change', setAutocompleteCountry);

  // When the user selects a city, get the place details for the city and
  // zoom the map in on the city.
  function onPlaceChanged() {
    var place = autocomplete.getPlace();
    if (place.geometry) {
      map.panTo(place.geometry.location);
      map.setZoom(12);
      search();
    } else {
      document.getElementById('autocomplete').placeholder = 'Enter a city';
    }
  }

  // Search for places in the selected city, within the viewport of the map.
  function search() {
    if ($("#placeType option:selected").text() == 'trail'){
      alert('trail!');
      //addTrails(event);
    }

    var search = {
      bounds: map.getBounds(),
      types: [$("#placeType option:selected").text()]
    };

    places.nearbySearch(search, function(results, status) {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        clearResults();
        //clearMarkers();
        // Create a marker for each place found, and assign a letter of the alphabetic to each marker icon.
        var maxResults = 13;
        for (var i = 0; i < maxResults; i++) {
          var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
          var markerIcon = MARKER_PATH + markerLetter + '.png';
          addResult(results[i], i);
        }
      }
    });
  }

  function clearMarkers() {
    for (var i = 0; i < markers.length; i++) {
       if (markers[i] !== null) {
          //markers[i].icon = null;
          markers[i].setMap(null);
          //markers[i].hidden = true;
       }
    }
  }

  // Set the country restriction based on user input. Also center and zoom the map on the given country.
  function setAutocompleteCountry() {
    var country = document.getElementById('country').value;
    if (country == 'all') {
      autocomplete.setComponentRestrictions({
        'country': []
      });
      map.setCenter({
        lat: 15,
        lng: 0
      });
      map.setZoom(2);
    } else {
      autocomplete.setComponentRestrictions({
        'country': country
      });
      map.setCenter(countries[country].center);
      map.setZoom(countries[country].zoom);
    }
    clearResults();
    // clearMarkers();
  }

  function dropMarker(index) {
    return function() {
      markers[index].setMap(map);
    };
  }

  function removeMarker(i){
    //var add = addResult();
    console.log("markers[i]: " + markers[i]);
    console.log("Removing_marker[" + i + "]: ");
        markers[i].setMap(null);
        markers.splice(i,1);
        index--;

  }

  function displayMarkers(){
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
    }
  }

  $("#displayTrip").on('click', displayTrip);

  function displayTrip(){
    directionsDisplay.setMap(null);
    directionsDisplay.setPanel(null);
    clearResults();

    //trip is an array of all results
    for (var i = 0; i < trip.length; i++) {
      addResultTrip(trip, i);
      setTimeout(dropMarker(i), i * 50);
      //dropMarker(i);
    }
  }

  function addResultTrip(trip, i) {
    // addResultTrip adds the entire trip array to the results div
    // it needs some info from each of the places, events, and trails methods
    // it should retain the result array, marker letter and icon set from those functions

    //directionsDisplay.setPanel(null);
    var results = document.getElementById('results');
    var tr = document.createElement('tr');
    tr.style.backgroundColor = (i % 2 === 0 ? '#d0d8cd' : '#FFFFFF');
    if (trip[i].hasOwnProperty('start_time'))
      var isEvent = true;

    // create blank cells
    var iconTd = document.createElement('td');
    var nameTd = document.createElement('td');
    if (isEvent)
      var dateTd = document.createElement('td');
    else
      var ratingTd = document.createElement('td');
    var delTd = document.createElement('td');
    delTd.style.padding = '4px';

    //create attibutes of the icon
    var icon = document.createElement('img');
    icon.src = tripIcons[i];
    icon.setAttribute('class', 'placeIcon');
    icon.setAttribute('className', 'placeIcon');

    var name = document.createTextNode(trip[i].name);
    if (isEvent)
      var date = document.createTextNode(trip[i].start_time);
    else
      var rating = document.createTextNode("\nRating: " + trip[i].rating);

      // delete button
      var delButton = document.createElement("delButton");
      var img = document.createElement('img');
      img.style.width = '14px';
      img.style.height = '14px';
      img.src = "./img/deleteButton.png";
      delButton.appendChild(img);

      //delButton.onclick = delResult;
      delButton.onclick = function(){
        delResult(i);
      }

    // add data to cells
    iconTd.appendChild(icon);
    nameTd.appendChild(name);
    if (isEvent)
      dateTd.appendChild(date);
    else
      ratingTd.appendChild(rating);

    delTd.appendChild(delButton);

    // add cells to rows
    tr.appendChild(iconTd);
    tr.appendChild(nameTd);
    if (isEvent)
      tr.appendChild(dateTd);
    else
      tr.appendChild(ratingTd);

      tr.appendChild(delTd);
      results.appendChild(tr);

      function delResult(i){
          //event.preventDefault();
          //console.log("WP removed: " +  JSON.stringify(waypoint[i]));
          alert("removed " + trip[i].name);
          //remove element clicked on and remove its marker
          console.log("i: " + i)
          console.log("index: " + index);
          trip.splice(i,1);
          tripIcons.splice(i,1);
          waypoint.splice(i,1);
          removeMarker(i);
          //displayMarkers();
          displayTrip();
    };
//=====================working trip=============================
    tr.onclick = function dropMark(evt) {
      console.log('clicked on trip at index ' + i + JSON.stringify(trip[i]));
      setTimeout(dropMarker(i), i * 100);
    };

  };

    //delButton.addEventListener ("click", delTripRes() {
  // if user selects trail from drop down
$("#trailForm").submit(function addTrails(event) {
//function addTrails(event) {
  //$("#trailForm").submit(function(event) {
    event.preventDefault();
    //if ($("#placeType option:selected").text() == "trail") {
    clearResults();
    var place2 = autocomplete.getPlace();
    var latitude = place2.geometry.location.lat()
    var longitude = place2.geometry.location.lng()

    $.get(`/apiTrail?lat=${latitude}&lon=${longitude}`, function(body, status) {
      body = JSON.parse(body);
      //console.log(body)
      var result = []
      for (var i = 0; i < 9; i++) {
        result.push({
          //icon: markers[i].markerIcon,
          name: body.trails[i].name,
          rating: body.trails[i].stars,
          url: body.trails[i].url,
          difficulty: body.trails[i].difficulty,
          elevGain: body.trails[i].ascent,
          summary: body.trails[i].summary,
          image: body.trails[i].imgSmall,
          geometry: {
            location: {
              lat: parseFloat(body.trails[i].latitude),
              lng: parseFloat(body.trails[i].longitude),
            }
          }
        })
        addResultTrail(result[i], i);
      }
    })
   //}
 });

  $("#eventsForm").submit(function(event) {
    //if ($("#placeType option:selected").text() == "trail") {
    event.preventDefault();
    clearResults();
    var place = autocomplete.getPlace();
    //var location = place.address_components[0].long_name
    //if place country is UK then use place.address_components[0].long_name + "," + place.address_components[4].long_name
    var location = place.formatted_address
    //console.log(location)
    var keyword = $("#eventType option:selected").text()
    var date = $("#eventTime option:selected").text()

    $.get(`/apiEvent?keywords=${keyword}&location=${location}&date=${date}`, function(body, status) {
      body = JSON.parse(body);
      //console.log(body)
      var result = []
      for (var i = 0; i < 12; i++) {
        result.push({
          name: body.events.event[i].title,
          url: body.events.event[i].url,
          address: body.events.event[i].venue_address,
          venue: body.events.event[i].venue_name,
          //image: body.events.event[i].image.small.url,
          rating: "",
          start_time: body.events.event[i].start_time,
          geometry: {
            location: {
              lat: parseFloat(body.events.event[i].latitude),
              lng: parseFloat(body.events.event[i].longitude),
            }
          }
        })
        addResultEvent(result[i], i);
        // console.log(body.events.event[i].title)
        // console.log(body.events.event[i].start_time)
      }
    })
  })

  function addResult(result, i) {

    var results = document.getElementById('results');
    //====== unique lines if place
    var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
    var markerIcon = MARKER_PATH + markerLetter + '.png';

    // start of function
    var tr = document.createElement('tr');
    tr.style.backgroundColor = (i % 2 === 0 ? '#d0d8cd' : '#FFFFFF');

    // when user clicks on result, add marker to map and push the result into a trip array
    //tr.onclick = placeMarkerPushTrip(evt){
    //tr.onclick = function dropMark(evt) {
    tr.onclick = function placeMarkerPushTrip(evt) {
      console.log("dropping marker")
      console.log("result.name: " + JSON.stringify(result.name));
      // ******* display marker on map *********
      markers[index] = new google.maps.Marker({
        position: result.geometry.location,
        animation: google.maps.Animation.DROP,
        icon: markerIcon
      });
      markers[index].placeResult = result;
      console.log('markers[' + index + '].name: ' + JSON.stringify(markers[index].placeResult.name));

      function checkNameExists(arr, newName) {
        return arr.some(function(e) {
          return e.name === newName.name;
        });
      }
      if (checkNameExists(trip, result) == false) {
          trip.push(result);
          tripIcons.push(markerIcon);
      }
      setTimeout(dropMarker(index), i * 100);
      // If the user clicks a marker, show the details of that marker in info window
      // if place
      google.maps.event.addListener(markers[index], 'click', showInfoWindow);
      index++
      return markers;
    };

    // ********* build results column *******
    var iconTd = document.createElement('td');
    var nameTd = document.createElement('td');
    var ratingTd = document.createElement('td');

    var icon = document.createElement('img');
    icon.src = markerIcon;
    icon.setAttribute('class', 'placeIcon');
    icon.setAttribute('className', 'placeIcon');

    var name = document.createTextNode(result.name);
    var rating = document.createTextNode("\nRating: " + result.rating);

    iconTd.appendChild(icon);
    nameTd.appendChild(name);
    ratingTd.appendChild(rating);

    tr.appendChild(iconTd);
    tr.appendChild(nameTd);
    tr.appendChild(ratingTd);
    results.appendChild(tr);
  }

  // Get the place details for a place. Show the information in an info window,
  // anchored on the marker for the place that the user selected.
  function showInfoWindow() {
    var marker = this;
    places.getDetails({
        placeId: marker.placeResult.place_id

      },
      function(place, status) {
        if (status !== google.maps.places.PlacesServiceStatus.OK) {
          return;
        }
        infoWindow.open(map, marker);
        buildIWContent(place);
      });
  };

  function addResultEvent(result, i) {
    //*===unique lines if event =====
    var markerLetter = String.fromCharCode('a'.charCodeAt(0) + (i % 26)); //if event
    var markerIcon = `http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=${markerLetter}|FE7569`

    // start of function creates adds markers and adds to trip
    var tr = document.createElement('tr');
    tr.style.backgroundColor = (i % 2 === 0 ? '#d0d8cd' : '#FFFFFF');

    //when user clicks on result, add it to map and add the markerIcon
    tr.onclick = function(evt) {
      //google.maps.event.trigger(markers[i], 'click');
      markers[index] = new google.maps.Marker({
        position: result.geometry.location,
        animation: google.maps.Animation.DROP,
        icon: markerIcon,
        //label: markerLetter
      });

      // If the user clicks a marker, show the details of that marker in an info window.
      markers[index].placeResult = result;
      console.log("markers[" + index + "]: " + JSON.stringify(markers[index]));
      // when result is added to map, also push it to trip array
      function checkNameExists(arr, newName) {
        return arr.some(function(e) {
          return e.name === newName.name;
        });
      }
      if (checkNameExists(trip, result) == false) {
          trip.push(result);
          tripIcons.push(markerIcon);
      }
      //=======unique if event
      google.maps.event.addListener(markers[index], 'click', showInfoWindowEvent); //if event
      setTimeout(dropMarker(index), i * 100);
      index++;
    };

    function showInfoWindowEvent() {
      var marker = this;
      infoWindow.open(map, marker);
      // here is the problem!! markers[i] is previous
      //buildIWContentEvent(markers[i].placeResult);
      buildIWContentEvent(marker.placeResult);
    }

    // places data into results column
    var iconTd = document.createElement('td');
    var nameTd = document.createElement('td');
    var dateTd = document.createElement('td'); //if event

    var icon = document.createElement('img');
    icon.src = markerIcon;
    icon.setAttribute('class', 'placeIcon');
    icon.setAttribute('className', 'placeIcon');

    var name = document.createTextNode(result.name);
    var date = document.createTextNode("\nDate: " + result.start_time); //if event

    iconTd.appendChild(icon);
    nameTd.appendChild(name);
    nameTd.appendChild(date); //if event

    tr.appendChild(iconTd);
    tr.appendChild(nameTd);
    tr.appendChild(dateTd); //if event

    results.appendChild(tr);
  }

  function addResultTrail(result, i) {
    var results = document.getElementById('results');
    //*** unique lines if trail ***
    var markerLetter = String.fromCharCode('1'.charCodeAt(0) + (i % 26));
    var markerIcon = `http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=${markerLetter}|d8be8c`

    var tr = document.createElement('tr');
    tr.style.backgroundColor = (i % 2 === 0 ? '#d0d8cd' : '#FFFFFF');

    // when user clicks on result, add it to map
    tr.onclick = function(evt) {
      //google.maps.event.trigger(markers[i], 'click');
      markers[index] = new google.maps.Marker({
        position: result.geometry.location,
        animation: google.maps.Animation.DROP,
        icon: markerIcon
      });

      function showInfoWindowTrail() {
        var marker = this;
        infoWindow.open(map, marker);
        buildIWContentTrail(marker.placeResult);
      }
      //==== placeResult is same data as trip, so we don't need both ====
      function checkNameExists(arr, newName) {
        return arr.some(function(e) {
          return e.name === newName.name;
        });
      }
      if (checkNameExists(trip, result) == false) {
          trip.push(result);
          tripIcons.push(markerIcon);
      }
      // If the user clicks a marker, show the details of that marker
      // in an info window.
      markers[index].placeResult = result;
      console.log("markers[" + index + "]: " + JSON.stringify(markers[index]));
      // ====if trail
      google.maps.event.addListener(markers[index], 'click', showInfoWindowTrail);
      setTimeout(dropMarker(index), i * 100);
      index++
    };

    // adding list results on right
    // creating blank cells
    var iconTd = document.createElement('td');
    var nameTd = document.createElement('td');
    var ratingTd = document.createElement('td');

    // fill in atrributes of the icon
    var icon = document.createElement('img');
    icon.src = markerIcon;
    icon.setAttribute('class', 'placeIcon');
    icon.setAttribute('className', 'placeIcon');

    var name = document.createTextNode(result.name);
    var rating = document.createTextNode("\nRating: " + result.rating);

    // add data into the cells
    iconTd.appendChild(icon);
    nameTd.appendChild(name);
    ratingTd.appendChild(rating);

    // add cells to the rows
    tr.appendChild(iconTd);
    tr.appendChild(nameTd);
    tr.appendChild(ratingTd);

    // add entire row to the results list
    results.appendChild(tr);
    return markers;
  }

  function clearResults() {
    var results = document.getElementById('results');
    while (results.childNodes[0]) {
      results.removeChild(results.childNodes[0]);
    }
  }

  // Load the place information into the HTML elements used by the info window.
  function buildIWContentEvent(place) {
    // document.getElementById('iw-icon').innerHTML = '<img class="hotelIcon" ' +
    //   'src="' + place.icon + '"/>';
    document.getElementById('iw-url').innerHTML = '<b><a href="' + place.url +
      '">' + place.name + '</a></b>';
    document.getElementById('iw-website-row').style.display = 'none';
    document.getElementById('iw-rating-row').style.display = 'none';
    document.getElementById('iw-difficulty-row').style.display = 'none';
    document.getElementById('iw-address-row').style.display = 'none';
    //document.getElementById('iw-address').textContent = place.address;
    document.getElementById('iw-eventDate-row').style.display = '';
    document.getElementById('iw-eventDate').textContent = place.start_time;
    document.getElementById('iw-venue-row').style.display = '';
    document.getElementById('iw-venue').textContent = place.venue;
    document.getElementById('iw-elevGain-row').style.display = 'none';

    if (place.formatted_phone_number) {
      document.getElementById('iw-phone-row').style.display = '';
      document.getElementById('iw-phone').textContent =
        place.formatted_phone_number;
    } else {
      document.getElementById('iw-phone-row').style.display = 'none';
    }
  }
  // Load the place information into the HTML elements used by the info window.
  function buildIWContentTrail(place) {
    // document.getElementById('iw-icon').innerHTML = '<img class="hotelIcon" ' +
    //   'src="' + place.icon + '"/>';
    document.getElementById('iw-url').innerHTML = '<b><a href="' + place.url +
      '">' + place.name + '</a></b>';
    //document.getElementById('iw-address').textContent = place.vicinity;
    document.getElementById('iw-website-row').style.display = 'none';
    document.getElementById('iw-address-row').style.display = 'none';
    document.getElementById('iw-eventDate-row').style.display = 'none';
    document.getElementById('iw-difficulty-row').style.display = '';
    document.getElementById('iw-difficulty').textContent = place.difficulty;
    document.getElementById('iw-venue-row').style.display = 'none';
    document.getElementById('iw-elevGain-row').style.display = '';
    document.getElementById('iw-elevGain').textContent = place.elevGain;

    if (place.formatted_phone_number) {
      document.getElementById('iw-phone-row').style.display = '';
      document.getElementById('iw-phone').textContent =
        place.formatted_phone_number;
    } else {
      document.getElementById('iw-phone-row').style.display = 'none';
    }

    // Assign a five-star rating to the hotel, using a black star ('&#10029;')
    // to indicate the rating the hotel has earned, and a white star ('&#10025;')
    // for the rating points not achieved.
    if (place.rating) {
      var ratingHtml = '';
      for (var i = 0; i < 5; i++) {
        if (place.rating < (i + 0.5)) {
          ratingHtml += '&#10025;';
        } else {
          ratingHtml += '&#10029;';
        }
        document.getElementById('iw-rating-row').style.display = '';
        document.getElementById('iw-rating').innerHTML = ratingHtml;
      }
    } else {
      document.getElementById('iw-rating-row').style.display = 'none';
    }
  }

  // Load the place information into the HTML elements used by the info window.
  function buildIWContent(place) {
    //document.getElementById('iw-icon').innerHTML = '<img class="hotelIcon" ' +
    //  'src="' + place.icon + '"/>';
    document.getElementById('iw-url').innerHTML = '<b><a href="' + place.url +
      '">' + place.name + '</a></b>';
    document.getElementById('iw-address').textContent = place.vicinity;
    document.getElementById('iw-eventDate-row').style.display = 'none';
    document.getElementById('iw-difficulty-row').style.display = 'none';
    document.getElementById('iw-venue-row').style.display = 'none';
    document.getElementById('iw-elevGain-row').style.display = 'none';

    if (place.formatted_phone_number) {
      document.getElementById('iw-phone-row').style.display = '';
      document.getElementById('iw-phone').textContent =
        place.formatted_phone_number;
    } else {
      document.getElementById('iw-phone-row').style.display = 'none';
    }

    // Assign a five-star rating to the hotel, using a black star ('&#10029;')
    // to indicate the rating the hotel has earned, and a white star ('&#10025;')
    // for the rating points not achieved.
    if (place.rating) {
      var ratingHtml = '';
      for (var i = 0; i < 5; i++) {
        if (place.rating < (i + 0.5)) {
          ratingHtml += '&#10025;';
        } else {
          ratingHtml += '&#10029;';
        }
        document.getElementById('iw-rating-row').style.display = '';
        document.getElementById('iw-rating').innerHTML = ratingHtml;
      }
    } else {
      document.getElementById('iw-rating-row').style.display = 'none';
    }

    // The regexp isolates the first part of the URL (domain plus subdomain)
    // to give a short URL for displaying in the info window.
    if (place.website) {
      var fullUrl = place.website;
      var website = hostnameRegexp.exec(place.website);
      if (website === null) {
        website = 'http://' + place.website + '/';
        fullUrl = website;
      }
      document.getElementById('iw-website-row').style.display = '';
      document.getElementById('iw-website').textContent = website;
    } else {
      document.getElementById('iw-website-row').style.display = 'none';
    }
  }
})
