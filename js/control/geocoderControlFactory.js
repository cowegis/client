import {
    Geocoder,
    geocoders
} from 'leaflet-control-geocoder';

import {cowegis} from '../geocoder/Cowegis';

geocoders.cowegis = cowegis;

export default async function(config) {
    if (config.geocoder !== undefined && config.geocoder !== null && !config.options.geocode) {
        config.options.geocoder = geocoders[config.geocoder.type](config.geocoder.options)
    }

    return new Geocoder(config.options);
}
