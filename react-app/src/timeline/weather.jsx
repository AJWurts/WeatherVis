import React, { Component } from 'react';
import *  as d3 from 'd3';

// 0-4 severity
const RAIN_COLORS = [
    '#6aa357', '#153cd0', '#f09610', '#9f3010'
]

const SNOW_COLORS = [
    '#2aedfe', '#1c9afe', '#f04bfe', '#0000bf'
]

const color_func = (weather) => {

    // Ice Snow  is blue, GR => dark blue
    // Rain, Drizzle, medium green
    // + makes it orange
    // - makes it light green or blue for snow
    // TS automatic orange, + red, - dark green
    // Fog is gray

    let category = 0;
    


}

var pad = (num, size) => {
    var s = "000000000" + num;
    return s.substr(s.length - size);
}

function drawWeather(forecast, svg, xScale, maxX, maxY, timeFunc) {

    let yScale = d3.scaleLinear()
        .domain([0, 10])
        .range([0.1 * maxY, 0.9 * maxY])

    let height = 0;
    svg.selectAll("weathertext")
        .data(forecast)
        .enter()
        .append('text')
        .text(d => {
            if (d.weather.length > 0) {
                return d.weather[0].raw + ": " + d.weather[0].text;
            } else {
                return "";
            }

        })
        .attr('x', d => xScale(timeFunc(d.from || d.start)))
        .attr('y', d => {
            height += 2;
            // console.log(height)
            return yScale(height % 5)
        })
        .attr('text-anchor', 'left')
        .attr('color', 'black')

    svg.selectAll('startLine')
        .data(forecast)
        .enter()
        .append('line')
        .attr('x1', d => xScale(timeFunc(d.from || d.start)))
        .attr('y1', d => 0)
        .attr('x2', d => xScale(timeFunc(d.from || d.start)))
        .attr('y2', d => maxY)
        .attr('stroke', 'black')
        .attr('stroke-width', 2)


}

export default drawWeather;