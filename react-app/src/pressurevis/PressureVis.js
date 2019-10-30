import React, { Component } from 'react';
import NumberSlider from './numberslider';
import InputLabel from './input';
import PressureGraph from './visualization';

import './pressurevis.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dataOne: {
        temperature: 15,
        humidity: 50,
        pressure: 29.92,
      },
      dataTwo: {
        temperature: 15,
        humidity: 50,
        pressure: 29.92,
      },
      isMobile: false,
      isPlaneVisible: false
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

  reset = () => {
    this.setState({
      dataOne: {
        temperature: 15,
        humidity: 50,
        pressure: 29.92,
      }
    })
  }

  onChange = (key, value) => {
    let data = this.state[key[0]];
    data[key[1]] = value;
    this.setState({
      [key[0]]: data
    })
  }

  render() {
    var { dataOne, dataTwo, isPlaneVisible, isMobile } = this.state;

    return (
      <div style={{ margin: '10px' }}>
        <div style={{
          display: isMobile ? 'block' : 'inline-block', width: isMobile ? '90%' : '75%', margin: '0px',
          maxWidth: isMobile ? null : '500px'
        }}>
          <span style={{ fontSize: '20px' }}>
            True Altitude: Black
              </span>
          <span style={{ fontSize: '20px', float: 'right', color: 'blue' }}>
            Density Altitude: Blue
              </span>
          <PressureGraph isPlaneVisible={isPlaneVisible} temperature={dataOne.temperature} humidity={dataOne.humidity} pressure={dataOne.pressure}></PressureGraph>
        </div>

        <div style={{ padding: '20px', display: isMobile ? 'block' : 'inline-block', height: '100%', verticalAlign: 'top', textAlign: 'left' }}>
          <div style={{ padding: '0px 0px 20px 0px' }}>

            <NumberSlider
              label={"Temperature"}
              value={dataOne.temperature}
              keyVal={['dataOne', 'temperature']}
              step={1}
              min={-20} max={50}
              units={'C'}
              vertical={!isMobile}
              onChange={this.onChange} />
            <NumberSlider
              label={"Pressure"}
              value={dataOne.pressure}
              min={28.60} max={31.00}
              units={"inHg"}
              vertical={!isMobile}
              step={0.03}
              keyVal={['dataOne', 'pressure']}
              onChange={this.onChange} />
          </div>

          <div style={{ padding: '20px 0px 0px 0px' }}>
            <InputLabel onChange={this.onChange} keyVal={['dataOne', 'temperature']} value={dataOne.temperature} label={"Temperature (C)"} />
            {/* <InputLabel onChange={this.onChange} keyVal={'humidity'} value={humidity} label={"% Humidity"} /> */}
            <InputLabel step={0.01} onChange={this.onChange} keyVal={['dataOne', 'pressure']} value={dataOne.pressure} label={"Pressure (inHg)"} />

            <input type="checkbox" name="showPlan" value={this.state.isPlaneVisible} onChange={() => this.setState({ isPlaneVisible: !this.state.isPlaneVisible })} />Show Plane
            <br />

          </div>


          <div>
            <button onClick={this.reset}>
              Reset
              </button>
          </div>
        </div>
        <div className='description'>
          <div className='description-title'>
            Explanation and Directions
          </div>
          <b>Hover over the chart to see the True Altitude vs Density Altitude. Using the sliders you can simulate varying pressures and temperatures.  </b>
          <br></br>
          <br></br>

          &emsp;Changes in pressure or temperature affect the density altitude. The density altitude is
          calculated based on the current surface pressure, humidity, and temperature. The
          higher the density altitude the worse a plane performs. Set the temperature to 23˚C, 8˚C
          degrees above the standard atmosphere temperature. The density altitude at 1000ft
          above sea level (ASL) is roughly 2000ft. That means taking off at an airport at 1000ft
          (ASL) will be the same as a 2000ft airport on a standard day.
          <br></br>
          <br></br>
          &emsp;To understand how the altimeter of a plane is affected click the checkbox to show a
plane. When changing the temperature and pressure at the surface the plane&#39;s true
altitude changes. This assumes the altimeter setting was not changed. This simulates
flying between areas with different altimeter settings. When it is changed the correct
altitude is maintained. Since altimeters are just sensitive barometers (pressure sensors)
they follow the pressure lines.
          <br></br>
          <br></br>
          &emsp;The visual assumes a standard atmospheric lapse rate, in other words, the
temperature and pressure decrease as the altitude increases at a standard rate. The
humidity is assumed to be 0%, however, the humidity has a minimal effect (+- 200ft) on
density altitude.

        </div>
      </div>
    );
  }

}

export default App;
