import React, { Component } from 'react';
import Wind from './wind';
import axios from 'axios';


class TestPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            airport: "KBED",
            metars: null,
            metarErrorMessage: "Loading METAR..."
        }

    }

    UNSAFE_componentWillMount() {
        axios.get(`/api/recentMETARs/${this.state.airport}?hours=24`)
            .then(result => {

                this.setState({
                    metars: result.data,
                    metarErrorMessage: ''
                })
            }).catch(err => {
                this.setState({
                    metars: null,
                    metarErrorMessage: "Could not find airport. Try again."
                })
            })
    }



    render() {
        return (
            <div>
                {this.state.metars ?
                    <Wind metars={this.state.metars} width={500} height={500} />
                    : null}
            </div>
        )
    }

}

export default TestPage;