import leaflet from '../leaflet';
import 'leaflet-providers';

export default async function (config) {
    let provider = config.provider;
    if (config.variant !== null) {
        provider += '.' + config.variant;
    }

    return leaflet.tileLayer.provider(provider, config.options);
}
