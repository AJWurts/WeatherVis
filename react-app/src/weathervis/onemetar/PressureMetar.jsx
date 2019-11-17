import React, { Component } from 'react';
import *  as d3 from 'd3';
import { LabelValue } from '../../components';


class Pressure extends Component {
  componentDidMount() {
    this.createGraph()
  }

  UNSAFE_componentWillReceiveProps(props) {
    this.props = props;
    this.createGraph()
  }


  // Functions for creating radial graphic
  rads = (deg) => {
    return deg * (Math.PI / 180);
  }
  calcX = (angle, length) => {
    return this.props.width / 2 + Math.cos(this.rads(angle + 90)) * length;
  }
  calcY = (angle, length) => {
    return this.props.height / 2 + Math.sin(this.rads(angle + 90)) * length;

  }
  ///////////////////////////////////////

  // hpa to inhg
  hpaToInhg = (hpa) => {
    if (+hpa > 500) {
      hpa = (hpa / 10 + 900) * 0.02953
    } else {
      hpa = (hpa / 10 + 1000) * 0.02953;
    }
    return hpa
  }

  // Draws barometer needle at top left
  // Then translates and rotates into place
  displayNeedle = (svg, baroScale) => {

    let colorScale = d3.scaleLinear()
      .domain([this.props.metar.length, 0])
      .range(["#000000", "#FFFFFF"])

    svg.selectAll('pressureneedles')
      .data(this.props.metar.slice().reverse())
      .enter()
      .append('path')
      .attr('class', (d, i) => 'metar metar' + (this.props.metar.length - i - 1))
      .attr('d', ` m -5 0 l 5 75 l 5 -75 l -5 -5 z`)
      .attr('transform', d => `translate(${this.props.width / 2} ${this.props.height / 2}) rotate(${baroScale(+d.alti / 100)})`)
      .attr('fill', (d, i) => colorScale(i))



  }

  createGraph = () => {
    // Runs every time graphic changes.
    const node = this.node;
    var svg = d3.select(node);
    svg.selectAll('*').remove();

    var width = 200;
    var height = 200

    // Defines outer arc
    var arc = d3.arc()
      .innerRadius(99)
      .outerRadius(100)
      .startAngle(-0.75 * Math.PI)
      .endAngle(0.75 * Math.PI);


    // Draws outer arc
    svg
      .append('path')
      .attr('transform', `translate(${width / 2} ${height / 2})`)
      .attr('d', arc)

    // Creates Barometer Scale
    var baroScale = d3.scaleLinear()
      .domain([28, 31])
      .range([55, 305])

    // Draws Barometer Scale
    svg.selectAll("barolabels")
      .data([28, 28.5, 29, 29.5, 30, 30.5, 31])
      .enter()
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', d => `translate(${width / 2} ${height / 2}) rotate(${baroScale(d)}) translate(0 75) rotate(180)`)
      .attr('fill', 'black')
      .text(d => d)

    // Draws Barometer Ticks
    // Uses Trigonometery to determine tick location and sizing
    svg.selectAll('ticks')
      .data(d3.range(28, 31.01, 0.1))
      .enter()
      .append('line')
      .attr('x1', d => this.calcX(baroScale(d), 100))
      .attr('y1', d => this.calcY(baroScale(d), 100))
      .attr('x2', d => {
        // Lengths tick marks at whole numbers
        if (d % 1 === 0) {
          return this.calcX(baroScale(d), 85);

        } else if ((d - 0.5) % 1 === 0) {
          // Lengths tick marks at half numbers
          return this.calcX(baroScale(d), 90);
        } else {
          // Leaves the rest of ticks shorter
          return this.calcX(baroScale(d), 93);
        }
      })
      .attr('y2', d => {
        if (d % 1 === 0) {
          // Lengths tick marks at whole numbers
          return this.calcY(baroScale(d), 85);
        } else if ((d - 0.5) % 1 === 0) {
          // Lengths tick marks at half numbers
          return this.calcY(baroScale(d), 90);
        } else {
          // Leaves the rest of ticks shorter
          return this.calcY(baroScale(d), 93);
        }
      })
      .attr('stroke', 'black')
      .attr('stroke-width', d => {
        // Darkens tick on whole numbers
        if (d % 1 === 0) {
          return 1.5
        }
      })

    this.displayNeedle(svg, baroScale);

    // Displays units
    svg.append('text')
      .attr('x', this.props.width / 2)
      .attr('y', this.props.height - 45)
      .text("inHg")
      .attr('text-anchor', "middle")
      .attr('font-size', 20)
      .attr('fill', 'black')

  }

  render() {
    var { width, height } = this.props;
    return (
      <div>
        {this.props.metar[0].alti ?
        <LabelValue
          className='selectable pressure'
          label={"Pressure"}
          value={+this.props.metar[0].alti / 100 + '"'} />
          : null
        }
        <svg ref={node => this.node = node}
          viewBox="0 0 200 160" // viewBox is kept constant so that the coordinates dont change with display size.
          width={width || 200}
          height={height || 200}>
        </svg>
      </div>
    );
  }
}

export default Pressure;
