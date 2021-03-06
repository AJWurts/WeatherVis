import React, { Component } from 'react';
import *  as d3 from 'd3';
import { LabelValue } from '../../components';


class Visibility extends Component {
  componentDidMount() {
    this.createGraph()
  }

  UNSAFE_componentWillReceiveProps(props) {
    this.props = props;
    this.createGraph()
  }

  createGraph = () => {
    const node = this.node;
    var svg = d3.select(node);
    svg.selectAll('*').remove();




    if (!this.props.vis) {
      return;
    } else {
      var vis = this.props.vis || 5;
    }
    var width = 500;
    var height = 40



    var xScale = d3.scaleLinear()
      .domain([0, 10])
      .range([width * 0.05, width * 0.92])




    // Axis bottom
    svg.append('line')
      .attr('x1', xScale(0))
      .attr('y1', height - 20)
      .attr('x2', xScale(10))
      .attr('y2', height - 20)
      .attr('stroke', 'black')
      .attr('stroke-width', 1)



    // Axis Labels
    svg.selectAll('label')
      .data([0, 1, 2, 4, 6, 8, 10])
      .enter()
      .append('text')
      .attr('text-anchor', 'start')
      .attr('x', d => xScale(d))
      .attr('y', d => height - 6)
      .text(d => d + 'sm')


    // Axis Ticks
    svg.selectAll('ticks')
      .data([0, 1, 2, 4, 6, 8, 10])
      .enter()
      .append('line')
      .attr('x1', d => xScale(d))
      .attr('y1', height - 25)
      .attr('x2', d => xScale(d))
      .attr('y2', height - 20)
      .attr('stroke', 'black')
      .attr('stroke-width', 1)


    // Cloud (GRay Area)
    svg.append('rect')
      .attr('x', xScale(vis))
      .attr('y', 0)
      .attr('width', xScale(10) - xScale(vis))
      .attr('height', height - 20)
      .attr('fill', '#616161')

    // Blue Sky
    // Slightly transparent to see underlying ticks
    svg.append('rect')
      .attr('x', xScale(0))
      .attr('y', 0)
      .attr('width', xScale(vis) - xScale(0))
      .attr('height', height - 20)
      .attr('fill', '#33c6f8')


  }

  render() {
    var { width, height } = this.props;
    return (
      <div style={{textAlign: 'start'}}>
        <LabelValue className='selectable visibility' label="Visibility" value={this.props.vis + " Statute (Standard) Miles"} />
        <svg ref={node => this.node = node}  viewBox="25 0 500 40" width={width || 500} height={height || 40}>
        </svg>
      </div>
    );
  }
}

export default Visibility;
