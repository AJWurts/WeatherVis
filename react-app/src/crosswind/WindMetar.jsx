import React, { Component } from 'react';
import *  as d3 from 'd3';
import { LabelValue } from '../components';


const compass = [
  {
    dir: 360,
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
      angle: 0,
      moving: false
    }
    this.maxSpeed = 60;
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

  // Given X and Y return dir and speed
  drawCursorArrow = (svg, maxSpeed) => {
    let x = d3.event.x;
    let y = d3.event.y - 298;

    this.drawArrow2(svg, 250, 250, x, y);

    let xDiff = x - 250;
    let yDiff = (y - 250);

    let angle = (Math.atan((yDiff) / (xDiff)) * 180 / Math.PI + 360 + 90) % 360
    let dist = Math.sqrt((xDiff * xDiff) + (yDiff * yDiff));
    // (80 / 160) * 60 = 30; sqrt(30) = 5.4
    dist = Math.pow(dist / 20, 2);
    if (xDiff < 0) {
      angle += 180;
    }
  
    angle = (angle + 180) % 360
    this.props.onDrag(angle, dist);

    // this.props.onDrag()
  }

  drawArrow2 = (svg, x1, y1, x2, y2, color, pointerHeight) => {
    let pHeight = pointerHeight || 15;
    color = color || 'blue';

    // Tip Triangle
    // IDK what I did, but it works so go with it
    let xDiff = x2 - x1;
    let yDiff = y2 - y1;
    let angle = Math.atan((yDiff) / (xDiff));
    let dist = Math.sqrt((xDiff * xDiff) + (yDiff * yDiff));

    // console.log(xDiff, yDiff, angle, dist);
    let xAltPtDelta = Math.cos(angle - Math.PI / 2) * 7;
    let yAltPtDelta = Math.sin(angle - Math.PI / 2) * 7;
    let radPtX = x1 + Math.cos(angle) * (dist - pHeight)
    let radPtY = y1 + Math.sin(angle) * (dist - pHeight);

    svg.append('line')
      .attr('x1', x1)
      .attr('y1', y1)
      .attr('x2', radPtX)
      .attr('y2', radPtY)
      .attr('stroke', color)
      .attr('stroke-width', '5')

    let path = d3.path()
    path.moveTo(radPtX, radPtY)
    path.lineTo(radPtX - xAltPtDelta, radPtY - yAltPtDelta)
    path.lineTo(x2, y2)
    path.lineTo(radPtX + xAltPtDelta, radPtY + yAltPtDelta)
    path.lineTo(radPtX, radPtY)
    path.closePath()

    svg.append('path')
      .attr('d', path.toString())
      .attr('id', 'arrowhead')
      .attr('fill', color)

    svg.append('circle')
      .attr('cx', x2)
      .attr('cy', y2)
      .attr('r', 20)
      .attr('opacity', 0)
      .on('mouseover', d => {
        d3.select('#arrowhead')
          .attr('fill', d => {
            console.log(color, color + 50);
            return color + "A0";
          })
          .style("cursor", "pointer")
      }).on('mouseout', d => {
        d3.select('#arrowhead')
          .attr('fill', color)
          .style('cursor', 'default')
      }).on('mousedown', d => {
        this.setState({ moving: true })
      }).on('mousemove', d => {
        if (this.state.moving) {
          this.drawCursorArrow(svg);

        }
      }).on('mouseup', d => {
        this.setState({ moving: false });
      })
  }

  // Draw an Arrow
  // Used for Wind and Gust arrows
  drawArrow = (svg, dir, speed, maxSpeed, color) => {

    // If Variable set speed to 0 so arrow doesnt show anything
    if (dir === 'VRB') {
      dir = 360;
      speed = 0;
    } else {
      // Flip arrow 180 so it points with the wind
      dir = (dir + 180) % 361;
    }

    var speedScale = (val) => {
      return  Math.sqrt(val) / 8 * 160
    }


    let halfWidth = 250;
    let halfHeight = 250;
    let length = speedScale(+speed);
    color = color || '#1a496b'

    // Line
    let tipX = halfWidth + this.calcX(dir, length);
    let tipY = halfHeight + this.calcY(dir, length);

    this.drawArrow2(svg, halfWidth, halfHeight, tipX, tipY, color);
    // // If Arrow is orange (gust) stop being from being too long


    // // Tip Triangle
    // // IDK what I did, but it works so go with it
    // let theta = (((dir + this.state.angle) / 10) - 9) * (2 * Math.PI / 36) - (Math.PI / 2);
    // let xAltPtDelta = Math.cos(theta) * (this.props.width / 4) * 0.06;
    // let yAltPtDelta = Math.sin(theta) * (this.props.width / 4) * 0.06;
    // let radPtX = halfWidth + this.calcX(dir, length - 20);
    // let radPtY = halfWidth + this.calcY(dir, length - 20);

    // svg.append('line')
    //   .attr('x1', color === 'orange' ? halfWidth : halfWidth + (halfWidth - tipX))
    //   .attr('y1', color === 'orange' ? halfWidth : halfWidth + (halfWidth - tipY))
    //   .attr('x2', radPtX)
    //   .attr('y2', radPtY)
    //   .attr('stroke', color)
    //   .attr('stroke-width', '5')

    // let path = d3.path()

    // path.moveTo(radPtX, radPtY)
    // path.lineTo(radPtX - xAltPtDelta, radPtY - yAltPtDelta)
    // path.lineTo(tipX, tipY)
    // path.lineTo(radPtX + xAltPtDelta, radPtY + yAltPtDelta)
    // path.lineTo(radPtX, radPtY)
    // path.closePath()

    // svg.append('path')
    //   .attr('d', path.toString())
    //   .attr('id', 'arrowhead')
    //   .attr('fill', color)

    // svg.append('circle')
    //   .attr('cx', tipX)
    //   .attr('cy', tipY)
    //   .attr('r', 20)
    //   .attr('opacity', 0)
    //   .on('mouseover', d => {
    //     console.log('mouseover');

    //     d3.select('#arrowhead')
    //       .attr('fill', d => {
    //         console.log(color, color + 50);
    //         return color + "A0";
    //       })
    //       .style("cursor", "pointer")
    //   }).on('mouseout', d => {
    //     d3.select('#arrowhead')
    //       .attr('fill', color)
    //       .style('cursor', 'default')
    //   }).on('mousedown', d => {
    //     console.log("Mouse Down");
    //   }).on('mousemove', d => {
    //     console.log("Mouse Move");
    //     console.log(this.calcDirSpd(maxSpeed));
    //   }).on('mouseup', d => {
    //     console.log("Mouse Up");
    //   })
  }

  processWind = (metar, speedScale) => {
    let { drct, sknt } = metar;
    if (drct === 'VRB') {
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
      let heading = runways[i].direction;
      let scaledLength = (runways[i].length / maxRwyLen) * (this.props.width / 3) * 0.9;
      let oppHeading = (runways[i].direction + 180) % 360;
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
        .attr('transform', `translate(${250} ${250}) rotate(${d.trueHeading + this.state.angle}) translate(0 ${-d.scaledLength + 5}) rotate(180)`)
        .attr('fill', 'white')
        .attr('text-anchor', 'middle')
        .text((((d.heading + 180) % 361) / 10).toFixed())

    })

  }

  drawSpeedRings = (svg, maxSpeed) => {
    // Uses power scale to emphasize slower speed winds which are more common
    var labels = [4, 8, 16, 32, 64];

    var speedScale = (val) => {
      return  Math.sqrt(val) / 8 * 160
    }
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
        if (i === labels.length - 1) {
          return d + 'kts'
        } else {
          return d;
        }
      })
      .attr('font-size', 13)

  }

  drawRunwayWind = (svg, heading, variation, yCoord) => {
    let X = 10;
    // Draw a single runway wind indicator in bottom left
    if (this.props.metar[0].drct === 'VRB') {
      return;
    }

    let dir = this.props.metar[0].drct;
    let spd = this.props.metar[0].sknt;
    let angle = this.rads(Math.abs((((heading + variation) + 360 - dir) % 361)))
    let headwind = Math.round(Math.cos(angle) * spd);
    let crosswind = -Math.round(Math.sin(angle) * spd);
    svg.append("text")
      .attr('x', X)
      .attr('y', yCoord)
      .text(`${((heading + 360) % 361 / 10).toFixed()}: `)
      .attr('color', 'black')
    if (headwind < 0) {
      svg.append('path')
        .attr('d', `M${X + 30} ${yCoord - 4} l5-5 5 5z`) //M7 14l5-5 5 5z
        .attr('fill', 'red')
    } else {
      svg.append('path')
        .attr('d', `M${X + 30} ${yCoord - 8} l5 5 5-5z`)
        .attr('fill', 'green')
    }


    svg.append("text")
      .attr('x', X + 40)
      .attr('y', yCoord)
      .text(`${Math.abs(headwind)}`)
      .attr('color', 'black')

    if (crosswind < 0) {
      svg.append('path')
        .attr('d', `M${X + 65} ${yCoord} l0 -10 5 5z`)
        .attr('fill', Math.abs(crosswind) < 10 ? 'green' : "red")
    } else {
      svg.append('path')
        .attr('d', `M${X + 69} ${yCoord} l0 -10 -5 5z`)
        .attr('fill', Math.abs(crosswind) < 10 ? 'green' : "red")
    }
    svg.append("text")
      .attr('x', X + 75)
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
    // Draws all runway winds
    let yCoord = 50;

    svg.append("text")
      .attr('x', 0)
      .attr('y', yCoord - 20)
      .text("Runway Winds")
      .attr('color', 'black')
    let alreadyDrawn = {}
    for (let i = 0; i < runways.length; i++) {
      if (!alreadyDrawn[runways[i].direction]) {
        yCoord = this.drawRunwayWind(svg, runways[i].direction, 0, yCoord)
        let direction = (runways[i].direction + 180) % 360;
        yCoord = this.drawRunwayWind(svg, direction, 0, yCoord)

        alreadyDrawn[runways[i].direction] = true;
        alreadyDrawn[direction] = true;
      }

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

      this.drawCursorArrow(svg);

    });

    
    var { sknt, gust } = this.props.metar[0];

    // Compass Labels
    svg.selectAll('label')
      .data(compass)
      .enter()
      .append('text')
      .attr('x', d => {
        let res = 250 + this.calcX(d.dir) - 6
        return res;
      })
      .attr('y', d => 250 + this.calcY(d.dir) + 6)
      .text(d => d.label)
      .attr('font-size', 18)

    let max_speed = Math.max(60, sknt, gust) //Math.max(sknt, gust) + 5
    this.maxSpeed = max_speed;
    sknt = sknt + 0.01;
    gust = gust + 0.01;

    // Draw Velocity Rings
    this.drawSpeedRings(svg, max_speed);

    // Draw Runways if available
    if (this.props.runways) {
      this.drawRunways(svg, this.props.runways, 0);
      this.drawRunwayWinds(svg, this.props.runways);
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

    svg.append('text')
      .attr('x', 32)
      .attr('y', 450)
      .text("Runway direction and size are to scale, but not relative location.")
      .attr('font-size', '14px');
  }

  render() {
    var { width, height } = this.props;
    var { drct, sknt, gust } = this.props.metar[0];
    console.log(drct);
    return (
      <div style={{ textAlign: 'start' }}>
        <div>
          <LabelValue className='selectable metarwind' label={"Wind"} value={gust ?
            `${drct === "VRB" ? "Variable" : this.pad(drct, 3)} at ${sknt} knots (${(sknt * 1.15077945).toFixed(0)}mph) gusting ${gust} knots (${(gust * 1.15077945).toFixed(0)}mph)`
            : `${this.pad(drct, 3)} at ${sknt} knots (${(sknt * 1.15077945).toFixed(0)}mph)`} />
        </div>

        <svg ref={node => this.node = node} onClick={(event) => console.log(event.clientX, event.clientY, event.pageX, event.pageY)} viewBox='0 0 500 500' width={width || 500} height={height || 500}>
        </svg>
      </div>
    );
  }
}

export default Wind;
