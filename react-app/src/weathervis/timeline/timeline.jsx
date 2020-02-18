import React, { Component } from 'react';
import *  as d3 from 'd3';
import drawClouds from './CloudTAF.jsx';
import drawWind from './WindTAF.jsx';
import drawVis from './VisibilityTAF.jsx';
import drawWeather from './WeatherTAF.jsx';
import LabelValueSVG from './LabelValueSVG.jsx';

function pad(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length - size);
}

function timeFunc(start) {
    let startHour = +start.hour;

    let fun = (full_time) => {

        try {

            let time = +full_time.hour + ((full_time.minute ? full_time.minute : 0) / 60);

            let result;
            if (full_time.day === start.day) {

                result = (time - startHour);
            } else { // (full_time.day > start.day)
                result = (24 - startHour) + time
            }
            return result
        } catch (e) {

        }

        return 0;
    }

    return fun;
}

class TimeLine extends Component {

    componentDidMount() {
        this.createGraph()

    }

    UNSAFE_componentWillReceiveProps(props) {
        this.props = props;
        // console.log(Object.keys(this.props));
        this.createGraph()
    }

    UNSAFE_componentWillUpdate(props) {
        this.createGraph()
    }

    createGraph = () => {

        if (!this.props.data) {
            return;
        }

        // const node = this.node;
        const outer = this.outer
        var bbox = outer.getBoundingClientRect()
        var width = bbox.bottom;
        this.width = bbox.bottom;
        width = 900
        var height = bbox.height;
        if (!this.props.data) {
            return;
        } else {
            var data = this.props.data;
        }

        this.time = timeFunc(data.start, data.end)
        let start = new Date(Date.UTC(data.start.year, data.start.month - 1, data.start.day, data.start.hour, data.start.minute))
        let end = new Date(Date.UTC(data.end.year, data.end.month - 1, data.end.day, data.end.hour, data.end.minute))

        let length = Math.abs(end - start) / 3600000;

        let maxTime = length;
        // if (data.end.day === data.start.day) {
        //     // Within 1 day 
        //     maxTime = (data.end.hour - data.start.hour);
        // } else if (data.end.day - data.start.day === 2) {
        //     // More than one day difference
        //     maxTime = 24 + (24 - data.start.hour) + data.end.hour
        // } else {
        //     // One day Difference
        //     maxTime = (24 - data.start.hour) + data.end.hour
        // }


        this.maxTime = maxTime;
        let widthScale = d3.scaleLinear()
            .domain([0, maxTime])
            .range([width * 0.06, width]);

        // Clear everything
        const vcSvg = d3.select(this.vcNode);
        vcSvg.selectAll('*').remove()

        const windSvg = d3.select(this.windNode);
        windSvg.selectAll("*").remove()


        const weatherSvg = d3.select(this.weatherNode);
        weatherSvg.selectAll('*').remove()

        const visSvg = d3.select(this.visNode);
        visSvg.selectAll('*').remove()


        // Redraw Everything
        drawClouds(data.forecast, vcSvg, widthScale, maxTime, 100, this.time);
        drawWind(data.forecast, windSvg, widthScale, maxTime, 100, this.time);
        drawWeather(data.forecast, weatherSvg, widthScale, maxTime, 100, this.time);
        drawVis(data.forecast, visSvg, widthScale, maxTime, 100, this.time);

        let tafDate = new Date()
        tafDate.setUTCDate(data.released.day)
        tafDate.setUTCHours(data.released.hour, data.released.minute)

        let diff = new Date() - tafDate
        let hours = diff / 3.6e6;
        // let minutes = Math.round(hours - Math.floor(hours) / 60);


        var outer_svg = d3.select(this.outer_svg)

        d3.selectAll(".tooltip").remove()
        outer_svg
            .append('rect')
            .attr('class', 'tooltip ttbox')
            .attr('x', -100)
            .attr('y', 0)
            .attr('width', 3)
            .attr('height', 600)
            .attr('fill', '#00000088')

        outer_svg.selectAll("labels")
            .data([
                ['time', height * 0.03],
                ["clouds", height * 0.08],
                ["vis", height * 0.28],
                ["wind", height * 0.51],
                ["weather", height * 0.78]
            ]).enter()
            .append('text')
            .attr('class', d => 'tooltip ' + d[0])
            .attr('x', -100)
            .attr('y', d => d[1])
            .text(d => d[0])



    }

