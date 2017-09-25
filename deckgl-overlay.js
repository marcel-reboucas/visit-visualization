import React, {Component} from 'react';

import DeckGL, {ScatterplotLayer, ArcLayer, HexagonLayer } from 'deck.gl';

export default class DeckGLOverlay extends Component {

  static get defaultViewport() {
    return {
      latitude: -8.0,
      longitude: -34.9,
      zoom: 13,
      maxZoom: 16,
      pitch: 0,
      bearing: 0
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      arcs: this._getArcs(props)
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data) {
      this.setState({
        arcs: this._getArcs(nextProps)
      });
    }
  }

  //generates arcs from data
  _getArcs({ data }) {
    if (!data) {
      return null;
    }

    var sortedData = data;
    sortedData.sort(function(a, b) {
      return a.timestamp - b.timestamp;
    });

    var arcs = [];

    sortedData.forEach(function (value, i) {
      var point = sortedData[i];
      var dest = (i != sortedData.length - 1) ? sortedData[i + 1] : point;
      
      arcs.push({...point, 
        dest_lat: dest.lat, 
        dest_lng: dest.lng, 
        dest_event_type: dest.event_type
      });
    });

    return arcs;
  }

  render() {
    const { viewport, data, visitColor, gpsColor, radius, strokeWidth } = this.props;
    const { arcs } = this.state;

    if (!data) {
      return null;
    }

    const layers = [
      // new HexagonLayer({
      //   id: 'hexagon-layer',
      //   data,
      //   getPosition: d => [d.lng, d.lat],
      //   radius: 500,
      //   opacity: 0.1
      // }),
      new ScatterplotLayer({
        id: 'scatter-plot',
        data,
        radiusScale: radius,
        radiusMinPixels: 0.24,
        getPosition: d => [d.lng, d.lat, 0],
        getColor: d => d.event_type == 'VISIT' ? visitColor : gpsColor,
        getRadius: d => 3,
        pickable: true,
        onHover: info => console.log('Hovered:', info)
      }), 
      new ArcLayer({
        id: 'arc',
        data: arcs,
        getSourcePosition: d => [d.lng, d.lat],
        getTargetPosition: d => [d.dest_lng, d.dest_lat],
        getSourceColor: d => d.event_type == 'VISIT' ? visitColor : gpsColor,
        getTargetColor: d => d.dest_event_type == 'VISIT' ? visitColor : gpsColor,
        strokeWidth
      })
    ];

    return (
      <DeckGL {...viewport} layers={ layers } />
    );
  }
}
