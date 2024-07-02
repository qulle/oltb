import { describe, it, expect } from '@jest/globals';
import './string';

describe('String', () => {
    it('should test prototype [startsWithCapital]', () => {
        const lowercaseAll = 'jest';
        const uppercaseFirst = 'Jest';
        const uppercaseSecond = 'jEst'

        expect(lowercaseAll.startsWithCapital()).toBe(false);
        expect(uppercaseFirst.startsWithCapital()).toBe(true);
        expect(uppercaseSecond.startsWithCapital()).toBe(false);
    });

    it('should test prototype [capitalize]', () => {
        const lowercaseAll = 'jest';
        const uppercaseFirst = lowercaseAll.capitalize();

        expect(lowercaseAll.startsWithCapital()).toBe(false);
        expect(uppercaseFirst.startsWithCapital()).toBe(true);
    });

    it('should test prototype [isDigitsOnly]', () => {
        const digits = '1234';
        const letters = 'jest';
        const mixed = '12a34';

        expect(digits.isDigitsOnly()).toBe(true);
        expect(letters.isDigitsOnly()).toBe(false);
        expect(mixed.isDigitsOnly()).toBe(false);
    });

    it('should test prototype [ellipsis]', () => {
        const shortString = 'jest';
        const longerString = 'foobar';
        const limit = 5;
        
        expect(shortString.ellipsis(limit)).toBe('jest');
        expect(longerString.ellipsis(limit)).toBe('fooba...');
    });
});