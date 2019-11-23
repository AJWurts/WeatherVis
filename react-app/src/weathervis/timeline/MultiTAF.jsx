import React, { Component } from 'react';
import Timeline from '.';

class MultiTAF extends Component {
    constructor(props) {
        super(props);

        this.state = {
            tafIndexVisible: 0
        };
    }

    render() {

        var { tafs, metar } = props;
        return (
            <div>
                {tafs ?
                    tafs.map((taf, index) => {
                        return <div width="1055px" style={{ overflow: 'scroll' }}>
                            <div>
                                <LabelValue
                                    label={"TAF"}
                                    value={this.state.taf.raw.slice(0, 22)} />
                                <LabelValue
                                    label="Released"
                                    value={tafAge} />
                                <LabelValue
                                    label="Directions"
                                    value={"Hover or Tap on charts to see data for selected time."} />
                                <LabelValue
                                    value="On mobile turn phone sideways for better quality." />
                            </div>
                            <TimeLine data={taf} metar={metar} />
                        </div>
                            : null}
            </div>
        );
    }
}

export default MultiTAF;