import bindEvents from '../factory/bindEvents';

import bindPopupFromFeature from './bindPopupFromFeature';
import bindTooltipFromFeature from './bindTooltipFromFeature';

export default function (feature, latlng, element) {
    let type   = 'marker';
    let marker = null;
    let options = {};

    if (feature.properties) {
        feature.properties.bounds = true;
        options = feature.properties.options || {};

        if (options.pane && element.panes[options.pane]) {
            options.pane = element.panes[options.pane].name;
        } else {
            delete options.pane;
        }

        if (feature.properties.type) {
            type = feature.properties.type;
        }
    }

    // TODO: Support different marker types as circle marker etc.
    marker = L[type](latlng, options);

    if (feature.properties) {
        bindEvents(marker, feature.properties.events, element);

        if (feature.properties.radius) {
            marker.setRadius(feature.properties.radius);
        }

        bindPopupFromFeature(marker, feature, element);
        bindTooltipFromFeature(marker, feature, element);
    }

    //this.fire('point:added', {marker: marker, feature: feature, latlng: latlng, type: type});

    return marker;
};
