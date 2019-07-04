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

  let wind = text.match(/([0-9]{3}|VRB)([0-9]{2,3})G{0,1}([0-9]{0,3})KT/);
  metar.drct = wind[1] === "VRB" ? wind[1] : +wind[1];
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
  metar.valid = {
    day: +time[1],
    hour: +time[2],
    minute: +time[3]
  }

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



function tafsTextToJson(text) {
  console.log(text)
  text = "KBED 221131Z 2212/2312 02004KT 5SM BR BKN025  \
    FM221600 04008KT 6SM BR VCSH OVC015  \
    FM221800 04010G19KT 5SM -SHRA OVC010  \
    FM221900 04010G21KT 3SM SHRA OVC008 \
    FM230000 02009KT 3SM -SHRA OVC008 \
    FM230900 01008KT 2SM BR VCSH OVC003"
  // Split it up and then analyze each line individually
//FM([0-9]{2})([0-9]{2})([0-9]{2}) ([0-9]{3}|VRB)([0-9]{2,3})G{0,1}([0-9]{0,3})KT ([0-9]{0,1})[ ]{0,1}(([0-9]{0,1})[\/]{0,1}([0-9]{1,2}))SM ([ ]{1}(([+|-]{0,1})([A-Z]{2}){1,2})(?![A-Z|0-9]))*
  let tafs = []

  let startStop = /([0-9]{2})([0-9]{2})\/([0-9]{2})([0-9]{2})/;
  let time = text.match(startStop);
  tafs.start = {
    day: time[1],
    hour: time[2]
  }

  tafs.end = {
    day: time[3],
    hour: time[4]
  }


  let from = /FM([0-9]{2})([0-9]{2})([0-9]{2})/g // ([0-9]{3}|VRB)([0-9]{2,3})G{0,1}([0-9]{0,3})KT([0-9]{0,1})[ ]{1}(([0-9]{0,1})[\/]{0,1}([0-9]{1,2}))SM (([+|-]{0,1})([A-Z]{2}){1,2}[ ]+)*(?![A-Z|0-9])*/g
  let wind = /([0-9]{3}|VRB)([0-9]{2,3})G{0,1}([0-9]{0,3})KT/g
  let vis = /([0-9]{0,1})[ ]{1}((P{0,1})([0-9]{0,1})[\/]{0,1}([0-9]{1,2}))SM/g
  let weather_regex = /SM (([+|-]{0,1})([A-Z]{2}){1,2}[ ]+(?![0-9]+))*/g;
  let clouds = /(CLR)|(([VV|A-O|Q-Z]{2,3})([0-9]{3}))/g;


  var from_;
  let i = 1;
  
  do {
    from_ = from.exec(text)
    let wind_ = wind.exec(text)
    let vis_ = vis.exec(text)
    let weather_ = weather_regex.exec(text)
    let cloud_ = clouds.exec(text)
    console.log(from_ ? from_[0] : "Null")
    console.log(wind_ ? wind_[0] : 'No Wind')
    console.log(vis_ ? vis_[0] : "No Vis")
    console.log(weather_ ? weather_[0] : "No Weather")
    console.log(cloud_ ? cloud_[0] : "No Cloud")
    



  } while (from_);
  



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


app.get('/api/newestTAFS/:ident', (req, res, next) => {
  let airportLetters = req.params.ident;
  console.log("newestTAFS")
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
