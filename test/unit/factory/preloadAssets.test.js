import { describe, expect, it, vi } from 'vitest';

import preloadAssets from '../../../js/factory/preloadAssets';

describe('preloadAssets', () => {
    it('loads all assets in parallel', async () => {
        const element = { assets: { load: vi.fn(async (asset) => asset.url) } };
        const assets = [{ type: 'javascript', url: 'a.js' }, { type: 'stylesheet', url: 'b.css' }];

        await expect(preloadAssets(assets, element)).resolves.toEqual(['a.js', 'b.css']);
        expect(element.assets.load).toHaveBeenCalledTimes(2);
    });

    it('fails if one asset fails', async () => {
        const element = { assets: { load: vi.fn(async () => { throw new Error('broken'); }) } };

        await expect(preloadAssets([{ type: 'javascript', url: 'a.js' }], element)).rejects.toThrow('broken');
    });
});
