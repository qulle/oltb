import { Tile, Vector } from 'ol/layer';

const LayerOptions = Object.freeze([
    {
        text: 'Tile',
        value: 'Tile'
    }, {
        text: 'Vector',
        value: 'Vector'
    }
]);

const LayerType = Object.freeze({
    'Tile': Tile,
    'Vector': Vector
});

const instantiateLayer = function(name, options) {
    if(!(name in LayerType)) {
        return null;
    }

    return new LayerType[name](options);
}

export { LayerOptions, LayerType, instantiateLayer };