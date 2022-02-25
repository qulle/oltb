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

export default SourceTypes;