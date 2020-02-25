import React, { Component } from 'react';
import { withCookies, Cookies } from 'react-cookie';
import Wind from './Wind24';
import { SearchBox } from '../components';
import axios from 'axios';


class TestPage extends Component {
    constructor(props) {
        super(props);
        const { cookies } = props;

        // If url has airport ident use instead of cookie.
        let ident;
        if (props.match && props.match.params && props.match.params.ident) {
          ident = props.match.params.ident;
        }
        this.state = {
            airport: ident ? ident :  (cookies.get('airport') || "KBED"),
            metars: null,
            metarErrorMessage: "Loading METAR...",
            width: 500
        }

    }

    handleWindowResize = () => {
        console.log( window.width < 500 ? window.width : 500);
        this.setState({ width: window.width < 500 ? window.width : 500});
    }

    componentDidMount() {
        window.addEventListener('resize', this.handleWindowResize);
        this.handleWindowResize()
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleWindowResize);
    }

    UNSAFE_componentWillMount() {
        // TODO: Remove and update component to React Function with useEffect.
        axios.get(`/api/recentMETARs/${this.state.airport}?hours=24`)
            .then(result => {

                this.setState({
                    metars: result.data.metars,
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
        // Pull METAR Data for airport
        axios.get(`/api/recentMETARs/${ident}?hours=24`)
            .then(result => {

                this.setState({
                    metars: result.data.metars,
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


        const { cookies } = this.props;
        cookies.set('airport', ident, { path: '/', maxAge: 315360000 });
    }



    render() {
        return (
            <div >
                <SearchBox onClick={this.onSearch} value={ this.state.airport } />
                <div style={{width: 'fit-content', marginLeft: 'auto', marginRight: 'auto'}}>

                {this.state.metars ?
                    <Wind metars={this.state.metars} width={this.state.width} height={this.state.width} />
                    : null}
                         </div>
            </div>
        )
    }

}

export default withCookies(TestPage);
