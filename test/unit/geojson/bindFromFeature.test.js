import { describe, expect, it } from 'vitest';

import bindPopupFromFeature from '../../../js/geojson/bindPopupFromFeature';
import bindTooltipFromFeature from '../../../js/geojson/bindTooltipFromFeature';
import leaflet from '../../../js/leaflet';
import { createElement } from '../../helpers';

describe.each([
    ['popup', 'popups', bindPopupFromFeature, (layer) => layer.getPopup()],
    ['tooltip', 'tooltips', bindTooltipFromFeature, (layer) => layer.getTooltip()],
])('bind %s from feature', (property, presetKey, bind, getBound) => {
    it('does nothing without definition', () => {
        const marker = leaflet.marker([0, 0]);

        bind(marker, { properties: {} }, createElement());

        expect(getBound(marker)).toBeUndefined();
    });

    it('binds content and options', () => {
        const marker = leaflet.marker([0, 0]);
        const feature = { properties: { [property]: { content: 'Hello', options: { className: 'own' } } } };

        bind(marker, feature, createElement());

        expect(getBound(marker).getContent()).toBe('Hello');
        expect(getBound(marker).options.className).toBe('own');
    });

    it('merges preset options with feature options', () => {
        const element = createElement({ presets: { [presetKey]: { preset: { options: { className: 'preset', offset: [1, 2] } } } } });
        const marker = leaflet.marker([0, 0]);
        const feature = { properties: { [property]: { content: 'Hello', presetId: 'preset', options: { className: 'own' } } } };

        bind(marker, feature, element);

        expect(getBound(marker).options).toMatchObject({ className: 'own', offset: [1, 2] });
    });

    it('does not modify the shared preset', () => {
        const element = createElement({ presets: { [presetKey]: { preset: { options: { offset: [1, 2] } } } } });
        const feature = { properties: { [property]: { content: 'Hello', presetId: 'preset', options: { className: 'own' } } } };

        bind(leaflet.marker([0, 0]), feature, element);

        expect(element.config.map.presets[presetKey].preset.options).toEqual({ offset: [1, 2] });
    });

    it('binds configured events', () => {
        let opened = false;
        const element = createElement({ listeners: { onOpen: () => { opened = true; } } });
        const marker = leaflet.marker([0, 0]);
        const feature = { properties: { [property]: {
            content: 'Hello',
            options: {},
            events: [{ eventName: 'custom', reference: { namespace: null, reference: 'onOpen' } }],
        } } };

        bind(marker, feature, element);
        marker.fire('custom');

        expect(opened).toBe(true);
    });
});
