import {Util} from 'leaflet';

import FontAwesomeIcon from './FontAwesomeIcon';

const attribution = '<a href="https://fontawesome.com/" target="_blank" rel="nofollow noopener" title="Font Awesome Free Icons by Fonticons Inc.">Font Awesome</a>';

export default function(config, properties, element) {
    const options = Util.extend({}, config.options);

    if (properties['marker-color']) {
        options.bgColor = properties['marker-color'];
    }

    if (properties['marker-symbol']) {
        options.icon = properties['marker-symbol'];
    }

    if (properties['symbol-color']) {
        options.color = properties['symbol-color'];
    }

    element.addEventListener('cowegis:ready', function() {
        element.map.attributionControl.addAttribution(attribution);
    });

    return new FontAwesomeIcon(options);
}
