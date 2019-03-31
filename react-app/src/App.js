import React, { Component } from 'react';
import logo from './logo.svg';
import HistoricalWind from './graphs/HistoricalWind.jsx';
import Visibility from './onemetar/visibility';
import Cloud from './onemetar/cloud.jsx';
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

    d3.csv("http://localhost:8000/9metar.csv")
      .then(data => {
        this.setState({
          metars: data
        });
      })
  }

  render() {
    return (
      <div className="App">
        <Cloud metar={this.state.metars[0]} />
        <HistoricalWind  data={this.state.data} />
        <Visibility vis={5} />
      </div>
    );
  }
}

export default App;
