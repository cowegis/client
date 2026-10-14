import { describe, expect, it } from 'vitest';

import pointToLayer from '../../../js/geojson/pointToLayer';
import leaflet from '../../../js/leaflet';
import { createElement } from '../../helpers';

const latlng = leaflet.latLng(52.5, 13.4);

describe('pointToLayer', () => {
    it('creates a marker by default', () => {
        expect(pointToLayer({ properties: {} }, latlng, createElement())).toBeInstanceOf(leaflet.Marker);
    });

    it('creates a marker for features without properties', () => {
        expect(pointToLayer({}, latlng, createElement())).toBeInstanceOf(leaflet.Marker);
    });

    it('creates the configured layer type with radius', () => {
        const layer = pointToLayer({ properties: { type: 'circleMarker', radius: 12 } }, latlng, createElement());

        expect(layer).toBeInstanceOf(leaflet.CircleMarker);
        expect(layer.getRadius()).toBe(12);
    });

    it('ignores the radius for markers', () => {
        expect(() => pointToLayer({ properties: { radius: 12 } }, latlng, createElement())).not.toThrow();
    });

    it('maps the pane id to the pane name', () => {
        const element = createElement();
        element.panes.p1 = { name: 'customPane' };

        const layer = pointToLayer({ properties: { options: { pane: 'p1' } } }, latlng, element);

        expect(layer.options.pane).toBe('customPane');
    });

    it('drops unknown panes', () => {
        const layer = pointToLayer({ properties: { options: { pane: 'unknown' } } }, latlng, createElement());

        expect(layer.options.pane).toBe('markerPane');
    });

    it('binds popup and tooltip from feature properties', () => {
        const feature = { properties: { popup: { content: 'Popup', options: {} }, tooltip: { content: 'Tooltip' } } };

        const layer = pointToLayer(feature, latlng, createElement());

        expect(layer.getPopup().getContent()).toBe('Popup');
        expect(layer.getTooltip().getContent()).toBe('Tooltip');
    });
});
