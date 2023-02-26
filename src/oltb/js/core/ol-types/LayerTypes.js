import { Tile, Vector } from 'ol/layer';

const FILENAME = 'ol-types/LayerTypes.js';

const LAYER_TYPES = Object.freeze({
    'Tile': Tile,
    'Vector': Vector
});

const instantiateLayer = function(name, options) {
    if(!(name in LAYER_TYPES)) {
        return null;
    }

    return new LAYER_TYPES[name](options);
}

export { LAYER_TYPES, instantiateLayer };