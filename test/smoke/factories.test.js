import { beforeEach, describe, expect, it, vi } from 'vitest';

import { controlTypes, iconTypes, layerTypes } from '../../js/bundle';
import leaflet from '../../js/leaflet';
import { createElement, featureCollection, point } from '../helpers';

const controls = {
    attribution: { options: {}, attributions: [] },
    fullscreen: { options: {} },
    geocoder: { options: {} },
    layers: { options: {}, baseLayers: [], overlays: [] },
    loading: { options: {} },
    scale: { options: {} },
    zoom: { options: {} },
};

const layers = {
    data: {
        options: {},
        data: { type: 'inline', format: 'geojson', data: featureCollection(point(13.4, 52.5)) },
    },
    featureGroup: { options: {}, layers: [] },
    layerGroupFactory: { options: {}, layers: [] },
    markerClusterGroup: { options: {}, layers: [] },
    overpass: { options: { query: 'node(BBOX);out;' } },
    provider: { options: {}, provider: 'OpenStreetMap', variant: null },
    tileLayer: { options: {}, urlTemplate: 'https://tiles.example/{z}/{x}/{y}.png' },
};

const icons = {
    div: { options: {} },
    fontAwesome: { options: {} },
    image: { options: { iconUrl: 'marker.png' } },
    svg: { options: {} },
};

function flushPromises() {
    return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('every registered type has a smoke fixture', () => {
    it.each([
        ['control', controlTypes, controls],
        ['layer', layerTypes, layers],
        ['icon', iconTypes, icons],
    ])('%s types', (kind, registry, fixtures) => {
        expect(Object.keys(registry.factories).sort()).toEqual(Object.keys(fixtures).sort());
    });
});

describe('control factories', () => {
    it.each(Object.entries(controls))('%s', async (type, config) => {
        const element = createElement();
        const factory = await controlTypes.get(type);
        const control = await factory(structuredClone(config), element);

        // leaflet-control-geocoder 4 mixes in L.Control instead of extending it, so instanceof is not reliable.
        element.map.addControl(control);
        expect(control.getContainer()).toBeInstanceOf(HTMLElement);
        element.map.removeControl(control);
    });
});

describe('layer factories', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn(async () => ({ json: async () => ({ elements: [] }) })));
    });

    it.each(Object.entries(layers))('%s', async (type, config) => {
        const element = createElement();
        const factory = await layerTypes.get(type);
        const layer = await factory(structuredClone(config), element);

        expect(layer).toBeInstanceOf(leaflet.Layer);
        element.map.addLayer(layer);
        expect(element.map.hasLayer(layer)).toBe(true);

        await flushPromises();
        element.map.removeLayer(layer);
    });
});

describe('icon factories', () => {
    it.each(Object.entries(icons))('%s', async (type, config) => {
        const element = createElement();
        const factory = await iconTypes.get(type);
        const icon = await factory(structuredClone(config), {}, element);

        expect(icon).toBeInstanceOf(leaflet.Icon);
        expect(icon.createIcon()).toBeInstanceOf(HTMLElement);
    });
});