    onMouseMove = (clientX) => {

        if (this.props.data && this.props.meter && this.props.data.forecast[0].raw.slice(0, 4) !== this.props.metar.raw.slice(0, 4)) {
            return;
        }
        const outer = this.outer
        var bbox = outer.getBoundingClientRect()

        var width = bbox.width;
        // console.log(bbox);
        let invtime = d3.scaleLinear()
            .range([0, this.maxTime])
            .domain([width * 0.06, width]);



        var time = invtime(clientX - bbox.left);
        // console.log("In Mouse Move", width, clientX, time);


        let previous_data;
        for (var i = this.props.data.forecast.length - 1; i >= 0; i--) {
            // Currently broken needs to be fixed to process items other than FM
            if (this.time(this.props.data.forecast[i].start) <= time) {
                previous_data = this.props.data.forecast[i];
                break
            }
        }

        // If no data exists, do nothing
        if (!previous_data) {
            // console.log("No Data")
            return;
        }


        if (this.last_data && this.last_data.start && this.last_data.start.hour !== previous_data.start.hour) {
            let cloudStr = ""
            for (let j = 0; j < previous_data.clouds.length; j++) {
                cloudStr += previous_data.clouds[j].cover + (previous_data.clouds[j].base ? (previous_data.clouds[j].base + "ft ") : "");
            }
            d3.select('.clouds')
                .text(cloudStr)

            let vis = previous_data.vsby;
            if (previous_data.vsby === 6.21) {
                vis = "Greater than 6";
            }
            d3.select('.vis')
                .text(vis + "SM")

            d3.select(".wind")
                .text(`${previous_data.drct} at ${previous_data.sknt} KT ${previous_data.gust > 0 ? "gusting " + previous_data.gust : ""}`)

            d3.select('.weather')
                .text(`${previous_data.weather.length >= 1 ? previous_data.weather[0].text : ""} ${previous_data.weather.length >= 2 ? previous_data.weather[1].text : ""}`)


        }
        this.last_data = previous_data;


        // Repositions tooltip to current mouse location
        d3.selectAll('.tooltip')
            .attr('x', this.props.isMobile ? 105 : (clientX + (this.maxTime - time < 10 ? -2 : 11)))
            .attr("text-anchor", this.maxTime - time < 10 && !this.props.isMobile ? 'end' : 'start')

        d3.select('.ttbox')
            .attr('x', clientX - bbox.left)

        var date = previous_data.start;
        var utcDate = new Date(Date.UTC(date.year, date.month - 1, date.day, date.hour, date.minute, date.second))
        d3.select('.time')
            .text(utcDate.toUTCString() + "(Z)")
            .attr('alignment-baseline', 'hanging')

    }

    onTouchMove = (event) => {
        this.onMouseMove(event.targetTouches[0].clientX);
    }
    render() {
        var { height, isMobile } = this.props;
        return (
            <div style={{ width: '98%' }}
                onMouseMove={(e) => {
                    // console.log("MouseMove", e.clientX);
                    return this.onMouseMove(e.clientX)
                }}
                onPointerMove={(e) => {
                    // console.log("PointerMove:" ,e.clientX);
                    return this.onMouseMove( e.clientX)
                }} ref={outer => this.outer = outer}>
                <svg
                    style={{ width: '98%', height: '600px' }}
                    ref={outside_svg => this.outer_svg = outside_svg}

                    onTouchMove={this.onTouchMove}>
                    <g style={{ width: '99%', height: "100%" }}>
                        <LabelValueSVG y={0.00} label="Start" />
                        <LabelValueSVG y={0.05} label="Clouds" />
                        <svg style={{ display: 'block' }}
                            y="8%"
                            viewBox={"0 0 900 " + (height || 100)}
                            ref={node => this.vcNode = node}
                            height={(height || 100) + 'px'}
                        >
                        </svg>
                        <LabelValueSVG y={0.25} label="Visibility" />
                        <svg style={{ display: 'block' }}
                            y="30%"
                            viewBox={"0 0 900 " + (height || 100)}
                            ref={node => this.visNode = node}
                            height={(height || 100)}
                        >
                        </svg>
                        <LabelValueSVG y={0.48} label="Wind" />
                        <svg style={{ display: 'block' }} y="55%"
                            viewBox={"0 0 900 " + (height || 100)}
                            ref={node => this.windNode = node} height={(height || 100)} width='100%'>
                        </svg>
                        <LabelValueSVG y={0.75} label="Weather" />
                        <svg style={{ display: 'block' }} y="80%"
                            viewBox={"0 0 900 " + (height || 100)} ref={node => this.weatherNode = node} height={(height || 100)} width='100%'>
                        </svg>
                    </g>
                </svg>
            </div>
        );
    }
}

export default TimeLine;
