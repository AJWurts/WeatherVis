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
    if (event.key == 'Enter') {
      this.onClick(event);
    }
  }
  /////////////////////////////////

  render() {
    return (
      <div onKeyPress={this.onKeyPress} style={{ padding: '10px', backgroundColor: 'gray', verticalAlign: 'middle' }}>
        <div style={{ display: 'inline-block', fontSize: '22px', margin: '0px 8px', verticalAlign: 'middle', color: 'white' }}>
          Airport Search:
        </div>
        <input onChange={this.onChange}
          style={{ height: '20px', width: '50px', fontSize: '18px', borderRadius: '20px', border: 'none', padding: '5px', verticalAlign: 'middle' }} placeholder={ this.props.value } />
        <button onClick={this.onClick} style={{ verticalAlign: 'middle', padding: '5px 25px' }} className='button'>
          Search
        </button>
      </div>
    );
  }
}

export default SearchBox;

