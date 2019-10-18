const express = require('express')
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const app = express()
const parsers = require('./weatherparser.js')

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
  result.raw = weather[0];
  let isValid = false;
  if (weather[2] && MODIFIERS[weather[2]]) {
    result.text += MODIFIERS[weather[2]] + ' ';
    isValid = true;
  }


  if (weather[1] && weather[1].length > 3) {

    if (weather[2]) {
      var val1 = weather[1].slice(1, 3);
      var val2 = weather[1].slice(3, 5);
    } else {
      var val1 = weather[1].slice(0, 2);
      var val2 = weather[1].slice(2, 4);
    }
    if (KEY[val1] && KEY[val2]) {
      result.text += KEY[val1] + " " + KEY[val2]
      isValid = true;
    }
  } else if (weather[3] && KEY[weather[3]]) {
    result.text += ' ' + KEY[weather[3]];
    isValid = true;
  }
  if (isValid) {
    return result;
  } else {
    return null;
  }
}


function metarTextToJson(text) {
  let metar = {}
  metar.raw = text
  // Test Metar
  // text = "KBED 081656Z 19006KT 1/2SM R11/6000VP6000FT -RA BR OVC006 33/M12 A2986 RMK AO2 RAE19B46 CIG 004V008 PRESFR SLP135 P0000 T00500050"

  // Wind
  let wind = text.match(/([0-9]{3}|VRB)([0-9]{2,3})G{0,1}([0-9]{0,3})KT/);
  metar.drct = wind[1] === "VRB" ? wind[1] : +wind[1];
  metar.sknt = +wind[2];
  metar.gust = wind.length === 4 ? +wind[3] : '';

  // Pressure 
  let pressure = text.match(/A([0-9]{4})/);
  metar.alti = pressure[1];

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
      let result = parseWAbbv(weather);
      if (result) {
        metar.weather.push(result);
      }
    }
  } while (weather)

  return metar;

}

// Process a FM line in a TAF
function processFrom(text) {
  let from = /FM([0-9]{2})([0-9]{2})([0-9]{2})/;
  ///----- FROM -----///
  current = {}
  from_ = from.exec(text)
  if (from_) {
    current.from = {
      day: +from_[1],
      hour: +from_[2],
      minute: +from_[3],
      raw: from_[0]
    }

  }
  current = { ...current, ...parsers.parseWind(text) }
  current = { ...current, ...parsers.parseVis(text) }
  current = { ...current, ...parsers.parseWeather(text) }
  current = { ...current, ...parsers.parseClouds(text) }

  return current;
}

// Process a TEMPO, known for time less than an hour
function processTempo(text) {
  let startStop = /([0-9]{2})([0-9]{2})\/([0-9]{2})([0-9]{2})/;
  let time = text.match(startStop);
  // TEMPO 1813/1815 4SM -SHRA 
  current = {}
  current.start = {
    day: +time[1],
    hour: +time[2]
  }

  current.end = {
    day: +time[3],
    hour: +time[4]
  }
  current = { ...current, ...parsers.parseWind(text) }
  current = { ...current, ...parsers.parseVis(text) }
  current = { ...current, ...parsers.parseWeather(text) }
  current = { ...current, ...parsers.parseClouds(text) }
  console.log(current)
  return current
}

// Process becoming: TBD
function processBecoming(text) {
  let timeRegex = /([0-9]{2})([0-9]{2})/;
  let times = timeRegex.exec(text);
  let current = {}
  current.start = times[1];
  current.end = times[2];



}

// Process TAF data from AWC text
function tafsTextToJson(text) {
  text = text.replace(/&nbsp;&nbsp;/g, '')
  let tafs = {}

  let released = /([0-9]{2})([0-9]{2})([0-9]{2})Z/g
  let created = released.exec(text)
  tafs.released = {
    day: +created[1],
    hour: +created[2],
    minute: +created[3],
    combined: created[0]
  }

  let startStop = /([0-9]{2})([0-9]{2})\/([0-9]{2})([0-9]{2})/;
  let time = text.match(startStop);
  tafs.start = {
    day: +time[1],
    hour: +time[2]
  }

  tafs.end = {
    day: +time[3],
    hour: +time[4]
  }

  tafs.raw = text
  let textsplit = text.split('<br\/>')
  tafs.forecast = []

  let current = {}
  current.raw = textsplit[0]

  let header = /(K[0-z]{3}|FM|TEMPO|BECMG|PROB)/;


  // Splits rows by <br/> and works line by line processing weather
  // each line usually consist of either FM, TEMPO or BECMG
  for (let i = 0; i < textsplit.length; i++) {
    text = textsplit[i]
    current = {}
    current.raw = textsplit[i]
    let header_ = header.exec(text);
    current.type = header_[1];

    if (current.type === 'TEMPO' || text.includes("TEMPO")) {
      tafs.forecast.push({ ...current, ...processTempo(current.raw) });
    } else if (current.type === 'FM' || current.type.includes('K')) {
      if (current.type !== 'FM') {
        current.from = tafs.start;
      }
      current.type = "FM"; // Overrides K*** type to From type
      tafs.forecast.push({ ...current, ...processFrom(current.raw) });
    } else if (current.type === 'BECMG') {
      tafs.forecast.push({ ...current, ...processBecoming(current.raw) });
    }
  }

  return tafs

}

// App routing to get newestMetar for given airport ident
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

app.get('/api/recentMETARs/:ident', (req, res, next) => {

  let airportLetters = req.params.ident;
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
          let trimmed = split[i].slice(i == 0 ? 32 : 8 , split[i].length - 7)
          metars.push(metarTextToJson(trimmed))
        }

        res.status(200).json(metars);
      } else {
        res.status(404).send();

      }
      // if (!search) {
      // } else {
      //   let metarJson = metarTextToJson(search[1]);
      //   res.status(200).json(metars);
      // }

    }).catch(err => {
      console.log(err);
    })

})

// Handle get TAF for ident
app.get('/api/newestTAFS/:ident', (req, res, next) => {
  let airportLetters = req.params.ident;
  axios.get(`https://www.aviationweather.gov/metar/data?ids=${airportLetters}&format=raw&hours=0&taf=on`)
    .then(result => {
      var text = result.data;

      let start = text.search(/<!-- Data starts here -->/)
      let end = text.search(/<!-- Data ends here -->/)

      let searchString = text.slice(start, end);
      let search = searchString.match(/<code>(.*)<\/code>.*\n.*<code>(.*)<\/code>/);
      if (!search) {
        res.status(404).send();
      } else {
        let tafs_json = tafsTextToJson(search[2]);
        res.json(tafs_json);
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
