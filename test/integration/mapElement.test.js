import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { describe, expect, it, vi } from 'vitest';

import '../../js/bundle';
import AssetsLoader from '../../js/assets/AssetsLoader';
import { featureCollection, point, renderMap, stubContainerSize, waitForReady } from '../helpers';

const fixtures = resolve(__dirname, '../fixtures/maps');

function loadFixture(path) {
    return JSON.parse(readFileSync(resolve(fixtures, path), 'utf8'));
}

function minimalConfig(overrides = {}) {
    return {
        map: {
            options: {},
            view: { center: [52, 13], zoom: 8 },
            layers: [],
            controls: [{ controlId: 'z', type: 'zoom', options: {} }],
            ...overrides,
        },
    };
}

describe('<cowegis-map>', () => {
    it('renders layers, controls and panes from an inline config', async () => {
        const layerAdded = vi.fn();
        const { element, ready } = renderMap(loadFixture('basic.json'));
        element.addEventListener('cowegis:layer:add', layerAdded);

        await ready;

        expect(Object.keys(element.layers).sort()).toEqual(['d', 'g', 't']);
        expect(Object.keys(element.controls).sort()).toEqual(['f', 'z']);
        expect(element.layers.g.hasLayer(element.layers.t)).toBe(true);
        expect(element.layers.t.options.pane).toBe('custom');
        expect(element.map.getPane('custom').style.zIndex).toBe('450');
        expect(element.container.querySelector('.leaflet-control-zoom-fullscreen')).not.toBeNull();
        expect(layerAdded).toHaveBeenCalledTimes(3);
    });

    it('adjusts the view to the data after loading', async () => {
        stubContainerSize();
        const { element, ready } = renderMap(loadFixture('basic.json'));

        await ready;

        expect(element.map.getBounds().contains([[52.5, 13.4], [48.1, 11.5]])).toBe(true);
    });

    it('keeps the configured view if no bounds can be calculated', async () => {
        stubContainerSize();
        const config = minimalConfig({
            layers: [{
                layerId: 'd', type: 'data', title: 'Empty', initialVisible: true, options: { adjustBounds: true },
                data: { type: 'inline', format: 'geojson', data: featureCollection() },
            }],
            bounds: { adjustAfterLoad: true },
        });
        const { element, ready } = renderMap(config);

        await ready;

        expect(element.map.getCenter()).toMatchObject({ lat: 52, lng: 13 });
        expect(element.map.getZoom()).toBe(8);
    });

    it('places layers with unknown panes into the default pane', async () => {
        const config = minimalConfig({
            layers: [{
                layerId: 't', type: 'tileLayer', title: 'Tiles', initialVisible: true,
                urlTemplate: 'https://tiles.example/{z}/{x}/{y}.png', options: { pane: 'missing' },
            }],
        });
        const { element, ready } = renderMap(config);

        await ready;

        expect(element.layers.t.options.pane).toBe('tilePane');
    });

    it('loads the config from map-uri', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => ({ json: async () => minimalConfig() })));
        const element = document.createElement('cowegis-map');
        element.setAttribute('map-uri', '/api/map/1');
        const ready = waitForReady(element);

        document.body.append(element);
        await ready;

        expect(fetch).toHaveBeenCalledWith('/api/map/1');
        expect(element.controls.z).toBeDefined();
    });

    it('waits for a config script added after connecting', async () => {
        const element = document.createElement('cowegis-map');
        const ready = waitForReady(element);
        document.body.append(element);

        const script = document.createElement('script');
        script.type = 'application/vnd.cowegis.map+json';
        script.textContent = JSON.stringify(minimalConfig());
        element.append(script);
        await ready;

        expect(element.map.getZoom()).toBe(8);
    });

    it('renders multiple maps independently', async () => {
        const first = renderMap(minimalConfig({ view: { center: [52, 13], zoom: 8 } }));
        const second = renderMap(minimalConfig({ view: { center: [48, 11], zoom: 5 } }));

        await Promise.all([first.ready, second.ready]);

        expect(first.element.map).not.toBe(second.element.map);
        expect(first.element.controls.z).not.toBe(second.element.controls.z);
        expect(first.element.map.getZoom()).toBe(8);
        expect(second.element.map.getZoom()).toBe(5);
    });

    it('keeps layers and bounds of maps with the same layer ids apart', async () => {
        stubContainerSize();
        const config = (lng, lat) => minimalConfig({
            layers: [
                { layerId: 'g', type: 'layerGroupFactory', title: 'Group', initialVisible: true, options: {}, layers: ['d'] },
                {
                    layerId: 'd', type: 'data', title: 'Data', initialVisible: false, options: { adjustBounds: true },
                    data: { type: 'inline', format: 'geojson', data: featureCollection(point(lng, lat)) },
                },
            ],
            bounds: { adjustAfterLoad: true },
        });
        const first = renderMap(config(13.4, 52.5));
        const second = renderMap(config(-74, 40.7));

        await Promise.all([first.ready, second.ready]);

        expect(first.element.layers.g.getLayers()).toEqual([first.element.layers.d]);
        expect(second.element.layers.g.getLayers()).toEqual([second.element.layers.d]);
        expect(first.element.map.getCenter().lat).toBeCloseTo(52.5, 1);
        expect(second.element.map.getCenter().lat).toBeCloseTo(40.7, 1);
    });
});

describe('<cowegis-editor>', () => {
    it('enables the geoman toolbar', async () => {
        const config = minimalConfig({ editor: { toolbar: { position: 'topleft' }, language: 'de' } });
        const { element, ready } = renderMap(config, 'cowegis-editor');

        await ready;

        expect(element.map.pm).toBeDefined();
        expect(element.container.querySelector('.leaflet-pm-toolbar')).not.toBeNull();
    });
});

// Each directory contains a map config exported from the backend (map.json), the recorded responses of the data
// requests (responses.json, keyed by uri) and optionally the exported callbacks module (callbacks.js).
const backendFixtures = readdirSync(resolve(fixtures, 'backend'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

describe.runIf(backendFixtures.length > 0)('backend map configs', () => {
    it.each(backendFixtures)('%s', async (name) => {
        const directory = resolve(fixtures, 'backend', name);
        const config = loadFixture(`backend/${name}/map.json`);
        const responses = loadFixture(`backend/${name}/responses.json`);
        const load = AssetsLoader.prototype.load;
        vi.spyOn(AssetsLoader.prototype, 'load').mockImplementation(function (asset) {
            if (asset.type === 'callbacks') {
                return load.call(this, { ...asset, url: pathToFileURL(resolve(directory, 'callbacks.js')).href });
            }

            // Stylesheets and scripts cannot be loaded without a browser.
            return Promise.resolve();
        });
        vi.stubGlobal('fetch', vi.fn(async (uri) => {
            if (!Object.prototype.hasOwnProperty.call(responses, uri)) {
                throw new Error(`No recorded response for "${uri}"`);
            }

            return { json: async () => responses[uri] };
        }));
        const { element, ready } = renderMap(config);

        await ready;

        expect(Object.keys(element.layers).sort()).toEqual(config.map.layers.map((layer) => layer.layerId).sort());
        expect(Object.keys(element.controls).sort()).toEqual(config.map.controls.map((control) => control.controlId).sort());
        config.map.layers
            .filter((layer) => layer.type === 'data')
            .forEach((layer) => expect(element.layers[layer.layerId].getLayers().length, layer.title).toBeGreaterThan(0));
    });
});
