import React, { Component } from 'react';
import axios from 'axios';
import Wind from './onemetar/wind.jsx';
import Visibility from './onemetar/visibility';
import CloudLayersVis from './onemetar/CloudLayersVis';
import Temp from './onemetar/temp.jsx';
import Percip from './onemetar/percip.jsx';
import Pressure from './onemetar/pressure.jsx';
import SearchBox from './SearchBox.jsx'
import TimeLine from './timeline/timeline.jsx'
import *  as d3 from 'd3';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      metar: null,
      airport: "KBED",
      errorMessage: ''
    }
  }

  componentWillMount() {
    axios.get(`/api/newestMetar/${this.state.airport}`)
      .then(result => {

        this.setState({
          metar: result.data
        })
      })

    axios.get(`/api/newestTAFS/${this.state.airport}`)
      .then(result => {

        this.setState({
          taf: result.data
        })
      })


  }



  handleMouseOver = (metar) => {
    this.setState({
      metar: metar
    })
  }

  onSearch = (ident) => {
    axios.get(`/api/newestMetar/${ident}`)
      .then(result => {
        console.log(result.data)

        this.setState({
          metar: result.data,
          airport: ident,
          errorMessage: ''
        })
      }).catch(error => {
        console.log("Error");
        this.setState({
          metar: null,
          errorMessage: "Could not find airport. Try again"
        })
      })

    axios.get(`/api/newestTAFS/${ident}`)
      .then(result => {
        this.setState({
          taf: result.data
        })
      })
  }



  render() {
    var { taf, metar, airport, errorMessage } = this.state;

    if (metar) {
      let metarDate = new Date()
      metarDate.setUTCDate(metar.valid.day)
      metarDate.setUTCHours(metar.valid.hour, metar.valid.minute)

      let diff = new Date() - metarDate
      let hours = diff / 3.6e6;
      let minutes = (hours - Math.floor(hours)) * 60
      let minRound = Math.round(minutes)


      var metarAge = `METAR released ${("" + minRound).padStart(2, "0")} minutes ago`
    }



    if (taf) {
      let tafDate = new Date()
      tafDate.setUTCDate(taf.released.day)
      tafDate.setUTCHours(taf.released.hour, taf.released.minute)

      let diff = new Date() - tafDate
      let hours = diff / 3.6e6;
      let minutes = (hours - Math.floor(hours)) * 60
      let minRound = Math.round(minutes)


      var tafAge = `TAF released ${Math.floor(hours)}:${("" + minRound).padStart(2, "0")} minutes ago`
    }


    return (
      <div className='top-bar'>
        <SearchBox onClick={this.onSearch} />
        {metar ? <div style={{ fontSize: 20, textAlign: 'left' }}>METAR: {metar.raw} </div> : null}
        {metarAge ? <div style={{ fontSize: 16, textAlign: 'left' }}>{metarAge} </div> : null}

        {!metar ? <span style={{ fontSize: 30 }}>{errorMessage}</span> :
          <div className="App">
            <CloudLayersVis metar={metar} height={850} />
            <div>
              <Wind airport={airport} metar={metar} width={500} height={500} />
              <div style={{ display: 'flex' }}>
                <Temp metar={metar} />
                <Percip metar={metar} />
                <Pressure metar={metar} width={200} height={200} />
              </div>
              <Visibility vis={metar.vsby} />
            </div>
          </div>}
        {!taf ? <span style={{ fontSize: 30 }}>{errorMessage}</span> :
          <div width="1055px">
            <div>
              {this.state.taf.forecast[0].raw.slice(0, 22)}
              <br />
              {tafAge}
            </div>
            <TimeLine data={taf} />
          </div>}
      </div>
    );
  }
}

export default App;
