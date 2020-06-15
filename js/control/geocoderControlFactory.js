import Geocoder from 'leaflet-control-geocoder';

export default async function(config) {
    if (config.options.geocoder !== undefined && !config.options.geocode instanceof global.IGeocoder) {
        // TODO: Create custom geocoder;
    }

    return new Geocoder(config.options);
}
