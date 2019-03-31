import React, { Component } from 'react';
import *  as d3 from 'd3';


class HistoricalWind extends Component {
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
    var height = this.props.height || 500

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

    const airportRunways = this.props.airportRunways || [
      {
        heading: 290,
        length: 7011
      },
      {
        heading: 230,
        length: 5107
      }
    ]; // Default airportis hanscom

    const maxRwyLen = d3.max(airportRunways, x => x.length)

    var radScale = d3.scaleLinear()
      .range([0, width / 4])

    var spdScale = d3.scaleLinear()
      .range([0.3, 1])


    var calcY;

    var calcX;

    svg.selectAll('refLines')
      .data([10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
      .enter()
      .append('circle')
      .attr('cx', width / 2)
      .attr('cy', width / 2)
      .attr('stroke', '#00000000')
      .attr('r', d => d)
      .attr('fill', 'none')




    let maxSpeed = d3.max(data, x => x.sknt)
    let minSpeed = d3.min(data, x => x.sknt)
    spdScale.domain([minSpeed, maxSpeed]);

    let maxCount = d3.max(data, x => x.cnt / 1);
    radScale.domain([0, maxCount])



    calcY = function (direction, count, numberOfPoints) {
      var angle = (direction / 10) * (2 * Math.PI / numberOfPoints) - (Math.PI / 2);

      let y = Math.sin(angle) * radScale(count);

      return y;
    }
    calcX = (direction, count, numberOfPoints) => {
      var angle = (direction / 10) * (2 * Math.PI / numberOfPoints) - (Math.PI / 2);

      let x = Math.cos(angle) * radScale(count);

      return x;
    }



    svg.selectAll("lines")
      .data(data)
      .enter()
      .append('line')
      .attr('x1', width / 2)
      .attr('y1', width / 2)
      .attr('x2', d => width / 2 + calcX(d.dir, d.cnt, 36))
      .attr('y2', d => width / 2 + calcY(d.dir, d.cnt, 36))
      .attr('stroke', d => d3.interpolateGnBu(spdScale(d.sknt)))
      .attr('stroke-width', '3')


    svg.selectAll('label')
      .data(compass)
      .enter()
      .append('text')
      .attr('x', d => width / 2 + calcX(d.dir, maxCount, 36) - 6)
      .attr('y', d => width / 2 + calcY(d.dir, maxCount, 36) + 6)
      .text(d => d.label)


    showRunways(airportRunways, maxCount);


    function showRunways(runways, maxCount) {
      for (let i = 0; i < runways.length; i++) {
        let heading = runways[i].heading;
        let scaledLength = (runways[i].length / maxRwyLen) * maxCount * 0.9;
        let oppHeading = (runways[i].heading + 180) % 360;
        // let xOffset = runways[i].xOffset || 0;
        // let yOffset = runways[i].yOffset || 0;

        svg.append("line")
          .attr('x1', width / 2 + calcX(heading, scaledLength, 36))
          .attr('y1', width / 2 + calcY(heading, scaledLength, 36))
          .attr('x2', width / 2 + calcX(oppHeading, scaledLength, 36))
          .attr('y2', width / 2 + calcY(oppHeading, scaledLength, 36))
          .attr('stroke', '#00000088')
          .attr('stroke-width', '15')

      }
    }
  }

  render() {
    var { width, height } = this.props;
    return (
      <div>
        <svg ref={node => this.node = node} width={width || 500} height={height || 500}>
        </svg>
      </div>
    );
  }
}

export default HistoricalWind;
