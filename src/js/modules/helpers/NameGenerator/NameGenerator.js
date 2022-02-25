import Adjectives from './adjectives';
import Animals from './animals';

const generateAnimalName = function() {
    const randomAnimal = Math.floor(Math.random() * Animals.length);
    const randomAdjective = Math.floor(Math.random() * Adjectives.length);

    return (Adjectives[randomAdjective] + ' ' + Animals[randomAnimal]).capitalize();
}

export { generateAnimalName };