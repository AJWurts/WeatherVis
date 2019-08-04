import React, { Component } from 'react';
import *  as d3 from 'd3';
import drawClouds from './clouds.jsx';
import drawWind from './wind.jsx';
import drawVis from './vis.jsx';
import { domainToASCII } from 'url';

function timeFunc(start, end) {
    let startHour = +start.hour;
    let endHour = 24 + end.hour;

    let fun = (full_time) => {
        let time = +full_time.hour;
        if (+time > startHour && +full_time.day === +start.day + 1 ) {
            return (time - startHour) + 24;
        } else if (+time < startHour) {
            return (24 - startHour) % 24 + time;
        } else if (+time >= startHour) {
            return +time - startHour;
        }
    }

    return fun;
}

class TimeLine extends Component {
    componentDidMount() {
        this.createGraph()
    }

    componentWillReceiveProps(props) {
        this.props = props;
        console.log(Object.keys(this.props));
        this.createGraph()
    }
    
    componentWillUpdate(props) {
        console.log("UPDATING")
        this.createGraph()
    }

    createGraph = () => {
        // const node = this.node;
        const outer = this.outer
        var bbox = outer.getBoundingClientRect()
        var width = bbox.bottom;
        width = 1055
        var height = bbox.height;
        if (!this.props.data) {
            return;
        } else {
            var data = this.props.data;
        }
    
        var time = timeFunc(data.start, data.end)
        let maxTime = (24 - data.start.hour) % 24 + data.end.hour;
        let widthScale = d3.scaleLinear()
            .domain([0, maxTime])
            .range([width * 0.06, width]);
        console.log("Width:", width)
        console.log([0, (24 - data.start.hour) % 24 + data.end.hour ])
        const vcSvg = d3.select(this.vcNode);
        vcSvg.selectAll('*').remove()
        drawVis(data.forecast, vcSvg, widthScale, maxTime, 100, time);
        drawClouds(data.forecast, vcSvg, widthScale, maxTime, 100, time);

        const windSvg = d3.select(this.windNode);
        windSvg.selectAll("*").remove()
        drawWind(data.forecast, windSvg, widthScale, maxTime, 100, time);




    }

    render() {
        var { width, height } = this.props;
        return (
            <div style={{width: '1055px'}} ref={outer => this.outer = outer}>
                <svg ref={node => this.vcNode = node}  height={height || 100} width="1055px">
                </svg>

                <svg ref={node => this.windNode = node}  height={height || 100} width='100%'>
                </svg>
                <svg ref={node => this.weatherNode = node}  height={height || 100} width='100%'>
                </svg>
            </div>
        );
    }
}

export default TimeLine;
