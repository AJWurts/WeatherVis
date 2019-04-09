const express = require('express')
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const app = express()

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());
const KEY = {
  BC: 'patchy',
  BL: 'blowing',
  BR: 'mist',
  DR: 'low drifting',
  DU: 'dust storm',
  DZ: 'drizzle',
  E: 'ended',
  FC: 'funnel cloud',
  FG: 'fog',
  FU: 'smoke',
  FZ: 'freezing',
  GR: 'hail (>5mm)',
  GS: 'small hail/snow pellets (<5mm)',
  HZ: 'haze',
  IC: 'ice crystals',
  MI: 'shallow',
  PL: 'ice pellets',
  PO: 'dust devil',
  PR: 'partial',
  PY: 'spray',
  RA: 'rain',
  SA: 'sand',
  SG: 'snow grains',
  SH: 'showers',
  SN: 'snow',
  SQ: 'squalls moderate',
  SS: 'sandstorms',
  TS: 'thunderstorms',
  UP: 'unknown percipitation',
  VA: 'volcanic ash',
  VC: 'vicinity'
}

const MODIFIERS = {
  '+': 'heavy',
  '-': 'light',
  'P': 'more than',
  'M': 'less than',
  'B': 'began',
  'E': 'ended'
}
function parseWAbbv(weather) {
  let result = {
    text: ""
  };
  result.raw = weather[1];
  if (weather[2]) {
    result.text += MODIFIERS[weather[2]] + ' ';
  }
  if (weather[1] && weather[1].length > 3) {

    if (weather[2]) {
      var val1 = weather[1].slice(1, 3);
      var val2 = weather[1].slice(3, 5);
    } else {
      var val1 = weather[1].slice(0, 2);
      var val2 = weather[1].slice(2, 4);
    }

    result.text +=  KEY[val1] + " " + KEY[val2]
  } else if (weather[3]) {
    result.text += ' ' + KEY[weather[3]]

  }

  return result;
}


function metarTextToJson(text) {
  let metar = {}

  // Test Metar
  // text = "KBED 081656Z 02006KT 1/2SM R11/6000VP6000FT -RA BR OVC006 33/M12 A2986 RMK AO2 RAE19B46 CIG 004V008 PRESFR SLP135 P0000 T00500050"

  let wind = text.match(/([0-9]{3})([0-9]{2,3})G{0,1}([0-9]{0,3})KT/);
  metar.drct = +wind[1];
  metar.sknt = +wind[2];
  metar.gust = wind.length == 4 ? +wind[3] : '';

  let pressure = text.match(/A([0-9]{4})/);
  metar.alti = pressure[1];

  let slp = text.match(/SLP([0-9]{3})/);
  metar.mslp = slp ? slp[1] : null;

  //
  let vis = text.match(/([0-9]{0,1})[ ]{1}(([0-9]{0,1})[\/]{0,1}([0-9]{1,2}))SM./)
  if (vis[1]) {
    metar.vsby = (+vis[1]) + (+vis[3]) / (+vis[4])
  } else if (vis[3] && vis[2].includes('/')) {
    metar.vsby = (+vis[3]) / (+vis[4]);
  } else {
    metar.vsby = +vis[2];
  }

  let temp = text.match(/ (M*[0-9]{2,3})\/(M*[0-9]{2,3}) /)
  metar.tmpf = temp[1].includes("M") ? -(temp[1].slice(1, temp[1].length)) : +temp[1];
  metar.dwpf = temp[2].includes("M") ? -(temp[2].slice(1, temp[2].length)) : +temp[2];

  let time = text.match(/([0-9]{2})([0-9]{2})([0-9]{2})Z/)
  metar.valid = time[0];

  // let clouds = matchAll(text, ).toArray()
  var cloud;
  var re = /(CLR)|(([A-O|Q-Z]{3})([0-9]{3}))/g;
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


  let weather_regex = / (([+|-]{0,1})([A-Z]{2}){1,2})(?![A-Z|0-9]).*A[0-9]{4}/g;
  var weather;
  metar.weather = [];
  do {
    weather = weather_regex.exec(text);
    if (weather) {
      let result = parseWAbbv(weather);
      metar.weather.push(result);
      continue;
    }
  } while (weather)

  return metar;

}


app.get('/api/newestMetar/:ident', (req, res, next) => {

  let airportLetters = req.params.ident;
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
        res.json(metarJson);
      }

    })
});

app.use(express.static(path.join(__dirname, 'client/build')));

app.get('*', (req, res, next) => {
  res.status(404).send();
})

PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Weather Vis listening on ${PORT}!`);
});
