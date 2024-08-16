import axios from 'axios';
import urlGeoJson from 'url:../geojson/capitals.geojson';
import { Toast } from '../../src/oltb/js/ui-common/ui-toasts/toast';
import { LogManager } from '../../src/oltb/js/toolbar-managers/log-manager/log-manager';
import { toStringHDMS } from 'ol/coordinate';
import { LayerManager } from '../../src/oltb/js/toolbar-managers/layer-manager/layer-manager';
import { FeatureManager } from '../../src/oltb/js/toolbar-managers/feature-manager/feature-manager';

const FILENAME = 'layers/Capitals.js';
const CLASS__FUNC_BUTTON = 'oltb-func-btn';
const ID__PREFIX_INFO_WINDOW = 'oltb-info-window-marker';

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
            fill: '#007C70FF',
            stroke: '#007C7066'
        },
        'Asia': {
            fill: '#2357B1FF',
            stroke: '#2357B166'
        },
        'Australia': {
            fill: '#007C70FF',
            stroke: '#007C7066'
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
        const timestamp = Date.now().toString();
        const placeholderImage = 'placeholder-1.jpeg';
        const description = `
            ${countryName} is a country located in ${continentName}.
            Its capital is ${capitalName} and its country code is ${countryCode}.
        `;

        const infoWindow = {
            title: countryName,
            content: `
                <p>${description}</p>
                <img src="./images/${placeholderImage}?cache=${timestamp}" alt="Placeholder Image" draggable="false" />
                <p>
                    Google has more information about <a href="//www.google.com/search?q=${countryName}" target="_blank" class="oltb-link">${countryName}</a>.
                </p>
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