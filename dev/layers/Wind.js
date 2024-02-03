// Url imports
import urlCapitalsGeoJson from 'url:../geojson/capitals.geojson';

// Module imports
import _ from 'lodash';
import { Toast } from '../../src/oltb/js/common/Toast';
import { LogManager } from '../../src/oltb/js/managers/LogManager';
import { toStringHDMS } from 'ol/coordinate';
import { LayerManager } from '../../src/oltb/js/managers/LayerManager';
import { FeatureManager } from '../../src/oltb/js/managers/FeatureManager';

const FILENAME = 'layers/Wind.js';
const CLASS_FUNC_BUTTON = 'oltb-func-btn';
const ID_PREFIX_INFO_WINDOW = 'oltb-info-window-marker';

const LayerWrapper = LayerManager.addFeatureLayer({
    id: 'fd319a29-d2ac-4b2b-b018-dc86cff22600',
    name: 'Wind Barbs',
    isVisible: false,
    isSilent: true
});

const getWindDirection = function(continentName) {
    const windDirections = Object.freeze({
        'Europe': 5,
        'Africa': 110,
        'Antarctica': 65,
        'Asia': 65,
        'Australia': 65,
        'Central America': 210,
        'North America': 210,
        'South America': 210,
        'UM': 210,
        'US': 210
    });

    return windDirections[continentName] || 0;
}

const parseGeoJson = function(data) {
    data.features.forEach((capital) => {
        const coordinates = [
            Number(capital.geometry.coordinates[0]),
            Number(capital.geometry.coordinates[1])
        ];

        const prettyCoordinates = toStringHDMS(coordinates);

        const countryName = capital.properties.countryName;
        const continentName = capital.properties.continentName;

        // Get windspeed between 0 and 40m/s (75knots)
        // Get example direction to not have all wind barbs facing the same way
        const windSpeed = _.random(0, 40);
        const windDirection = getWindDirection(continentName);

        const description = `
            Current wind speed is ${windSpeed}m/s. The direction is ${windDirection}deg.
        `;
        
        const infoWindow = {
            title: countryName,
            content: `
                <p>${description}</p>
            `,
            footer: `
                <span class="oltb-info-window__coordinates">${prettyCoordinates}</span>
                <div class="oltb-info-window__buttons-wrapper">
                    <button class="${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--delete oltb-tippy" title="Delete Marker" id="${ID_PREFIX_INFO_WINDOW}-remove"></button>
                    <button class="${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--crosshair oltb-tippy" title="Copy Marker Coordinates" id="${ID_PREFIX_INFO_WINDOW}-copy-coordinates" data-oltb-coordinates="${prettyCoordinates}"></button>
                    <button class="${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--copy oltb-tippy" title="Copy Marker Text" id="${ID_PREFIX_INFO_WINDOW}-copy-text" data-oltb-copy="${description}"></button>
                    <button class="${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--layer oltb-tippy" title="Show Layer" id="${ID_PREFIX_INFO_WINDOW}-show-layer"></button>
                </div>
            `
        };

        const windBarb = FeatureManager.generateWindBarb({
            lon: coordinates[0],
            lat: coordinates[1],
            infoWindow: infoWindow,
            title: countryName,
            description: description,
            icon: {
                key: windSpeed,
                rotation: windDirection
            },
            label: {
                text: `${windSpeed}m/s`
            }
        });

        LayerWrapper.getLayer().getSource().addFeature(windBarb);
    });
}

fetch(urlCapitalsGeoJson)
    .then((response) => {
        if(!response.ok) {
            throw new Error('Failed to fetch local geojson', {
                cause: response
            });
        }

        return response.json();
    })
    .then((data) => {
        parseGeoJson(data);
    })
    .catch((error) => {
        const errorMessage = 'Failed to load Wind Barbs layer';
        LogManager.logError(FILENAME, 'geoJsonPromise', {
            message: errorMessage,
            error: error
        });

        Toast.error({
            title: 'Error',
            message: errorMessage
        }); 
    });