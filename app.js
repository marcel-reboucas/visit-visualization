/* global window,document */
import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL, { Popup } from 'react-map-gl';
import DeckGLOverlay from './deckgl-overlay.js';
import Papa from 'papaparse';

import { json as requestJson } from 'd3-request';

// Set your mapbox token here
const MAPBOX_TOKEN = 'pk.eyJ1IjoibWFyY2VscmVib3VjYXMiLCJhIjoiY2o3eGZkYm5rMTd2bDJ3bzJ4enN6czRkdSJ9.GtCF9r--onL2FkjK7ETj4A';
const VISIT_COLOR = [136, 176, 75];
const GPS_COLOR = [50, 234, 75];
const DURATION = 60000 //ms

// Source data CSV
const DATA_URL = 'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/scatterplot/manhattan.json';
// or file
const FILE_PATH = './sample.csv';

class Root extends Component {

  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        ...DeckGLOverlay.defaultViewport,
        width: 500,
        height: 500
      },
      data: null
    };
  }

  componentWillMount() {

    // requestJson(DATA_URL, (error, response) => {
    //   if (!error) {
    //     this.setState({data: response});
    //   }
    // });

    this.readFile(FILE_PATH, (error, response) => {
      if (!error) {
        var viewport = this.state.viewport;

        if (response.length > 0) {
          viewport.latitude = response[0].lat;
          viewport.longitude = response[0].lng;
        }

        this.setState({
          data: response, 
          viewport: viewport}
        );
      } else {
        console.debug(error);
      }
    });
  }

  readFile(file, onCompletion) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, true);
    
		rawFile.onreadystatechange = () => {
      Papa.parse(rawFile.responseText, {
        header: true,
        dynamicTyping: true,
        complete: function(results) {
          console.log(results);
          onCompletion(null, results.data);
        }
      });
    };

    rawFile.onerror = (target, error) => {
      onCompletion(error, null)
    }
    rawFile.send(null);
  }

  componentDidMount() {
    window.addEventListener('resize', this._resize.bind(this));
    this._resize();
  }

  _resize() {
    this._onViewportChange({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  _onViewportChange(viewport) {
    this.setState({
      viewport: {...this.state.viewport, ...viewport}
    });
  }

  render() {
    const {viewport, data} = this.state;
    return (
      <MapGL
        {...viewport}
        onViewportChange={this._onViewportChange.bind(this)}
        mapboxApiAccessToken={MAPBOX_TOKEN}>
        <DeckGLOverlay 
          viewport={viewport}
          data={data}
          visitColor={VISIT_COLOR}
          gpsColor={GPS_COLOR}
          radius={30}
        />
      </MapGL>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
