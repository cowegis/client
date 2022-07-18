import {
    Geocoder,
    geocoders
} from 'leaflet-control-geocoder';

export default async function(config) {
    if (config.options.geocoder !== undefined && !config.options.geocode instanceof global.IGeocoder) {
        config.options.geocoder = geocoders[config.options.geocoder.type](config.options.geocoder.options)
    }

    return new Geocoder(config.options);
}
