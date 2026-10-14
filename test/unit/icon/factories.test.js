import { describe, expect, it } from 'vitest';

import divIconFactory from '../../../js/icon/divIconFactory';
import fontAwesomeIconFactory from '../../../js/icon/fontAwesomeIconFactory';
import imageIconFactory from '../../../js/icon/imageIconFactory';
import svgIconFactory from '../../../js/icon/svgIconFactory';
import leaflet from '../../../js/leaflet';
import { createElement } from '../../helpers';

describe('divIconFactory', () => {
    it('creates a div icon without modifying the config', () => {
        const config = { options: { className: 'custom' } };

        const icon = divIconFactory(config, {}, createElement());
        icon.options.html = 'changed';

        expect(icon).toBeInstanceOf(leaflet.DivIcon);
        expect(config.options).toEqual({ className: 'custom' });
    });
});

describe('imageIconFactory', () => {
    it('merges feature properties into the icon options', () => {
        const icon = imageIconFactory({ options: { iconUrl: 'a.png', iconSize: [10, 10] } }, { iconSize: [20, 20] }, createElement());

        expect(icon.options.iconUrl).toBe('a.png');
        expect(icon.options.iconSize).toEqual([20, 20]);
    });
});

describe('svgIconFactory', () => {
    it('maps simplestyle properties to icon colors', () => {
        const icon = svgIconFactory({ options: {} }, { 'marker-color': '#123456', 'symbol-color': '#abcdef' }, createElement());

        expect(icon.options.bgColor).toBe('#123456');
        expect(icon.options.color).toBe('#abcdef');
    });

    it('renders the pin and optional html content', () => {
        const icon = svgIconFactory({ options: { html: '<b>1</b>', color: '#abcdef' } }, {}, createElement());

        const div = icon.createIcon();

        expect(div.querySelector('svg.cowegis-marker-pin path').getAttribute('fill')).toBe('#80c22a');
        expect(div.querySelector('.cowegis-marker-content').innerHTML).toBe('<b>1</b>');
        expect(div.querySelector('.cowegis-marker-content').style.color).toBe('#abcdef');
    });
});

describe('fontAwesomeIconFactory', () => {
    it('maps simplestyle properties to icon options', () => {
        const properties = { 'marker-color': '#123456', 'marker-symbol': 'house', 'symbol-color': '#abcdef' };

        const icon = fontAwesomeIconFactory({ options: {} }, properties, createElement());

        expect(icon.options).toMatchObject({ bgColor: '#123456', icon: 'house', color: '#abcdef' });
    });

    it('adds the font awesome attribution once the map is ready', () => {
        const element = createElement();
        fontAwesomeIconFactory({ options: {} }, {}, element);

        element.dispatchEvent(new CustomEvent('cowegis:ready'));

        // _attributions is Leaflet internal API.
        expect(Object.keys(element.map.attributionControl._attributions).join()).toContain('fontawesome.com');
    });
});
