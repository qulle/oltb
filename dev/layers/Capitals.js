import urlCapitalsGeoJson from 'url:../geojson/capitals.geojson';
import { Toast } from "../../src/oltb/js/common/Toast";
import { LogManager } from "../../src/oltb/js/core/managers/LogManager";
import { toStringHDMS } from "ol/coordinate";
import { LayerManager } from "../../src/oltb/js/core/managers/LayerManager";
import { generateMarker } from '../../src/oltb/js/generators/GenerateMarker';

const FILENAME = 'layers/Capitals.js';
const CLASS_FUNC_BUTTON = 'oltb-func-btn';
const ID_PREFIX_INFO_WINDOW = 'oltb-info-window-marker';

const LayerWrapper = LayerManager.addFeatureLayer({
    id: '73e8b36c-6aa2-42b9-a97d-0e8288916050',
    name: 'Capitals',
    visible: true,
    silent: true
});

const getFillColor = function(continentName) {
    const fillColors = Object.freeze({
        'Europe': '#5B88D6FF',
        'Africa': '#68B9E5FF',
        'Antarctica': '#3CAEA3FF',
        'Asia': '#56BABDFF',
        'Australia': '#6397C2FF',
        'Central America': '#9085E4FF',
        'North America': '#9085E4FF',
        'South America': '#9085E4FF',
        'UM': '#9085E4FF',
        'US': '#9085E4FF'
    });

    return fillColors[continentName] || '#6397C2FF';
}

const parseGeoJson = function(data) {
    data.features.forEach((capital) => {
        const coordinates = [
            Number(capital.geometry.coordinates[0]),
            Number(capital.geometry.coordinates[1])
        ];

        const prettyCoordinates = toStringHDMS(coordinates);

        const countryName = capital.properties.countryName;
        const countryCode = capital.properties.countryCode;
        const capitalName = capital.properties.capitalName;
        const continentName = capital.properties.continentName;

        const fill = getFillColor(continentName);

        const description = `
            ${countryName} is a country located in ${continentName}.
            Its capital is ${capitalName} and its country code is ${countryCode}
        `;

        const infoWindow = {
            title: countryName,
            content: `
                <p>${description}</p>
                <p>
                    Google has more information about <a href="//www.google.com/search?q=${countryName}" target="_blank" class="oltb-link">${countryName}</a> 
                </p>
            `,
            footer: `
                <span class="oltb-info-window__coordinates">${prettyCoordinates}</span>
                <div class="oltb-info-window__buttons-wrapper">
                    <button class="${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--delete oltb-tippy" title="Delete marker" id="${ID_PREFIX_INFO_WINDOW}-remove"></button>
                    <button class="${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--crosshair oltb-tippy" title="Copy marker coordinates" id="${ID_PREFIX_INFO_WINDOW}-copy-coordinates" data-coordinates="${prettyCoordinates}"></button>
                    <button class="${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--copy oltb-tippy" title="Copy marker text" id="${ID_PREFIX_INFO_WINDOW}-copy-text" data-copy="${description}"></button>
                </div>
            `
        };

        LayerWrapper.getLayer().getSource().addFeature(
            new generateMarker({
                lon: coordinates[0],
                lat: coordinates[1],
                title: countryName,
                description: description,
                icon: 'geoMarker.filled',
                fill: fill,
                notSelectable: true,
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
        const errorMessage = 'Failed to load Capitals layer';
        LogManager.logError(FILENAME, 'geoJsonPromise', {
            message: errorMessage,
            error: error
        });

        Toast.error({
            title: 'Error',
            message: errorMessage
        });
    });