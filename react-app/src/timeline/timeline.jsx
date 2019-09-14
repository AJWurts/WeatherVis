import React, { Component } from 'react';
import *  as d3 from 'd3';
import drawClouds from './clouds.jsx';
import drawWind from './wind.jsx';
import drawVis from './vis.jsx';
import drawWeather from './weather.jsx';
import { domainToASCII } from 'url';

function timeFunc(start, end) {
    let startHour = +start.hour;
    let endHour = 24 + end.hour;

    let fun = (full_time) => {
        let time = +full_time.hour + ((full_time.minute ? full_time.minute : 0) / 60);
        if (+time > startHour && +full_time.day === +start.day + 1) {
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
    constructor(props) {
        super(props)
        this.state = {
            tafAge: ""
        }
    }
    componentDidMount() {
        this.createGraph()

    }

    componentWillReceiveProps(props) {
        this.props = props;
        // console.log(Object.keys(this.props));
        this.createGraph()
    }

    componentWillUpdate(props) {
        this.createGraph()
    }

    createGraph = () => {
        // const node = this.node;
        const outer = this.outer
        var bbox = outer.getBoundingClientRect()
        var width = bbox.bottom;
        this.width = 1055
        width = 1055
        var height = bbox.height;
        if (!this.props.data) {
            return;
        } else {
            var data = this.props.data;
        }

        this.time = timeFunc(data.start, data.end)
        let maxTime = (24 - data.start.hour) % 24 + data.end.hour;
        this.maxTime = maxTime;
        let widthScale = d3.scaleLinear()
            .domain([0, maxTime])
            .range([width * 0.06, width]);
        // console.log("Width:", width)
        // console.log([0, (24 - data.start.hour) % 24 + data.end.hour])
        console.log(data.forecast)

        const vcSvg = d3.select(this.vcNode);
        vcSvg.selectAll('*').remove()
        drawClouds(data.forecast, vcSvg, widthScale, maxTime, 100, this.time);

        const windSvg = d3.select(this.windNode);
        windSvg.selectAll("*").remove()
        drawWind(data.forecast, windSvg, widthScale, maxTime, 100, this.time);

        const weatherSvg = d3.select(this.weatherNode);
        weatherSvg.selectAll('*').remove()
        drawWeather(data.forecast, weatherSvg, widthScale, maxTime, 100, this.time);

        const visSvg = d3.select(this.visNode);
        visSvg.selectAll('*').remove()
        drawVis(data.forecast, visSvg, widthScale, maxTime, 100, this.time);

        let tafDate = new Date()
        tafDate.setUTCDate(data.released.day)
        tafDate.setUTCHours(data.released.hour, data.released.minute)

        let diff = new Date() - tafDate
        let hours = diff / 3.6e6;
        let minutes = Math.round(hours - Math.floor(hours) / 60);
        // this.setState({
        //     tafAge: `TAF released ${Math.floor(hours)}:${minutes} hours ago`
        // })
        // // this.tafAge = `TAF released ${hours}:${minutes} hours ago`
        this.state.tafAge = `TAF released ${Math.floor(hours)}:${("" + minutes).padStart(2, "0")} hours ago`

        console.log(this.outer_svg)
        var outer_svg = d3.select(this.outer_svg)

        d3.selectAll(".tooltip").remove()
        outer_svg
            .append('rect')
            .attr('class', 'tooltip ttbox')
            .attr('x', -100)
            .attr('y', 20)
            .attr('width', 10)
            .attr('height', 600)
            .attr('fill', '#00000088')
            .attr('stroke', 'black')

        outer_svg.selectAll("labels")
            .data([
                ['time', height * 0.01],
                ["clouds", height * 0.15], 
                ["vis", height * 0.4], 
                ["wind", height * 0.65],
                ["weather", height * 0.9]
            ]).enter()
            .append('text')
            .attr('class', d => 'tooltip ' + d[0])
            .attr('x', -100)
            .attr('y', d => d[1])
            .text(d => d[0])



    }

    onMouseMove = (event) => {

        let invtime = d3.scaleLinear()
            .range([0, this.maxTime])
            .domain([this.width * 0.06, this.width]);
        var time = invtime(event.screenX);
        console.log(time)
        let previous_data;
        for (var i = this.props.data.forecast.length - 1; i >= 0 ; i--) {
            if (this.time(this.props.data.forecast[i].from) <= time) {
                previous_data = this.props.data.forecast[i];
                break
            }
        }
        console.log(i, previous_data)

        if (!previous_data) {
            return;
        }

        d3.selectAll('.tooltip')
            .attr('x', event.screenX + (this.maxTime - time < 10 ? -2 : 11))
            .attr("text-anchor", this.maxTime - time < 10 ? 'end' : 'start')

        d3.select('.ttbox')
            .attr('x', event.screenX)
        

        let cloudStr = ""
        for (let j = 5; j >= 0; j--) {
            if (previous_data['skyc' + j]) {
                cloudStr += previous_data['skyc' + j]+ " "+ previous_data['skyl' + j] + " "
            }
        }
        d3.select('.clouds')
            .text(cloudStr)

        d3.select('.vis')
            .text(previous_data.vsby + "SM")

        d3.select(".wind")
            .text(`${previous_data.drct} at ${previous_data.sknt} KT ${previous_data.gust > 0 ? "gusting " + previous_data.gust : ""}`)

        let weatherStr = ""
        for (let j = 0; j < previous_data.weather.length; i++) {
            weatherStr += previous_data.weather[j].text + " "
        }
        d3.select('.weather')
            .text(previous_data.weater)

        // If the next item exists and the next is smaller than the current, then day++
        let day_plus_plus =  i + 1 < this.props.data.forecast.length && previous_data.from.hour > this.props.data.forecast[i+1].from.hour
        console.log(day_plus_plus)
        d3.select('.time')
            .text(`Day ${day_plus_plus ? previous_data.from.day + 1: previous_data.from.day} Hour ${time.toFixed(0)}h ${previous_data.raw}`)
            .attr('alignment-baseline', 'hanging')
            // .attr('text-align', 'start')


        // event.getX
        // event.getY
        // want to show
        // - relevant TAF section
        // - aligned values for vis, wind, weather, clouds
        // Need free floating box that moves to mouse X and set y coordinate

    }
    render() {
        var { width, height } = this.props;
        return (
            <div style={{ width: '1055px' }} ref={outer => this.outer = outer}
            >
                <svg style={{ width: '1055px', height: '480' }} ref={outside_svg => this.outer_svg = outside_svg} onMouseMove={this.onMouseMove}>
                    <g style={{ width: '1055px', height: "100%" }}>
                        <svg style={{ display: 'block' }} y="5%" ref={node => this.vcNode = node} height={height || 100} width="1055px">
                        </svg>
                        <svg style={{ display: 'block' }} y="30%" ref={node => this.visNode = node} height={height || 100} width="1055px">
                        </svg>
                        <svg style={{ display: 'block' }} y="55%" ref={node => this.windNode = node} height={height || 100} width='100%'>
                        </svg>
                        <svg style={{ display: 'block' }} y="80%" ref={node => this.weatherNode = node} height={height || 100} width='100%'>
                        </svg>
                    </g>
                </svg>
            </div>
        );
    }
}

export default TimeLine;
