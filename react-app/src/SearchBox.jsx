import React, { Component } from 'react';


class SearchBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      input: ""
    }
    
  }


  onChange = (event) => {
    this.setState({
      input: event.target.value
    })
  }

  onClick = (event) => {
    this.props.onClick(this.state.input);
  }

  render() {
    return (
      <div style={{display: 'flex'}}>
        Enter Airport Abbreviation:
        <input onChange={this.onChange}/>
        <button onClick={this.onClick}>
        Search
        </button>
      
      </div>
   );
 }
}

export default SearchBox;

