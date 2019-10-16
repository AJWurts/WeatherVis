import React, { Component } from 'react';
import WeatherVis from './weathervis/WeatherVis';
import PressureVis from './pressurevis/PressureVis';
import { ButtonLink, AirplaneIcon } from './components';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
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
            <Router>
                <div style={{ fontSize: '30px' }}>
                    Pilot Weather Visualizations
                    <AirplaneIcon/>
                </div>
                <div style={{backgroundColor: '#33c6f8a2'}}>
                    <ButtonLink to='/' text="METAR/TAF Vis" />
                    <ButtonLink to='/pressure' text="Pressure Vis" />
                </div>
                <Switch>


                    <Route path='/pressure'>
                        <PressureVis />
                    </Route>
                    <Route path='/'>
                        <WeatherVis />
                    </Route>
                </Switch>

            </Router>


        );
    }
}

export default App;