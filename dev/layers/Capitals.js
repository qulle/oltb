import urlCapitalsGeoJson from 'url:../geojson/capitals.geojson';
import { Toast } from '../../src/oltb/js/common/Toast';
import { LogManager } from '../../src/oltb/js/managers/LogManager';
import { toStringHDMS } from 'ol/coordinate';
import { LayerManager } from '../../src/oltb/js/managers/LayerManager';
import { generateIconMarker } from '../../src/oltb/js/generators/GenerateIconMarker';

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
            stroke: '#FFFFFFFF'
        },
        'Africa': {
            fill: '#00959AFF', 
            stroke: '#FFFFFFFF'
        },
        'Antarctica': {
            fill: '#52489BFF', 
            stroke: '#FFFFFFFF'
        },
        'Asia': {
            fill: '#52489BFF', 
            stroke: '#FFFFFFFF'
        },
        'Australia': {
            fill: '#0080C5FF', 
            stroke: '#FFFFFFFF'
        },
        'Central America': {
            fill: '#0080C5FF', 
            stroke: '#FFFFFFFF'
        },
        'North America': {
            fill: '#0080C5FF', 
            stroke: '#FFFFFFFF'
        },
        'South America': {
            fill: '#0080C5FF', 
            stroke: '#FFFFFFFF'
        },
        'UM': {
            fill: '#0080C5FF', 
            stroke: '#FFFFFFFF'
        },
        'US': {
            fill: '#0080C5FF', 
            stroke: '#FFFFFFFF'
        }
    });

    return colors[name] || {
        fill: '#0166A5FF', 
        stroke: '#FFFFFFFF'
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

        const markerColor = getMarkerColor(continentName);
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

        LayerWrapper.getLayer().getSource().addFeature(
            new generateIconMarker({
                lon: coordinates[0],
                lat: coordinates[1],
                title: countryName,
                description: description,
                icon: 'geoMarker.filled',
                markerFill: markerColor.fill,
                markerStroke: markerColor.stroke,
                label: countryName,
                labelFill: '#FFFFFF',
                labelStroke: '#3B4352CC',
                labelStrokeWidth: 12,
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