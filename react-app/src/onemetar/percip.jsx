import React, { Component } from 'react';
import *  as d3 from 'd3';

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
  componentDidMount() {
    this.createGraph()
  }

  componentWillReceiveProps(props) {
    this.props = props;
    this.createGraph()
  }

  createGraph = () => {
    const node = this.node;
    var svg = d3.select(node);
    svg.selectAll('*').remove();



    if (!this.props.metar.tmpf) {
      return;
    } else {
      var temp = this.props.metar.tmpf || 5;
      var dew = this.props.metar.dwpf || 5;
    }

    var width = this.props.width || 200;
    var height = this.props.height || 200

  }

  render() {
    var { width, height } = this.props;
    return (
      <div>
        <svg ref={node => this.node = node} width={width || 200} height={height || 200}>
        </svg>
      </div>
    );
  }
}

export default Percip;
