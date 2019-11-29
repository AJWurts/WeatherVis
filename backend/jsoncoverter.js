/// Weather Parsing from XML to JSON

/// Constants for Weather Transform
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


// Utility Functions
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
    if (clouds.length === 0) {
        let cloud = {}
        cloud['cover'] = cloudArray['$']['sky_cover']
        cloud['base'] = parseInt(cloudArray['$']['cloud_base_ft_agl'])
        clouds.push(cloud);
    }

    return clouds;
}

function parseDate(date) {
    let re = /([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})Z/
    let data = re.exec(date)
    return {
        year: parseInt(data[1]),
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
    let parsedWeather = []
    for (let i = 0; i < splitWeather.length; i++) {
        let parsed = parseWAbbv(splitWeather[i]);
        if (parsed) {
            parsedWeather.push(parsed);
        }

    }
    return parsedWeather;
}

// TAF PARSING
function parseTAF(json) {
    let keyConv = {
        // XML JSON: Std JSON
        raw_text: {
            conv: (d) => d,
            key: 'raw'
        },
        station_id: {
            conv: (d) => d,
            key: 'airport'
        },
        issue_time: {
            conv: d => parseDate(d),
            key: 'released'
        },
        valid_time_from: {
            conv: d => parseDate(d),
            key: 'start'
        },
        valid_time_to: {
            conv: d => parseDate(d),
            key: 'end'
        }
    }

    let forecastKeyConv = {
        fcst_time_from: {
            conv: (d) => parseDate(d),
            key: 'start',
        },
        fcst_time_to: {
            conv: (d) => parseDate(d),
            key: 'end'
        },
        change_indicator: {
            conv: d => d ? d : null,
            key: 'type',
        },
        wind_dir_degrees: {
            conv: (d) => d ? parseInt(d) : null,
            key: 'drct'
        },
        wind_speed_kt: {
            conv: (d) => d ? parseInt(d) : null,
            key: 'sknt',
        },
        wind_gust_kt: {
            conv: (d) => d ? parseInt(d) : null,
            key: 'gust',
        },
        visibility_statute_mi: {
            conv: (d) => d ? parseFloat(d) : null,
            key: 'vsby',
        },
        wx_string: {
            conv: (d) => d ? parseWeather(d) : [],
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

    if (!Array.isArray(json.forecast)) {

        json.forecast = [json.forecast]
    }

    for (let i = 0; i < json.forecast.length; i++) {
        stdJSON['forecast'].push({})
        for (let key in forecastKeyConv) {

            let stdKey = forecastKeyConv[key].key
            let convFunc = forecastKeyConv[key].conv

            stdJSON['forecast'][i][stdKey] = convFunc(json['forecast'][i][key])
        }

        // Need to convert the data to the raw format to display


    }

    return stdJSON;
}

function parseMultipleTAF(tafs) {
    let multiple = [];

    // // Still do the right thing even if we were only given a single TAF.
    if (!Array.isArray(tafs)) {
        console.log(tafs);
        tafs = [tafs]
    }

    for (let i = 0; i < tafs.length; i++) {
        multiple.push(parseTAF(tafs[i]));
    }

    return multiple;
}


// METAR PARSING
function parseMETAR(json) {

    let keyConv = {
        // XML JSON: Std JSON
        raw_text: {
            conv: (d) => d,
            key: 'raw'
        },
        station_id: {
            conv: (d) => d,
            key: 'airport'
        },
        observation_time: {
            conv: d => d ? parseDate(d) : null,
            key: 'valid'
        },
        temp_c: {
            conv: d => d ? parseFloat(d) : null,
            key: 'tmpf',
        },
        dewpoint_c: {
            conv: d => d ? parseFloat(d) : null,
            key: 'dwpf',
        },

        wind_dir_degrees: {
            conv: (d) => d ? parseInt(d) : null,
            key: 'drct'
        },
        wind_speed_kt: {
            conv: (d) => d ? parseInt(d) : null,
            key: 'sknt',
        },
        wind_gust_kt: {
            conv: (d) => d ? parseInt(d) : null,
            key: 'gust',
        },
        visibility_statute_mi: {
            conv: (d) => d ? parseFloat(d) : null,
            key: 'vsby',
        },
        altim_in_hg: {
            conv: d => d ? parseFloat(d) : null,
            key: 'alti',
        },
        sea_level_pressure_mb: {
            conv: d => d ? parseFloat(d) : null,
            key: 'mslp',
        },
        flight_category: {
            conv: d => d ? d : null,
            key: 'flightcat',
        },
        precip_in: {
            conv: d => d ? parseFloat(d) : null,
            key: 'percip',
        },
        wx_string: {
            conv: (d) => d ? parseWeather(d) : [],
            key: 'weather'
        },
        sky_condition: {
            conv: (value) => value ? parseSkyCondition(value) : [],
            key: 'clouds',
        }
    }

    let stdJSON = {}
    for (let key in keyConv) {
        let stdKey = keyConv[key].key
        let convFunc = keyConv[key].conv
        stdJSON[stdKey] = convFunc(json[key])
    }


    return stdJSON;

}

function parseMultipleMETAR(metars) {
    let multiple = [];

    if (!Array.isArray(metars)) {
        multiple = Array(metars)
    }


    for (let i = 0; i < metars.length; i++) {
        multiple.push(parseMETAR(metars[i]));
    }

    return multiple;
}


/// STATION PARSING
function parseStation(json) {
    let keyConv = {
        // XML JSON: Std JSON

        station_id: {
            conv: (d) => d,
            key: 'airport'
        },
        latitude: {
            conv: d => d ? parseFloat(d) : null,
            key: 'lat'
        },
        longitude: {
            conv: d => d ? parseFloat(d) : null,
            key: 'lon',
        },
        elevation_m: {
            conv: d => d ? parseFloat(d) : null,
            key: 'elevation',
        },
        site: {
            conv: (d) => d ? d : null,
            key: 'name'
        },
        state: {
            conv: (d) => d ? d : null,
            key: 'state',
        },
        country: {
            conv: (d) => d ? d : null,
            key: 'country',
        },
        site_type: {
            conv: (d) => d ? Object.keys(d) : [],
            key: "typeList"
        }

    }


    /*<station_id>KBKF</station_id>
        <latitude>39.72</latitude>
        <longitude>-104.75</longitude>
        <elevation_m>1726.0</elevation_m>
        <site>BUCKLEY ANGB/DEN</site>
        <state>CO</state>
        <country>US</country>
        <site_type>
        <METAR/>
        <TAF/>
        </site_type>
        }
        */

    let stdJSON = {}
    for (let key in keyConv) {
        let stdKey = keyConv[key].key
        let convFunc = keyConv[key].conv
        stdJSON[stdKey] = convFunc(json[key])
    }


    return stdJSON;

}


function parseMultipleStations(json) {

    let multiple = [];

    if (!Array.isArray(json)) {
        multiple = Array(json)
    }


    for (let i = 0; i < json.length; i++) {
        multiple.push(parseStation(json[i]));
    }

    return multiple;

}

module.exports = { parseDate, parseWeather, parseSkyCondition, parseTAF, parseMultipleTAF, parseMETAR, parseMultipleMETAR, parseStation, parseMultipleStations }