import React, { Component } from 'react';


// Input with Label
class InputLabel extends Component {
    constructor(props) {
        super(props);
    }

    onChange = (event) => {
        console.log(event);
        this.props.onChange(this.props.keyVal, event.target.value);
    }

    render() {

        return (
            <div style={{padding: "10px 0px 0px 0px" }}>
                {/* Input */}
                <div style={{ display: 'block-inline' }}>
                    {this.props.label}
                </div>
                {/* Label */}
                <div style={{ display: 'block-inline' }}>
                    <input type={"number"} step={this.props.step} onChange={this.onChange} value={this.props.value}>

                    </input>
                </div>
            </div>
        )
    }
}

export default InputLabel;