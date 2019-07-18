import React, { Component } from 'react';
import *  as d3 from 'd3';


class TimeLine extends Component {
    componentDidMount() {
        this.createGraph()
    }

    componentWillReceiveProps(props) {
        this.props = props;
        this.createGraph()
    }

    createGraph = () => {
        const node = this.node;
        this.svg = d3.select(node);

        if (!this.props.data) {
            return;
        } else {
            var data = this.props.data;
        }


    }

    render() {
        var { width, height } = this.props;
        return (
            <div>
                <svg ref={node => this.node = node} width={width || 500} height={height || 500}>
                </svg>
                <WindTimeLine data={this.props.data} />
                <WeatherTimeLine data={this.props.data} />
                <CloudTimeLine data={this.props.data} />
                <VisTimeLine data={this.props.data} />

            </div>
        );
    }
}

export default TimeLine;
