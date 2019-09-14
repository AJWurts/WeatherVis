import React, { Component } from 'react';
import *  as d3 from 'd3';
import drawClouds from './clouds.jsx';
import drawWind from './wind.jsx';
import drawVis from './vis.jsx';
import drawWeather from './weather.jsx';
import { domainToASCII } from 'url';

function timeFunc(start) {
    let startHour = +start.hour;

    let fun = (full_time) => {
        let time = +full_time.hour + ((full_time.minute ? full_time.minute : 0) / 60);

        let result;
        if (full_time.day == start.day) {

            result = (time - startHour);
        } else { // (full_time.day > start.day) 
            result = (24 - startHour) + time
        }

        return result
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
        let maxTime;
        if (data.end.day == data.start.day) {

            maxTime = (data.end.hour - data.start.hour);
        } else { // (full_time.day > start.day) 
            maxTime = (24 - data.start.hour) + data.end.hour
        }

        // console.log(data.start, data.end)

        this.maxTime = maxTime;
        let widthScale = d3.scaleLinear()
            .domain([0, maxTime])
            .range([width * 0.06, width]);
        // console.log("Width:", width)
        // console.log([0, (24 - data.start.hour) % 24 + data.end.hour])
        // console.log(maxTime, data.forecast)

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

        let previous_data;
        for (var i = this.props.data.forecast.length - 1; i >= 0; i--) {
            if (this.time(this.props.data.forecast[i].from) <= time) {
                previous_data = this.props.data.forecast[i];
                break
            }
        }

        // If no data exists, do nothiing
        if (!previous_data) {
            return;
        }

        // If they are the same only update. else do everything
        if (this.last_data && this.last_data.from.hour !== previous_data.from.hour) {
            let cloudStr = ""
            for (let j = 5; j >= 0; j--) {
                if (previous_data['skyc' + j]) {
                    cloudStr += previous_data['skyc' + j] + " " + previous_data['skyl' + j] + " "
                }
            }
            d3.select('.clouds')
                .text(cloudStr)
    
            d3.select('.vis')
                .text(previous_data.vsby + "SM")
    
            d3.select(".wind")
                .text(`${previous_data.drct} at ${previous_data.sknt} KT ${previous_data.gust > 0 ? "gusting " + previous_data.gust : ""}`)
    
            d3.select('.weather')
                .text(`${previous_data.weather.length >= 1 ? previous_data.weather[0].text : ""} ${previous_data.weather.length >= 2 ? previous_data.weather[1].text : ""}`)


        } 
        this.last_data = previous_data;
 

        // Repositions tooltip to current mouse location
        d3.selectAll('.tooltip')
        .attr('x', event.screenX + (this.maxTime - time < 10 ? -2 : 11))
        .attr("text-anchor", this.maxTime - time < 10 ? 'end' : 'start')

        d3.select('.ttbox')
            .attr('x', event.screenX)
    
        d3.select('.time')
            .text(`${previous_data.raw}`)
            .attr('alignment-baseline', 'hanging')
        
   
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
