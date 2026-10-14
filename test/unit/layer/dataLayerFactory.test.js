import { describe, expect, it, vi } from 'vitest';

import '../../../js/bundle';
import dataLayerFactory from '../../../js/layer/dataLayerFactory';
import leaflet from '../../../js/leaflet';
import { createElement, featureCollection, point } from '../../helpers';

function inline(data, options = {}, format = 'geojson') {
    return { options, data: { type: 'inline', format, data } };
}

describe('dataLayerFactory', () => {
    it('creates a GeoJSON layer from inline data', async () => {
        const layer = await dataLayerFactory(inline(featureCollection(point(13.4, 52.5), point(11.5, 48.1))), createElement());

        expect(layer).toBeInstanceOf(leaflet.GeoJSON);
        expect(layer.getLayers()).toHaveLength(2);
    });

    it('loads data and assets from an uri', async () => {
        const element = createElement();
        element.assets = { load: vi.fn(async () => {}) };
        vi.stubGlobal('fetch', vi.fn(async () => ({
            json: async () => ({ assets: [{ type: 'stylesheet', url: 'data.css' }], data: featureCollection(point(1, 2)) }),
        })));

        const layer = await dataLayerFactory({ options: {}, data: { type: 'uri', uri: '/api/data/1', format: 'geojson' } }, element);

        expect(fetch).toHaveBeenCalledWith('/api/data/1');
        expect(element.assets.load).toHaveBeenCalledWith({ type: 'stylesheet', url: 'data.css' });
        expect(layer.getLayers()).toHaveLength(1);
    });

    it('parses external files in the configured format', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => ({ blob: async () => ({ text: async () => 'POINT (13.4 52.5)' }) })));

        const layer = await dataLayerFactory({ options: {}, data: { type: 'external', uri: '/file.wkt', format: 'wkt' } }, createElement());

        expect(layer.getLayers()[0].getLatLng()).toMatchObject({ lat: 52.5, lng: 13.4 });
    });

    it('rejects unknown data types', async () => {
        await expect(dataLayerFactory({ options: {}, data: { type: 'ftp' } }, createElement()))
            .rejects.toThrow('Unknown data type "ftp"');
    });

    it('creates icons from presets referenced by features', async () => {
        const element = createElement({ presets: { icons: { pin: { type: 'div', options: { className: 'pin' } } } } });

        const layer = await dataLayerFactory(inline(featureCollection(point(1, 2, { icon: 'pin', options: {} }))), element);

        expect(layer.getLayers()[0].options.icon.options.className).toBe('pin');
    });

    it('creates icons for features without options', async () => {
        const element = createElement({ presets: { icons: { pin: { type: 'div', options: { className: 'pin' } } } } });

        const layer = await dataLayerFactory(inline(featureCollection(point(1, 2, { icon: 'pin' }))), element);

        expect(layer.getLayers()[0].options.icon.options.className).toBe('pin');
    });

    it('uses the default icon if the referenced preset does not exist', async () => {
        const layer = await dataLayerFactory(inline(featureCollection(point(1, 2, { icon: 'missing' }))), createElement());

        expect(layer.getLayers()[0].options.icon).toBeInstanceOf(leaflet.Icon.Default);
    });

    it('resolves pointToLayer and onEachFeature callbacks', async () => {
        const custom = vi.fn((feature, latlng) => leaflet.circleMarker(latlng));
        const each = vi.fn();
        const element = createElement({ listeners: { custom, each } });
        const options = {
            pointToLayer: { namespace: null, reference: 'custom' },
            onEachFeature: { namespace: null, reference: 'each' },
        };

        const layer = await dataLayerFactory(inline(featureCollection(point(1, 2)), options), element);

        expect(layer.getLayers()[0]).toBeInstanceOf(leaflet.CircleMarker);
        expect(custom).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'Feature' }),
            expect.any(leaflet.LatLng),
            element,
            expect.any(Function)
        );
        expect(each).toHaveBeenCalledTimes(1);
    });

    describe('bounds', () => {
        function boundsLayer(element, adjustBounds = true) {
            return dataLayerFactory(inline(featureCollection(point(10, 20)), { adjustBounds }), element);
        }

        function calculateBounds(element) {
            const bounds = leaflet.latLngBounds([]);
            element.map.fire('cowegis:calculate-bounds', { element, bounds });

            return bounds;
        }

        it('only listens for bounds calculation while on the map', async () => {
            const element = createElement();
            const layer = await boundsLayer(element);

            expect(element.map.listens('cowegis:calculate-bounds')).toBe(false);

            element.map.addLayer(layer);
            expect(element.map.listens('cowegis:calculate-bounds')).toBe(true);

            element.map.removeLayer(layer);
            expect(element.map.listens('cowegis:calculate-bounds')).toBe(false);
        });

        it('contributes its features to the map bounds', async () => {
            const element = createElement();
            element.map.addLayer(await boundsLayer(element));

            expect(calculateBounds(element).contains([20, 10])).toBe(true);
        });

        it('does not contribute without adjustBounds', async () => {
            const element = createElement();
            element.map.addLayer(await boundsLayer(element, false));

            expect(calculateBounds(element).isValid()).toBe(false);
        });

        it('does not contribute while not on the map', async () => {
            const element = createElement();
            await boundsLayer(element);

            expect(calculateBounds(element).isValid()).toBe(false);
        });

        it('stops contributing after being removed', async () => {
            const element = createElement();
            const layer = await boundsLayer(element);
            element.map.addLayer(layer);
            element.map.removeLayer(layer);

            expect(calculateBounds(element).isValid()).toBe(false);
        });

        it('contributes again after being re-added', async () => {
            const element = createElement();
            const layer = await boundsLayer(element);
            element.map.addLayer(layer);
            element.map.removeLayer(layer);
            element.map.addLayer(layer);

            expect(calculateBounds(element).contains([20, 10])).toBe(true);
        });
    });
});
