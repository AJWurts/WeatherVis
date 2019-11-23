const axios = require('axios');
const xml2js = require('xml2js');

// Client for the NWS ADDS service
const AddsClient = {
    baseUrl: 'https://aviationweather.gov/adds/dataserver_current/httpparam?requestType=retrieve&format=xml&',

    stationTaf(airportId) {
        return this._tafRequest(`stationString=${airportId}`)
    },

    nearbyTafs(lat, lon, distance = 50) {
        return this._tafRequest(`radialDistance=${distance};${lon},${lat}`)
    },

    nearbyMetars(lat, lon, distance = 50) {
        return this._metarRequest(`&hoursBeforeNow=1&radialDistance=${distance};${lon},${lat}`)
    },

    newestMetar(airportId) {
        return this._metarRequest(`stationString=${airportId}&hoursBeforeNow=5&mostRecent=true`)
    },

    recentMetar(airportId, hours) {
        return this._metarRequest(`stationString=${airportId}&hoursBeforeNow=${hours}`)
    },

    nearbyStations(lat, lon, distance = 50) {
        return this._stationRequest(`&radialDistance=${distance};${lon},${lat}`)
    },

    stationInfo(stationId) {
        return this._stationRequest(`&stationString=${stationId}`)
    },

    _tafRequest(query) {
        return new Promise((resolve, reject) => {
            axios.get(`${this.baseUrl}dataSource=tafs&hoursBeforeNow=1&timeType=valid&${query}`)
                .then(result => {
                    var text = result.data;
                    xml2js.parseStringPromise(text, { explicitArray: false }).then(parsed => {
                        resolve(parsed.response.data.TAF);
                    })
                }).catch(error => {
                    reject(error);
                })
        });
    },

    _metarRequest(query) {
        return new Promise((resolve, reject) => {
            axios.get(`${this.baseUrl}dataSource=metars&${query}`)
                .then(result => {
                    var text = result.data;
                    xml2js.parseStringPromise(text, { explicitArray: false }).then(parsed => {
                        resolve(parsed.response.data.METAR);
                    })
                }).catch(error => {
                    reject(error);
                })
        });
    },

    _stationRequest(query) {
        return new Promise((resolve, reject) => {
            axios.get(`${this.baseUrl}dataSource=stations&${query}`)
                .then(result => {
                    var text = result.data;
                    xml2js.parseStringPromise(text, { explicitArray: false }).then(parsed => {
                        console.log(parsed.response.data.Station);
                        resolve(parsed.response.data.Station);
                    })
                }).catch(error => {
                    reject(error);
                })
        });
    }

}

module.exports = AddsClient