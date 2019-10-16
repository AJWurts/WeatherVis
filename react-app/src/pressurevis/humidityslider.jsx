import React, { Component } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css'


class HumiditySlider extends Component {
    constructor(props) {
        super(props);
    }

 

    onChange = (new_value) => {
        console.log(new_value);

        this.props.onChange('humidity', new_value);
    }

    render() {
        var humidity = this.props.humidity;
        return (
            <Slider
                value={humidity}
                min={0}
                max={100}
                onChange={this.onChange}
              />
        );
    }
}


export default HumiditySlider


