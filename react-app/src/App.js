import React, { Component } from 'react';
import WeatherVis from './weathervis/WeatherVis';
import PressureVis from './pressurevis/PressureVis';
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


                <div style={{ fontSize: '30px', backgroundColor: '#33c6f8a2', padding: '10px 5px' }}>
                    <div style={{ height: '100%', display: 'inline-block', verticalAlign: 'middle' }}>
                        <AirplaneIcon />
                        Pilot Weather Visualizations
                    </div>
                    <div style={{ display: 'inline-block' }}>
                        <ButtonLink to='/' text="METAR/TAF Vis" />
                        <ButtonLink to='/pressure' text="Pressure Vis" />

                    </div>

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