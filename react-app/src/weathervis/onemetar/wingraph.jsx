import React, { Component } from 'react';
import *  as d3 from 'd3';
import { LabelValue } from '../../components';


class Wind extends Component {
  constructor(props) {
    super(props);

    this.state = {
      angle: 0
    }
  }

  UNSAFE_componentWillMount() {
    this.createGraph()

  }
  componentDidMount() {
    this.createGraph()
  }

  UNSAFE_componentWillReceiveProps(props) {
    this.props = props;
    this.createGraph()
  }

  createGraph = () => {

  }

  render() {
    return (
        <svg ref={node => this.node = node} viewBox='0 0 500 80' width={width || 500} height={height || 500}>
        </svg>
    )
  }
}