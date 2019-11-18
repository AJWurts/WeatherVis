import React, { Component } from 'react';
// import *  as d3 from 'd3';
import { LabelValue } from '../../components';


// Displays Percipitation
// Metar Value: Decoded Value
class Percip extends Component {

  render() {
    var { width, height } = this.props;
    return (
      <div>
        <LabelValue className='selectable metarweather' label={'Current Conditions'}/>
        <div style={{textAlign: 'start'}} width={width || 200} height={height || 200}>
          {this.props.metar.weather.length > 0 ? this.props.metar.weather.map(val => {
       
            return <LabelValue key={val} label={val.raw} value={val.text} />
          }) : "No Weather Reported"}
        </div>
      </div>
    );
  }
}

export default Percip;
