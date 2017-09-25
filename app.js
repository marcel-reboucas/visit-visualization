/* global window,document */
import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';
import DeckGLOverlay from './deckgl-overlay.js';
import Papa from 'papaparse';

import { json as requestJson } from 'd3-request';

// Set your mapbox token here
const MAPBOX_TOKEN = 'pk.eyJ1IjoibWFyY2VscmVib3VjYXMiLCJhIjoiY2o3eGZkYm5rMTd2bDJ3bzJ4enN6czRkdSJ9.GtCF9r--onL2FkjK7ETj4A';
const VISIT_COLOR = [255, 96, 128];
const GPS_COLOR = [96, 128, 255];

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
          // Updates the viewport to be centered in the first point of the csv
          viewport.latitude = response[0].lat;
          viewport.longitude = response[0].lng;
        }

        this.setState({
          data: this.filterResponse(response), 
          viewport: viewport}
        );
      } else {
        console.debug(error);
      }
    });
  }

  filterResponse(response) {
    //remove equal timestamps
    var filtered = response.filter(
      (elt, i, a) => i === a.findIndex(
        elt2 => elt.timestamp === elt2.timestamp
      )
    );
    return filtered;
  }

  readFile(file, onCompletion) {
    // Reads the csv file as a string
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, true);
    
		rawFile.onreadystatechange = () => {
      // Parses the csv string to a list of objects
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
          radius={10}
          strokeWidth={3}
        /> 
      </MapGL>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
