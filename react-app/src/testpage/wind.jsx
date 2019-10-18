import React, { Component } from 'react';
import *  as d3 from 'd3';

import { LabelValue } from '../components';


const compass = [
  {
    dir: 0,
    label: 'N'
  },
  {
    dir: 30,
    label: '3',
  },
  {
    dir: 60,
    label: '6'
  },
  {
    dir: 90,
    label: 'E'
  },
  {
    dir: 120,
    label: '12'
  },
  {
    dir: 150,
    label: '15'
  },
  {
    dir: 180,
    label: "S"
  },
  {
    dir: 210,
    label: '21'
  },
  {
    dir: 240,
    label: '24'
  },
  {
    dir: 270,
    label: "W"
  },
  {
    dir: 300,
    label: '30'
  },
  {
    dir: 330,
    label: '33'
  },
]

class Wind extends Component {
  constructor(props) {
    super(props);

    this.state = {
      angle: 0
    }
  }

  UNSAFE_componentWillMount() {
    this.createGraph()

  }

  componentDidMount() {
    this.createGraph()
  }

  UNSAFE_componentWillReceiveProps(props) {
    this.props = props;
    this.createGraph()
  }


  processWind = (drct, sknt, speedScale) => {

    if (drct == 'VRB') {
      drct = 360;
    }

    return {
      drct: drct,
      sknt: speedScale(sknt)
    }
  }

  drawOldWind = (svg, winds, speedScale) => {


    for (let i = 1; i < winds.length; i++) {
      let res = this.processWind(winds[i - 1].drct, winds[i - 1].sknt, speedScale);
      let y1 = this.props.width / 2 + this.calcY(res.drct, res.sknt)
      let x1 = this.props.width / 2 + this.calcX(res.drct, res.sknt)
      res = this.processWind(winds[i - 1].drct, winds[i - 1].gust, speedScale);
      let gy1 = this.props.width / 2 + this.calcY(res.drct, res.sknt)
      let gx1 = this.props.width / 2 + this.calcX(res.drct, res.sknt)

      // res = this.processWind(winds[i].drct, winds[i].sknt, speedScale);
      // let y2 = this.props.width / 2 + this.calcY(res.drct, res.sknt)
      // let x2 = this.props.width / 2 + this.calcX(res.drct, res.sknt)

      svg.append('line')
        .attr('x1', x1)
        .attr('x2', gx1 != 250 ? gx1 : x1)
        .attr('y1', y1)
        .attr('y2', gy1 != 250 ? gy1 : y1)
        .attr('stroke-width', 3)
        .attr('stroke', d3.interpolateGreys(1.05 - (i / winds.length)))

      svg.selectAll('dots' + i)
        .data([[x1, y1], [gx1, gy1]])
        .enter()
        .append('circle')
        .attr('cx', d => d[0])
        .attr('cy', d => d[1])
        .attr('r', 5)
        .attr('fill', (d, j) => {
          if (j == 0) {
            return d3.interpolateBlues(1 - (i / winds.length));
          } else if (d[0] == 250 && d[1] == 250) {
            return 'none'
          } else {
            return d3.interpolateOranges(1 - (i / winds.length));
          }

        })


    }

  }

  calcY = function (direction, length) {
    length = length == null ? (this.props.height / 3) : length;
    var angle = ((direction + this.state.angle) / 10) * (2 * Math.PI / 36) - (Math.PI / 2);

    let y = Math.sin(angle) * (length);

    return y;
  }

  calcX = (direction, length) => {
    length = length == null ? (this.props.width / 3) : length;

    var angle = ((direction + this.state.angle) / 10) * (2 * Math.PI / 36) - (Math.PI / 2);

    let x = Math.cos(angle) * (length);

    return x;
  }

  drawMaxWindRing = (svg, maxWind, speedScale, color) => {
    svg.append('circle')
      .attr('cx', this.props.width / 2)
      .attr('cy', this.props.width / 2)
      .attr('r', speedScale(maxWind))
      .attr('stroke', color)
      .attr('fill', 'none')
      .attr('stroke-width', 2)

  }

  drawSpeedRings = (svg, speedScale) => {

    var labels = [4, 8, 16, 24, 36, 48, 60];
    delete labels[2];

    svg.selectAll('speedRings')
      .data(labels)
      .enter()
      .append('circle')
      .attr('cx', d => this.props.width / 2)
      .attr('cy', d => this.props.height / 2)
      .attr('stroke', '#00000022')
      .attr('r', d => speedScale(d))
      .attr('fill', 'none')

    svg.selectAll('speedRingLabels')
      .data(labels)
      .enter()
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('x', d => this.props.width / 2 + this.calcX(165, speedScale(d)))
      .attr('y', d => this.props.height / 2 + this.calcY(165, speedScale(d)))
      .text((d, i) => {
        if (i == labels.length - 1) {
          return d + 'kts'
        } else {
          return d;
        }
      })
      .attr('font-size', 13)

  }


  pad = (num, size) => {
    var s = "000000000" + num;
    return s.substr(s.length - size);
  }

  createGraph = () => {
    const node = this.node;
    var svg = d3.select(node);
    svg.selectAll('*').remove();



    svg.selectAll('label')
      .data(compass)
      .enter()
      .append('text')
      .attr('x', d => this.props.width / 2 + this.calcX(d.dir) - 6)
      .attr('y', d => this.props.height / 2 + this.calcY(d.dir) + 6)
      .text(d => d.label)

    let maxSpeed = 60;
    var speedScale = d3.scalePow()
      .exponent(0.5)
      .domain([0, maxSpeed])
      .range([0, (this.props.width / 3) * 0.95])

    this.drawMaxWindRing(svg, d3.max(this.props.metars, d => d.sknt), speedScale, 'blue')


    this.drawOldWind(svg, this.props.metars, speedScale);
    this.drawSpeedRings(svg, speedScale);
    this.drawMaxWindRing(svg, d3.max(this.props.metars, d => d.gust), speedScale, 'orange');

  }

  render() {
    var { width, height } = this.props;
    var { drct, sknt, gust } = this.props.metars[0];

    return (
      <div style={{ textAlign: 'start' }}>
        <div>
          <LabelValue label={"24 Hour Wind"} />
          <LabelValue label={"Directions"} value={"The darker the more recent."} />
          <LabelValue value={"Orange is gusts. Blue is sustained. Rings are maximums."} />
        </div>

        <svg ref={node => this.node = node} viewBox='0 50 500 450' width={width || 500} height={height || 500}>
        </svg>
      </div>
    );
  }
}

export default Wind;
