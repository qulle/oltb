// Url imports
import urlCountriesGeoJson from 'url:../geojson/countries.geojson';

// Module imports
import { bbox } from 'ol/loadingstrategy';
import { Toast } from '../../src/oltb/js/common/Toast';
import { Config } from '../../src/oltb/js/core/Config';
import { GeoJSON } from 'ol/format';
import { transform } from 'ol/proj';
import { getCenter } from 'ol/extent';
import { LogManager } from '../../src/oltb/js/core/managers/LogManager';
import { toStringHDMS } from 'ol/coordinate';
import { LayerManager } from '../../src/oltb/js/core/managers/LayerManager';
import { getMeasureValue } from '../../src/oltb/js/helpers/Measurements';
import { FeatureProperties } from '../../src/oltb/js/helpers/constants/FeatureProperties';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';

const FILENAME = 'layers/Countries.js';
const CLASS_FUNC_BUTTON = 'oltb-func-btn';
const ID_PREFIX_INFO_WINDOW = 'oltb-info-window-marker';

const parseGeoJson = function(context, data, projection) {
    const features = new GeoJSON({
        featureProjection: projection.getCode()
    }).readFeatures(data);

    features.forEach((feature) => {
        const coordinates = transform(
            getCenter(feature.getGeometry().getExtent()), 
            Config.projection.default, 
            Config.projection.wgs84
        );

        const prettyCoordinates = toStringHDMS(coordinates);
        const measureValue = getMeasureValue(feature.getGeometry());

        const title = feature.getProperties().name;
        const description = `
            Based on the geometric data, we estimate the area to be ${measureValue.value} ${measureValue.unit}.
        `;

        feature.setProperties({
            oltb: {
                type: FeatureProperties.type.layer,
                highlightOnHover: true,
                title: title,
                description: description,
                infoWindow: {
                    title: title,
                    content: `
                        <p>${description}</p>
                    `,
                    footer: `
                        <span class="oltb-info-window__coordinates">${prettyCoordinates}</span>
                        <div class="oltb-info-window__buttons-wrapper">
                            <button class="${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--copy oltb-tippy" title="Copy Marker Text" id="${ID_PREFIX_INFO_WINDOW}-copy-text" data-oltb-copy="${description}"></button>
                        </div>
                    `
                }
            }
        });
    });

    context.addFeatures(features);
    
    return features;
}

const loadGeoJson = function(extent, resolution, projection, success, failure) {
    fetch(urlCountriesGeoJson)
        .then((response) => {
            if(!response.ok) {
                throw new Error('Failed to fetch local geojson', {
                    cause: response
                });
            }

            return response.json();
        })
        .then((data) => {
            const features = parseGeoJson(this, data, projection);
            success(features);
        })
        .catch((error) => {
            const errorMessage = 'Failed to load Countries layer';
            LogManager.logError(FILENAME, 'geoJsonPromise', {
                message: errorMessage,
                error: error
            });

            Toast.error({
                title: 'Error',
                message: errorMessage
            });

            failure();
        });
}

LayerManager.addMapLayers([
    {
        id: '90fcb696-0eca-43cf-897c-268f1d7d070f',
        name: 'Countries overlay',
        layer: new VectorLayer({
            source: new VectorSource({
                format: new GeoJSON({
                    featureProjection: Config.projection.default
                }),
                loader: loadGeoJson, 
                strategy: bbox,
            }),
            visible: false
        })
    }
], {
    isSilent: true
});