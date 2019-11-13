import React, { Component } from 'react';
import *  as d3 from 'd3';
import { LabelValue } from '../../components';

// Runways for small set of airports
const airports = {

  "KBED": {
    runways: [
      {
        heading: 290,
        length: 7011
      },
      {
        heading: 230,
        length: 5107
      }
    ],
    variation: 0
  },
  "KSFM": {
    runways: [
      {
        heading: 70,
        length: 6389,
      },
      {
        heading: 140,
        length: 4999
      }
    ],
    variation: 0
  }
}// Default airport is hanscom

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

class Wind extends Component {
  constructor(props) {
    super(props);

    this.state = {
      angle: 0
    }
  }

  // Handle Creation of Graph when Loading
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

  // Draw an Arrow
  // Used for Wind and Gust arrows
  drawArrow = (svg, dir, speed, maxSpeed, color) => {

    // If Variable set speed to 0 so arrow doesnt show anything
    if (dir == 'VRB') {
      dir = 360;
      speed = 0;
    } else {
      // Flip arrow 180 so it points with the wind
      dir = (dir + 180) % 360;
    }

    var speedScale = d3.scalePow()
      .exponent(0.5)
      .domain([0, maxSpeed])
      .range([0, (this.props.width / 3) * 0.95])


    let halfWidth = 250;
    let halfHeight = 250;
    let length = speedScale(+speed);
    color = color || '#1a496b'
    // Line
    let tipX = halfWidth + this.calcX(dir, length);
    let tipY = halfHeight + this.calcY(dir, length);

    // If Arrow is orange (gust) stop being from being too long
    svg.append('line')
      .attr('x1', color === 'orange' ? halfWidth : halfWidth + (halfWidth - tipX))
      .attr('y1', color === 'orange' ? halfWidth : halfWidth + (halfWidth - tipY))
      .attr('x2', tipX)
      .attr('y2', tipY)
      .attr('stroke', color)
      .attr('stroke-width', '5')

    // Tip Triangle
    // IDK what I did, but it works so go with it
    let theta = (((dir + this.state.angle) / 10) - 9) * (2 * Math.PI / 36) - (Math.PI / 2);
    let xAltPtDelta = Math.cos(theta) * (this.props.width / 4) * 0.06;
    let yAltPtDelta = Math.sin(theta) * (this.props.width / 4) * 0.06;
    let radPtX = halfWidth + this.calcX(dir, length - 20);
    let radPtY = halfWidth + this.calcY(dir, length - 20);
    let lines = [
      {
        x: radPtX - xAltPtDelta,
        y: radPtY - yAltPtDelta
      },
      {
        x: radPtX + xAltPtDelta,
        y: radPtY + yAltPtDelta
      }
    ];
    svg.selectAll('arrowhead')
      .data(lines)
      .enter()
      .append('line')
      .attr('x1', tipX)
      .attr('y1', tipY)
      .attr('x2', d => d.x)
      .attr('y2', d => d.y)
      .attr('stroke', color)
      .attr('stroke-width', 5)

  }

  processWind = (metar, speedScale) => {
    let { drct, sknt } = metar;
    if (drct == 'VRB') {
      drct = 360;
      // speed = 0;
    } else {
      drct = (drct + 180) % 360;
    }

    return {
      drct: drct,
      sknt: speedScale(sknt)
    }
  }


  // Trig Stuff ---------
  calcY = function (direction, length) {
    length = length == null ? (this.props.height / 3) : length;
    var angle = ((direction + this.state.angle) / 10) * (2 * Math.PI / 36) - (Math.PI / 2);
    let y = Math.sin(angle) * (length);

    return y;
  }

  calcX = (direction, length) => {
    length = length == null ? (this.props.width / 3) : length;

    var angle = ((direction + this.state.angle) / 10) * (2 * Math.PI / 36) - (Math.PI / 2);

    let x = Math.cos(angle) * (length);

    return x;
  }

  //////////////////////

  // Runway Interaction
  runwayHover = (runway) => {
    runway = d3.selectAll(".runway" + (runway.heading % 180));
    runway.attr('stroke', '#444444')
  }

  runwayHoverExit = (runway) => {
    runway = d3.selectAll(".runway" + (runway.heading % 180));
    runway.attr('stroke', '#000000')
  }

