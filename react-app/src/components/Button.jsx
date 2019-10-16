import React, { Component } from 'react';
import {
    Link
} from "react-router-dom";
import './button.css';
function ButtonLink(props) {
    //style={{ borderRadius: '3px', border: 'solid black 1px', width: 'fit-content', height: '20px', display: 'inline-block', padding: '5px', margin: '5px' }}>
    return (
        <Link className='button' 
            style={{ padding: '8px 12px', color: 'white', textDecoration: 'none'}}
                to={props.to} >
                {props.text}
      
        </Link>
    );
}

export default ButtonLink;