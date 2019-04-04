import React, { Component } from 'react';
import axios from 'axios';
import Wind from './onemetar/wind.jsx';
import Visibility from './onemetar/visibility';
import CloudLayersVis from './onemetar/CloudLayersVis';
import *  as d3 from 'd3';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      metars: [],
    }
  }

  componentWillMount() {
    d3.csv('http://localhost:8000/2018_wind_daytime_dirspd.csv')
      .then(data => {
        this.setState({
          data: data
        })
      })

    d3.csv("http://localhost:8000/9metar.csv?pear=1")
      .then(data => {
        this.setState({
          metars: data,
          metar: data[0]
        });
      })
    this.refresh();
    this.refreshInterval = setInterval(this.refresh, 600000)
  }

  refresh = () => {
    var request = new Request("https://www.aviationweather.gov/metar/data?ids=KBED&format=raw&hours=0&taf=on",
      {
        mode: 'no-cors',
        method: 'GET'
      })
    
    fetch(request)
      .then(response => {
        console.log(response);
        return response.body;
      }).then(response => {
        console.log(response);
      });
    }
    

  handleMouseOver = (metar) => {
    this.setState({
      metar: metar
    })
  }

  render() {
    var { metars, metar } = this.state;
    if (metars.length === 0) {
      return null;
    }

    return (
      <div>
        <div className="App">
          <CloudLayersVis metar={metar} />
          <div>
            <Wind metar={metar} width={500} height={500} />
            <Visibility vis={metar.vsby} />
          </div>
        </div>
        <div style={{ display: "flex" }}>
          {metars.map((m, i) => {
            return (<div key={i} style={{ margin: '3px' }} onMouseOver={() => this.handleMouseOver(m)}>
              {m.valid}
            </div>);
          })}
        </div>

      </div>
    );
  }
}

export default App;
