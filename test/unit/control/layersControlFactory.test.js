import { describe, expect, it } from 'vitest';

import layersControlFactory from '../../../js/control/layersControlFactory';
import { announceLayer, createElement, fakeLayer } from '../../helpers';

// control._layers is Leaflet internal API, but the only way to inspect registered layers without rendering.
function entries(control) {
    return control._layers.map((entry) => [entry.layer.cowegis.layerId, !!entry.overlay, entry.name]);
}

describe('layersControlFactory', () => {
    it('registers existing base layers and overlays with default names', async () => {
        const element = createElement();
        element.layers.base = fakeLayer('base', { type: 'tileLayer', title: 'Base' });
        element.layers.overlay = fakeLayer('overlay', { type: 'data', title: 'Overlay' });

        const control = await layersControlFactory({ options: {}, baseLayers: ['base'], overlays: ['overlay'] }, element);

        expect(entries(control)).toEqual([
            ['base', false, '<span class="cowegis-layer cowegis-layer-tileLayer">Base</span>'],
            ['overlay', true, '<span class="cowegis-layer cowegis-layer-data">Overlay</span>'],
        ]);
    });

    it('adds layers created later', async () => {
        const element = createElement();
        const control = await layersControlFactory({ options: {}, baseLayers: [], overlays: ['later'] }, element);

        announceLayer(element, fakeLayer('later'));

        expect(entries(control).map(([id, overlay]) => [id, overlay])).toEqual([['later', true]]);
    });

    it('sorts layers by configuration order even if they arrive later', async () => {
        const element = createElement();
        element.layers.b = fakeLayer('b');
        const control = await layersControlFactory({ options: {}, baseLayers: ['a', 'b'], overlays: [] }, element);

        announceLayer(element, fakeLayer('a'));

        expect(entries(control).map(([id]) => id)).toEqual(['a', 'b']);
    });

    it('uses a configured name function', async () => {
        const element = createElement({ listeners: { names: { label: (layer) => 'Label ' + layer.cowegis.title } } });
        element.layers.base = fakeLayer('base', { title: 'Base' });
        const config = {
            options: { nameFunction: { namespace: ['names'], reference: 'label' } },
            baseLayers: ['base'],
            overlays: [],
        };

        const control = await layersControlFactory(config, element);

        expect(entries(control)[0][2]).toBe('Label Base');
    });

    it('uses a configured sort function', async () => {
        const element = createElement({ listeners: {
            descending: (a, b) => b.cowegis.title.localeCompare(a.cowegis.title),
        } });
        element.layers.a = fakeLayer('a', { title: 'A' });
        element.layers.b = fakeLayer('b', { title: 'B' });
        const config = {
            options: { sortLayers: true, sortFunction: { namespace: null, reference: 'descending' } },
            baseLayers: ['a', 'b'],
            overlays: [],
        };

        const control = await layersControlFactory(config, element);

        expect(entries(control).map(([id]) => id)).toEqual(['b', 'a']);
    });

    it('is created even if a referenced layer never arrives', async () => {
        const control = await layersControlFactory({ options: {}, baseLayers: ['never'], overlays: [] }, createElement());

        expect(control._layers).toHaveLength(0);
    });
});
