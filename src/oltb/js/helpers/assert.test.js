import { Assert } from './assert';

describe('Assert', () => {
    it('should test isTrue', () => {
        expect(() => Assert.isTrue(true)).not.toThrow();
        expect(() => Assert.isTrue(false)).toThrow();
    });
});