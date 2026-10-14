import { describe, expect, it, vi } from 'vitest';

import featureGroupFactory from '../../../js/layer/featureGroupFactory';
import layerGroupFactory from '../../../js/layer/layerGroupFactory';
import leaflet from '../../../js/leaflet';
import { announceLayer, createElement, fakeLayer } from '../../helpers';

describe.each([
    ['layerGroupFactory', layerGroupFactory, leaflet.LayerGroup],
    ['featureGroupFactory', featureGroupFactory, leaflet.FeatureGroup],
])('%s', (name, factory, type) => {
    it('creates the expected group type', async () => {
        expect(await factory({ options: {}, layers: [] }, createElement())).toBeInstanceOf(type);
    });

    it('contains layers that already exist', async () => {
        const element = createElement();
        const child = fakeLayer('a');
        element.layers.a = child;

        const group = await factory({ options: {}, layers: ['a'] }, element);

        expect(group.hasLayer(child)).toBe(true);
    });

    it('adds layers that are created later', async () => {
        const element = createElement();
        const group = await factory({ options: {}, layers: ['later'] }, element);
        const child = fakeLayer('later');

        announceLayer(element, child);

        expect(group.hasLayer(child)).toBe(true);
    });

    it('ignores layers it does not reference', async () => {
        const element = createElement();
        const group = await factory({ options: {}, layers: ['later'] }, element);
        const other = fakeLayer('other');

        announceLayer(element, other);

        expect(group.hasLayer(other)).toBe(false);
    });

    it('stops listening once all pending layers arrived', async () => {
        const element = createElement();
        const removeListener = vi.spyOn(element, 'removeEventListener');
        await factory({ options: {}, layers: ['later'] }, element);

        announceLayer(element, fakeLayer('later'));

        expect(removeListener).toHaveBeenCalledWith('cowegis:layer:add', expect.any(Function));
    });

    it('is created even if a referenced layer never arrives', async () => {
        const group = await factory({ options: {}, layers: ['never'] }, createElement());

        expect(group.getLayers()).toHaveLength(0);
    });
});
