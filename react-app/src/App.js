import React, { Component } from 'react';
import WeatherVis from './weathervis/WeatherVis.jsx';
import PressureVis from './pressurevis/PressureVis';
import TestPage from './24hour/Hour24Vis';
import Crosswind from './crosswind/Crosswind';
import { ButtonLink, AirplaneIcon } from './components';
import {
    BrowserRouter as Router,
    Switch,
    Route,
} from "react-router-dom";

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            savedMetar: {},
            savedTaf: {}
        }
    }

    render() {
        return (
            <Router style={{}}>
                {/* Navigation Bar */}
                <div style={{ fontSize: '30px', backgroundColor: '#33c6f8a2', padding: '10px 5px' }}>
                    <div style={{ height: '100%', display: 'inline-block', verticalAlign: 'middle' }}>
                        <AirplaneIcon />
                        Pilot Weather Visualizations
                    </div>
                    <div style={{ display: 'inline-block' }}>
                        <ButtonLink to='/' text="METAR/TAF Vis" />
                        <ButtonLink to='/crosswind' text="Crosswind Calculator" />
                        <ButtonLink to='/pressure' text="Pressure Vis" />
                        <ButtonLink to='/24hour' text="24 Hour Data" />
                        <ButtonLink to='/code' text='Github Code Link' />
                            <div style={{ borderRadius: "10px", backgroundColor: "white", color: "black", padding: "2px 20px", fontSize: "14px", width: "300px", display: "inline-block" , textAlign: "start"}}>
                                If you have any feedback or suggestions email alex@alexwurts.com.

                        </div>
                    </div>

                </div>

                {/* Page Switching */}
                <Switch>
                    <Route path='/code' component={() => {
                        window.location.href = 'https://github.com/ajwurts/WeatherVis'
                    }} />
                    <Route path='/pressure'>
                        <PressureVis />
                    </Route>
                    <Route path='/24hour'>
                        <TestPage />
                    </Route>
                    <Route path='/crosswind'>
                        <Crosswind />
                    </Route>

                    <Route path='/'>
                        <WeatherVis />
                    </Route>
                </Switch>
                <div style={{ height: '100%' }} />
            </Router>
        );
    }
}

export default App;