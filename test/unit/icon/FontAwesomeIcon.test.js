import { describe, expect, it, vi } from 'vitest';

import FontAwesomeIcon from '../../../js/icon/FontAwesomeIcon';

describe('FontAwesomeIcon', () => {
    it('renders the configured icon into the pin', async () => {
        const div = new FontAwesomeIcon({ icon: 'house', iconSet: 'solid', color: '#ff0000' }).createIcon();

        await vi.waitFor(() => expect(div.querySelector('svg.cowegis-marker-icon')).not.toBeNull());

        const symbol = div.querySelector('svg.cowegis-marker-icon');
        expect(symbol.getAttribute('data-icon')).toBe('house');
        expect(symbol.getAttribute('width')).toBe('13');
        expect(symbol.style.color).toBe('#ff0000');
    });

    it('reports unknown icons', async () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});

        new FontAwesomeIcon({ icon: 'does-not-exist', iconSet: 'solid' }).createIcon();

        await vi.waitFor(() => expect(error).toHaveBeenCalledWith(
            'Could not resolve Font Awesome icon "does-not-exist" in icon set "solid"'
        ));
    });
});
