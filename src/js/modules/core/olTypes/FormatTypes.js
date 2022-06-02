import GeoJSON from 'ol/format/GeoJSON';
import KML from 'ol/format/KML';

const FormatTypes = {
    'GeoJSON': GeoJSON,
    'KML': KML
};

const instantiateFormat = function(name, options) {
    if(!(name in FormatTypes)) {
        return null;
    }

    return new FormatTypes[name](options);
}

export { FormatTypes as default, instantiateFormat };