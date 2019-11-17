import *  as d3 from 'd3';

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
            if (d.weather.length >= 1) {
                return d.weather[0].raw + ": " + d.weather[0].text;
            } else {
                return "";
            }

        })
        .attr('x', d => xScale(timeFunc(d.start)))
        .attr('y', d => {
            height += 2;
            return yScale(height % 5)
        })
        .attr('text-anchor', 'left')
        .attr('color', 'black')

    svg.selectAll('startLine')
        .data(forecast)
        .enter()
        .append('line')
        .attr('x1', d => xScale(timeFunc(d.start)))
        .attr('y1', d => 0)
        .attr('x2', d => xScale(timeFunc(d.start)))
        .attr('y2', d => maxY)
        .attr('stroke', 'black')
        .attr('stroke-width', 2)


}

export default drawWeather;
