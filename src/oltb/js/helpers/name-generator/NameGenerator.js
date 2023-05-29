import { Animals } from './Animals';
import { Adjectives } from './Adjectives';
import { randomNumber } from '../browser/Random';

const ZERO_INDEX_OFFSET = 1;

const generateAnimalName = function() {
    const animalIndex    = randomNumber(0, Animals.length    - ZERO_INDEX_OFFSET);
    const adjectiveIndex = randomNumber(0, Adjectives.length - ZERO_INDEX_OFFSET);

    return (`${Adjectives[adjectiveIndex]} ${Animals[animalIndex]}`).capitalize();
}

export { generateAnimalName };