import React, { Component } from 'react';
import *  as d3 from 'd3';

drawCloud = (svg, cloud, minX, maxX, yScale) => {
    var clouds; // [[startX, endX]]
    var xScale = d3.scaleLinear()
      .domain([0, 48])
      .range([minX, maxX])
    if (cloud.cover === 0) {
      return;
    } else if (cloud.cover === 1) {
      clouds = [
        [5, 20], [28, 43]
      ]
    } else if (cloud.cover === 2) {
      clouds = [
        [2, 14], [18, 30], [34, 46]
      ]
    } else if (cloud.cover === 3) {
      clouds = [
        [1, 11], [13, 22], [25, 35], [37, 47]
      ]
    } else if (cloud.cover === 4) {
      clouds = [
        [0, 9.6], [9.6, 19.2], [19.2, 28.8], [28.8, 38.4], [38.4, 48]
      ]
    } else if (cloud.cover === 5) {
      clouds = [
        [0,48]
      ]
    }

    // Clouds
    svg.selectAll('clouds' + cloud.alt)
      .data(clouds)
      .enter()
      .append('rect')
      .attr('x', d => xScale(d[0]))
      .attr('y', yScale(cloud.alt) - (yScale(0) - yScale(1000)))
      .attr('width', d => {
        return xScale(d[1]) - xScale(d[0])
      })
      .attr('height', (yScale(0) - yScale(1000)))
      .attr('fill', '#AAAAAA')
      .attr('rx', 10)
      .attr('ry', 10)

    // Labels
    svg.append('text')
      .attr('x', 5)
      .attr('y', yScale(+cloud.alt + 500))
      .text(cloud.actual + " " + (this.pad(cloud.alt / 100, 3)))
      .attr('color', 'black')
      .attr('text-anchor', 'start')


  }

function drawClouds(forecast, svg, width, height) {
    // How can i simplify this enough to just get something to show up>>
    
    for (let i = 0; i < forecast.length; i++) {
        let minX = 
    }
    
}