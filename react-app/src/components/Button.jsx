import React, { Component } from 'react';
import {
    Link
} from "react-router-dom";
import './button.css';
function ButtonLink(props) {
    //style={{ borderRadius: '3px', border: 'solid black 1px', width: 'fit-content', height: '20px', display: 'inline-block', padding: '5px', margin: '5px' }}>
    return (
        <div className='button' >
            <Link style={{color: 'white', textDecoration: 'none'}}
                to={props.to} >
                {props.text}
            </Link >
        </div>
    );
}

export default ButtonLink;