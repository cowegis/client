import { FullScreen } from 'leaflet.fullscreen';

export default async function(config) {
    return new FullScreen(config.options);
}
