import _ from 'lodash';
import { Animals } from './animals';
import { Adjectives } from './adjectives';

const INDEX_OFFSET = 1;

const generateAnimalName = function() {
    const animalIndex = _.random(0, Animals.length - INDEX_OFFSET);
    const adjectiveIndex = _.random(0, Adjectives.length - INDEX_OFFSET);

    return (`${Adjectives[adjectiveIndex]} ${Animals[animalIndex]}`).capitalize();
}

export { generateAnimalName };