import React, { Component } from 'react';
import *  as d3 from 'd3';





var pad = (num, size) => {
    var s = "000000000" + num;
    return s.substr(s.length - size);
}

function drawVis(forecast, svg, xScale, maxX, maxY, timeFunc) {

    let yScale = d3.scaleLinear()
        .domain([0, 10])
        .range([maxY, 0])
    // debugger
    // var spd = forecast.map(x => {
    //     return {
    //         "sknt":x.sknt,
    //         "drct": x.drct,
    //         "")

    forecast = [...forecast];
    forecast.unshift({
        from: {
            hour: -1
        },
        vsby: 0
    })
    forecast.push({
        from: {
            hour: -2
        },
        vsby: forecast[forecast.length - 1].vsby
    })

    forecast.push({
        from: {
            hour: -2
        },
        vsby: 0
    })

    forecast.push({
        from: {
            hour: -1
        },
        vsby: 0
    })

    var line = d3.line()
        .x(function (d) {
            if (!d.from) {
                return xScale(timeFunc(d.start));
            }
            if (d.from.hour === -1) {
                return xScale(0);
            } else if (d.from.hour === -2) {
                return xScale(maxX);
            } else {
                return xScale(timeFunc(d.from));
            }
        })
        .y(function (d, i) {
            if (d.type ? d.type === "TEMPO" : false) {
                return yScale(forecast[i+1].vsby)
            }
            return yScale(d.vsby);
        })
        .curve(d3.curveMonotoneX) // apply smoothing to the line
        ;


    // Wind Speed Data
    var path = svg.append("path")
        .datum(forecast) // 10. Binds data to the line 
        .attr("d", line)
        .attr('fill', '#2244aaaa')
        .attr('stroke', '#2244aa')

}

export default drawVis;