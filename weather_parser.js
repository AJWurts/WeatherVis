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


let text = 'KBED 081656Z 02006KT 1/2SM R11/6000VP6000FT -GR -FZRA OVC006 33/M12 A2986 RMK AO2 RAE19B46 CIG 004V008 PRESFR SLP135 P0000 T00500050'


let weather_regex = / (([+|-]{0,1})([A-Z]{2}){1,2})(?![A-Z|0-9])/g;
var weather;
// metar.weather = [];
do {
  weather = weather_regex.exec(text);
  if (weather) {
    let result = parseWAbbv(weather);
    // metar.weather.push(result);

    console.log(result.text);
    continue;
  }
} while (weather)
let hi = 1;