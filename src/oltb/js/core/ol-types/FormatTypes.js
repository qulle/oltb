import { KML } from 'ol/format';
import { GeoJSON } from 'ol/format';

const FILENAME = 'ol-types/FormatTypes.js';
const FORMAT_TYPES = Object.freeze({
    'GeoJSON': GeoJSON,
    'KML': KML
});

const instantiateFormat = function(name, options) {
    if(!(name in FORMAT_TYPES)) {
        return null;
    }

    return new FORMAT_TYPES[name](options);
}

export { FORMAT_TYPES, instantiateFormat };