import { Animals } from './Animals';
import { Adjectives } from './Adjectives';
import { randomNumber } from '../browser/Random';

const FILENAME = 'name-generator/NameGenerator.js';

const generateAnimalName = function() {
    const animalIndex    = randomNumber(0, Animals.length    - 1);
    const adjectiveIndex = randomNumber(0, Adjectives.length - 1);

    return (`${Adjectives[adjectiveIndex]} ${Animals[animalIndex]}`).capitalize();
}

export { generateAnimalName };