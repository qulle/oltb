import KML from 'ol/format/KML';
import GeoJSON from 'ol/format/GeoJSON';

const FORMAT_TYPES = {
    'GeoJSON': GeoJSON,
    'KML': KML
};

const instantiateFormat = function(name, options) {
    if(!(name in FORMAT_TYPES)) {
        return null;
    }

    return new FORMAT_TYPES[name](options);
}

export { 
    FORMAT_TYPES as default, 
    instantiateFormat 
};