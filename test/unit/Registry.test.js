import { describe, expect, it } from 'vitest';

import Registry from '../../js/Registry';

describe('Registry', () => {
    it('returns a registered factory', async () => {
        const registry = new Registry();
        const factory = () => {};
        registry.register('example', factory);

        await expect(registry.get('example')).resolves.toBe(factory);
    });

    it('rejects unknown types', async () => {
        await expect(new Registry().get('missing')).rejects.toMatch('missing');
    });

    it('does not resolve inherited object properties', async () => {
        await expect(new Registry().get('toString')).rejects.toMatch('toString');
    });
});
