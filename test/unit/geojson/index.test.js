import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { from } from '../../../js/geojson';

function fixture(name) {
    return readFileSync(resolve(__dirname, '../../fixtures/geodata', name), 'utf8');
}

describe('geojson.from', () => {
    it('parses geojson strings', () => {
        const data = '{"type":"FeatureCollection","features":[]}';

        expect(from('geojson', data)).toEqual({ type: 'FeatureCollection', features: [] });
    });

    it('passes geojson objects through', () => {
        const data = { type: 'FeatureCollection', features: [] };

        expect(from('geojson', data)).toBe(data);
    });

    it('converts gpx tracks and waypoints', () => {
        const result = from('gpx', fixture('route.gpx'));

        expect(result.features.map((feature) => [feature.properties.name, feature.geometry.type])).toEqual([
            ['Track', 'LineString'],
            ['Berlin', 'Point'],
        ]);
        expect(result.features[0].geometry.coordinates).toEqual([[13.4, 52.5], [11.5, 48.1]]);
    });

    it('converts kml placemarks', () => {
        const result = from('kml', fixture('place.kml'));

        expect(result.features).toHaveLength(1);
        expect(result.features[0].properties.name).toBe('Berlin');
        expect(result.features[0].geometry).toEqual({ type: 'Point', coordinates: [13.4, 52.5, 0] });
    });

    it('converts wkt to a geometry', () => {
        expect(from('wkt', 'POINT (13.4 52.5)')).toEqual({ type: 'Point', coordinates: [13.4, 52.5] });
    });

    it('converts every topojson object to a feature', () => {
        const result = from('topojson', fixture('places.topojson'));

        expect(result.type).toBe('FeatureCollection');
        expect(result.features[0].properties).toEqual({ name: 'Berlin' });
        expect(result.features[0].geometry).toEqual({ type: 'Point', coordinates: [13.4, 52.5] });
    });

    it('accepts parsed topojson objects', () => {
        const result = from('topojson', JSON.parse(fixture('places.topojson')));

        expect(result.features).toHaveLength(1);
    });

    it('rejects unknown formats', () => {
        expect(() => from('shapefile', '')).toThrow('Format "shapefile" not supported');
    });
});
