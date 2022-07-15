import {Util,DivIcon} from 'leaflet';

export default function (config, properties, element) {
    const options = Util.extend({}, config.options);

    return new DivIcon(options);
}
