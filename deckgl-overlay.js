import React, {Component} from 'react';

import DeckGL, {ScatterplotLayer} from 'deck.gl';

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

  render() {
    const { viewport, data, visitColor, gpsColor, radius } = this.props;

    if (!data) {
      return null;
    }

    const layer = new ScatterplotLayer({
      id: 'scatter-plot',
      data,
      radiusScale: radius,
      radiusMinPixels: 0.24,
      getPosition: d => [d.lng, d.lat, 0],
      getColor: d => d.type == 'visit' ? visitColor : gpsColor,
      getRadius: d => 2,
      pickable: true,
      onHover: info => console.log('Hovered:', info)
    });

    return (
      <DeckGL {...viewport} layers={ [layer] } />
    );
  }
}
