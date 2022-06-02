import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';

const LayerTypes = {
    'Tile': TileLayer,
    'Vector': VectorLayer
};

const instantiateLayer = function(name, options) {
    if(!(name in LayerTypes)) {
        return null;
    }

    return new LayerTypes[name](options);
}

export { LayerTypes as default, instantiateLayer };