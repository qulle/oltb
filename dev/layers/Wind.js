import { Toast } from "../../src/oltb/js/common/Toast";
import { toStringHDMS } from "ol/coordinate";
import { randomNumber } from "../../src/oltb/js/helpers/browser/Random";
import { LayerManager } from "../../src/oltb/js/core/managers/LayerManager";
import { generateWindbarb } from "../../src/oltb/js/generators/GenerateWindbarb";

import urlCapitalsGeoJSON from 'url:../geojson/capitals.geojson';

const ID_PREFIX = 'oltb-info-window-marker';
const CONTINENT_DIRECTION = Object.freeze({
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

const layerWrapper = LayerManager.addFeatureLayer('Windbarbs', false, true);
const geoJsonPromise = fetch(urlCapitalsGeoJSON)
    .then((response) => {
        if(!response.ok) {
            throw new Error(`Fetch error [${response.status}] [${response.statusText}]`);
        }

        return response.json();
    })
    .then((json) => {
        json.features.forEach((capital) => {
            const lon = capital.geometry.coordinates[0];
            const lat = capital.geometry.coordinates[1];
            const prettyCoordinates = toStringHDMS([lon, lat]);
        
            // Get windspeed between 0 and 40m/s (75knots)
            const windSpeed = randomNumber(0, 40);

            // Get example direction to not have all wind barbs facing the same way
            const rotation = CONTINENT_DIRECTION[capital.properties.continentName] || 0;
            const infoWindow = {
                title: capital.properties.countryName,
                content: `
                    <p>
                        Current wind speed is <strong>${windSpeed}m/s</strong>. The direction is <strong>${rotation}deg</strong>
                    </p>
                `,
                footer: `
                    <span class="oltb-info-window__coordinates">${prettyCoordinates}</span>
                    <div class="oltb-info-window__button-wrapper">
                        <button class="oltb-func-btn oltb-func-btn--delete oltb-tippy" title="Delete marker" id="${ID_PREFIX}-remove"></button>
                        <button class="oltb-func-btn oltb-func-btn--copy oltb-tippy" title="Copy marker text" id="${ID_PREFIX}-copy-location" data-copy="Wind speed ${windSpeed}m/s - Direction ${rotation}deg"></button>
                    </div>
                `
            };

            layerWrapper.layer.getSource().addFeature(
                new generateWindbarb({
                    lat: lat,
                    lon: lon,
                    fill: 'rgb(59, 67, 82)',
                    stroke: 'rgb(59, 67, 82)',
                    scale: .8,
                    windSpeed: windSpeed,
                    rotation: rotation,
                    notSelectable: true,
                    infoWindow: infoWindow,
                    strokeWidth: 3
                })
            );
        });
    })
    .catch((error) => {
        const errorMessage = 'Failed to load Windbarb layer';

        console.error(`${errorMessage} [${error}]`);
        Toast.error({
            title: 'Error',
            message: errorMessage
        }); 
    });