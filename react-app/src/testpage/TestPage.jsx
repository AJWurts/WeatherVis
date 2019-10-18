import React, { Component } from 'react';
import Wind from './wind';
import { SearchBox } from '../components';
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


    onSearch = (ident) => {
        axios.get(`/api/recentMETARs/${ident}?hours=24`)
            .then(result => {
                console.log(result.data)

                this.setState({
                    metars: result.data,
                    airport: ident,
                    metarErrorMessage: ''
                })
            }).catch(error => {
                console.log("Metar Failed");
                this.setState({
                    metars: null,
                    metarErrorMessage: "Could not find airport. Try again"
                })
            })

        axios.get(`/api/newestTAFS/${ident}`)
            .then(result => {
                this.setState({
                    taf: result.data,
                    tafErrorMessage: ''
                })
            }).catch(err => {
                console.log("Taf Failed")
                this.setState({
                    taf: null,
                    tafErrorMessage: "No TAF available"
                })
            })
    }

    //



    render() {
        return (
            <div>
            <SearchBox onClick={this.onSearch} />

                {this.state.metars ?
                    <Wind metars={this.state.metars} width={500} height={500} />
                    : null}
            </div>
        )
    }

}

export default TestPage;