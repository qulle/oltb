import { Toast } from "../../src/oltb/js/common/Toast";
import { LogManager } from "../../src/oltb/js/core/managers/LogManager";
import { toStringHDMS } from "ol/coordinate";
import { randomNumber } from "../../src/oltb/js/helpers/browser/Random";
import { LayerManager } from "../../src/oltb/js/core/managers/LayerManager";
import { generateWindBarb } from "../../src/oltb/js/generators/GenerateWindBarb";

import urlCapitalsGeoJson from 'url:../geojson/capitals.geojson';

const FILENAME = 'layers/Wind.js';
const ID_PREFIX = 'oltb-info-window-marker';
const FUNC_BUTTON_CLASS = 'oltb-func-btn';

const LayerWrapper = LayerManager.addFeatureLayer('Wind Barbs', false, true);

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
        const windSpeed = randomNumber(0, 40);

        // Get example direction to not have all wind barbs facing the same way
        const windDirection = getWindDirection(continentName);

        const description = `
            Current wind speed is ${windSpeed}m/s. The direction is ${windDirection}deg
        `;
        
        const infoWindow = {
            title: countryName,
            content: `
                <p>${description}</p>
            `,
            footer: `
                <span class="oltb-info-window__coordinates">${prettyCoordinates}</span>
                <div class="oltb-info-window__buttons-wrapper">
                    <button class="${FUNC_BUTTON_CLASS} ${FUNC_BUTTON_CLASS}--delete oltb-tippy" title="Delete marker" id="${ID_PREFIX}-remove"></button>
                    <button class="${FUNC_BUTTON_CLASS} ${FUNC_BUTTON_CLASS}--crosshair oltb-tippy" title="Copy marker coordinates" id="${ID_PREFIX}-copy-coordinates" data-coordinates="${prettyCoordinates}"></button>
                    <button class="${FUNC_BUTTON_CLASS} ${FUNC_BUTTON_CLASS}--copy oltb-tippy" title="Copy marker text" id="${ID_PREFIX}-copy-text" data-copy="${description}"></button>
                </div>
            `
        };

        LayerWrapper.getLayer().getSource().addFeature(
            new generateWindBarb({
                lon: coordinates[0],
                lat: coordinates[1],
                title: countryName,
                description: description,
                fill: '#3B4352FF',
                stroke: '#3B4352FF',
                scale: .8,
                windSpeed: windSpeed,
                rotation: windDirection,
                infoWindow: infoWindow
            })
        );
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