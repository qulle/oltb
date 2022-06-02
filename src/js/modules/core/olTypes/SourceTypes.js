import {
    TileWMS, 
    XYZ,
    OSM,
    Vector
} from 'ol/source';

const SourceTypes = {
    'TileWMS': TileWMS,
    'XYZ': XYZ,
    'OSM': OSM,
    'Vector': Vector
};

const instantiateSource = function(name, options) {
    if(!(name in SourceTypes)) {
        return null;
    }

    return new SourceTypes[name](options);
}

export { SourceTypes as default, instantiateSource };