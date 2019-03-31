import React, { Component } from 'react';
import *  as d3 from 'd3';


class Metar extends Component {
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


    if (!this.props.data) {
      return;
    } else {
      var data = this.props.data;
    }
    var width = this.props.width || 500;
    var height = this.props.height || 100

    var xScale = d3.scaleLinear()
      .domain([0, 10])
      .range([0, width])

    svg.append('line')
      .attr('x1', 0)
      .attr('y1', height - 20)
      .attr('x2', width)
      .attr('y2', height - 20)
      .attr('stroke', 'black')
      .attr('stroke-width', 1)

      

    svg.selectAll('label')
      .data([0,2,4,6,8,10])
      .enter()
      .append('text')
      .attr('x', d => xScale(d))
      .attr('y', d => height - 10)
      .text(d => d)
  }

  render() {
    var { width, height } = this.props;
    return (
      <div>
          <HistoricalWind data={this.props.data}/>
        </div>
    );
  }
}

export default Metar;
