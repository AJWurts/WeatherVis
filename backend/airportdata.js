const axios = require('axios');

const AirportData = {
  resolveIdent(airportId) {
    if (airportId.slice(0, 1) === "K") {
      return airportId;
    }
    if (airportId.length == 3) {
      return "K" + airportId;
    }
    return airportId;
  },

  getCoordinates(airportId) {
    return axios.get(`https://api.aeronautical.info/dev/?appid=WeatherVis&airport=${airportId}&include=geographic`)
      .then(result => {
        let airdata = result.data;

        return {
          lat: this.dmsToDec(airdata.latitude_dms),
          lon: this.dmsToDec(airdata.longitude_dms),
        }

      }).catch(err => {
        // console.error(err);
        return null
      })
  },


  dmsToDec(value) {
    let sign = 1

    if(['W', 'S'].includes(value[value.length - 1])) {
      sign = -1
    }

    let parts = value.split('-')

    return sign * (parseInt(parts[0], 10) +
      (parseInt(parts[1], 10) / 60) +
      (parseFloat(parts[2], 10) / 3600))
  }
}

module.exports = AirportData;
