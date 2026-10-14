import { describe, expect, it, vi } from 'vitest';

import bindEvents, { determineListener } from '../../../js/factory/bindEvents';

describe('determineListener', () => {
    it('resolves a listener without namespace', () => {
        const listener = () => {};

        expect(determineListener({ namespace: null, reference: 'onClick' }, { listeners: { onClick: listener } }))
            .toBe(listener);
    });

    it('resolves a listener inside a nested namespace', () => {
        const listener = () => {};
        const element = { listeners: { map1: { layer: { onClick: listener } } } };

        expect(determineListener({ namespace: ['map1', 'layer'], reference: 'onClick' }, element)).toBe(listener);
    });
});

describe('bindEvents', () => {
    it('ignores missing event definitions', () => {
        const object = { on: vi.fn() };

        bindEvents(object, undefined, {});
        bindEvents(object, null, {});

        expect(object.on).not.toHaveBeenCalled();
    });

    it('binds every configured event', () => {
        const listener = () => {};
        const object = { on: vi.fn() };
        const events = [{ eventName: 'click', reference: { namespace: null, reference: 'onClick' } }];

        bindEvents(object, events, { listeners: { onClick: listener } });

        expect(object.on).toHaveBeenCalledWith('click', listener);
    });
});
