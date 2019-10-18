import React, { Component } from 'react';
import *  as d3 from 'd3';
import { LabelValue } from '../../components';


class Temp extends Component {
  componentDidMount() {
    this.createGraph()
  }

  UNSAFE_componentWillReceiveProps(props) {
    this.props = props;
    this.createGraph()
  }

  drawTemps = (svg, tempScale, x) => {

    // console.log(this.props.metar.tmpf, dew)
    // Dew Point)

    var dewCircle =
      svg.append('circle')

        .attr('cx', x)
        .attr('cy', d => tempScale(this.props.metar[0].dwpf))
        .attr('r', 5)
        .attr('fill', '#0000FF')



    var tempCircle =
      svg.append('circle')

        .attr('cx', x)
        .attr('cy', d => tempScale(this.props.metar[0].tmpf))
        .attr('r', 5)
        .attr('fill',  '#FF0000')


    if (this.props.metar[0].tmpf == this.props.metar[0].dwpf) {
      dewCircle.attr('stroke-width', 5)
        .attr('stroke', 'blue')
    }
  }

  cToF = (t) => {
    //(0°C × 9/5) + 32 = 32°F
    return (t * (9 / 5)) + 32;
  }


  pad = (num, size) => {
    var s = "000000000" + num;
    return s.substr(s.length - size);
  }

  createGraph = () => {
    const node = this.node;
    var svg = d3.select(node);
    svg.selectAll('*').remove();



    if (this.props.metar[0].tmpf == undefined) {
      return;
    } else {
      var temp = this.props.metar[0].tmpf;
      var dew = this.props.metar[0].dwpf;
    }

    var width = this.props.width || 155;
    var height = this.props.height || 200

    let min = Math.min(temp, dew) - 8;
    let max = Math.max(temp, dew) + 8;
    let range = max - min + 16;
    // console.log(min, max);
    var tempScale = d3.scaleLinear()
      .domain([min, max])
      .range([height * 0.78, 20])


    this.drawTemps(svg, tempScale, 60);

    // svg.append('text')
    //   .attr('x', 5)
    //   .attr('y', 13)
    //   .text(`Temp: ${(temp < 0 ? 'M' : '') + this.pad(Math.abs(temp), 2)}/${(dew < 0 ? 'M' : "") + this.pad(Math.abs(dew), 2)}`)
    //   .attr('text-anchor', 'start')
    //   .attr('fill', 'black')
    //   .attr('font-size', 18)

    // Celsius
    // Labels
    svg.selectAll('labels')
      .data(d3.range(min, max, 1))
      .enter()
      .append('text')
      .attr('x', 38)
      .attr('y', d => tempScale(d) + 5)
      .attr('fill', (d, i) => (d % 5) == 0 ? "black" : '#00000000')
      .attr('text-anchor', 'end')
      .text(d => d + "C")

    // Ticks
    svg.selectAll('ticks')
      .data(d3.range(min, max, 1))
      .enter()
      .append('line')
      .attr('x1', 40)
      .attr('y1', d => tempScale(d))
      .attr('x2', 45)
      .attr('y2', d => tempScale(d))
      .attr('stroke', (d, i) => (d % 5) == 0 ? "black" : '#00000000')

    // Fahrenheit -------------------
    if (range > 25) {
      var tickMod = 10;
    } else {
      tickMod = 5;
    }
    let minF = this.cToF(min).toFixed(0);
    let maxF = this.cToF(max).toFixed(0);
    // console.log(minF, maxF);
    let fScale = d3.scaleLinear()
      .domain([+minF, +maxF])
      .range([height * 0.78, 20])

    svg.selectAll('labels')
      .data(d3.range(+minF, +maxF, 1))
      .enter()
      .append('text')
      .attr('x', 88)
      .attr('y', d => fScale(d) + 5)
      .attr('fill', (d, i) => (d % tickMod) == 0 ? "black" : '#00000000')
      .attr('text-anchor', 'start')
      .text(d => d + "F")


    // Ticks
    svg.selectAll('ticks')
      .data(d3.range(+minF, +maxF, 1))
      .enter()
      .append('line')
      .attr('x1', 80)
      .attr('y1', d => fScale(d))
      .attr('x2', 75)
      .attr('y2', d => fScale(d))
      .attr('stroke', (d, i) => (d % tickMod) == 0 ? "black" : '#00000000')


    svg.selectAll("axisbars")
      .data([[40, 20, 40, height * 0.78], [80, 20, 80, height * 0.78]])
      .enter()
      .append('line')
      .attr('x1', d => d[0])
      .attr('y1', d => d[1])
      .attr('x2', d => d[2])
      .attr('y2', d => d[3])
      .attr('stroke', 'black')


    svg.append("text")
      .attr('x', 30)
      .attr('y', 190)
      // .attr('transform', `translate(130,5) rotate(-90) translate(-175, 0)`)
      .text(`Dew Point: ${this.cToF(dew).toFixed(1)}F`)
      .attr('font-size', 15)

    svg.append('circle')
      .attr('cx', 20)
      .attr('cy', 185)
      .attr('r', 5)
      .attr('fill', 'blue')

    svg.append("text")
      .attr('x', 30)
      .attr('y', 175)
      // .attr('transform', `translate(150,5) rotate(-90) translate(-175, 0)`)
      .text(`Temp: ${this.cToF(temp).toFixed(1)}F`)
      // .attr('font-weight', 'bold')
      .attr('font-size', 15)


    svg
      .append('circle')
      .attr('cx', 20)
      .attr('cy', 170)
      .attr('r', 5)
      .attr('fill', 'red')

    // Freezing Line
    if (min < 0 && max > 0) {
      svg.append('line')
        .attr('x1', 40)
        .attr('y1', tempScale(0))
        .attr('x2', 80)
        .attr('y2', tempScale(0))
        .attr('stroke-width', 2)
        .attr('stroke', 'blue')
    }

  }

  render() {
    var { width, height } = this.props;
    var { tmpf, dwpf } = this.props.metar[0];
    return (
      <div style={{ textAlign: 'start' }}>
        <LabelValue label={"Temp"} value={`${(tmpf < 0 ? 'M' : '') + this.pad(Math.abs(tmpf), 2)}/${(dwpf < 0 ? 'M' : "") + this.pad(Math.abs(dwpf), 2)}`} />
        <svg ref={node => this.node = node} width={width || 155} height={height || 200}>
        </svg>
      </div>
    );
  }
}

export default Temp;
