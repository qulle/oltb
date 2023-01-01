import { Toast } from "../../src/oltb/js/common/Toast";
import { toStringHDMS } from "ol/coordinate";
import { LayerManager } from "../../src/oltb/js/core/managers/LayerManager";
import { generateMarker } from '../../src/oltb/js/generators/GenerateMarker';
import { getIcon, SVG_PATHS } from "../../src/oltb/js/core/icons/GetIcon";

import urlCapitalsGeoJSON from 'url:../geojson/capitals.geojson';

const ID_PREFIX = 'oltb-info-window-marker';
const ICON = getIcon({
    path: SVG_PATHS.GeoMarker.Filled,
    width: 20,
    height: 20,
    fill: 'rgb(255, 255, 255)'
});

const CONTINENT_COLORS = Object.freeze({
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

const layerWrapper = LayerManager.addFeatureLayer('Capitals', true, true);
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
        
            const infoWindow = {
                title: capital.properties.countryName,
                content: `
                    <p>
                        <strong>${capital.properties.countryName}</strong> is a country located in <strong>${capital.properties.continentName}</strong>.
                        Its capital is <strong>${capital.properties.capitalName}</strong> and its country code is <strong>${capital.properties.countryCode}</strong>.
                    </p>
                    <p>
                        Google has more information about <a href="//www.google.com/search?q=${capital.properties.countryName}" target="_blank" class="oltb-link">${capital.properties.countryName}</a> 
                    </p>
                `,
                footer: `
                    <span class="oltb-info-window__coordinates">${prettyCoordinates}</span>
                    <div class="oltb-info-window__buttons-wrapper">
                        <button class="oltb-func-btn oltb-func-btn--delete oltb-tippy" title="Delete marker" id="${ID_PREFIX}-remove"></button>
                        <button class="oltb-func-btn oltb-func-btn--copy oltb-tippy" title="Copy marker text" id="${ID_PREFIX}-copy-location" data-copy="Country ${capital.properties.countryName} Capital ${capital.properties.capitalName} Coordinates ${prettyCoordinates}"></button>
                    </div>
                `
            };
        
            const backgroundColor = CONTINENT_COLORS[capital.properties.continentName] || '#6397C2FF';
        
            layerWrapper.layer.getSource().addFeature(
                new generateMarker({
                    lat: lat,
                    lon: lon,
                    icon: ICON,
                    backgroundColor: backgroundColor,
                    notSelectable: true,
                    infoWindow: infoWindow
                })
            );
        });
    })
    .catch((error) => {
        const errorMessage = 'Failed to load Capitals layer';

        console.error(`${errorMessage} [${error}]`);
        Toast.error({
            title: 'Error',
            message: errorMessage
        });
    });