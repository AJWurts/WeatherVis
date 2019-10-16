import React, { Component } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css'


class TemperatureSlider extends Component {
    constructor(props) {
        super(props);
    }

 

    onChange = (new_value) => {
        console.log(new_value);

        this.props.onChange('temperature', new_value);
    }

    render() {
        var temperature = this.props.temperature;
        return (
            <Slider
                value={temperature}
                min={-40}
                max={130}
                onChange={this.onChange}
              />
        );
    }
}


export default TemperatureSlider


