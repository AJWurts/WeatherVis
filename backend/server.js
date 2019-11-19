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

function metarTextToJson(text) {
  let metar = {}
  metar.raw = text

  // Test Metar
  // text = "KBED 081656Z 19006KT 1/2SM R11/6000VP6000FT -RA BR OVC006 33/M12 A2986 RMK AO2 RAE19B46 CIG 004V008 PRESFR SLP135 P0000 T00500050"


  // Remove RMK and past

  text = text.match(/(.*)(RMK)+/)[0]

  // Wind
  let wind = text.match(/([0-9]{3}|VRB)([0-9]{2,3})G{0,1}([0-9]{0,3})KT/);

  if (wind) {
    metar.drct = wind[1] === "VRB" ? wind[1] : +wind[1];
    metar.sknt = +wind[2];
    metar.gust = wind.length === 4 ? +wind[3] : '';
  } else {
    metar.drct = 0;
    metar.sknt = 0;
    metar.gust = 0;
  }


  // Pressure

  let pressure = text.match(/A([0-9]{4})/);

  metar.alti = pressure ? pressure[1] : 0 ;

  let slp = text.match(/SLP([0-9]{3})/);
  metar.mslp = slp ? slp[1] : null;

  // Visbility. Includes various formats, 1 1/2, 1/2, 1/3, +10SM
  let vis = text.match(/([0-9]{0,1})[ ]{1}(([0-9]{0,1})[\/]{0,1}([0-9]{1,2}))SM./)

  if (vis && vis[1]) {
    metar.vsby = (+vis[1]) + (+vis[3]) / (+vis[4])
  } else if (vis && vis[3] && vis[2].includes('/')) {
    metar.vsby = (+vis[3]) / (+vis[4]);
  } else if (vis) {
    metar.vsby = +vis[2];
  }

  // Temperture 10/20, 10 is temperature in C, 20 is dew point in C
  let temp = text.match(/ (M*[0-9]{2,3})\/(M*[0-9]{2,3}) /)
  metar.tmpf = temp[1].includes("M") ? -(temp[1].slice(1, temp[1].length)) : +temp[1];
  metar.dwpf = temp[2].includes("M") ? -(temp[2].slice(1, temp[2].length)) : +temp[2];

  // Time in DDHHMM
  let time = text.match(/([0-9]{2})([0-9]{2})([0-9]{2})Z/)
  metar.valid = {
    day: +time[1],
    hour: +time[2],
    minute: +time[3]
  }

  // Clouds. BKN020 -> Broken 2000ft ceilings, SKC -> sky clear
  var cloud;
  var re = /(CLR)|(([VV|A-O|Q-Z]{2,3})([0-9]{3}))/g;
  let i = 1;
  do {
    cloud = re.exec(text);
    if (cloud) {
      if (cloud[1]) {
        metar['skyc' + i] = cloud[1];
        i++;
        continue;
      } else {
        metar['skyc' + i] = cloud[3];
        metar['skyl' + i] = +cloud[4] * 100;
      }
      i++;

    }
  } while (cloud);


  // Parses Weather and turns abbreviations into normal text
  let weather_regex = / (([+|-]{0,1})([A-Z]{2}){1,2})(?![A-Z|0-9])/g;
  //.*A[0-9]{4}
  var weather;
  metar.weather = [];
  do {
    weather = weather_regex.exec(text);
    if (weather) {
      let result = parsers.parseWAbbv(weather);
      if (result) {
        metar.weather.push(result);
      }
    }
  } while (weather)
  return metar;

}

// Process a FM line in a TAF


// Process a TEMPO, known for time less than an hour


// Process becoming



// App routing to get newestMetar for given airport ident
app.get('/api/newestMetar/:ident', (req, res, next) => {
  let airportLetters = airportData.resolveIdent(req.params.ident);
  console.log(airportLetters)

  axios.get(`https://www.aviationweather.gov/metar/data?ids=${airportLetters}&format=raw&hours=0&taf=on`)
    .then(result => {
      var text = result.data;
      // <!-- Data starts here -->
      let start = text.search(/<!-- Data starts here -->/)
      let end = text.search(/<!-- Data ends here -->/)

      let searchString = text.slice(start, end);

      let search = searchString.match(/<code>(.*)<\/code>/);
      if (!search) {
        res.status(404).send();
      } else {
        let metarJson = metarTextToJson(search[1]);
        return runwayData.addRwysToMETAR(metarJson, airportLetters);
      }

    }).then(result => {
      res.status(200).json(result);
    }).catch(error => {
      console.error(error);
    })
});

app.get('/api/recentMETARs/:ident', (req, res, next) => {
  let airportLetters = airportData.resolveIdent(req.params.ident);
  let hours = req.query.hours || 5;
  axios.get(`https://www.aviationweather.gov/metar/data?ids=${airportLetters}&format=raw&hours=${hours}`)
    .then(result => {
      var text = result.data;
      // <!-- Data starts here -->
      let start = text.search(/<!-- Data starts here -->/)
      let end = text.search(/<!-- Data ends here -->/)

      let searchString = text.slice(start, end);

      if (searchString.includes('<code>')) {
        let split = searchString.split('<br/>');


        let metars = [];

        for (let i = 0; i < split.length - 1; i++) {
          let trimmed = split[i].slice(i == 0 ? 32 : 8, split[i].length - 7)
          metars.push(metarTextToJson(trimmed))
        }
        return runwayData.addRwysToMETAR({metars: metars}, airportLetters);
      } else {
        res.status(404).send();
      }
    })
    .then(result => {
      res.status(200).json(result);
    })
    .catch(err => {
      console.log(err);
    })

})

// Handle get TAF for ident
app.get('/api/newestTAFS/:ident', (req, res, next) => {
  let airportLetters = airportData.resolveIdent(req.params.ident);

  airportData.getCoordinates(airportLetters)
    .then(coord => {
      addsClient.stationTaf(airportLetters)
        .then(tafs => {
          tafs = parsers.parseMultipleTAF(tafs);
          res.json(tafs)
        });
    });
});


// Return TAFs within a radius of the airport
app.get('/api/nearestTAFS/:ident/:radius(\\d+)?', (req, res, next) => {
  let airportLetters = airportData.resolveIdent(req.params.ident);

  airportData.getCoordinates(airportLetters)
    .then(coord => {
      addsClient.nearbyTafs(coord.lat, coord.lon, req.params.radius)
        .then(tafs => {
          tafs = parsers.parseMultipleTAF(tafs);
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
