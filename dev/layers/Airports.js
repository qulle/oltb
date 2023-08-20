import urlAirportsGeoJson from 'url:../geojson/airports.geojson';
import { Toast } from '../../src/oltb/js/common/Toast';
import { LogManager } from '../../src/oltb/js/core/managers/LogManager';
import { toStringHDMS } from 'ol/coordinate';
import { LayerManager } from '../../src/oltb/js/core/managers/LayerManager';
import { generateIconMarker } from '../../src/oltb/js/generators/GenerateIconMarker';

const FILENAME = 'layers/Airports.js';
const CLASS_FUNC_BUTTON = 'oltb-func-btn';
const ID_PREFIX_INFO_WINDOW = 'oltb-info-window-marker';

const LayerWrapper = LayerManager.addFeatureLayer({
    id: '91a9a06f-7e49-4f85-a204-58dc7ab6a95e',
    name: '50 Busiest Airports',
    isVisible: false,
    isSilent: true
});

const parseGeoJson = function(data) {
    data.features.forEach((airport) => {
        const coordinates = [
            Number(airport.geometry.coordinates[0]),
            Number(airport.geometry.coordinates[1])
        ];

        const prettyCoordinates = toStringHDMS(coordinates);

        const name = airport.properties.name;
        const location = airport.properties.location;
        const country = airport.properties.country;
        const totalPassengers = airport.properties.totalPassengers;

        const description = `
            ${name} is a airport located in ${location} in ${country}.
            Its total number of passenger is estimated to ${totalPassengers}.
        `;

        const infoWindow = {
            title: name,
            content: `
                <p>${description}</p>
                <p>
                    Google has more information about <a href="//www.google.com/search?q=${name}" target="_blank" class="oltb-link">${name}</a> 
                </p>
            `,
            footer: `
                <span class="oltb-info-window__coordinates">${prettyCoordinates}</span>
                <div class="oltb-info-window__buttons-wrapper">
                    <button class="${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--delete oltb-tippy" title="Delete Marker" id="${ID_PREFIX_INFO_WINDOW}-remove"></button>
                    <button class="${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--crosshair oltb-tippy" title="Copy Marker Coordinates" id="${ID_PREFIX_INFO_WINDOW}-copy-coordinates" data-oltb-coordinates="${prettyCoordinates}"></button>
                    <button class="${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--copy oltb-tippy" title="Copy Marker Text" id="${ID_PREFIX_INFO_WINDOW}-copy-text" data-oltb-copy="${description}"></button>
                </div>
            `
        };

        LayerWrapper.getLayer().getSource().addFeature(
            new generateIconMarker({
                lon: coordinates[0],
                lat: coordinates[1],
                title: name,
                description: description,
                icon: 'airplane.filled',
                markerFill: '#E96B69FF',
                markerStroke: '#FFFFFF',
                label: name,
                labelFill: '#FFFFFF',
                labelStroke: '#3B4352CC',
                labelStrokeWidth: 12,
                notSelectable: true,
                infoWindow: infoWindow
            })
        );
    });
}

fetch(urlAirportsGeoJson)
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
        const errorMessage = 'Failed to load Airports layer';
        LogManager.logError(FILENAME, 'geoJsonPromise', {
            message: errorMessage,
            error: error
        });

        Toast.error({
            title: 'Error',
            message: errorMessage
        });
    });