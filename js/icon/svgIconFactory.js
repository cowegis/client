import {Util} from 'leaflet';

import SvgIcon from './SvgIcon';

export default function(config, properties, element) {
    const options = Util.extend({}, config.options);

    if (properties['marker-color']) {
        options.bgColor = properties['marker-color'];
    }

    if (properties['symbol-color']) {
        options.color = properties['symbol-color'];
    }

    return new SvgIcon(options);
}
