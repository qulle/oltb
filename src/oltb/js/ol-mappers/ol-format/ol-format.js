import { KML } from 'ol/format';
import { GeoJSON } from 'ol/format';

const FormatOptions = Object.freeze([
    {
        text: 'GeoJSON',
        value: 'GeoJSON'
    }, {
        text: 'KML',
        value: 'KML'
    }
]);

const FormatType = Object.freeze({
    'GeoJSON': GeoJSON,
    'KML': KML
});

const instantiateFormat = function(name, options) {
    if(!(name in FormatType)) {
        return null;
    }

    return new FormatType[name](options);
}

export { FormatOptions, FormatType, instantiateFormat };