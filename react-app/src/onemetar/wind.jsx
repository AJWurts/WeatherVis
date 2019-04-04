import React, { Component } from 'react';
import *  as d3 from 'd3';

const MAX_SPEED = 40;

const hanscomRunways = [
  {
    heading: 290,
    length: 7011
  },
  {
    heading: 230,
    length: 5107
  }
]; // Default airport is hanscom

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


  }

  componentWillMount() {

    this.createGraph()

  }
  componentDidMount() {
    this.createGraph()
  }

  componentWillReceiveProps(props) {
    this.props = props;
    this.createGraph()
  }

  drawArrow = (svg, dir, speed, maxSpeed, color) => {
    var speedScale = d3.scaleLinear()
      .domain([0, maxSpeed])
      .range([0, (this.props.width / 3) * 0.95])

    let length = speedScale(+speed);
    color = color || '#1a496b'
    // Line
    let tipX = this.props.width / 2 + this.calcX(dir, length);
    let tipY = this.props.height / 2 + this.calcY(dir, length);


    svg.append('line')
      .attr('x1', this.props.width / 2)
      .attr('y1', this.props.width / 2)
      .attr('x2', tipX)
      .attr('y2', tipY)
      .attr('stroke', color)
      .attr('stroke-width', '3')

    // Tip Triangle
    let theta = ((dir / 10) - 9) * (2 * Math.PI / 36) - (Math.PI / 2);
    let xAltPtDelta = Math.cos(theta) * (this.props.width / 4) * 0.05;
    let yAltPtDelta = Math.sin(theta) * (this.props.width / 4) * 0.05;
    let radPtX = this.props.width / 2 + this.calcX(dir, length * 0.9);
    let radPtY = this.props.height / 2 + this.calcY(dir, length * 0.9);
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
      .attr('stroke-width', 3)

  }

  calcY = function (direction, length) {
    length = length == null ? (this.props.height / 3) : length;
    var angle = (direction / 10) * (2 * Math.PI / 36) - (Math.PI / 2);

    let y = Math.sin(angle) * (length);

    return y;
  }
  calcX = (direction, length) => {
    length = length == null ? (this.props.width / 3) : length;

    var angle = (direction / 10) * (2 * Math.PI / 36) - (Math.PI / 2);

    let x = Math.cos(angle) * (length);

    return x;
  }

  drawRunways = (svg, runways) => {
    const maxRwyLen = d3.max(runways, x => x.length)
    for (let i = 0; i < runways.length; i++) {
      let heading = runways[i].heading;
      let scaledLength = (runways[i].length / maxRwyLen) * (this.props.width / 3) * 0.9;
      let oppHeading = (runways[i].heading + 180) % 360;

      svg.append("line")
        .attr('x1', this.props.width / 2 + this.calcX(heading, scaledLength))
        .attr('y1', this.props.width / 2 + this.calcY(heading, scaledLength))
        .attr('x2', this.props.height / 2 + this.calcX(oppHeading, scaledLength))
        .attr('y2', this.props.height / 2 + this.calcY(oppHeading, scaledLength))
        .attr('stroke', '#000000CC')
        .attr('stroke-width', 25)

      svg.append('text')
        .attr('transform', `translate(${this.props.width / 2} ${this.props.width / 2}) rotate(${heading}) translate(8 ${-scaledLength + 5}) rotate(180)`)
        .attr('fill', 'white')
        .text(heading / 10)

      svg.append('text')
        .attr('transform', `translate(${this.props.width / 2} ${this.props.width / 2}) rotate(${oppHeading}) translate(8 ${-scaledLength + 5}) rotate(180)`)
        .attr('fill', 'white')

        .text(oppHeading / 10)
        .attr('text-anchor', 'start')
    }
  }

  drawSpeedRings = (svg, maxSpeed) => {

    var labels = d3.range(0, maxSpeed + 10, 10);
    delete labels[0];
    var speedScale = d3.scaleLinear()
      .domain([0, labels[labels.length - 1]])
      .range([0, (this.props.width / 3) * 0.95])
    svg.selectAll('speedRings')
      .data(labels)
      .enter()
      .append('circle')
      .attr('cx', d => this.props.width / 2)
      .attr('cy', d => this.props.height / 2)
      .attr('stroke', '#00000022')
      .attr('r', d => speedScale(d))
      .attr('fill', 'none')

    svg.selectAll('speedRingLabels')
      .data(labels)
      .enter()
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('x', d => this.props.width / 2 + this.calcX(165, speedScale(d)))
      .attr('y', d => this.props.height / 2 + this.calcY(165, speedScale(d)))
      .text((d, i) => {
        if (i == labels.length - 1) {
          return d + 'kts'
        } else {
          return d;
        }
      })
      .attr('font-size', 10)

  }

  drawRunwayWind = (svg, heading, yCoord) => {
    let dir = this.props.metar.drct * 10;
    let spd = this.props.metar.sknt;
    let crosswind = -Math.round(Math.cos(this.rads(Math.abs(heading - dir)))* spd);
    let headwind = -Math.round(Math.sin(this.rads(Math.abs(heading - dir))) * spd);
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

  drawRunwayWinds = (svg, runways) => {

    svg.append("text")
      .attr('x', 5)
      .attr('y', this.props.height - 120)
      .text("Runway Winds")
      .attr('color', 'black')
    let yCoord = this.props.height - 100;
    for (let i = 0; i < runways.length; i++) {
      yCoord = this.drawRunwayWind(svg, runways[i].heading, yCoord)
    }

    for (let i = 0; i < runways.length; i++) {
      let heading = (runways[i].heading + 180) % 360;
      yCoord = this.drawRunwayWind(svg, heading, yCoord)

    }

  }

  createGraph = () => {
    const node = this.node;
    var svg = d3.select(node);
    svg.selectAll('*').remove();

    // Title
    svg.append('text')
      .attr('x', 10)
      .attr('y', 30)
      .text("Wind: "  + this.props.metar.drct + "" + this.props.metar.sknt + 'G' + this.props.metar.gust)
      .attr('text-anchor', 'start')
      .attr('font-size', 20)

    // Compass Labels
    svg.selectAll('label')
      .data(compass)
      .enter()
      .append('text')
      .attr('x', d => this.props.width / 2 + this.calcX(d.dir) - 6)
      .attr('y', d => this.props.height / 2 + this.calcY(d.dir) + 6)
      .text(d => d.label)

    var runways = this.props.runways || hanscomRunways;
    this.drawRunways(svg, runways);

    this.drawArrow(svg, +this.props.metar.drct, this.props.metar.gust, MAX_SPEED, 'orange')
    this.drawArrow(svg, +this.props.metar.drct, this.props.metar.sknt, MAX_SPEED)

    this.drawSpeedRings(svg, MAX_SPEED);

    // Wind Direction Label
    svg.append('windDirLabel')
      .append("text")
      .attr('text-anchor', 'middle')
      .attr('x', this.props.width / 2)
      .attr('y', this.props.height / 2 - 50)
      .text(this.props.metar.drct)
      .attr('color', 'black')


    this.drawRunwayWinds(svg, runways);
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

export default Wind;
