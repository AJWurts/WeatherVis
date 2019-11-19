const axios = require('axios');
const xml2js = require('xml2js');

// Client for the NWS ADDS service
const AddsClient = {
  baseUrl: 'https://aviationweather.gov/adds/dataserver_current/httpparam?requestType=retrieve&format=xml&',

  stationTaf(airportId) {
    return this._tafRequest(`stationString=${airportId}`)
  },

  nearbyTafs(lat, lon, distance=50) {
    return this._tafRequest(`radialDistance=${distance};${lon},${lat}`)
  },

  newestMetar(airportId) {
    return this._metarRequest(`stationString=${airportId}&hoursBeforeNow=1`)
  },

  recentMetar(airportId, hours) {
    return this._metarRequest(`stationString=${airportId}&hoursBeforeNow=${hours}`)
  },

  _tafRequest(query) {
    return new Promise((resolve, reject) => {
      axios.get(`${this.baseUrl}dataSource=tafs&hoursBeforeNow=0&timeType=valid&${query}`)
      .then(result => {
        var text = result.data;
        xml2js.parseStringPromise(text, {explicitArray: false}).then(parsed => {
          resolve(parsed.response.data.TAF);
        })
      })
    });
  },

  _metarRequest(query) {
    return new Promise((resolve, reject) => {
      axios.get(`${this.baseUrl}dataSource=metars&${query}`)
      .then(result => {
        var text = result.data;
        xml2js.parseStringPromise(text, {explicitArray: false}).then(parsed => {
          resolve(parsed.response.data.METAR);
        })
      })
    });
  }

}

module.exports = AddsClient;
