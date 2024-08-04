import { describe, it, expect } from '@jest/globals';
import { IgnoredKeys } from './igenored-keys';

describe('IgnoredKeys', () => {
    const sut = Object.freeze([
        'marker',
        'tooltip',
        'onChangeListener'
    ]);

    it('should have the same structure as the runtime-object', () => {
        expect(IgnoredKeys).toStrictEqual(sut);
    });
});
