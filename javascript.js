var map = L.map('map').setView([47.2454, -122.4385], 14);
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYXl1c2hqb3NoaTEzODAiLCJhIjoiY2xhajN2bjV0MDhuYTNzbGZ4eXY3aWV0YyJ9.-t8ccvCJhwwHcOdi435HrQ', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiYXl1c2hqb3NoaTEzODAiLCJhIjoiY2xhajN2bjV0MDhuYTNzbGZ4eXY3aWV0YyJ9.-t8ccvCJhwwHcOdi435HrQ'
}).addTo(map);

var drawnItems = L.featureGroup().addTo(map);

var tableData = L.layerGroup().addTo(map);
var url = "https://gisdb.xyz/sql?q=";
// change the Query below by replacing lab_7_name with your table name
var sqlQuery = "SELECT geom, name, spots, date, time FROM ayush_uwparking";
function addPopup(feature, layer) {
    layer.bindPopup(
        "<b>" + "Name: " + feature.properties.name + "</b><br>" +
        "<b>" + "Spots: " + feature.properties.spots + "</b><br>" +
        "<b>" + "Date: " + feature.properties.date + "</b><br>" +
        "<b>" + "Time: " + feature.properties.time + "</b><br>"
    );
}

fetch(url + sqlQuery)
    .then(function(response) {
    return response.json();
    })
    .then(function(data) {
        L.geoJSON(data, {onEachFeature: addPopup}).addTo(tableData);
    });

new L.Control.Draw({
    draw : {
        polygon : false,
        polyline : false,
        rectangle : false,     // Rectangles disabled
        circle : false,        // Circles disabled
        circlemarker : false,  // C
        marker: true
    },
    edit : {
        featureGroup: drawnItems
    }
}).addTo(map);

function createFormPopup() {
    var popupContent =
      //replace this block
        '<form>' +
        'Your name:<br><input type="text" id="name"><br>' +
        'How many spots do you see:<br><input type="number" id="spots"><br>' +
        'Enter date: <br><input type="date" id="date"><br>' +
        'Enter time: <br><input type="time" id="time"><br>' +
        '<input type="button" value="Submit" id="submit">' +
        '</form>'
     //but leave this part
    drawnItems.bindPopup(popupContent).openPopup();
}

//change the event listener code to this
map.addEventListener("draw:created", function(e) {
    e.layer.addTo(drawnItems);
    createFormPopup();
});

function setData(e) {
    if(e.target && e.target.id == "submit") {
        // Get user name and description
        	// CHANGE THE VAR NAMES TO SOMETHING THAT MAKES SENSE FOR YOUR FORM
        	// CHANGE THE ELEMENT IDs TO MATCH THE IDs YOU GAVE YOUR FORM INPUTS IN STEP 6.2
        	// INSERT ADDITIONAL VARS AND .getElementById STATEMENTS FOR EACH OF YOUR FORM INPUTS
        var enteredname = document.getElementById("name").value;
        var enteredspots = document.getElementById("spots").value;
        var entereddate = document.getElementById("date").value;
        var enteredtime = document.getElementById("time").value;
        // Print user name and description
        	// LOG TO THE CONSOLE ALL OF THE VARIABLES THAT HOLD THE INPUT VALUES FOR YOUR FORM
          drawnItems.eachLayer(function(layer) {

			// Create SQL expression to insert layer
            var drawing = JSON.stringify(layer.toGeoJSON().geometry);
            var sql =
                "INSERT INTO ayush_uwparking (geom, name, spots, date, time) " +
                "VALUES (ST_SetSRID(ST_GeomFromGeoJSON('" +
                drawing + "'), 4326), '" +
                enteredname + "', '" +
                enteredspots + "', '" +
                entereddate + "', '" +
                enteredtime + "');";
            console.log(sql);

            // Send the data
            fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: "q=" + encodeURI(sql)
            })
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                console.log("Data saved:", data);
            })
            .catch(function(error) {
                console.log("Problem saving the data:", error);
            });

        // Transfer submitted drawing to the tableData layer
        //so it persists on the map without you having to refresh the page
        var newData = layer.toGeoJSON();
        newData.properties.name = enteredname;
        newData.properties.spots = enteredspots;
        newData.properties.date = entereddate;
        newData.properties.time = enteredtime;
        L.geoJSON(newData, {onEachFeature: addPopup}).addTo(tableData);

    });
        // Clear drawn items layer
        drawnItems.closePopup();
        drawnItems.clearLayers();
    }
}

document.addEventListener("click", setData);

map.addEventListener("draw:editstart", function(e) {
    drawnItems.closePopup();
});
map.addEventListener("draw:deletestart", function(e) {
    drawnItems.closePopup();
});
map.addEventListener("draw:editstop", function(e) {
    drawnItems.openPopup();
});
map.addEventListener("draw:deletestop", function(e) {
    if(drawnItems.getLayers().length > 0) {
        drawnItems.openPopup();
    }
});
