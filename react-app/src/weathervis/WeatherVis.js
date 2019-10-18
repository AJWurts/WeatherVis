import React, { Component } from 'react';
import axios from 'axios';
import Wind from './onemetar/wind.jsx';
import Visibility from './onemetar/visibility';
import CloudLayersVis from './onemetar/CloudLayersVis';
import Temp from './onemetar/temp.jsx';
import Percip from './onemetar/percip.jsx';
import Pressure from './onemetar/pressure.jsx';
import TimeLine from './timeline/timeline.jsx'
import { LabelValue, SearchBox } from '../components';

import './weathervis.css';

class WeatherVis extends Component {
  constructor(props) {
    super(props);

    this.state = {
      metar: null,
      taf: null,
      airport: "KBED",
      tafErrorMessage: 'Loading TAF...',
      metarErrorMessage: 'Loading METAR...'
    }
  }

  UNSAFE_componentWillMount() {
    axios.get(`/api/recentMETARs/${this.state.airport}`)
      .then(result => {

        this.setState({
          metar: result.data,
          metarErrorMessage: ''
        })
      }).catch(err => {
        this.setState({
          metar: null,
          metarErrorMessage: "Could not find airport. Try again."
        })
      })

    axios.get(`/api/newestTAFS/${this.state.airport}`)
      .then(result => {

        this.setState({
          taf: result.data,
          tafErrorMessage: ''
        })
      }).catch(err => {
        this.setState({
          taf: null,
          tafErrorMesssage: 'No TAF available'
        })
      })


  }



  handleMouseOver = (metar) => {
    this.setState({
      metar: metar
    })
  }

  onSearch = (ident) => {
    axios.get(`/api/recentMETARs/${ident}`)
      .then(result => {
        console.log(result.data)

        this.setState({
          metar: result.data,
          airport: ident,
          metarErrorMessage: ''
        })
      }).catch(error => {
        console.log("Metar Failed");
        this.setState({
          metar: null,
          metarErrorMessage: "Could not find airport. Try again"
        })
      })

    axios.get(`/api/newestTAFS/${ident}`)
      .then(result => {
        this.setState({
          taf: result.data,
          tafErrorMessage: ''
        })
      }).catch(err => {
        console.log("Taf Failed")
        this.setState({
          taf: null,
          tafErrorMessage: "No TAF available"
        })
      })
  }

  //

  render() {
    var { taf, metar, airport, tafErrorMessage, metarErrorMessage } = this.state;

    if (metar) {
      let metarDate = new Date()
      metarDate.setUTCDate(metar[0].valid.day)
      metarDate.setUTCHours(metar[0].valid.hour, metar[0].valid.minute)

      let diff = new Date() - metarDate
      let hours = diff / 3.6e6;
      let minutes = (hours - Math.floor(hours)) * 60
      let minRound = Math.round(minutes)


      var metarAge = `${("" + minRound).padStart(2, "0")} minutes ago`
    }



    if (taf) {
      let tafDate = new Date()
      tafDate.setUTCDate(taf.released.day)
      tafDate.setUTCHours(taf.released.hour, taf.released.minute)

      let diff = new Date() - tafDate
      let hours = diff / 3.6e6;
      let minutes = (hours - Math.floor(hours)) * 60
      let minRound = Math.round(minutes)


      var tafAge = `${Math.floor(hours)}:${("" + minRound).padStart(2, "0")} minutes ago`
    }


    return (
      <div className='top-bar'>
        <SearchBox onClick={this.onSearch} />
        <div style={{ margin: '5px' }}>

          {metar ?
            <LabelValue label={"Raw METAR"} value={metar[0].raw} /> : null}
          {metarAge ?
            <LabelValue label="Released" value={metarAge} /> : null}

          {!metar ? <div style={{ fontSize: 30 }}>{metarErrorMessage}</div> :
            <div className="App" style={{ margin: '10px' }}>
              <div style={{ margin: '5px' }}>
                <CloudLayersVis metar={metar[0]} height={500} width={400} />
                <Visibility vis={metar[0].vsby} width={400} />
              </div>

              <div>
                <Wind airport={airport} metar={metar} width={500} height={500} />
                <div style={{ display: 'flex' }}>
                  <Temp metar={metar} />
                  <Percip metar={metar[0]} />
                  <Pressure metar={metar} width={200} height={200} />
                </div>
              </div>
            </div>}
          {!taf ? <div style={{ fontSize: 30 }}>{tafErrorMessage}</div> :

            <div width="1055px">
              <div>
                <LabelValue label={"TAF"} value={this.state.taf.forecast[0].raw.slice(0, 22)} />
                <LabelValue label="Released" value={tafAge} />
              </div>
              <TimeLine data={taf} metar={metar} />
            </div>}
        </div>

      </div>
    );
  }
}

export default WeatherVis;
