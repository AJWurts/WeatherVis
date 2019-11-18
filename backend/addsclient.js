const axios = require('axios');
const xml2js = require('xml2js');

// Client for the NWS ADDS service
const AddsClient = {
  baseUrl: 'https://aviationweather.gov/adds/dataserver_current/httpparam?',

  stationTaf(airportId) {
    return this._tafRequest(`stationString=${airportId}`)
  },

  nearbyTafs(lat, lon, distance=50) {
    return this._tafRequest(`radialDistance=${distance};${lon},${lat}`)
  },


  _tafRequest(query) {
    return new Promise((resolve, reject) => {
      axios.get(`${this.baseUrl}dataSource=tafs&requestType=retrieve&format=xml&hoursBeforeNow=0&timeType=valid&${query}`)
      .then(result => {
        var text = result.data;
        xml2js.parseStringPromise(text).then(parsed => {
          resolve(parsed.response.data[0].TAF);
        })
      })
    });
  }
}

module.exports = AddsClient;
