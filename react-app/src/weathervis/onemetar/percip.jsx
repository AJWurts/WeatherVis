import React, { Component } from 'react';
import *  as d3 from 'd3';
import { LabelValue } from '../../components';

const KEY = {
  BC: "patches",
  BL: "blowing",
  BR: "mist",
  DR: "low drifting",
  DU: 'dust storm',
  DZ: 'drizzle',
  E: 'ended',
  FC: 'funnel cloud',
  FG: 'fog',
  FU: 'smoke',
  FZ: 'freezing',
  GR: 'hail (>5mm)',
  GS: 'small hail/snow pellets (<5mm)',
  HZ: 'haze',
  IC: 'ice crystals',
  MI: 'shallow',
  PL: 'ice pellets',
  PO: 'well-developed dust/sand whirls',
  PR: 'partial',
  PY: 'spray',
  RA: 'rain',
  SA: 'sand',
  SG: 'snow grains',
  SH: 'showers',
  SN: 'snow',
  SQ: 'squalls moderate',
  SS: 'sandstorms',
  TS: 'thunderstorms',
  UP: 'unknown percipitation',
  VA: 'volcanic ash',
  VC: 'in the vicinity'
}

class Percip extends Component {





  render() {
    var { width, height } = this.props;
    return (
      <div>
        <LabelValue className='selectable weather' label={'Current Conditions'}/>
        <div style={{textAlign: 'start'}} width={width || 200} height={height || 200}>
          {this.props.metar.weather.length > 0 ? this.props.metar.weather.map(val => {
            console.log(val);
            return <LabelValue key={val} label={val.raw} value={val.text} />
          }) : "No Weather Reported"}
          
        </div>
      </div>
    );
  }
}

export default Percip;
