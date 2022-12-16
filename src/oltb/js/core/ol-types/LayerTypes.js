import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';

const LAYER_TYPES = Object.freeze({
    'Tile': TileLayer,
    'Vector': VectorLayer
});

const instantiateLayer = function(name, options) {
    if(!(name in LAYER_TYPES)) {
        return null;
    }

    return new LAYER_TYPES[name](options);
}

export { 
    LAYER_TYPES as default, 
    instantiateLayer 
};