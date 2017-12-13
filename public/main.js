//var GoogleMapsJsAPI = AIzaSyCOK8unHwKjh44byRIfMgAuRBpoH63_CqE
//var GoogleMapsDirectionsAPI = AIzaSyBna-nft5cxYdVqD4vHCgurCqhi3B9zNhY
//var GoogleMapsPlacesAPI = AIzaSyAGzhtIF6wqZ96WemXVfDdg3TerD_TYyiU
//var eventfulKey = pcXqHp3KG3jmtgNJ
//var API = http://api.eventful.com/json/events/search?...&location=San+Diego
//var hikingProjectAPI = 200192113-0e12500ca3d4423414d88aaa658cda2e
//var https://www.hikingproject.com/data/get-trails?lat=40.0274&lon=-105.2519&maxDistance=10&key=200192113-0e12500ca3d4423414d88aaa658cda2e

// initialize map on webpage
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: countries['us'].zoom,
    center: countries['us'].center,
    mapTypeControl: false,
    panControl: false,
    zoomControl: false,
    streetViewControl: false
  });
}

var map, places, infoWindow;
var markers = [];
var autocomplete;
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
$(document).ready(function() {

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
        var search = {
          bounds: map.getBounds(),
          types: [$("#placeType option:selected").text()]
        };
        if (search.types == 'event') {
          getEvents()
        }
        // if (search.types == 'trail') {
        //   getTrails()
        // }
        places.nearbySearch(search, function(results, status) {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            clearResults();
            //clearMarkers();
            // Create a marker for each place found, and
            // assign a letter of the alphabetic to each marker icon.
            for (var i = 0; i < 13; i++) {
              var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
              var markerIcon = MARKER_PATH + markerLetter + '.png';
              // // If the user clicks a hotel marker, show the details of that hotel
              // // in an info window.
              // markers[i].placeResult = results[i];
              // google.maps.event.addListener(markers[i], 'click', showInfoWindow);
              // setTimeout(dropMarker(i), i * 100);
              addResult(results[i], i);
            }
          }
        });
      }

      function clearMarkers() {
        for (var i = 0; i < markers.length; i++) {
          if (markers[i]) {
            markers[i].setMap(null);
          }
        }
        markers = [];
      }

      // Set the country restriction based on user input.
      // Also center and zoom the map on the given country.
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

      function dropMarker(i) {
        return function() {
          markers[i].setMap(map);
        };
      }

      // if user selects trail from drop down
      $("#trailForm").submit(function(event) {
        //if ($("#placeType option:selected").text() == "trail") {
        event.preventDefault();
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
              name: body.trails[i].name,
              rating: body.trails[i].stars,
              url: body.trails[i].url,
              difficulty: body.trails[i].difficulty,
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

          // var lat = result[0].geometry.location.lat
          // var lng = result[0].geometry.location.lng
          // var latlng = lat + ',' + lng
          // console.log('latlng = ' + latlng)
          //
          // $.get(`/getPlaceId?latlng=${latlng}`, function(body, status) {
          //   var result2 = []
          //   //body = JSON.parse(body);
          //   console.log("Here's the body: " + body)
          //   for (var i = 0; i < 9; i++) {
          //     result2.push({
          //       place_id: body.results[i].place_id
          //       // place_id: ChIJj_jCfVJ5bIcR0GcWvs-SkkA
          //     })
          //     console.log("placeID: " + result2[i].place_id)
          //   }
          // })

        })

        $("#eventsForm").submit(function(event) {
          //if ($("#placeType option:selected").text() == "trail") {
          event.preventDefault();
          clearResults();
          var place = autocomplete.getPlace();
          var location = place.address_components[0].long_name
          var keyword = $("#eventType option:selected").text()
          var date = $("#eventTime option:selected").text()

          $.get(`/apiEvent?keywords=${keyword}&location=${location}&date=${date}`, function(body, status) {
            body = JSON.parse(body);
            //console.log(body)
            var result = []
            for (var i = 0; i < 13; i++) {
              result.push({
                name: body.events.event[i].title,
                url: body.events.event[i].url,
                address: body.events.event[i].venue_address,
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
          var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
          var markerIcon = MARKER_PATH + markerLetter + '.png';
          var tr = document.createElement('tr');
          tr.style.backgroundColor = (i % 2 === 0 ? '#d0d8cd' : '#FFFFFF');

          // when user clicks on result, add it to map
          tr.onclick = function(evt) {
            google.maps.event.trigger(markers[i], 'click');
            markers[i] = new google.maps.Marker({
              position: result.geometry.location,
              animation: google.maps.Animation.DROP,
              icon: markerIcon
            });
            // If the user clicks a marker, show the details of that marker
            // in an info window.
            markers[i].placeResult = result;
            google.maps.event.addListener(markers[i], 'click', showInfoWindow);
            setTimeout(dropMarker(i), i * 100);
          };

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
          nameTd.appendChild(rating);

          tr.appendChild(iconTd);
          tr.appendChild(nameTd);
          tr.appendChild(ratingTd);

          results.appendChild(tr);
        }

        function addResultEvent(result, i) {
          // var results = document.getElementById('results');
          // var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
          // var labelIndex = 0;
          var markerLetter = String.fromCharCode('a'.charCodeAt(0) + (i % 26));
          //var markerIcon = MARKER_URL + markerLetter + '.png';
          var markerIcon = `http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=${markerLetter}|FE7569`
          //var markerIcon = 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FE7569';
          var tr = document.createElement('tr');
          tr.style.backgroundColor = (i % 2 === 0 ? '#d0d8cd' : '#FFFFFF');

          // when user clicks on result, add it to map
          tr.onclick = function(evt) {
            google.maps.event.trigger(markers[i], 'click');
            markers[i] = new google.maps.Marker({
              position: result.geometry.location,
              animation: google.maps.Animation.DROP,
              icon: markerIcon,
              //label: labels[labelIndex++ % labels.length],
              //label: markerLetter
            });
            // If the user clicks a marker, show the details of that marker
            // in an info window.
            function showInfoWindowTrail() {
              var marker = this;
              infoWindow.open(map, marker);
              buildIWContentTrail(markers[i].placeResult);
            }

            // If the user clicks a marker, show the details of that marker
            // in an info window.
            markers[i].placeResult = result;
            google.maps.event.addListener(markers[i], 'click', showInfoWindowTrail);
            setTimeout(dropMarker(i), i * 100);

          };

          var iconTd = document.createElement('td');
          var nameTd = document.createElement('td');
          var dateTd = document.createElement('td');

          var icon = document.createElement('img');
          icon.src = markerIcon;
          icon.setAttribute('class', 'placeIcon');
          icon.setAttribute('className', 'placeIcon');

          var name = document.createTextNode(result.name);
          var date = document.createTextNode("\nDate: " + result.start_time);

          iconTd.appendChild(icon);
          nameTd.appendChild(name);
          nameTd.appendChild(date);

          tr.appendChild(iconTd);
          tr.appendChild(nameTd);
          tr.appendChild(dateTd);

          results.appendChild(tr);
        }

        function addResultTrail(result, i) {
          var results = document.getElementById('results');
          var markerLetter = String.fromCharCode('1'.charCodeAt(0) + (i % 26));
          var markerIcon = `http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=${markerLetter}|d8be8c`

          var tr = document.createElement('tr');
          tr.style.backgroundColor = (i % 2 === 0 ? '#d0d8cd' : '#FFFFFF');

          // when user clicks on result, add it to map
          tr.onclick = function(evt) {
            google.maps.event.trigger(markers[i], 'click');
            markers[i] = new google.maps.Marker({
              position: result.geometry.location,
              animation: google.maps.Animation.DROP,
              icon: markerIcon
            });

            function showInfoWindowTrail() {
              var marker = this;
              infoWindow.open(map, marker);
              buildIWContentTrail(markers[i].placeResult);
            }

            // If the user clicks a marker, show the details of that marker
            // in an info window.
            markers[i].placeResult = result;
            google.maps.event.addListener(markers[i], 'click', showInfoWindowTrail);
            setTimeout(dropMarker(i), i * 100);
          };

          // adding list results on right
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
          nameTd.appendChild(rating);

          tr.appendChild(iconTd);
          tr.appendChild(nameTd);
          tr.appendChild(ratingTd);

          results.appendChild(tr);
        }

        function clearResults() {
          var results = document.getElementById('results');
          while (results.childNodes[0]) {
            results.removeChild(results.childNodes[0]);
          }
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
        }

          // places.getDetails({
          //     placeId: marker.placeResult.place_id
          //   },
          //   function(place, status) {
          //     if (status !== google.maps.places.PlacesServiceStatus.OK) {
          //       return;
          //     }
          //   });


        // Load the place information into the HTML elements used by the info window.
        function buildIWContentTrail(place) {
          // document.getElementById('iw-icon').innerHTML = '<img class="hotelIcon" ' +
          //   'src="' + place.icon + '"/>';
          document.getElementById('iw-url').innerHTML = '<b><a href="' + place.url +
            '">' + place.name + '</a></b>';
          document.getElementById('iw-address').textContent = place.vicinity;
          document.getElementById('iw-website-row').style.display = 'none';
          document.getElementById('iw-address-row').style.display = 'none';

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

      // $("#form").submit(function(event) {
      //   event.preventDefault();
      //   var keywords = document.getElementById("eventType").value;
      //   var location = document.getElementById("location").value;
