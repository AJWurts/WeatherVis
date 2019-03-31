import React, { Component } from 'react';
import *  as d3 from 'd3';


class Cloud extends Component {
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



    if (!this.props.metar) {
      return;
    } else {
      var metar = this.props.metar;
    }

    var width = this.props.width || 200;
    var height = this.props.height || 800;

    var yScale = d3.scaleLinear()
      .domain([0, 12000])
      .range([height * 0.05, height * 0.92])




    svg.selectAll('label')
      .data([0, 3000, 6000, 8000, 9000, 12000])
      .enter()
      .append('text')
      .attr('x', d => 10)
      .attr('y', d => yScale(d))
      .text(d => d + 'ft')



  }

  render() {
    var { width, height } = this.props;
    return (
      <div>
        <svg ref={node => this.node = node} width={width || 200} height={height || 800}>
        </svg>
      </div>
    );
  }
}

export default Cloud;
