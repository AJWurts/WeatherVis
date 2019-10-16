import React, { Component } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css'


class NumberSlider extends Component {
    constructor(props) {
        super(props);
    }



    onChange = (new_value) => {
        this.props.onChange(this.props.keyVal, new_value);
    }

    render() {
        let { vertical } = this.props;
        return (
            <div style={{ width: vertical ? null : '300px', display: vertical ? 'inline-block' : 'block', height: vertical ? '300px' : '20px', verticalAlign: 'top', padding: '0px 15px 0px 0px' }}>
                <div style={{ padding: '0px 5px 0px 0px', display: vertical ? "block" : "inline-block", verticalAlign: 'top', textAnchor: 'middle' }}>
                    {(vertical ? this.props.max : this.props.min) + this.props.units}
                </div>
                <div style={{ height: '100%', width: '60%', display: vertical ? "block" : "inline-block", paddingLeft: '5px' }}>
                    <Slider
                        {...this.props}
                        style={{ height: '100%', }}
                        onChange={this.onChange}
                    />
                </div>

                <div style={{ padding: '0px 0px 0px 5px ', display: vertical ? "block" : "inline-block", verticalAlign: 'top',  textAnchor: 'middle'  }} >
                    {(vertical ? this.props.min : this.props.max) + this.props.units}
                </div>
            </div>


        );
    }
}


export default NumberSlider