  rotateAnimation = (inc, end) => {
    if (Math.abs(this.state.angle - end) < 2) {
      this.setState({
        angle: end
      }, this.createGraph);
      // console.log(end);
      clearInterval(this.interval);
      this.interval = null;
    }
    this.setState({
      angle: this.state.angle + inc
    });

    this.createGraph();

  }

  ////////////////////////////////////

  drawRunways = (svg, runways, variation) => {
    const maxRwyLen = d3.max(runways, x => x.length)
    var data = [];
    for (let i = 0; i < runways.length; i++) {
      let heading = runways[i].heading;
      let scaledLength = (runways[i].length / maxRwyLen) * (this.props.width / 3) * 0.9;
      let oppHeading = (runways[i].heading + 180) % 360;
      data.push({
        heading: oppHeading,
        trueHeading: oppHeading + variation,
        scaledLength: scaledLength
      })
      data.push({
        heading: heading,
        trueHeading: heading + variation,
        scaledLength: scaledLength
      })
    }

    svg.selectAll('runways')
      .data(data)
      .enter()
      .append("line")
      .attr('cursor', 'pointer')
      .attr('class', d => "runway" + (d.heading % 180))
      .attr('x1', d => 250 + this.calcX(d.trueHeading + 180, d.scaledLength))
      .attr('y1', d => 250 + this.calcY(d.trueHeading + 180, d.scaledLength))
      .attr('x2', d => 250)
      .attr('y2', d => 250)
      .attr('stroke', '#000000')
      .attr('stroke-width', 25)
      .on('mouseover', d => {
        if (!this.interval) {

          this.runwayHover(d)
        }
      })
      .on('mouseout', d => {
        if (!this.interval) {
          this.runwayHoverExit(d)
        }
      })
      .on('click', d => {
        d3.event.stopPropagation()
        if (this.interval) {
          clearInterval(this.interval)

        }
        this.interval = setInterval(() => this.rotateAnimation(((360 - d.trueHeading) - this.state.angle) / 10, 360 - d.trueHeading), 50)
      })

    data.forEach((d) => {
      svg.append('text')
        .attr('transform', `translate(${250} ${250}) rotate(${d.trueHeading + this.state.angle}) translate(8 ${-d.scaledLength + 5}) rotate(180)`)
        .attr('fill', 'white')
        .text(((d.heading + 180) % 360) / 10)

    })

  }

  drawSpeedRings = (svg, maxSpeed) => {
    // Uses power scale to emphasize slower speed winds which are more common
    var labels = [4, 8, 16, 24, 36, 48, 60];

    var speedScale = d3.scalePow()
      .exponent(0.5)
      .domain([0, maxSpeed])
      .range([0, (this.props.width / 3) * 0.95])
    svg.selectAll('speedRings')
      .data(labels)
      .enter()
      .append('circle')
      .attr('cx', d => 250)
      .attr('cy', d => 250)
      .attr('stroke', '#000000')
      .attr('r', d => speedScale(d))
      .attr('fill', 'none')

    svg.selectAll('speedRingLabels')
      .data(labels)
      .enter()
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('x', d => 250 + this.calcX(165, speedScale(d)))
      .attr('y', d => 250 + this.calcY(165, speedScale(d)))
      .text((d, i) => {
        if (i == labels.length - 1) {
          return d + 'kts'
        } else {
          return d;
        }
      })
      .attr('font-size', 13)

  }

  drawRunwayWind = (svg, heading, variation, yCoord) => {

    // Draw a single runway wind indicator in bottom left
    if (this.props.metar[0].drct == 'VRB') {
      return;
    }

    let dir = this.props.metar[0].drct;
    let spd = this.props.metar[0].sknt;
    let angle = this.rads(Math.abs((((heading + variation) + 360 - dir) % 360)))
    let headwind = Math.floor(Math.cos(angle) * spd);
    let crosswind = -Math.floor(Math.sin(angle) * spd);
    svg.append("text")
      .attr('x', 5)
      .attr('y', yCoord)
      .text(`${heading / 10}: `)
      .attr('color', 'black')
    if (headwind < 0) {
      svg.append('path')
        .attr('d', `M${30} ${yCoord - 4} l5-5 5 5z`) //M7 14l5-5 5 5z
        .attr('fill', 'red')
    } else {
      svg.append('path')
        .attr('d', `M${30} ${yCoord - 8} l5 5 5-5z`)
        .attr('fill', 'green')
    }


    svg.append("text")
      .attr('x', 40)
      .attr('y', yCoord)
      .text(`${Math.abs(headwind)}`)
      .attr('color', 'black')

    if (crosswind < 0) {
      svg.append('path')
        .attr('d', `M${70} ${yCoord} l0 -10 5 5z`)
        .attr('fill', Math.abs(crosswind) < 10 ? 'green' : "red")
    } else {
      svg.append('path')
        .attr('d', `M${75} ${yCoord} l0 -10 -5 5z`)
        .attr('fill', Math.abs(crosswind) < 10 ? 'green' : "red")
    }
    svg.append("text")
      .attr('x', 80)
      .attr('y', yCoord)
      .text(`${Math.abs(crosswind)}`)
      .attr('color', 'black')
    yCoord += 25
    return yCoord;
  }

