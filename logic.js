// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";


// Create the tile layer that will be the background of our map
var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
  maxZoom: 5,
  id: "mapbox.light",
  accessToken: API_KEY
});


var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 5,
  id: "mapbox.dark",
  accessToken: API_KEY
});

var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 5,
  id: "mapbox.satellite",
  accessToken: API_KEY
});

// Initialize all of the LayerGroups we'll be using
var layers = {
  FaultLines: new L.LayerGroup(),
  Earthquakes: new L.LayerGroup()
};

var faults = L.geoJSON().addTo(layers['FaultLines']);
faults.addData(faultLinesGeo);


// Create the map with our layers
var map = L.map("map", {
  center: [40.73, -100.0059],
  zoom: 4,
  layers: [
    layers.FaultLines,
    layers.Earthquakes
  ]
});

// Add our 'lightmap' tile layer to the map
 lightmap.addTo(map);

var baseMaps = {
  "Light": lightmap,
  "Dark": darkmap,
  "Statellite": satellite
 

};


// Create an overlays object to add to the layer control
var overlays = {
  "Fault Lines": layers.FaultLines,
  "Earthquakes": layers.Earthquakes
};

// Create a control for our layers, add our overlay layers to it
L.control.layers(baseMaps, overlays).addTo(map);

function magColor(mag) {
  if(mag > 5){
    color = 'darkred'
  } else if (mag > 4) {
    color = 'red'
  } else if (mag > 3) {
    color = 'orange'
  } else if (mag > 2) {
    color = 'yellow'
  } else if (mag > 1) {
    color = 'yellowgreen'
  } else {
    color = 'green'
  }
  return color;
};

var legend = L.control({position: 'bottomright'});
legend.onAdd = function (map) {

  var div = L.DomUtil.create('div', 'info legend'),
  grades = [0, 1, 2, 3, 4, 5]
  for (var i = 0; i < grades.length; i++) {
    div.innerHTML +=
        ' <i style="background:' + magColor(grades[i]+1 ) + '"></i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '  <br>' : '+  ');
}

return div;

};
legend.addTo(map);


// Perform an API call to the Citi Bike quake Information endpoint
d3.json(queryUrl, function(quakes) {

    var quakesInfo = quakes.features;

    for (var i = 0; i < quakesInfo.length; i++) {

      var quake = Object.assign({}, quakesInfo[i]);

      var newCircle = L.circleMarker([quake.geometry.coordinates[1],quake.geometry.coordinates[0]], {
        'color': magColor(quake.properties.mag),
        'fillColor': magColor(quake.properties.mag),
        'fillOpacity': 0.8,
        'radius': (quake.properties.mag *3)
        
      });

      // Add the new marker to the appropriate layer
      newCircle.addTo(layers['Earthquakes']);

      // Bind a popup to the marker that will  display on click. This will be rendered as HTML
      newCircle.bindPopup(quake.properties.place + "<br>" + new Date(quake.properties.time) + "<br>Magnitude: " + quake.properties.mag );
    }
   
  });


