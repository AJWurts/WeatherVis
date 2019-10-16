import *  as d3 from 'd3';

function drawVis(forecast, svg, xScale, maxX, maxY, timeFunc) {

    let yScale = d3.scaleLinear()
        .domain([0, 12])
        .range([maxY, 0])


    // Adds filler data to make visibility graph cover the entire graph
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
                // Tempo does not include visiblity, so it needs to take from the next available vsby
                return yScale(forecast[i+1].vsby)
            }
            return yScale(d.vsby);
        })
        .curve(d3.curveMonotoneX) // apply smoothing to the line
        ;


    // Plot vsby based on forecast and fake data
    var path = svg.append("path")
        .datum(forecast) // 10. Binds data to the line 
        .attr("d", line)
        .attr('fill', '#33c6f8a2')
        .attr('stroke', '#2244aa')

    svg.selectAll('cloudLevelLabels')
        .data([0, 5, 10])
        .enter()
        .append('text')
        .attr('x', 5)
        .attr('y', d => yScale(d))
        .text(d => d + 'sm')
        .attr('color', 'black')
        .attr('text-anchor', 'start')


}

export default drawVis;