import { describe, it, expect } from '@jest/globals';
import { generateAnimalName } from './name-generator';
import '../../helpers/prototypes/string';

describe('NameGenerator', () => {
    it('should create a concatenated animal and adjective', () => {
        const animal = generateAnimalName();
        expect(animal.length).toBeGreaterThan(0);
        expect(animal).toContain(' ');
    });
});