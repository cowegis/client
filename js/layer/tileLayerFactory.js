import leaflet from '../leaflet';

export default async function (config) {
    return leaflet.tileLayer(config.urlTemplate, config.options);
}
