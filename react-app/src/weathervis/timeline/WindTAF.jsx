import *  as d3 from 'd3';

function drawWind(forecast, svg, xScale, maxX, maxY, timeFunc) {

    let maxWind = d3.max(forecast, x => Math.max(x.sknt, x.gust));
    maxWind = maxWind * 1.3;
    let yScale = d3.scaleLinear()
        .domain([0, maxWind])
        .range([maxY, 0])

    forecast = [...forecast]
    forecast.push({
        start: {
            hour: -2
        },
        sknt: forecast[forecast.length - 1].sknt,
        gust: Math.max(forecast[forecast.length - 1].gust, forecast[forecast.length - 1].sknt),
    })

    // debuggers
    var line = d3.line()
        .x(function (d) {
            let time = d.start;
            if (time.hour === -2) {
                return xScale(maxX);
            }

            return xScale(timeFunc(time));
        })
        .y(function (d) { return yScale(d.sknt); })
        .curve(d3.curveMonotoneX) // apply smoothing to the line
        ;


    // Gust Graphing
    line = line.y(d => {
        return yScale(Math.max(d.gust, d.sknt))
    })

    // Gust Data
    svg.append("path")
        .datum(forecast)
        .attr("d", line)
        .attr('fill', 'none')
        .attr('stroke', 'orange')
        .attr('stroke-width', '3px')

        line = line.y(d => {
            return yScale(d.sknt)
        })
    // Wind Speed Data
    svg.append("path")
        .datum(forecast) // 10. Binds data to the line 
        .attr("d", line)
        .attr('fill', 'none')
        .attr('stroke-width', '3px')
        .attr('stroke', '#2244aa')



    // Labels
    svg.selectAll('cloudLevelLabels')
        .data(d3.ticks(0, maxWind, 3).map(d => d.toFixed(0)))
        .enter()
        .append('text')
        .attr('x', 5)
        .attr('y', d => yScale(d))
        .text(d => d + 'kts')
        .attr('color', 'black')
        .style('font-size', "25px")

        .attr('text-anchor', 'start')
}

export default drawWind;
