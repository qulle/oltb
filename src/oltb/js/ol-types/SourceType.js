import { TileWMS, XYZ, OSM, Vector } from 'ol/source';

const SourceOptions = Object.freeze([
    {
        text: 'TileWMS',
        value: 'TileWMS'
    }, {
        text: 'XYZ',
        value: 'XYZ'
    }, {
        text: 'OSM',
        value: 'OSM'
    }, {
        text: 'Vector',
        value: 'Vector'
    }
]);

const SourceType = Object.freeze({
    'TileWMS': TileWMS,
    'XYZ': XYZ,
    'OSM': OSM,
    'Vector': Vector
});

const instantiateSource = function(name, options) {
    if(!(name in SourceType)) {
        return null;
    }

    return new SourceType[name](options);
}

export { SourceOptions, SourceType, instantiateSource };