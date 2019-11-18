import React, { Component } from 'react';


class SelectableMetar extends Component {

  pad = (num, size) => {
    var s = "000000000" + num;
    return s.substr(s.length - size);
  }

  // Takes METAR object and converts into list of key
  // value pairs to transform into buttons.
  // Attempts to replicate METAR as close as possible
  metarToRaw = (metar) => {

    var rawMetar = []
    var split = metar.raw.split(' ')
    // Airport Code
    rawMetar.push({
      key: 'airport',
      'val': split[0],
    })
    // Start TIme
    rawMetar.push({
      key: 'valid',
      'val': split[1]
    })

    // Wind
    rawMetar.push({
      key: 'metarwind',
      'val': this.pad(metar.drct, 3) + "" + this.pad(metar.sknt, 2) + (metar.gust > 0 ? "G" + this.pad(metar.gust, 2) : "" + "KT")
    })

    // Visibility
    rawMetar.push({
      key: 'visibility',
      'val': metar.vsby + 'SM'
    })

    // Weather
    let weatherStr = ""
    for (let i = 0; i < metar.weather.length; i++) {
      weatherStr += metar.weather[i].raw + ' '
    }

    rawMetar.push({
      key: 'metarweather',
      val: weatherStr
    })


    let cloudStr = ""
    let i = 1;
    while (metar['skyc' + i]) {
      if (metar['skyc' + i] === 'CLR' || metar['skyc' + i] === 'SKC') {
        cloudStr += metar['skyc' + i]
      } else {
        cloudStr += metar['skyc' + i] + this.pad(metar['skyl' + i] / 100, 3) + " "
      }
      i++;
    }
    rawMetar.push({
      key: "metarclouds",
      'val': cloudStr
    })


    rawMetar.push({
      key: 'temp',
      'val':
        (metar.tmpf < 0 ? 'M' : '') + // Adds M of negative
        this.pad(Math.abs(metar.tmpf), 2) + "/" +
        (metar.dwpf < 0 ? 'M' : '') + // Adds M of negative
        this.pad(Math.abs(metar.dwpf), 2)
    })

    if (metar.alti !== 0) {
      rawMetar.push({
        key: 'pressure',
        val: "A" + metar.alti
      })
    }



    return rawMetar
  }

  onHover = (key) => {
    this.props.onHover(key)
  }

  onMouseLeave = (key) => {
    this.props.onMouseLeave(key)
  }

  render() {
    let metarData = this.metarToRaw(this.props.metar)
    return (
      <div style={{ display: "inline-block", width: '100%' }}>
        {this.props.label ?
          <div className={this.props.className + ' normal'} >
            {this.props.label}
          </div> : null}

        {/* Draws Metar Components */}
        {metarData.map((d, i) => {
          if (d.val) {
            return (<div className={'selector'} key={i} onMouseOver={() => this.onHover(d.key)} onMouseLeave={() => this.onMouseLeave(d.key)}>
              {d.val + " "}
            </div>)
          } else {
            return null;
          }

        })}
      </div>
    );
  }
}

export default SelectableMetar;