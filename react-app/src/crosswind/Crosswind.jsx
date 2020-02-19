import React from 'react'
import axios from 'axios';
import { withCookies, Cookies } from 'react-cookie';
import { TextField } from '@material-ui/core';
import { LabelValue, SearchBox } from '../components';
import WindMetar from './WindMetar';
import RunwayViewer from './RunwayViewer';


class Crosswind extends React.Component {
    constructor(props) {
        super(props)
        const { cookies } = props;

        this.state = {
            metar: [{
                drct: 290,
                sknt: 5,
            }],
            airport: cookies.get('airport') || "KBED",
            nearestAirports: null,
            isMobile: false,
            runways: null,
            isLive: false
        }
    }

    handleWindowResize = () => {
        console.log("Resize", window.innerWidth < 715);
        this.setState({ isMobile: window.innerWidth < 1000 });
    }

    componentDidMount() {
        window.addEventListener('resize', this.handleWindowResize);
        this.handleWindowResize()
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleWindowResize);
    }

    UNSAFE_componentWillMount() {
        this.onSearch(this.state.airport);
    }

    onSearch = (ident) => {
        this.props.cookies.set("airport", ident);

        axios.get(`api/nearestAirports/${ident}`)
            .then(result => {

                this.setState({
                    nearestAirports: result.data
                })
            }).catch(error => {
                console.error(error);
                this.setState({ errorMessage: "Airport Not Found." })
            })
        axios.get(`/api/runway/${ident}`)
            .then(result => {
                console.log(result.data.runways);
                if (!result.data.runways) {
                    this.setState({
                        airport: ident,
                        runways: [{
                            direction: 180,
                            length: 5000
                        },
                        {
                            direction: 90,
                            length: 5000
                        }]
                    }, () => console.log(this.state));
                } else {
                    this.setState({
                        runways: result.data.runways,
                        airport: ident
                    })
                }

            }).catch(error => {


                console.error(error);
            })
        axios.get(`/api/recentMETARs/${ident}?noRunways=true`)
            .then(result => {
                this.setState({
                    metar: result.data,
                    isLive: true,
                    airport: ident,
                    metarErrorMessage: ''
                })
            }).catch(error => {
                console.log(error);
                console.log("Metar Failed");
                this.setState({
                    // metar: null,
                    metarErrorMessage: "Could not find airport. Try again",
                    isLive: false
                })
            })
    }

    handleDrag = (drct, spd) => {
        if (isNaN(drct) || isNaN(spd)) {
            return;
        }
        this.setState({
            metar: [{
                sknt: spd,
                drct: drct,
            }]
        })
    }

    handleRunwayUpdate = (index, dir) => {
        let rwys = this.state.runways;
        rwys[index].direction = dir;
        this.setState({
            runways: rwys
        })
    }

    render() {
        let { airport, metar, runways, nearestAirports, isMobile, isLive } = this.state;
        return (
            <div>
                <SearchBox onClick={this.onSearch} value={airport} nearestAirports={nearestAirports} />
                {metar ?
                    <div style={{ paddingLeft: "10px", display: isMobile ? "block" : "flex" }}>
                        <div>
                            <LabelValue label="Airport" value={airport} />
                            <LabelValue label="Weather" color={isLive ? "green" : "red"} value={isLive ? "Showing Live Weather" : "No Live Weather Available"} />


                            <WindMetar
                                onDrag={this.handleDrag}
                                airport={airport}
                                runways={runways}
                                metar={metar}
                                width={isMobile ? 350 : 500}
                                height={isMobile ? 350 : 500} />
                        </div>

                        <div style={{ paddingTop: "10px" }}>
                            <h3>Wind</h3>

                            <TextField
                                id="standard-basic"
                                label="Magnetic Direction"
                                type="number"
                                inputProps={{ step: 10 }}
                                value={this.state.metar[0].drct.toFixed(0)}
                                onKeyPress={(e) => console.log(e.target.key)}
                                onChange={(e) => {
                                    this.setState({
                                        metar: [{
                                            drct: Math.max(0, +e.target.value % 361),
                                            sknt: this.state.metar[0].sknt
                                        }]
                                    })
                                }}

                            />
                            <TextField
                                id="standard-basic"
                                label="Speed in Knots"
                                type="number"
                                value={this.state.metar[0].sknt.toFixed(0)}
                                onChange={(e) => {
                                    this.setState({
                                        metar: [{
                                            sknt: Math.max(0, +e.target.value),
                                            drct: this.state.metar[0].drct
                                        }]
                                    })
                                }}
                            />
                            {runways ? <>
                                <h3>Runways</h3>
                                {runways.map((rwy, i) => {
                                    return <RunwayViewer
                                        metar={metar[0]} rwy={rwy} index={i} key={i} onChange={this.handleRunwayUpdate} />
                                })}
                            </>
                                : null}
                            <h3>Example</h3>
                            <img src={require("./try2.png")} width="250px" />
                            <h3>Tips!</h3>
                            <p style={{ maxWidth: "300px" }}>
                                Click on the runway heading text box and use the up/down arrow keys to change the value by 10.
                            </p>
                            <p style={{ maxWidth: "300px" }}>
                                Click on the diagram to set the wind/direction with your mouse.
                            </p>
                        </div>
                    </div> : null



                }


            </div >
        )
    }

}

export default withCookies(Crosswind);

