import LayerManager from "../core/Managers/LayerManager";
import Toast from "../common/Toast";
import { toStringHDMS } from "ol/coordinate";
import { getIcon, SVGPaths } from "../core/Icons";
import { generateMarker } from '../helpers/olFunctions/Marker';

import urlCapitalsGeoJSON from 'url:../../../json/capitals.geojson';

const icon = getIcon({
    path: SVGPaths.GeoMarkerFilled,
    width: 20,
    height: 20,
    fill: 'rgb(255, 255, 255)'
});

const continentColors = {
    'Europe': '#0166A5FF',
    'Africa': '#007C70FF',
    'Antarctica': '#F67D2CFF',
    'Asia': '#FBBD02FF',
    'Australia': '#EB4542FF',
    'Central America': '#3B4352FF',
    'North America': '#3B4352FF',
    'South America': '#3B4352FF',
    'UM': '#3B4352FF',
    'US': '#3B4352FF'
};

const layerWrapper = LayerManager.addFeatureLayer('Capitals', true);

fetch(urlCapitalsGeoJSON)
    .then(async (response) => {
        if(!response.ok) {
            throw new Error(`Fetch error [${response.status}] [${response.statusText}]`);
        }

        const capitals = await response.json();

        capitals.features.forEach((capital) => {
            const lon = capital.geometry.coordinates[0];
            const lat = capital.geometry.coordinates[1];
            const prettyCoords = toStringHDMS([lon, lat]);
        
            const infoWindow = `
                <h3 class="oltb-text-center">${capital.properties.countryName} - ${capital.properties.countryCode}</h3>
                <p class="oltb-text-center">${capital.properties.capitalName} - ${capital.properties.continentName}</p>
                <p class="oltb-text-center">${prettyCoords}</p>
                <div class="oltb-d-flex oltb-justify-content-center">
                    <button class="oltb-func-btn oltb-func-btn--delete oltb-tippy" title="Delete marker" id="oltb-info-window-remove-marker"></button>
                    <button class="oltb-func-btn oltb-func-btn--copy oltb-tippy" title="Copy marker text" id="oltb-info-window-copy-marker-location" data-copy="Country ${capital.properties.countryName} Capital ${capital.properties.capitalName} Coordinates ${prettyCoords}"></button>
                </div>
            `;
        
            const backgroundColor = continentColors[capital.properties.continentName] || '#223344FF';
        
            layerWrapper.layer.getSource().addFeatures(
                new generateMarker({
                    lat: lat,
                    lon: lon,
                    icon: icon,
                    backgroundColor: backgroundColor,
                    notSelectable: true,
                    infoWindow: infoWindow
                })
            );
        });
    })
    .catch((error) => {
        console.error(`Error loading Capitals [${error}]`);
        Toast.error({text: 'Error loading Capitals layer'});  
    });