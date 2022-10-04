import LayerManager from "../core/managers/LayerManager";
import Toast from "../common/Toast";
import { toStringHDMS } from "ol/coordinate";
import { randomNumber } from "../helpers/Random";
import { generateWindbarb } from "../helpers/ol-functions/GenerateWindbarb";

import urlCapitalsGeoJSON from 'url:../../../json/capitals.geojson';

const ID_PREFIX = 'oltb-info-window-marker';

const CONTINENT_DIRECTION = {
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
};

const LAYER_WRAPPER = LayerManager.addFeatureLayer('Windbarbs', false, true);

fetch(urlCapitalsGeoJSON)
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
            const prettyCoords = toStringHDMS([lon, lat]);
        
            // Get SVG for winds between 0 and 40m/s (75knots)
            const windSpeed = randomNumber(0, 40);
            const rotation = CONTINENT_DIRECTION[capital.properties.continentName] || 0;

            const infoWindow = `
                <h3 class="oltb-text-center">${capital.properties.countryName} - ${capital.properties.countryCode}</h3>
                <p class="oltb-text-center">Wind speed ${windSpeed}m/s - Direction ${rotation}deg</p>
                <p class="oltb-text-center">${prettyCoords}</p>
                <div class="oltb-d-flex oltb-justify-content-center">
                    <button class="oltb-func-btn oltb-func-btn--delete oltb-tippy" title="Delete marker" id="${ID_PREFIX}-remove"></button>
                    <button class="oltb-func-btn oltb-func-btn--copy oltb-tippy" title="Copy marker text" id="${ID_PREFIX}-copy-location" data-copy="Wind speed ${windSpeed}m/s - Direction ${rotation}deg"></button>
                </div>
            `;

            LAYER_WRAPPER.layer.getSource().addFeature(
                new generateWindbarb({
                    lat: lat,
                    lon: lon,
                    fill: 'rgb(59, 67, 82)',
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
        console.error(`Error loading Windbarbs [${error}]`);
        Toast.error({text: 'Error loading Windbarbs layer'});  
    });