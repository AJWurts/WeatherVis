const KEY = {
    BC: 'patchy',
    BL: 'blowing',
    BR: 'fog',
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


function parseVis(text) {
    let vis = /([0-9]{0,1})[ ]{1}((P{0,1})([0-9]{0,1})[\/]{0,1}([0-9]{1,2})SM)/
    let vis_ = vis.exec(text)

    let current = {};
    if (vis_) {
        if (vis[1]) {
            current.vsby = (+vis[1]) + (+vis[5]) / (+vis[6])
        } else if (vis[3] && vis[2].includes('/')) {
            current.vsby = (+vis[3]) / (+vis[4]);
        } else if (vis_[3] === 'P') {
            current.vsby = 10
        } else {
          current.vsby = +vis_[5]
        }
    }


    return current;
}

function parseWind(text) {
    let wind = /([0-9]{3}|VRB)([0-9]{1,3})G{0,1}([0-9]{0,3})KT/;
    let current = {};
    let wind_ = wind.exec(text);
    if (wind_) {
        current.drct = wind_[1] === "VRB" ? wind_[1] : +wind_[1];
        current.sknt = +wind_[2];
        current.gust = wind_.length === 4 ? +wind_[3] : '';
    }


    return current;
}

function parseWeather(text) {
    
    let weather_regex = /(([+|-]{0,1})([A-Z]{2}){1,2})/;
    let current = {};
    let current_split = text.split(' ');
    let j = current_split.length - 1;
    let weather_;
    current.weather = [];
    do {
        weather_ = current_split[j];
        if (j === 1) break;
        if (weather_ && weather_.length >= 2 && weather_.length <= 5 && !weather_.includes("SM") && !weather_.includes("SKC")) {
            let regexed = weather_regex.exec(weather_);
            current.weather.push(parseWAbbv(regexed));
        }
        j--;
    } while (weather_.length === 0 || !weather_.includes("SM") || j < 0)


    return current;
}

function parseClouds(text) {
    let current = {};
    let current_split = text.split(' ');
    let cloud_;
    j = current_split.length - 1;
    let layer_count = 1;
    do {
        if (j === 0) break;
        cloud_ = current_split[j];
        

        if (cloud_ && cloud_.length === 6) {
            current['skyc' + layer_count] = cloud_.slice(0, 3);
            current['skyl' + layer_count] = +cloud_.slice(3, 7) * 100;
            layer_count++;
        }
        j--;
    } while (cloud_.length === 0 || cloud_.length >= 6)

    if (!current['skyc1']) {
      current['skyc1'] = 'SKC'
      current['skyl1'] = 100000 
    }
    return current
}


module.exports = { parseClouds, parseVis, parseWeather, parseWind }