  rads = (degrees) => {
    var pi = Math.PI;
    return degrees * (pi / 180);
  }

  drawRunwayWinds = (svg, airport) => {
    // Draws all runway winds
    let runways = airport.runways;
    svg.append("text")
      .attr('x', 5)
      .attr('y', this.props.height - 120)
      .text("Runway Winds")
      .attr('color', 'black')
    let yCoord = this.props.height - 100;
    for (let i = 0; i < runways.length; i++) {
      yCoord = this.drawRunwayWind(svg, runways[i].heading, airport.variation, yCoord)
    }

    for (let i = 0; i < runways.length; i++) {
      let heading = (runways[i].heading + 180) % 360;
      yCoord = this.drawRunwayWind(svg, heading, airport.variation, yCoord)

    }

  }

  pad = (num, size) => {
    var s = "000000000" + num;
    return s.substr(s.length - size);
  }

  createGraph = () => {
    const node = this.node;
    var svg = d3.select(node);
    svg.selectAll('*').remove();

    svg.on('click', () => {
      if (this.interval) {
        clearInterval(this.interval)
      }
      this.interval = setInterval(() => this.rotateAnimation(((0) - this.state.angle) / 10, 0), 50)

    });
    var { drct, sknt, gust } = this.props.metar[0];



    // Compass Labels
    svg.selectAll('label')
      .data(compass)
      .enter()
      .append('text')
      .attr('x', d => 250 + this.calcX(d.dir) - 6)
      .attr('y', d => 250 + this.calcY(d.dir) + 6)
      .text(d => d.label)
      .attr('font-size', 18)

    // var runways = this.props.runways || hanscomRunways;
    let max_speed = Math.max(60, sknt, gust) //Math.max(sknt, gust) + 5
    sknt = sknt + 0.01;
    gust = gust + 0.01;
    this.drawSpeedRings(svg, max_speed);

    if (airports[this.props.airport]) {
      this.drawRunways(svg, airports[this.props.airport].runways, airports[this.props.airport].variation);
      this.drawRunwayWinds(svg, airports[this.props.airport]);
    }




    if (gust !== 0.01) {
      this.drawArrow(svg, this.props.metar[0].drct, gust, max_speed, 'orange');
    }
    this.drawArrow(svg, this.props.metar[0].drct, sknt, max_speed, '#61a8c6');


    // Wind Direction Label
    svg.append('windDirLabel')
      .append("text")
      .attr('text-anchor', 'middle')
      .attr('x', 250)
      .attr('y', 250 - 50)
      .text(this.props.metar[0].drct)
      .attr('color', 'black')


  }

  render() {
    var { width, height } = this.props;
    var { drct, sknt, gust } = this.props.metar[0];

    return (
      <div style={{ textAlign: 'start' }}>
        <div>
          <LabelValue className='selectable metarwind' label={"Wind"} value={gust ?
            `${drct == "VRB" ? "Variable" : this.pad(drct, 3)} at ${sknt} knots (${(sknt * 1.15077945).toFixed(0)}mph) gusting ${gust} knots (${(gust * 1.15077945).toFixed(0)}mph)`
            : `${this.pad(drct, 3)} at ${sknt} knots (${(sknt * 1.15077945).toFixed(0)}mph)`} />
        </div>

        <svg ref={node => this.node = node} viewBox='0 50 375 475' width={width || 500} height={height || 500}>
        </svg>
      </div>
    );
  }
}

export default Wind;
