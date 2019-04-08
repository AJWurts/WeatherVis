import React, { Component } from 'react';
import *  as d3 from 'd3';


class Temp extends Component {
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
      var temp = this.props.tmpf || 5;
      var dew = this.props.dewf || 5;
    }
    
    console.log(temp, dew)
    var width = this.props.width || 100;
    var height = this.props.height || 200



    var tempScale = d3.scaleLinear()
      .domain([-20, 110])
      .range([height * 0.05, height * 0.92])

    console.log("Hello")

    // Dew Point
    var dewCircle = svg.append('circle')
      .attr('cx', 10)
      .attr('cy', tempScale(dew))
      .attr('r', 5)
      .attr('fill', 'blue')


    // Temp
    var tempCircle = svg.append('circle')
      .attr('cx', 10)
      .attr('cy', tempScale(temp))
      .attr('r', 5)
      .attr('fill', 'red')


    if (temp === dew) {
      console.log('heu')
      dewCircle.attr('stroke-width', 5)
    }




  }

  render() {
    var { width, height } = this.props;
    return (
      <div>
        <svg ref={node => this.node = node} width={width || 100} height={height || 200}>
        </svg>
      </div>
    );
  }
}

export default Temp;
