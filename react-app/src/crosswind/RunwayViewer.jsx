import React from 'react'
import { TextField } from '@material-ui/core';
import *  as d3 from 'd3';


function RunwayViewer(props) {
    function rads(degrees) {
        var pi = Math.PI;
        return degrees * (pi / 180);
    }

    function drawRunwayWind(svg, heading, variation, yCoord) {
        let X = 0;
        // Draw a single runway wind indicator in bottom left
        if (props.metar.drct === 'VRB') {
            return;
        }

        let dir = props.metar.drct;
        let spd = props.metar.sknt;
        let angle = rads(Math.abs((((heading + variation) + 360 - dir) % 361)))
        let headwind = Math.round(Math.cos(angle) * spd);
        let crosswind = -Math.round(Math.sin(angle) * spd);
        svg.append("text")
            .attr('x', X)
            .attr('y', yCoord)
            .text(`${((heading + 360) % 361 / 10).toFixed()}: `)
            .attr('color', 'black')
        if (headwind < 0) {
            svg.append('path')
                .attr('d', `M${X + 30} ${yCoord - 4} l5-5 5 5z`) //M7 14l5-5 5 5z
                .attr('fill', 'red')
        } else {
            svg.append('path')
                .attr('d', `M${X + 30} ${yCoord - 8} l5 5 5-5z`)
                .attr('fill', 'green')
        }


        svg.append("text")
            .attr('x', X + 40)
            .attr('y', yCoord)
            .text(`${Math.abs(headwind)}`)
            .attr('color', 'black')

        if (crosswind < 0) {
            svg.append('path')
                .attr('d', `M${X + 65} ${yCoord} l0 -10 5 5z`)
                .attr('fill', Math.abs(crosswind) < 10 ? 'green' : "red")
        } else {
            svg.append('path')
                .attr('d', `M${X + 69} ${yCoord} l0 -10 -5 5z`)
                .attr('fill', Math.abs(crosswind) < 10 ? 'green' : "red")
        }
        svg.append("text")
            .attr('x', X + 75)
            .attr('y', yCoord)
            .text(`${Math.abs(crosswind)}`)
            .attr('color', 'black')

    }

    function handleChange(heading) {
        props.onChange(props.index, +heading % 360);
    }

    let svgref = React.useRef(null);

    React.useEffect(() => {
        let svg = d3.select("#windsvg" + props.index);
        drawRunwayWind(svg, props.rwy.direction, 0, 15);
        drawRunwayWind(svg, (props.rwy.direction + 180) % 360, 0, 30)

        console.log(svg)
    })
    return (
        <div>
            <TextField
                id="standard-basic"
                label="Heading"
                style={{ width: "60px" }}
                inputProps={{ step: 10 }}
                type="number"
                value={Math.max(0, props.rwy.direction)}
                onChange={(e) => handleChange(e.target.value)}
            />
            <TextField
                id="standard-basic"
                label="Heading 2"
                style={{ width: "80px" }}
                disabled
                value={(props.rwy.direction + 180) % 360}
                onChange={(e) => handleChange(e.target.value)}
            />
            <TextField
                id="standard-basic"
                label="Length"
                style={{ width: "80px" }}
                disabled
                value={props.rwy.length + "ft"}
            />
            <svg width="100" height="40" style={{ display: "inline-block", marginTop: "13px" }} id={"windsvg" + props.index}>

            </svg>

        </div>
    )
}



export default RunwayViewer;

