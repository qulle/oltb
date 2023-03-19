import { KML } from 'ol/format';
import { GeoJSON } from 'ol/format';

const FILENAME = 'ol-types/FormatTypes.js';

const FormatTypes = Object.freeze({
    'GeoJSON': GeoJSON,
    'KML': KML
});

const instantiateFormat = function(name, options) {
    if(!(name in FormatTypes)) {
        return null;
    }

    return new FormatTypes[name](options);
}

export { FormatTypes, instantiateFormat };