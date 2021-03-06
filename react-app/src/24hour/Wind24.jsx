import React, { Component } from 'react';
import *  as d3 from 'd3';

import { LabelValue } from '../components';


const compass = [
  {
    dir: 0,
    label: 'N'
  },
  {
    dir: 45,
    label: 'NE',
  },
  {
    dir: 90,
    label: 'E'
  },
  {
    dir: 135,
    label: 'SE'
  },
  {
    dir: 180,
    label: "S"
  },
  {
    dir: 225,
    label: 'SW'
  },
  {
    dir: 270,
    label: "W"
  },
  {
    dir: 315,
    label: 'NW'
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

    if (drct === 'VRB') {
      drct = 360;
    }

    return {
      drct: drct,
      sknt: speedScale(sknt)
    }
  }

  drawOldWind = (svg, winds, speedScale) => {

    winds = winds.slice().reverse();
    for (let i = 1; i < winds.length; i++) {
      let res = this.processWind(winds[i - 1].drct, winds[i - 1].sknt, speedScale);
      let y1 = 500 / 2 + this.calcY(res.drct, res.sknt)
      let x1 = 500 / 2 + this.calcX(res.drct, res.sknt)
      res = this.processWind(winds[i - 1].drct, winds[i - 1].gust, speedScale);
      let gy1 = 500 / 2 + this.calcY(res.drct, res.sknt)
      let gx1 = 500 / 2 + this.calcX(res.drct, res.sknt)

      // res = this.processWind(winds[i].drct, winds[i].sknt, speedScale);
      // let y2 = this.props.width / 2 + this.calcY(res.drct, res.sknt)
      // let x2 = this.props.width / 2 + this.calcX(res.drct, res.sknt)

      svg.append('line')
        .attr('x1', x1)
        .attr('x2', gx1 !== 250 ? gx1 : x1)
        .attr('y1', y1)
        .attr('y2', gy1 !== 250 ? gy1 : y1)
        .attr('stroke-width', 3)
        .attr('stroke', d3.interpolateGreys((i / winds.length)))

      svg.selectAll('dots' + i)
        .data([[x1, y1], [gx1, gy1]])
        .enter()
        .append('circle')
        .attr('cx', d => d[0])
        .attr('cy', d => d[1])
        .attr('r', 5)
        .attr('fill', (d, j) => {
          if (j === 0) {
            return d3.interpolateBlues((i / winds.length));
          } else if (d[0] === 250 && d[1] === 250) {
            return 'none'
          } else {
            return d3.interpolateOranges((i / winds.length));
          }

        })


    }

  }

  calcY = function (direction, length) {
    length = length == null ? (500 / 3) : length;
    var angle = ((direction + this.state.angle) / 10) * (2 * Math.PI / 36) - (Math.PI / 2);

    let y = Math.sin(angle) * (length);

    return y;
  }

  calcX = (direction, length) => {
    length = length == null ? (500 / 3) : length;

    var angle = ((direction + this.state.angle) / 10) * (2 * Math.PI / 36) - (Math.PI / 2);

    let x = Math.cos(angle) * (length);

    return x;
  }

  drawMaxWindRing = (svg, maxWind, speedScale, color) => {
    var that = this;
    svg.append('circle')
      .attr('class', 'max' + color)
      .attr('cx', 500 / 2)
      .attr('cy', 500 / 2)
      .attr('r', speedScale(maxWind))
      .attr('stroke', color)
      .attr('fill', 'none')
      .attr('stroke-width', 2)

    svg.append('circle')
      .attr('cx', 500 / 2)
      .attr('cy', 500 / 2)
      .attr('r', speedScale(maxWind))
      .attr('stroke', '#FFF00F01')
      .attr('fill', 'none')
      .attr('stroke-width', 20)
      .on('mouseover', function (d) {
        d3.select('.max' + color)
          .attr('stroke', color)
          .attr('stroke-width', 5)

        d3.select('.tooltip')
          .attr('x', d3.mouse(this)[0] + 5)
          .attr('y', d3.mouse(this)[1] + 5)

        d3.select('.tooltiplabel')
          .text(d => {
            if (color === 'orange') {
              return "Max Gust";
            } else {
              return "Max Wind";
            }
          })

        d3.select('.tooltipvalue')
          .text(d => {
            if (color === 'orange') {
              return that.maxGust + 'kts';
            } else {
              return that.maxWind + 'kts';
            }
          })

      })
      .on('mousemove', function () {
        d3.select('.tooltip')
          .attr('x', d3.mouse(this)[0] + 5)
          .attr('y', d3.mouse(this)[1] + 5)
      })
      .on('mouseout', function () {
        d3.select('.max' + color)
          .attr('stroke', color)
          .attr('stroke-width', 2)

        d3.select('.tooltip')
          .attr('x', -100)
          .attr('y', -100)


      })

  }

  drawLegend = (svg) => {

    let amt = 11;
    let range = d3.range(amt).reverse();
    let start = 110;
    let scale = d3.scaleLinear()
      .domain([0, amt - 1])
      .range([0, 1]);

    svg.selectAll('legend-lines')
      .data(range)
      .enter()
      .append('line')
      .attr('y1', (d, i) => start + i * 30)
      .attr('y2', (d, i) => start + i * 30)
      .attr('x1', 440)
      .attr('x2', 460)
      .attr('stroke-width', 3)
      .attr('stroke', d => d3.interpolateGreys(scale(d)))

    svg.selectAll('legentbubbles')
      .data(range)
      .enter()
      .append('circle')
      .attr('cy', (d, i) => start + i * 30)
      .attr('cx', 440)
      .attr('r', 8)
      .attr('fill', d => d3.interpolateBlues(scale(d)))

    svg.selectAll('legentbubbles')
      .data(range)
      .enter()
      .append('circle')
      .attr('cy', (d, i) => start + i * 30)
      .attr('cx', 460)
      .attr('r', 8)
      .attr('fill', d => d3.interpolateOranges(scale(d)))

    svg.append('text')
      .attr('y', 100)
      .attr('x', 438)
      .style('font-size', '12px')
      .text('Now')


    // Multiline Text because I dont know how to do it any other way
    svg.append('text')
      .attr('y', 440)
      .attr('x', 449)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('24')

    svg.append('text')
      .attr('y', 450)
      .attr('x', 449)
      .style('font-size', '12px')
      .attr('text-anchor', 'middle')

      .text('Hours')
    svg.append('text')
      .attr('y', 460)
      .attr('x', 449)
      .style('font-size', '12px')
      .attr('text-anchor', 'middle')

      .text('Ago')
  }

  drawSpeedRings = (svg, speedScale, maxSpeed) => {

    // var labels = [4, 8, 16, 24, 36, 48, 60];
    var speed = 2;

    // Draws Speed Ring Labels until it passes the maxSpeed
    while (speed < maxSpeed) {
      svg.append('circle')
        .attr('cx', d => 500 / 2)
        .attr('cy', d => 500 / 2)
        .attr('stroke', '#00000022')
        .attr('r', speedScale(speed))
        .attr('fill', 'none')


      svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', 500 / 2 + this.calcX(165, speedScale(speed)))
        .attr('y',  500 / 2 + this.calcY(165, speedScale(speed)))
        .text((d, i) => {

          return speed.toFixed(0);
      })
      .attr('font-size', 13)

      // Rate of increase for labels
      speed = speed * 2

    }

  }


  pad = (num, size) => {
    var s = "000000000" + num;
    return s.substr(s.length - size);
  }

  createTooltip = (svg) => {


    this.tooltip = svg.append('svg')
      .attr('class', 'tooltip')
      .attr('x', -100)
      .attr('y', -100)

    this.tooltip
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 100)
      .attr('height', 20)
      .attr('fill', 'rgb(170, 170, 170')

    this.tooltip
      .append('rect')
      .attr('x', 55)
      .attr('y', 0)
      .attr('width', 45)
      .attr('height', 20)
      .attr('fill', 'rgb(238, 238, 238)')

    this.tooltip
      .append('text')
      .attr('class', 'tooltiplabel')
      .attr('x', 2)
      .attr('y', 13)
      .attr('text-anchor', 'top')
      .text('Max Gust')
      .attr('font-size', '10px')
      .style('fill', 'white')

    this.tooltip
      .append('text')
      .attr('class', 'tooltipvalue')
      .attr('x', 58)
      .attr('y', 13)
      .text("30kts")
      .attr('text-anchor', 'top')
      .attr('font-size', '10px')
      .style('fill', 'black')
  }

  createGraph = () => {
    const node = this.node;
    var svg = d3.select(node);
    svg.selectAll('*').remove();




    svg.selectAll('label')
      .data(compass)
      .enter()
      .append('text')
      .attr('x', d => 500 / 2 + this.calcX(d.dir))
      .attr('y', d => 500 / 2 + this.calcY(d.dir) + 6)
      .text(d => d.label)
      .attr('font-size', 20)
      .attr('text-anchor', 'middle')


    this.maxGust = d3.max(this.props.metars, d => +d.gust);
    this.maxWind = d3.max(this.props.metars, d => +d.sknt);

    let maxSpeed = Math.max(60,
      this.maxWind,
      this.maxGust) + 10;
    var speedScale = d3.scalePow()
      .exponent(0.5)
      .domain([0, maxSpeed])
      .range([0, (500 / 3) * 0.95])



    this.drawOldWind(svg, this.props.metars, speedScale);
    this.drawSpeedRings(svg, speedScale, maxSpeed);

    this.drawMaxWindRing(svg, this.maxWind, speedScale, 'blue')
    this.drawMaxWindRing(svg, this.maxGust, speedScale, 'orange');
    this.drawLegend(svg);

    this.createTooltip(svg);


  }

  render() {
    var { width, height } = this.props;

    return (
      <div style={{ textAlign: 'start' }}>
        <div>
          <LabelValue label={"24 Hour Wind"} />
          <LabelValue label={"Directions"} value={"Orange is gusts. Blue is sustained. Rings are maximums."} />
        </div>

        <svg ref={node => this.node = node} viewBox='75 75 400 400' width={width } height={height}>
        </svg>
      </div>
    );
  }
}

export default Wind;
