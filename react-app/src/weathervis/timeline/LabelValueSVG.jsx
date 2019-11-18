import React, { Component } from 'react';


function LabelValueSVG(props) {
    let height = 600;
    let { y, label, width } = props;
    return (
        <g>
            <rect y={y * height} x={0} width={width || 100} height="5%" fill='rgb(170, 170, 170)' />
            <rect y={y * height} x={width || 100} width='90%' height="5%" fill='rgb(238, 238, 238)' />
            <text style={{ fill: 'white', fontSize: '22px', textAnchor: 'top' }} color='white' x='5' y={y * height + 20}>
                {label}
            </text>
        </g>

    )
}

export default LabelValueSVG;