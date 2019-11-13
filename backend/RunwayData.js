const axios = require('axios');

function RunwayData() {

  function getRunways(airportID) {
    return axios.get(`https://api.aeronautical.info/dev/?airport=${airportID}&include=runways`)
      .then(result => {
        let airdata = result.data;
        if (airdata.runways) {
          return airdata.runways;
        } else {
          return null;
        }
      }).catch(err => {
        console.error(err);
        return null
      })
  }

  this.addRwysToMETAR = function (metar, airportID) {
    return getRunways(airportID)
      .then(result => {
        if (result) {
          for (let i = 0; i < result.length; i++) {
            let direction = result[i].name.split('/')[0]
            if (direction.length === 3) {
              direction = direction.slice(0, 2);
            }
            result[i].direction = +direction * 10;
          }
          metar.runways = result;
          
          return metar
        } else {
          console.log("Failed to Retrieve Data")
          return metar;
        }

      })
  }


}

module.exports = new RunwayData();