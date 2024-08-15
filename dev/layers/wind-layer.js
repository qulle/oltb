import _ from 'lodash';
import axios from 'axios';
import urlGeoJson from 'url:../geojson/capitals.geojson';
import { Toast } from '../../src/oltb/js/ui-common/ui-toasts/toast';
import { LogManager } from '../../src/oltb/js/toolbar-managers/log-manager/log-manager';
import { toStringHDMS } from 'ol/coordinate';
import { LayerManager } from '../../src/oltb/js/toolbar-managers/layer-manager/layer-manager';
import { FeatureManager } from '../../src/oltb/js/toolbar-managers/feature-manager/feature-manager';

const FILENAME = 'layers/Wind.js';
const CLASS__FUNC_BUTTON = 'oltb-func-btn';
const ID__PREFIX_INFO_WINDOW = 'oltb-info-window-marker';

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

        // Note:
        // Get windspeed between 0 and 40m/s (75knots)
        // Get example direction to not have all wind barbs facing the same way
        const windSpeed = _.random(0, 40);
        const windDirection = getWindDirection(continentName);
        const timestamp = Date.now().toString();
        const placeholderImage = 'placeholder-9.jpeg';
        const description = `
            Current wind speed is ${windSpeed}m/s. The direction is ${windDirection}deg.
        `;

        const infoWindow = {
            title: countryName,
            content: `
                <p>${description}</p>
                <img src="./images/${placeholderImage}?cache=${timestamp}" alt="Placeholder Image" draggable="false" />
            `,
            footer: `
                <span class="oltb-info-window__coordinates">${prettyCoordinates}</span>
                <div class="oltb-info-window__buttons-wrapper">
                    <button class="${CLASS__FUNC_BUTTON} ${CLASS__FUNC_BUTTON}--delete oltb-tippy" title="Delete Marker" id="${ID__PREFIX_INFO_WINDOW}-remove"></button>
                    <button class="${CLASS__FUNC_BUTTON} ${CLASS__FUNC_BUTTON}--crosshair oltb-tippy" title="Copy Marker Coordinates" id="${ID__PREFIX_INFO_WINDOW}-copy-coordinates" data-oltb-coordinates="${prettyCoordinates}"></button>
                    <button class="${CLASS__FUNC_BUTTON} ${CLASS__FUNC_BUTTON}--copy oltb-tippy" title="Copy Marker Text" id="${ID__PREFIX_INFO_WINDOW}-copy-text" data-oltb-copy="${description}"></button>
                    <button class="${CLASS__FUNC_BUTTON} ${CLASS__FUNC_BUTTON}--layer oltb-tippy" title="Show Layer" id="${ID__PREFIX_INFO_WINDOW}-show-layer"></button>
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

axios.get(urlGeoJson, {
    responseType: 'application/json',
    headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0',
    }
}).then((response) => {
    if(response.status !== 200) {
        throw new Error('Failed to fetch local geojson', {
            cause: response
        });
    }

    return JSON.parse(response.data);
}).then((data) => {
    parseGeoJson(data);
}).catch((error) => {
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