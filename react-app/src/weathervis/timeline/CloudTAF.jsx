import *  as d3 from 'd3';

const COVER_KEY = {
    "SKC": 0,
    "NCD": 0,
    "CLR": 0,
    "FEW": 1,
    "SCT": 2,
    "BKN": 3,
    "OVC": 4,
    "VV": 5
}


var drawCloud = (svg, cloud, minX, maxX, yScale) => {
    // Draws a single layer of clouds
    // Density based on cloud density
    // Attempted to replicate cloud cover percentages reflected by coverage names

    // console.log(cloud, minX, maxX)
    var clouds; // [[startX, endX]]
    var xScale = d3.scaleLinear()
        .domain([0, 48])
        .range([minX, maxX])
    if (cloud.cover === 0) {
        return;
    } else if (cloud.cover === 1) {
        clouds = [
            // [5, 20], [28, 43]
            [12,36],
        ]
    } else if (cloud.cover === 2) {
        clouds = [
            [4, 20], [28,44]
        ]
    } else if (cloud.cover === 3) {
        clouds = [
            [2, 22], [26,46]
        ]
    } else if (cloud.cover === 4) {
        clouds = [
            [-4,52]
        ]
    } else if (cloud.cover === 5) {
        clouds = [
            [0, 48]
        ]
    }

    // Clouds
    svg.selectAll('clouds' + cloud.alt)
        .data(clouds)
        .enter()
        .append('rect')
        .attr('x', d => xScale(d[0]))
        .attr('y', yScale(+cloud.alt + 1000)) //- (yScale(0) - yScale(1000)))
        .attr('width', d => {
            return xScale(d[1]) - xScale(d[0])
        })
        .attr('height', (yScale(0) - yScale(2000))) // Assume clouds are 2000ft think, not always true
        .attr('fill', '#AAAAAA')
        .attr('rx', 10)
        .attr('ry', 10)


}

var pad = (num, size) => {
    // Pads numbers
    var s = "000000000" + num;
    return s.substr(s.length - size);
}

function drawClouds(forecast, svg, xScale, maxX, maxY, timeFunc) {
    let yScale = d3.scaleLinear()
        .domain([0, 30000])
        .range([maxY, 0])

    // Iterates through taf and retrieves cloud cover and converts to format for easier displaying
    let divs = [];
    for (let i = 0; i < forecast.length; i++) {
        let levels = [];
        let skyi = 1;
        if (forecast[i].skyl2) {
            while (forecast[i]['skyc' + skyi]) {
                
                levels.push({
                    cover: COVER_KEY[forecast[i]['skyc' + skyi]],
                    alt: +forecast[i]['skyl' + skyi],
                    time: timeFunc(forecast[i].start)
                })
                skyi++;
            }
            divs.push(levels)
        } else if (forecast[i]['skyl1']) {
            levels.push({
                cover: COVER_KEY[forecast[i]['skyc' + skyi]],
                alt: +forecast[i]['skyl' + skyi],
                time: timeFunc(forecast[i].start),
            })
            divs.push(levels)
        }
    }


    for (let i = 0; i < divs.length; i++) {
        for (let j = 0; j < divs[i].length; j++) {
            let level = divs[i][j];

            // Calculates end of cloud. So the drawCloud function know what size to work with
            if (i === divs.length - 1) {
                var endTime = maxX;
            } else {
                var endTime = divs[i+1][0].time
            }

            for (let k = 0; k < endTime - level.time; k++) {

                drawCloud(svg, level, xScale(level.time + k), xScale((level.time + k + 1)), yScale)
            }
            
        }

    }

    // Labels
    svg.selectAll('cloudLevelLabels')
        .data([0, 10000, 20000, 30000])
        .enter()
        .append('text')
        .attr('x', 5)
        .attr('y', d => yScale(d))
        .text(d => d + 'ft')
        .attr('color', 'black')
        .attr('text-anchor', 'start')


}

export default drawClouds;