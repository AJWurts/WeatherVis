const express = require('express')
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const app = express()

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

function metarTextToJson(text) {
  let metar = {}

  let wind = text.match(/([0-9]{3})([0-9]{2,3})G{0,1}([0-9]{0,3})KT/);
  metar.drct = +wind[1];
  metar.sknt = +wind[2];
  metar.gust = wind.length == 4 ? +wind[3] : '';

  let pressure = text.match(/A([0-9]{4})/);
  metar.mslp = pressure[1];

  let visibility = text.match(/[A-Z]*([0-9]{1,2})SM/)
  metar.vsby = +visibility[1];

  let temp = text.match(/(M*[0-9]{1,3})\/(M*[0-9]{1,3})/)
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
      console.log(cloud);
      if (cloud[1]) {
        metar['skyc' + i] = cloud[1];
        i++;
        continue;
      } else {
        metar['skyc' + i] = cloud[3];
        metar['skyl' + i] = cloud[4];
      }
      i++;

    }
  } while (cloud);


  let rain = text.match(/([+|-]{0,1}RN)/)
  metar.rain = rain ? rain[1] : 0;

  let snow = text.match(/([+|-]{0,1}SN)/)
  metar.snow = snow ? snow[1] : 0;

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

      let metar = searchString.match(/<code>(.*)<\/code>/)[1];

      let metarJson = metarTextToJson(metar);



      console.log(text);
      res.json(metarJson);
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