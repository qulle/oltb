import { Tile, Vector } from 'ol/layer';

const LayerOptions = Object.freeze([
    {
        text: 'Tile',
        value: 'Tile'
    },
    {
        text: 'Vector',
        value: 'Vector'
    }
]);

const LayerTypes = Object.freeze({
    'Tile': Tile,
    'Vector': Vector
});

const instantiateLayer = function(name, options) {
    if(!(name in LayerTypes)) {
        return null;
    }

    return new LayerTypes[name](options);
}

export { LayerOptions, LayerTypes, instantiateLayer };