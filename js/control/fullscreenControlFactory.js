import 'leaflet.fullscreen';

export default async function(config) {
    return new L.Control.FullScreen(config.options);
}
