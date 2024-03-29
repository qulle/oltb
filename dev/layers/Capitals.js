import urlCapitalsGeoJson from 'url:../geojson/capitals.geojson';
import { Toast } from '../../src/oltb/js/common/Toast';
import { LogManager } from '../../src/oltb/js/managers/LogManager';
import { toStringHDMS } from 'ol/coordinate';
import { LayerManager } from '../../src/oltb/js/managers/LayerManager';
import { FeatureManager } from '../../src/oltb/js/managers/FeatureManager';

const FILENAME = 'layers/Capitals.js';
const CLASS_FUNC_BUTTON = 'oltb-func-btn';
const ID_PREFIX_INFO_WINDOW = 'oltb-info-window-marker';

const LayerWrapper = LayerManager.addFeatureLayer({
    id: '73e8b36c-6aa2-42b9-a97d-0e8288916050',
    name: 'Capitals',
    isVisible: true,
    isSilent: true
});

const getMarkerColor = function(name) {
    const colors = Object.freeze({
        'Europe': {
            fill: '#0166A5FF', 
            stroke: '#0166A566'
        },
        'Africa': {
            fill: '#00959AFF', 
            stroke: '#00959A66'
        },
        'Antarctica': {
            fill: '#52489BFF', 
            stroke: '#52489B66'
        },
        'Asia': {
            fill: '#52489BFF', 
            stroke: '#52489B66'
        },
        'Australia': {
            fill: '#0080C5FF', 
            stroke: '#0080C566'
        },
        'Central America': {
            fill: '#0080C5FF', 
            stroke: '#0080C566'
        },
        'North America': {
            fill: '#0080C5FF', 
            stroke: '#0080C566'
        },
        'South America': {
            fill: '#0080C5FF', 
            stroke: '#0080C566'
        },
        'UM': {
            fill: '#0080C5FF', 
            stroke: '#0080C566'
        },
        'US': {
            fill: '#0080C5FF', 
            stroke: '#0080C566'
        }
    });

    return colors[name] || {
        fill: '#0166A5FF', 
        stroke: '#0166A566'
    };
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
        const description = `
            ${countryName} is a country located in ${continentName}.
            Its capital is ${capitalName} and its country code is ${countryCode}.
        `;

        const infoWindow = {
            title: countryName,
            content: `
                <p>${description}</p>
                <p>
                    Google has more information about <a href="//www.google.com/search?q=${countryName}" target="_blank" class="oltb-link">${countryName}</a>.
                </p>
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

        const markerColor = getMarkerColor(continentName);
        const marker = FeatureManager.generateIconMarker({
            lon: coordinates[0],
            lat: coordinates[1],
            title: countryName,
            description: description,
            infoWindow: infoWindow,
            marker: {
                fill: markerColor.fill,
                stroke: markerColor.stroke
            },
            icon: {
                key: 'geoMarker.filled'
            },
            label: {
                text: countryName
            }
        });

        LayerWrapper.getLayer().getSource().addFeature(marker);
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