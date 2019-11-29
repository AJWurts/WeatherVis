import React, { Component } from 'react';
import TimeLine from './timeline.jsx';

import LabelValue from '../../components/LabelValue.jsx';

class MultiTAF extends Component {
    constructor(props) {
        super(props);

        this.state = {
            tafIndexVisible: 0
        };
    }

    onTafClick = (index) => {
        this.setState({
            tafIndexVisible: index
        })
    }

    render() {

        var { tafs, metar } = this.props;
        return (
            <div>
                <div>
                    {tafs ?
                        <div>
                            <span className='normal'>
                                Nearest TAFS
                            </span>

                            {tafs.map((taf, index) => {
                                return <button key={index} onClick={() => this.onTafClick(index)} style={{ verticalAlign: 'middle', padding: '5px 10px' }} className='button'>
                                    {taf.airport}
                                </button>
                            })}
                        </div> : null}
                </div>
                       
                {tafs ?
                    tafs.map((taf, index) => {
                        if (index !== this.state.tafIndexVisible)
                            return;
                        if (taf) {
                            let tafDate = new Date()
                            tafDate.setUTCDate(taf.released.day)
                            tafDate.setUTCHours(taf.released.hour, taf.released.minute)

                            let diff = new Date() - tafDate
                            let hours = diff / 3.6e6;
                            let minutes = (hours - Math.floor(hours)) * 60
                            let minRound = Math.round(minutes)


                            var tafAge = `${Math.floor(hours)}:${("" + minRound).padStart(2, "0")} hours ago`
                        }
                        return <div key={index} width="1055px" style={{ overflow: 'scroll' }}>

                            <div>
                                <LabelValue
                                    label={"TAF"}
                                    value={taf.raw.slice(0, 22)} />
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
                    })
                    : null}
            </div>
        );
    }
}

export default MultiTAF;