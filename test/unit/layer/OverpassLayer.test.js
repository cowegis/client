import { describe, expect, it, vi } from 'vitest';

import '../../../js/bundle';
import OverpassLayer from '../../../js/layer/OverpassLayer';
import leaflet from '../../../js/leaflet';
import { createElement, stubContainerSize } from '../../helpers';

function overpassResponse(tags = { amenity: 'cafe' }) {
    return { json: async () => ({ elements: [{ type: 'node', id: 1, lat: 1, lon: 2, tags }] }) };
}

function stubFetch(response = overpassResponse()) {
    vi.stubGlobal('fetch', vi.fn(async () => response));
}

function dataloaded(element) {
    return new Promise((resolve) => element.map.once('dataload', resolve));
}

describe('OverpassLayer', () => {
    it('loads dynamically if the query depends on the bounding box', () => {
        const element = createElement();

        expect(new OverpassLayer({ query: 'node(BBOX);out;' }, element).options.dynamicLoad).toBe(true);
        expect(new OverpassLayer({ query: 'node(1,2,3,4);out;' }, element).options.dynamicLoad).toBe(false);
        expect(new OverpassLayer({ query: 'node(BBOX);out;', adjustBounds: true }, element).options.dynamicLoad).toBe(false);
    });

    it('replaces BBOX with the current map bounds', async () => {
        stubContainerSize();
        stubFetch();
        const element = createElement();
        element.map.setView([52, 13], 10);
        const layer = new OverpassLayer({ query: 'node(BBOX);out;', endpoint: 'https://overpass.example/api/' }, element);

        element.map.addLayer(layer);

        const bounds = element.map.getBounds();
        const bbox = [bounds.getSouth(), bounds.getWest(), bounds.getNorth(), bounds.getEast()].join(',');
        expect(fetch).toHaveBeenCalledWith(
            'https://overpass.example/api/interpreter?data=' + encodeURIComponent('[out:json];node(' + bbox + ');out;')
        );
    });

    it('does not load below the minimum zoom', () => {
        stubFetch();
        const element = createElement();

        element.map.addLayer(new OverpassLayer({ query: 'node(BBOX);out;', minZoom: 10 }, element));

        expect(fetch).not.toHaveBeenCalled();
    });

    it('renders loaded nodes and fires loading events', async () => {
        stubFetch();
        const element = createElement();
        const dataloading = vi.fn();
        element.map.on('dataloading', dataloading);
        const layer = new OverpassLayer({ query: 'node(BBOX);out;' }, element);
        const loaded = dataloaded(element);

        element.map.addLayer(layer);
        await loaded;

        expect(dataloading).toHaveBeenCalledTimes(1);
        expect(layer._layer.getLayers()).toHaveLength(1);
        expect(layer._layer.getLayers()[0].feature.properties.amenity).toBe('cafe');
    });

    it('uses icon presets for amenities', async () => {
        stubFetch();
        const element = createElement({ presets: { icons: { cafeIcon: { type: 'div', options: { className: 'cafe' } } } } });
        const layer = new OverpassLayer({ query: 'node(BBOX);out;', amenityIcons: { cafe: 'cafeIcon' } }, element);
        const loaded = dataloaded(element);

        element.map.addLayer(layer);
        await loaded;

        const marker = layer._layer.getLayers()[0];
        await vi.waitFor(() => expect(marker.options.icon.options.className).toBe('cafe'));
    });

    it('ignores the radius for markers', async () => {
        stubFetch(overpassResponse({ radius: '5' }));
        const element = createElement();
        const layer = new OverpassLayer({ query: 'node(BBOX);out;' }, element);
        const loaded = dataloaded(element);

        element.map.addLayer(layer);
        await loaded;

        expect(layer._layer.getLayers()[0]).toBeInstanceOf(leaflet.Marker);
    });

    it('ignores responses that arrive after the layer was removed', async () => {
        let respond;
        vi.stubGlobal('fetch', vi.fn(() => new Promise((resolve) => { respond = resolve; })));
        const element = createElement();
        const layer = new OverpassLayer({ query: 'node(BBOX);out;' }, element);
        const loaded = dataloaded(element);

        element.map.addLayer(layer);
        element.map.removeLayer(layer);
        respond(overpassResponse());
        await loaded;

        expect(layer._layer.getLayers()).toHaveLength(0);
    });

    it('finishes loading if the response cannot be processed', async () => {
        // Overpass answers rate limited requests with an html page.
        vi.stubGlobal('fetch', vi.fn(async () => ({ json: async () => { throw new SyntaxError('Unexpected token <'); } })));
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});
        const element = createElement();
        const loaded = dataloaded(element);

        element.map.addLayer(new OverpassLayer({ query: 'node(BBOX);out;' }, element));
        await loaded;

        expect(error).toHaveBeenCalledWith(expect.any(SyntaxError));
    });

    it('stops reloading on map moves after being removed', async () => {
        stubFetch();
        const element = createElement();
        const layer = new OverpassLayer({ query: 'node(BBOX);out;' }, element);
        const loaded = dataloaded(element);
        element.map.addLayer(layer);
        await loaded;
        element.map.removeLayer(layer);
        fetch.mockClear();

        element.map.fire('moveend');

        expect(fetch).not.toHaveBeenCalled();
    });
});
