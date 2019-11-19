const express = require('express')
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const app = express()
const parsers = require('./weatherparser.js')
const runwayData = require('./RunwayData.js')
const airportData = require('./airportdata');
const addsClient = require('./addsclient');

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());


// App routing to get newestMetar for given airport ident
app.get('/api/newestMetar/:ident', (req, res, next) => {
  let airportLetters = airportData.resolveIdent(req.params.ident);

  addsClient.newestMetar(airportLetters)
    .then(metar => {
      if(metar){
        res.json(metar)
      }
      else {
        res.status(404).send();
      }
    }).catch(error => {
      console.error(error);
    });
});


app.get('/api/recentMETARs/:ident', (req, res, next) => {
  let airportLetters = airportData.resolveIdent(req.params.ident);
  let hours = req.query.hours || 5;

  addsClient.recentMetar(airportLetters, hours)
    .then(metar => {
      if(metar){
        res.json(metar)
      }
      else {
        res.status(404).send();
      }
    }).catch(error => {
      console.error(error);
    });
});

// Handle get TAF for ident
app.get('/api/newestTAFS/:ident', (req, res, next) => {
  let airportLetters = airportData.resolveIdent(req.params.ident);

  addsClient.stationTaf(airportLetters)
    .then(tafs => {
      res.json(tafs)
    });
});


// Return TAFs within a radius of the airport
app.get('/api/nearestTAFS/:ident/:radius(\\d+)?', (req, res, next) => {
  let airportLetters = airportData.resolveIdent(req.params.ident);

  airportData.getCoordinates(airportLetters)
    .then(coord => {
      addsClient.nearbyTafs(coord.lat, coord.lon, req.params.radius)
        .then(tafs => {
          res.json(tafs)
        });
    });
});

app.use(express.static(path.join(__dirname, 'client/build')));

app.get('*', (req, res, next) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'));
})

PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Weather Vis listening on ${PORT}!`);
});
