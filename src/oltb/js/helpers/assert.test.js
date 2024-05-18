import { describe, it, expect } from '@jest/globals';
import { Assert } from './assert';

describe('Assert', () => {
    it('should test isTrue', () => {
        expect(() => Assert.isTrue(true)).not.toThrow();
        expect(() => Assert.isTrue(false)).toThrow();
    });

    it('should test isFalse', () => {
        expect(() => Assert.isFalse(false)).not.toThrow();
        expect(() => Assert.isFalse(true)).toThrow();
    });

    it('should test equalTo', () => {
        expect(() => Assert.equalTo(1, 1)).not.toThrow();
        expect(() => Assert.equalTo(1, 2)).toThrow();

        expect(() => Assert.equalTo('A', 'A')).not.toThrow();
        expect(() => Assert.equalTo('A', 'B')).toThrow();
    });

    it('should test notEqualTo', () => {
        expect(() => Assert.notEqualTo(1, 2)).not.toThrow();
        expect(() => Assert.notEqualTo(1, 1)).toThrow();

        expect(() => Assert.notEqualTo('A', 'B')).not.toThrow();
        expect(() => Assert.notEqualTo('A', 'A')).toThrow();
    });

    it('should test objectIs', () => {
        expect(() => Assert.objectIs(1, 1)).not.toThrow();
        expect(() => Assert.objectIs(1, 2)).toThrow();

        const sameObject = {};
        expect(() => Assert.objectIs(sameObject, sameObject)).not.toThrow();
        expect(() => Assert.objectIs({}, {})).toThrow();

        const sameString = 'Foo';
        expect(() => Assert.objectIs(sameString, sameString)).not.toThrow();

        expect(() => Assert.objectIs('A', 'A')).not.toThrow();
        expect(() => Assert.objectIs('A', 'B')).toThrow();
    });

    it('should test objectIsNot', () => {
        expect(() => Assert.objectIsNot(1, 2)).not.toThrow();
        expect(() => Assert.objectIsNot(1, 1)).toThrow();

        const sameObject = {};
        expect(() => Assert.objectIsNot({}, {})).not.toThrow();
        expect(() => Assert.objectIsNot(sameObject, sameObject)).toThrow();

        const sameString = 'Foo';
        expect(() => Assert.objectIsNot(sameString, sameString)).toThrow();

        expect(() => Assert.objectIsNot('A', 'B')).not.toThrow();
        expect(() => Assert.objectIsNot('A', 'A')).toThrow();
    });

    it('should test greaterThan', () => {
        expect(() => Assert.greaterThan(2, 1)).not.toThrow();
        expect(() => Assert.greaterThan(2.0, 0.5)).not.toThrow();

        expect(() => Assert.greaterThan(1, 2)).toThrow();
        expect(() => Assert.greaterThan(0.5, 2.0)).toThrow();
    });

    it('should test greaterThanOrEqualTo', () => {
        expect(() => Assert.greaterThanOrEqualTo(2, 1)).not.toThrow();
        expect(() => Assert.greaterThanOrEqualTo(2, 2)).not.toThrow();
        expect(() => Assert.greaterThanOrEqualTo(2.0, 0.5)).not.toThrow();
        expect(() => Assert.greaterThanOrEqualTo(2.0, 2.0)).not.toThrow();

        expect(() => Assert.greaterThanOrEqualTo(1, 2)).toThrow();
        expect(() => Assert.greaterThanOrEqualTo(0.5, 2.0)).toThrow();
    });

    it('should test lessThan', () => {
        expect(() => Assert.lessThan(1, 2)).not.toThrow();
        expect(() => Assert.lessThan(0.5, 2.0)).not.toThrow();

        expect(() => Assert.lessThan(2, 1)).toThrow();
        expect(() => Assert.lessThan(2.0, 0.5)).toThrow();
    });

    it('should test lessThanOrEqualTo', () => {
        expect(() => Assert.lessThanOrEqualTo(1, 2)).not.toThrow();
        expect(() => Assert.lessThanOrEqualTo(2, 2)).not.toThrow();
        expect(() => Assert.lessThanOrEqualTo(0.5, 2.0)).not.toThrow();
        expect(() => Assert.lessThanOrEqualTo(2.0, 2.0)).not.toThrow();

        expect(() => Assert.lessThanOrEqualTo(2, 1)).toThrow();
        expect(() => Assert.lessThanOrEqualTo(2.0, 0.5)).toThrow();
    });
});