import React, { Component } from 'react';
import {
    Link
} from "react-router-dom";
import './button.css';
// Create Button that Links to other page.
function ButtonLink(props) {
    return (
        <Link className='button'
            style={{
                padding: '8px 12px', color: 'white',
                textDecoration: 'none'
            }}
            to={props.to} >
            {props.text}

        </Link>
    );
}

export default ButtonLink;