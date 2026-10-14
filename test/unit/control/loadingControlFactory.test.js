import { describe, expect, it } from 'vitest';

// Imported first on purpose: leaflet-loading registers itself on the global L while being imported.
import loadingControlFactory from '../../../js/control/loadingControlFactory';
import leaflet from '../../../js/leaflet';
import { createElement } from '../../helpers';

describe('loadingControlFactory', () => {
    it('resolves the zoom control reference', async () => {
        const element = createElement();
        element.controls.zoom = leaflet.control.zoom();

        const control = await loadingControlFactory({ options: { zoomControl: 'zoom' } }, element);

        expect(control.options.zoomControl).toBe(element.controls.zoom);
    });

    it('drops unknown zoom control references', async () => {
        const control = await loadingControlFactory({ options: { zoomControl: 'missing' } }, createElement());

        // leaflet-loading falls back to its default value.
        expect(control.options.zoomControl).toBeNull();
    });

    it('applies spinner defaults and loads spin.js', async () => {
        const control = await loadingControlFactory({ options: { spinjs: true } }, createElement());

        expect(control.options.spin).toMatchObject({ lines: 7, length: 3, width: 3, radius: 4, rotate: 13, top: '50%' });
        expect(globalThis.Spinner).toBeTypeOf('function');
    });
});
