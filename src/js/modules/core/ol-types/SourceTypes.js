import { TileWMS, XYZ, OSM, Vector } from 'ol/source';

const SOURCE_TYPES = {
    'TileWMS': TileWMS,
    'XYZ': XYZ,
    'OSM': OSM,
    'Vector': Vector
};

const instantiateSource = function(name, options) {
    if(!(name in SOURCE_TYPES)) {
        return null;
    }

    return new SOURCE_TYPES[name](options);
}

export { SOURCE_TYPES as default, instantiateSource };