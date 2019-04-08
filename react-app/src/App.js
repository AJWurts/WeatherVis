import React, { Component } from 'react';
import axios from 'axios';
import Wind from './onemetar/wind.jsx';
import Visibility from './onemetar/visibility';
import CloudLayersVis from './onemetar/CloudLayersVis';
import Temp from './onemetar/temp.jsx';
import *  as d3 from 'd3';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      metar: null,
    }
  }

  componentWillMount() {
    axios.get('http://localhost:8080/api/newestMetar/KBED')
      .then(result => {
        console.log(result.data)

        this.setState({
          metar: result.data
        })
      })
  }



  handleMouseOver = (metar) => {
    this.setState({
      metar: metar
    })
  }

  render() {
    var { metars, metar } = this.state;
    if (!metar) {
      return null;
    }

    return (
      <div>
        <div className="App">
          <CloudLayersVis metar={metar} />
          <div>
            <Wind metar={metar} width={500} height={500} />
            <Temp metar={metar} />
            <Visibility vis={metar.vsby} />
          </div>
        </div>
        {/* <div style={{ display: "flex" }}>
          {metars.map((m, i) => {
            return (<div key={i} style={{ margin: '3px' }} onMouseOver={() => this.handleMouseOver(m)}>
              {m.valid}
            </div>);
          })}
        </div> */}

      </div>
    );
  }
}

export default App;
