import leaflet from '../leaflet';

export default async function (config) {
    return leaflet.control.scale(config.options);
}
