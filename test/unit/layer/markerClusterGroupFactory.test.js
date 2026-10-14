import { describe, expect, it } from 'vitest';

// Imported first on purpose: leaflet.markercluster registers itself on the global L while being imported.
import markerClusterGroupFactory from '../../../js/layer/markerClusterGroupFactory';
import { announceLayer, createElement, fakeLayer } from '../../helpers';

describe('markerClusterGroupFactory', () => {
    it('shows visible layers and checks in hidden ones', async () => {
        const element = createElement();
        const visible = fakeLayer('visible', { initialVisible: true });
        const hidden = fakeLayer('hidden', { initialVisible: false });
        element.layers.visible = visible;
        element.layers.hidden = hidden;

        const cluster = await markerClusterGroupFactory({ options: {}, layers: ['visible', 'hidden'] }, element);
        element.map.addLayer(cluster);

        expect(cluster.getLayers()).toHaveLength(1);

        element.map.addLayer(hidden);

        expect(cluster.getLayers()).toHaveLength(2);
    });

    it('handles layers created later', async () => {
        const element = createElement();
        const cluster = await markerClusterGroupFactory({ options: {}, layers: ['later'] }, element);
        element.map.addLayer(cluster);

        announceLayer(element, fakeLayer('later', { initialVisible: true }));

        expect(cluster.getLayers()).toHaveLength(1);
    });

    it('checks in hidden layers created later', async () => {
        const element = createElement();
        const cluster = await markerClusterGroupFactory({ options: {}, layers: ['later'] }, element);
        element.map.addLayer(cluster);
        const hidden = fakeLayer('later', { initialVisible: false });

        announceLayer(element, hidden);
        expect(cluster.getLayers()).toHaveLength(0);

        element.map.addLayer(hidden);
        expect(cluster.getLayers()).toHaveLength(1);
    });

    it('is created even if a referenced layer never arrives', async () => {
        const cluster = await markerClusterGroupFactory({ options: {}, layers: ['never'] }, createElement());

        expect(cluster.getLayers()).toHaveLength(0);
    });
});
