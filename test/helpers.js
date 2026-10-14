import { vi } from 'vitest';

import leaflet from '../js/leaflet';

export function createElement({ presets = {}, listeners = {}, mapOptions = {} } = {}) {
    const container = document.createElement('div');
    document.body.append(container);

    const element = document.createElement('div');
    element.attachShadow({ mode: 'open' });
    element.map = leaflet.map(container, { maxZoom: 18, ...mapOptions }).setView([0, 0], 2);
    element.layers = {};
    element.controls = {};
    element.panes = {};
    element.listeners = listeners;
    element.config = {
        map: {
            presets: { icons: {}, popups: {}, tooltips: {}, ...presets },
        },
    };
    document.body.append(element);

    return element;
}

// happy-dom does not calculate a layout, Leaflet needs a container size for bounds and zoom calculations.
export function stubContainerSize(width = 800, height = 600) {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(width);
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(height);
}

export function point(lng, lat, properties = {}) {
    return { type: 'Feature', properties, geometry: { type: 'Point', coordinates: [lng, lat] } };
}

export function featureCollection(...features) {
    return { type: 'FeatureCollection', features };
}

export function fakeLayer(layerId, cowegis = {}) {
    const layer = leaflet.layerGroup([leaflet.marker([1, 1])]);
    layer.cowegis = { layerId, type: 'layerGroup', title: layerId, initialVisible: true, ...cowegis };

    return layer;
}

export function announceLayer(element, layer) {
    element.layers[layer.cowegis.layerId] = layer;
    element.dispatchEvent(new CustomEvent('cowegis:layer:add', {
        detail: { config: layer.cowegis, layer, element },
    }));
}

export function waitForReady(element) {
    return new Promise((resolve) => element.addEventListener('cowegis:ready', resolve, { once: true }));
}

export function renderMap(config, tagName = 'cowegis-map') {
    const element = document.createElement(tagName);
    const script = document.createElement('script');
    script.type = 'application/vnd.cowegis.map+json';
    script.textContent = JSON.stringify(config);
    element.append(script);

    const ready = waitForReady(element);
    document.body.append(element);

    return { element, ready };
}
