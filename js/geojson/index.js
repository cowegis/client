import toGeoJSON from '@mapbox/togeojson';
import { feature as parseTopoJsonFeature } from 'topojson-client';
import wellknown from 'wellknown';

function parseXml(str) {
    return (new DOMParser()).parseFromString(str,  'text/xml');
}

function parseGpx(str) {
    return toGeoJSON.gpx(parseXml(str));
}

function parseKml(str) {
    return toGeoJSON.kml(parseXml(str));
}

function parseWkt(str) {
    return wellknown(str);
}

function parseTopoJson(str) {
    const json = typeof str === 'string' ? JSON.parse(str) : str;
    const geojson = { type: 'FeatureCollection', features: [] };

    for (var i in json.objects) {
        var feature = parseTopoJsonFeature(json, json.objects[i]);
        geojson.features.push(feature);
    }

    return geojson;
}

export function from(format, string) {
    switch (format) {
        case 'geojson':
            return typeof string === 'string' ? JSON.parse(string) : string;

        case 'gpx':
            return parseGpx(string);

        case 'kml':
            return parseKml(string);

        case 'wkt':
            return parseWkt(string);

        case 'topojson':
            return parseTopoJson(string);

        default:
            throw new Error(`Format "${format}" not supported`);
    }
}

export default {
    from: from,
    fromGpx: parseGpx,
    fromKml: parseKml,
    fromWkt: parseWkt,
    fromTopoJson: parseTopoJson,
}
