import React, { Component } from 'react';
import * as d3 from 'd3';
import { AirplaneIcon } from '../components';


// Plane Density Altitude.
const PLANE_ALT = 3000;

class PressureGraph extends Component {
    constructor(props) {
        super(props);
    }


    UNSAFE_componentWillReceiveProps(props) {

        this.createGraph(props)
    }

    componentDidMount() {
        this.createGraph(this.props);
    }


    onMouseOut = (event) => {
        d3.select(this.svg).selectAll('.hover').remove();
    }


    onUpdateHover = (clientY) => {
        // Updates visual on visualization to compare True vs Density altitude.
        let bbox = this.svg.getBoundingClientRect()

        let svg = d3.select(this.svg);

        let linScale = d3.scaleLinear()
            .domain([bbox.top, bbox.bottom])
            .range([0, 500])

        let yVal = linScale(clientY);

        svg.selectAll(".hover").remove()

        // Adds Dashed Line Ac
        svg.append('path')
            .attr('d', `M 0,${yVal + 20} l 500,0`)
            .attr('class', 'd3add hover')
            .attr('stroke', 'black')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '5,5')


        // Draws white rectangle to make text more visible
        svg.append('rect')
            .attr('class', 'hover hoverbox')
            .attr('x', 0)
            .attr('width', 500)
            .attr('y', yVal)
            .attr('height', 20)
            .attr('fill', '#FFFFFF')

        // Draws True Altitude Text
        svg.append('text')
            .attr('class', 'd3add hover hovertext')
            .attr('x', 10)
            .attr('y', yVal + 14)
            .text('True Alt: ' + this.invTrueAltScale(yVal + 20).toFixed(0) + 'ft')
 
        // Draws Density Altitude Text
        svg.append('text')
            .attr('class', 'd3add hover hovertext')
            .attr('x', 500 - 10)
            .attr('y', yVal + 14)
            .text('Density Alt: ' + this.invPresAltScale(yVal + 20).toFixed(0) + 'ft')
            .attr('text-anchor', 'end')


    }

    onMouseMove = (event) => {
        this.onUpdateHover(event.clientY);
    }

    drawAirplane = () => {
        let x = 375;
        let y = this.presAltScale(PLANE_ALT) - 16;

        return <AirplaneIcon x={x} y={y} rotate={-90} />
    }

    onTouchMove = (event) => {
        this.onUpdateHover(event.targetTouches[0].clientY);
    }

    createGraph = (props) => {
        // Function runs everytime page visual changes.
        let svg = d3.select(this.svg);
        svg.selectAll('.d3add').remove()

        let height = 500;
        let width = 500


        var { temperature, humidity, pressure } = props;
        // console.log(temperature, humidity, pressure)

        // Calculates Min and Max Altitude and creates linear scale between
        let minAlt = (29.92 - pressure) * 1000

        let minDAlt = (120 * (temperature - 15)) + minAlt

        // Scales for True Alt, Pres Alt, and Inverse of both
        this.trueAltScale = d3.scaleLinear()
            .domain([0, 10000])
            .range([height, 0])

        this.presAltScale = d3.scaleLinear()
            .domain([minDAlt, minDAlt + 10000])
            .range([height, 0])

        this.invTrueAltScale = d3.scaleLinear()
            .domain([height, 0])
            .range([0, 10000])

        this.invPresAltScale = d3.scaleLinear()
            .domain([height, 0])
            .range([minDAlt, minDAlt + 10000])


        // Draws True Altitude
        svg.selectAll(".truealt")
            .data(d3.range(0, 10001, 1000))
            .enter()
            .append('line')
            .attr('class', 'd3add truealt')
            .attr('x1', 0)
            .attr('x2', width / 2)
            .attr('y1', d => this.trueAltScale(d))
            .attr('y2', d => this.trueAltScale(d))
            .attr('stroke', 'black')
            .attr('stroke-width', 3)

        // Draws True Altitude Labels
        svg.selectAll('.truealtlabel')
            .data(d3.range(0, 10001, 1000))
            .enter()
            .append('text')
            .attr('class', 'd3add truealtlabel')
            .attr('x', 10)
            .attr('y', d => this.trueAltScale(d) - 5)
            .text(d => d + "ft")
            .attr('font-size', '20px')

        // Draws Pressure Altitude
        svg.selectAll('.pressurealt')
            .data(d3.range(-10000, 100001, 1000))
            .enter()
            .append('line')
            .attr('class', 'd3add pressurealt')
            .attr('x1', width / 2)
            .attr('x2', width)
            .attr('y1', d => this.presAltScale(d))
            .attr('y2', d => this.presAltScale(d))
            .attr('stroke', 'blue')
            .attr('stroke-width', 3)

        // Draws Pressure Altitude Labels
        svg.selectAll('.pressurealtlabel')
            .data(d3.range(-10000, 20000, 1000))
            .enter()
            .append('text')
            .attr('class', 'd3add truealtlabel')
            .attr('x', width - 10)
            .attr('y', d => this.presAltScale(d) - 5)
            .attr('text-anchor', 'end')
            .text(d => d + "ft")
            .attr('color', 'blue')
            .attr('font-size', '20px')

    }

    render() {
        return (
            <div>
                <svg
                    onPointerMove={this.onMouseMove}
                    onTouchMove={this.onTouchMove}
                    ref={svg => this.svg = svg} 
                    viewBox="0 0 500 500"
                    style={{ touchAction: 'none' }}>

                    {this.props.isPlaneVisible && this.presAltScale ? this.drawAirplane() : null}

                </svg>
            </div>
        );
    }
}

export default PressureGraph;
