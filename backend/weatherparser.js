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

function parseSkyCondition(cloudArray) {
    // If no clouds reported
    if (!cloudArray) {
        return [];
    }
    // Final Format
    /*
    clouds: [
        {
            cover: "CLR",
            base: "4000"
        },
        ...
    ]
    */
    let clouds = []

    for (let i = 0; i < cloudArray.length; i++) {
        let cloud = {}
        cloud['cover'] = cloudArray[i]['$']['sky_cover']
        cloud['base'] = parseInt(cloudArray[i]['$']['cloud_base_ft_agl'])
        clouds.push(cloud);
    }

    return clouds;
}
function parseTAF(json) {
    let keyConv = {
        // XML JSON: Std JSON
        raw_text: {
            conv: (d) => d[0],
            key: 'raw'
        },
        issue_time: {
            conv: d => parseDate(d[0]),
            key: 'released'
        },
        valid_time_from: {
            conv: d => parseDate(d[0]),
            key: 'start'
        },
        valid_time_to: {
            conv: d => parseDate(d[0]),
            key: 'end'
        }
    }

    let forecastKeyConv = {
        fcst_time_from: {
            conv: (d) => parseDate(d[0]),
            key: 'start',
        },
        fcst_time_to: {
            conv: (d) => parseDate(d[0]),
            key: 'end'
        },
        change_indicator: {
            conv: d => d ? d[0] : null,
            key: 'type',
        },
        wind_dir_degrees: {
            conv: (d) => parseInt(d[0]),
            key: 'drct'
        },
        wind_speed_kt: {
            conv: (d) => parseInt(d[0]),
            key: 'sknt',
        },
        wind_gust_kt: {
            conv: (d) => d ? parseInt(d[0]) : 0,
            key: 'gust',
        },
        visibility_statute_mi: {
            conv: (d) => parseFloat(d[0]),
            key: 'vsby',
        },
        wx_string: {
            conv: (d) => d ? parseWeather(d[0]) : [],
            key: 'weather'
        },
        sky_condition: {
            conv: (value) => parseSkyCondition(value),
            key: 'clouds',
        }
    }

    let stdJSON = {}

    for (let key in keyConv) {
        let stdKey = keyConv[key].key
        let convFunc = keyConv[key].conv
        stdJSON[stdKey] = convFunc(json[key])
    }

    stdJSON['forecast'] = []

    for (let i = 0; i < json.forecast.length; i++) {
        stdJSON['forecast'].push({})
        for (let key in forecastKeyConv) {

            let stdKey = forecastKeyConv[key].key
            let convFunc = forecastKeyConv[key].conv

            stdJSON['forecast'][i][stdKey] = convFunc(json['forecast'][i][key])

        }


    }

    return stdJSON;
}

function parseMultipleTAF(tafs) {
    let multiple = [];

    for (let i = 0; i < tafs.length; i++) {
        multiple.push(parseTAF(tafs[i]));
    }

    return multiple;
}

function parseDate(date) {
    let re = /([0-9]{2})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})Z/
    let data = re.exec(date)
    return {
        year: parseInt('20' + data[1]),
        month: parseInt(data[2]),
        day: parseInt(data[3]),
        hour: parseInt(data[4]),
        minute: parseInt(data[5]),
        second: parseInt(data[6])
    }
}


function parseWAbbv(weather) {
    let re = /(([+|-]{0,1})([A-Z]{2}){1,2})/;
    weather = re.exec(weather);

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





function parseWeather(weather) {
    // If no weather return empty list
    if (!weather) {
        return []
    }

    let stdWeather = []

    /* Final Format
    weather: [
        {
            text: "Heavy Rain",
            raw: "+RA" 
        },
        ...
    ]
    */

    let splitWeather = weather.split(' ')

    return splitWeather.map(parseWAbbv);
}



function parseMETAR() {

}

module.exports = { parseDate, parseWeather, parseTAF, parseMultipleTAF, parseMETAR, parseSkyCondition }