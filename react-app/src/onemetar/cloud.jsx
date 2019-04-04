import React, { Component } from 'react';
import *  as d3 from 'd3';

const COVER_KEY = {
  "SKC": 0,
  "NCD": 0,
  "CLR": 0,
  "FEW": 1,
  "SCT": 2,
  "BKN": 3,
  "OCV": 4,
  "VV": 5
}

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

    // For each level we want the cloud level
    // Important columns: skyc1,skyc2,skyc3,skyc4,skyl1,skyl2,skyl3,skyl4
    // Potential data
    var levels = [
      // {
      //   alt: Number,
      //   cover: Number
      // }
    ]
    for (let i = 1; i <= 4; i++) {

    }

    var yScale = d3.scaleLinear()
      .domain([0, 12000])
      .range([height * 0.92, height * 0.05])


    svg.selectAll('label')
      .data([0, 3000, 6000, 9000, 12000])
      .enter()
      .append('text')
      .attr('text-anchor', 'end')
      .attr('x', d => 100)
      .attr('y', d => yScale(d))
      .text(d => d + 'ft AGL')



  }

  render() {
    var { alt, cover, xMin, xMax, yScale } = this.props;

    if (cover == 0) {
      return <rect
        x={xMin}
        width={1000}
        y={yScale(alt)}
        height={yScale(1)} // 1000ft

      ></rect>
    } else if (cover == 5) {
      return <rect
        x={xMin}
        width={1000}
        y={yScale(alt)}
        height={yScale(1)} // 1000ft
        rx={10}
        ry={10}
        backgroundColor={'#FFFFFF88'}

      ></rect>
    }
    return (
      <div>
        <svg ref={node => this.node = node} width={width || 200} height={height || 800}>
        </svg>
      </div>
    );
  }
}

export default Cloud;
