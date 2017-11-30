var GoogleMapsJsAPI = AIzaSyCOK8unHwKjh44byRIfMgAuRBpoH63_CqE
var GoogleMapsDirectionsAPI = AIzaSyBna-nft5cxYdVqD4vHCgurCqhi3B9zNhY
var GoogleMapsPlacesAPI = AIzaSyAGzhtIF6wqZ96WemXVfDdg3TerD_TYyiU
var eventfulKey = pcXqHp3KG3jmtgNJ
//var API = http://api.eventful.com/json/events/search?...&location=San+Diego

  function initMap() {
    var boulder = {lat: 40.017, lng: -105.28};
    var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 12,
      center: boulder
    });
    var marker = new google.maps.Marker({
      position: boulder,
      map: map
    });
  }
