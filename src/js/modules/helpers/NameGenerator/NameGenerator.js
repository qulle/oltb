import ADJECTIVES from './adjectives';
import ANIMALS from './animals';

const generateAnimalName = function() {
    const randomAnimal = Math.floor(Math.random() * ANIMALS.length);
    const randomAdjective = Math.floor(Math.random() * ADJECTIVES.length);

    return (ADJECTIVES[randomAdjective] + ' ' + ANIMALS[randomAnimal]).capitalize();
}

export { generateAnimalName };