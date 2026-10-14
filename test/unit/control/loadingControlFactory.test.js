import { afterEach, describe, expect, it, vi } from 'vitest';

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

    describe('bottom button of the zoom control', () => {
        // happy-dom does not calculate a layout, leaflet-loading detects hidden buttons by their size.
        function stubButtonSize() {
            const size = function () {
                return this.classList.contains('leaflet-control-loading') && !this.classList.contains('is-loading') ? 0 : 30;
            };

            vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(size);
            vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(size);
        }

        async function setup() {
            stubButtonSize();

            const element = createElement();
            const control = await loadingControlFactory({ options: {} }, element);
            element.map.addControl(control);

            // A button appended to the zoom control after the loading control, e.g. by leaflet.fullscreen.
            const container = element.map.zoomControl.getContainer();
            const button = leaflet.DomUtil.create('a', 'leaflet-control-zoom-fullscreen', container);

            return { control, container, button };
        }

        function bottomButtons(container) {
            return Array.from(container.children).filter(
                (child) => child.classList.contains('leaflet-bar-part-bottom') && !child.classList.contains('leaflet-control-loading')
            );
        }

        afterEach(() => {
            vi.restoreAllMocks();
        });

        it('marks only the last visible button after loading', async () => {
            const { control, container, button } = await setup();

            control.addLoader('test');
            control.removeLoader('test');

            expect(bottomButtons(container)).toEqual([button]);
        });

        it('marks no other button while loading', async () => {
            const { control, container } = await setup();

            control.addLoader('test');

            expect(bottomButtons(container)).toEqual([]);
        });
    });
});
