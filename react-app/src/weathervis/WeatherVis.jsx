import React, { Component } from 'react';
import axios from 'axios';
import *  as d3 from 'd3';
import { withCookies, Cookies } from 'react-cookie';
import {
  Wind,
  Visibility,
  CloudLayersVis,
  Temp,
  Percip,
  Pressure,
  SelectableMetar
} from './onemetar';
import MultiTAF from './timeline';
import { LabelValue, SearchBox } from '../components';

import './weathervis.css';

class WeatherVis extends Component {
  constructor(props) {
    super(props);
    const { cookies } = props;

    this.state = {
      metar: null,
      taf: null,
      airport: cookies.get('airport') || "KBED",
      tafErrorMessage: 'Loading TAF...',
      metarErrorMessage: 'Loading METAR...',
      isMobile: false,
      nearestAirports: null
    }
  }

  handleWindowResize = () => {
    this.setState({ isMobile: window.innerWidth < 715 });
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleWindowResize);
    this.handleWindowResize()
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize);
  }

  UNSAFE_componentWillMount() {
    this.onSearch(this.state.airport);
  }

  handleMouseOver = (key) => {
    d3.selectAll("." + key)
      .attr('class', 'selectable ' + key + ' highlighted')
  }

  handleMouseLeave = (key) => {
    d3.selectAll("." + key)
      .attr('class', 'selectable ' + key + ' normal')
  }

  onSearch = (ident) => {
    axios.get(`api/nearestAirports/${ident}`)
      .then(result => {
        this.setState({
          nearestAirports: result.data
        })
      }).catch(error => {
        console.error(error);

      })
    axios.get(`/api/recentMETARs/${ident}`)
      .then(result => {

        this.setState({
          metar: result.data.metars,
          airport: ident,
          runways: result.data.runways,
          metarErrorMessage: ''
        })
      }).catch(error => {
        console.log("Metar Failed");
        this.setState({
          metar: null,
          metarErrorMessage: "Could not find airport. Try again"
        })
      })

    axios.get(`/api/nearestTAFS/${ident}`)
      .then(result => {
        let searchedIdentTAFS = []
        let otherTAFS = []
        for (let i = 0; i < result.data.length; i++) {

          if (result.data[i].airport === ident) {
            searchedIdentTAFS.push(result.data[i]);
          } else {
            otherTAFS.push(result.data[i]);
          }
        }
        
        this.setState({
          taf: searchedIdentTAFS.concat(otherTAFS),
          tafErrorMessage: ''
        })
      }).catch(err => {
        console.log("Taf Failed")
        this.setState({
          taf: null,
          tafErrorMessage: "No TAF available"
        })
      })

    const { cookies } = this.props;
    cookies.set('airport', ident, { path: '/', maxAge: 315360000 });
  }

  //

  render() {
    var { taf, metar,
      airport, runways,
      tafErrorMessage,
      metarErrorMessage,
      isMobile,
      nearestAirports } = this.state;
    if (metar) {
      let metarDate = new Date(Date.UTC(metar[0].valid.year, metar[0].valid.month - 1, metar[0].valid.day, metar[0].valid.hour, metar[0].valid.minute))


      let diff = Math.abs(new Date() - metarDate)
      let hours = diff / 3.6e6;
      let minutes = (hours - Math.floor(hours)) * 60
      let minRound = Math.round(minutes)


      var metarAge = `${("" + minRound).padStart(2, "0")} minutes ago`
    }




    return (
      <div className='top-bar'>
        <SearchBox onClick={this.onSearch} value={this.state.airport} nearestAirports={nearestAirports} />
        <div style={{  overflow: 'visible' }} className="App">

          {metar ?
            <SelectableMetar label="Selectable Metar" onHover={this.handleMouseOver} onMouseLeave={this.handleMouseLeave} metar={metar[0]} /> : null}

          {metar ?
            <LabelValue label={"Raw METAR"} value={metar[0].raw} /> : null}
          {metarAge ?
            <LabelValue className='valid' label="Released" value={metarAge} /> : null}

          {!metar ? <div style={{ fontSize: 30 }}>{metarErrorMessage}</div> :
            <div className="App" style={{ display: isMobile ? 'block' : 'flex', margin: '10px' }}>
              <div style={{ margin: '5px' }}>
                <CloudLayersVis
                  metar={metar[0]}
                  height={500}
                  width={isMobile ? 300 : 400} />
                <Visibility
                  vis={metar[0].vsby}
                  width={isMobile ? 300 : 400} />
              </div>

              <div>
                <Wind airport={airport}
                  runways={runways}
                  metar={metar}
                  width={isMobile ? 350 : 500}
                  height={isMobile ? 350 : 500} />
                <div style={{ textAlign: 'left', display: isMobile ? 'inline-block' : 'flex' }}>
                  <Temp metar={metar} />
                  <Percip metar={metar[0]} />
                  <Pressure metar={metar} width={200} height={200} />
                </div>
              </div>
            </div>}
          {!taf ? <div style={{ fontSize: 30 }}>{tafErrorMessage}</div> :

            <MultiTAF tafs={taf} isMobile metar={metar ? metar[0] : null} />
          }
        </div>

      </div >
    );
  }
}

export default withCookies(WeatherVis);
