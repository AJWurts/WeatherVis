import React, { Component } from 'react';
import NumberSlider from './numberslider';
import InputLabel from './input';
import PressureGraph from './visualization';

import './App.css';

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
      isPlaneView: false
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
        pressure: 29.92
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
    var { dataOne, dataTwo, isPlaneView, isMobile } = this.state;

    return (
      <div>
        <div >
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
            <PressureGraph temperature={dataOne.temperature} humidity={dataOne.humidity} pressure={dataOne.pressure}></PressureGraph>
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
            </div>


            <div>
              <button onClick={this.reset}>
                Reset
              </button>
            </div>
          </div>
        </div>
        <div className={"App"}>

        </div>
      </div>
    );
  }

}

export default App;
