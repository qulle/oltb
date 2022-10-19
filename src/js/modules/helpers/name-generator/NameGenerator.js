import ADJECTIVES from './adjectives';
import ANIMALS from './animals';
import { randomNumber } from '../Random';

const generateAnimalName = function() {
    const animalIndex    = randomNumber(0, ANIMALS.length    - 1);
    const adjectiveIndex = randomNumber(0, ADJECTIVES.length - 1);

    return (ADJECTIVES[adjectiveIndex] + ' ' + ANIMALS[animalIndex]).capitalize();
}

export { generateAnimalName };