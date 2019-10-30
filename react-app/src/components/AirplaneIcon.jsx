import React from 'react';



function AirplaneIcon(props) {
    return (
        <svg x={props.x || 0} y={props.y || 0} xmlns="http://www.w3.org/2000/svg" width={props.width || 30} height={props.height || 30} viewBox="0 0 24 24">
            {/* <path d="M10.18 9" /> */}
            <path style={{transformOrigin: 'center center', transform: 'rotate(' + (props.rotate || 45) + 'deg)'}} d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
            {/* <path d="M0 0h24v24H0z" fill="none" /> */}
        </svg>
    )
}


export default AirplaneIcon;