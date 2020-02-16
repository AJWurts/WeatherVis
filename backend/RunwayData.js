const axios = require('axios');

function RunwayData() {

  this.getRunways = function (airportID) {
    return axios.get(`https://api.aeronautical.info/dev/?airport=${airportID}&include=runways`)
      .then(result => {
        let airdata = result.data;
        if (airdata.runways) {
          return airdata.runways;
        } else {
          return null;
        }
      }).catch(err => {
        // If request fails try without K for airports without ICAO
        return axios.get(`https://api.aeronautical.info/dev/?airport=${airportID.slice(1, airportID.length)}&include=runways`)
          .then(result => {
            let airdata = result.data;
            if (airdata.runways) {
              return airdata.runways;
            } else {
              return null;
            }
          }).catch(error => {
            // console.error(error);
            return null
          })

      })

  },

    this.addRwysToMETAR = function (metar, airportID) {
      return this.getRunways(airportID)
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
            // console.log("Failed to Retrieve Data")
            return metar;
          }

        })
    }


}

module.exports = new RunwayData();
