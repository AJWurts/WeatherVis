import React, { Component } from 'react';


// Search Box
class SearchBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      input: ""
    }
  }

  // Handles Input Interaction
  onChange = (event) => {
    this.setState({
      input: event.target.value
    })
  }

  onClick = (event) => {
    this.props.onClick(this.state.input);
  }

  onKeyPress = (event) => {
    if (event.key === 'Enter') {
      this.onClick(event);
    }
  }

  onAirportClick = (airport) => {
    this.setState({
      input: airport.airport
    }, () =>  this.props.onClick(airport.airport))

   
  }
  /////////////////////////////////

  render() {
    var { nearestAirports } = this.props;
    return (
      <div onKeyPress={this.onKeyPress} style={{ padding: '10px', backgroundColor: 'gray', verticalAlign: 'middle' }}>
        <div style={{ display: 'inline-block', fontSize: '22px', margin: '0px 8px', verticalAlign: 'middle', color: 'white' }}>
          Airport Search:
        </div>
        <input onChange={this.onChange}
          style={{ height: '20px', width: '80px', fontSize: '18px', borderRadius: '20px', border: 'none', padding: '5px', verticalAlign: 'middle', textAlign: 'center' }} value={this.state.input} placeholder={this.props.value} />
        <button onClick={this.onClick} style={{ verticalAlign: 'middle', padding: '5px 25px' }} className='button'>
          Search
        </button>
        {nearestAirports ?
          <div>
            <span style={{ display: 'inline-block', fontSize: '22px', margin: '0px 8px', verticalAlign: 'middle', color: 'white' }}>
              Nearest Airports
            </span>

            {nearestAirports.map((airport, index) => {
              return <button key={index} onClick={() => this.onAirportClick(airport)} style={{ verticalAlign: 'middle', padding: '5px 10px', marginTop: "5px" }} className='button'>
                {airport.airport}: {airport.name.toLowerCase()}, {airport.state}
              </button>
            })}
          </div> : null}

      </div>
    );
  }
}

export default SearchBox;

