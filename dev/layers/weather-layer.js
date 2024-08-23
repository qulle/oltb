import axios from 'axios';
import urlGeoJson from 'url:../geojson/capitals.geojson';
import { Toast } from '../../src/oltb/js/ui-common/ui-toasts/toast';
import { LogManager } from '../../src/oltb/js/toolbar-managers/log-manager/log-manager';
import { LayerManager } from '../../src/oltb/js/toolbar-managers/layer-manager/layer-manager';
import { FeatureManager } from '../../src/oltb/js/toolbar-managers/feature-manager/feature-manager';

const FILENAME = 'weather-layer.js';

const LayerWrapper = LayerManager.addFeatureLayer({
    id: '6c9751fc-a4cf-433b-8898-5cb7ca2f6d26',
    name: 'Weather',
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

        const countryName = capital.properties.countryName;
        const countryCode = capital.properties.countryCode;
        const capitalName = capital.properties.capitalName;
        const continentName = capital.properties.continentName;
        const description = `
            ${countryName} is a country located in ${continentName}.
            Its capital is ${capitalName} and its country code is ${countryCode}.
        `;

        const markerColor = getMarkerColor(continentName);
        const infoWindow = {
            title: '',
            content: `
                <div style="text-align: center;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="${markerColor.fill}" viewBox="0 0 16 16">
                        <path d="M2.658 11.026a.5.5 0 0 1 .316.632l-.5 1.5a.5.5 0 1 1-.948-.316l.5-1.5a.5.5 0 0 1 .632-.316m9.5 0a.5.5 0 0 1 .316.632l-.5 1.5a.5.5 0 0 1-.948-.316l.5-1.5a.5.5 0 0 1 .632-.316m-7.5 1.5a.5.5 0 0 1 .316.632l-.5 1.5a.5.5 0 1 1-.948-.316l.5-1.5a.5.5 0 0 1 .632-.316m9.5 0a.5.5 0 0 1 .316.632l-.5 1.5a.5.5 0 0 1-.948-.316l.5-1.5a.5.5 0 0 1 .632-.316m-7.105-1.25A.5.5 0 0 1 7.5 11h1a.5.5 0 0 1 .474.658l-.28.842H9.5a.5.5 0 0 1 .39.812l-2 2.5a.5.5 0 0 1-.875-.433L7.36 14H6.5a.5.5 0 0 1-.447-.724zm6.352-7.249a5.001 5.001 0 0 0-9.499-1.004A3.5 3.5 0 1 0 3.5 10H13a3 3 0 0 0 .405-5.973"/>
                    </svg>
                </div>
            `
        };

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
                key: 'cloudLightningRain.filled'
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