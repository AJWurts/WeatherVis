import React, { Component } from 'react';
import *  as d3 from 'd3';


class Pressure extends Component {
  componentDidMount() {
    this.createGraph()
  }

  componentWillReceiveProps(props) {
    this.props = props;
    this.createGraph()
  }

  rads = (deg) => {
    return deg * (Math.PI / 180);
  }

  calcX = (angle, length) => {
    return this.props.width / 2 + Math.cos(this.rads(angle + 90)) * length;
  }

  calcY = (angle, length) => {
    return this.props.height / 2 + Math.sin(this.rads(angle + 90)) * length;

  }

  hpaToInhg = (hpa) => {
    

    if (+hpa > 500) {
      hpa = (hpa / 10 + 900) * 0.02953
    } else {
      hpa = (hpa / 10 + 1000) * 0.02953;
    }

    return hpa
  }

  displayNeedle = (svg, baroScale) => {
    let mslp = this.hpaToInhg(this.props.metar.mslp);
    console.log(mslp);
    svg.append('path')
      .attr('d', ` m -5 0 l 5 75 l 5 -75 l -5 -5 z`)
      .attr('transform', `translate(${this.props.width / 2} ${this.props.height / 2}) rotate(${baroScale(mslp)})`)
      .attr('fill', 'black')
  }

  createGraph = () => {
    const node = this.node;
    var svg = d3.select(node);
    svg.selectAll('*').remove();


    console.log('wasup')
    if (!this.props.metar.alti) {
      return;
    } else {
      var temp = this.props.metar.tmpf || 5;
      var dew = this.props.metar.dwpf || 5;
    }

    var width = this.props.width || 200;
    var height = this.props.height || 200

    var arc = d3.arc()
      .innerRadius(99)
      .outerRadius(100)
      .startAngle(-0.75 * Math.PI)
      .endAngle(0.75 * Math.PI);


    svg
      .append('path')
      .attr('transform', `translate(${width / 2} ${height / 2})`)
      .attr('d', arc)

    var baroScale = d3.scaleLinear()
      .domain([28, 31])
      .range([55, 305])

    svg.selectAll("barolabels")
      .data([28, 28.5, 29, 29.5, 30, 30.5, 31])
      .enter()
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', d => `translate(${width / 2} ${height / 2}) rotate(${baroScale(d)}) translate(0 75) rotate(180)`)
      .attr('fill', 'black')
      .text(d => d)

    svg.selectAll('ticks')
      .data(d3.range(28, 31.01, 0.1))
      .enter()
      .append('line')
      .attr('x1', d => this.calcX(baroScale(d), 100))
      .attr('y1', d => this.calcY(baroScale(d), 100))
      .attr('x2', d => {
        console.log(d)
        if (d % 1 === 0) {
          return this.calcX(baroScale(d), 85);
        } else if ((d - 0.5) % 1 === 0) {
          return this.calcX(baroScale(d), 90);
        } else {
          return this.calcX(baroScale(d), 93);
        }
      })
      .attr('y2', d => {
        if (d % 1 === 0) {
          return this.calcY(baroScale(d), 85);
        } else if ((d - 0.5) % 1 === 0) {
          return this.calcY(baroScale(d), 90);
        } else {
          return this.calcY(baroScale(d), 93);
        }
      })
      .attr('stroke', 'black')
      .attr('stroke-width', d => {
        if (d % 1 === 0) {
          return 1
        }
      })

    this.displayNeedle(svg, baroScale);

    // Labels
    svg.selectAll('labels')
      .data([
        this.props.metar.mslp ? {
        label: "Sea Level",
        value: this.hpaToInhg(this.props.metar.mslp).toFixed(2)
      } : {label: "", value: ""},
      {
        label: 'Altimeter',
        value: this.props.metar.alti / 100
      }])
      .enter()
      .append('text')
      .attr('x', this.props.width / 2)
      .attr('y', (d, i) => this.props.height - 23 + (i * 15))
      .attr('text-anchor', 'middle')
      .text(d => d.label ?  `${d.label}: ${d.value}"` : "")

    
    svg.append('text')
      .attr('x', this.props.width / 2)
      .attr('y', this.props.height - 45)
      .text("Pressure")
      .attr('text-anchor', "middle")
      .attr('font-size', 20)
      .attr('fill', 'black')

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

export default Pressure;
