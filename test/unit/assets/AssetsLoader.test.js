import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { describe, expect, it, vi } from 'vitest';

import AssetsLoader from '../../../js/assets/AssetsLoader';
import controlTypes from '../../../js/control';
import { createElement } from '../../helpers';

function fixture(name) {
    return pathToFileURL(resolve(__dirname, '../../fixtures/assets', name)).href;
}

// Captures inserted script/link nodes instead of letting happy-dom load them.
function captureInsert(target) {
    const captured = {};
    vi.spyOn(target, 'insertBefore').mockImplementation((node) => {
        captured.node = node;
        return node;
    });

    return captured;
}

describe('AssetsLoader', () => {
    it('loads javascript files asynchronously into the document head', async () => {
        const captured = captureInsert(document.head);
        const loading = new AssetsLoader(createElement()).load({ type: 'javascript', url: 'https://example.org/a.js' });

        expect(captured.node.src).toBe('https://example.org/a.js');
        expect(captured.node.async).toBe(true);
        captured.node.dispatchEvent(new Event('load'));

        await expect(loading).resolves.toBe('https://example.org/a.js');
    });

    it('rejects failing javascript files', async () => {
        const captured = captureInsert(document.head);
        const loading = new AssetsLoader(createElement()).load({ type: 'javascript', url: 'https://example.org/a.js' });

        captured.node.dispatchEvent(new Event('error'));

        await expect(loading).rejects.toThrow('Loading script "https://example.org/a.js" failed');
    });

    it('loads stylesheets into the shadow root', async () => {
        const element = createElement();
        const captured = captureInsert(element.shadowRoot);
        const loading = new AssetsLoader(element).load({ type: 'stylesheet', url: 'https://example.org/a.css' });

        expect(captured.node.rel).toBe('stylesheet');
        expect(captured.node.href).toBe('https://example.org/a.css');
        captured.node.dispatchEvent(new Event('load'));

        await expect(loading).resolves.toBe('https://example.org/a.css');
    });

    it('rejects failing stylesheets', async () => {
        const element = createElement();
        const captured = captureInsert(element.shadowRoot);
        const loading = new AssetsLoader(element).load({ type: 'stylesheet', url: 'https://example.org/a.css' });

        captured.node.dispatchEvent(new Event('error'));

        await expect(loading).rejects.toThrow('Loading stylesheet "https://example.org/a.css" failed');
    });

    it('registers default exported callbacks as listeners', async () => {
        const element = createElement();

        await new AssetsLoader(element).load({ type: 'callbacks', identifier: 'map1', url: fixture('callbacks.js') });

        expect(element.listeners.map1.onClick()).toBe('clicked');
    });

    it('falls back to callbacks registered on window', async () => {
        const element = createElement();
        const callbacks = { onClick: () => 'global' };
        vi.stubGlobal('globalCallbacks', callbacks);

        await new AssetsLoader(element).load({ type: 'callbacks', identifier: 'globalCallbacks', url: fixture('callbacks-global.js') });

        expect(element.listeners.globalCallbacks).toBe(callbacks);
    });

    it('rejects callbacks that cannot be resolved', async () => {
        const loading = new AssetsLoader(createElement())
            .load({ type: 'callbacks', identifier: 'unknownCallbacks', url: fixture('callbacks-global.js') });

        await expect(loading).rejects.toThrow('Could not load callbacks.');
    });

    it('registers components in the matching registry', async () => {
        await new AssetsLoader(createElement()).load({ type: 'component', url: fixture('component.js') });

        expect(controlTypes.factories.fixtureControl).toBeTypeOf('function');
    });

    it('rejects unsupported component types', async () => {
        const loading = new AssetsLoader(createElement()).load({ type: 'component', url: fixture('component-invalid.js') });

        await expect(loading).rejects.toThrow('Unsupported component provided');
    });

    it('rejects unsupported asset types', async () => {
        await expect(new AssetsLoader(createElement()).load({ type: 'font' })).rejects.toThrow('Unsupported asset type font');
    });
});
