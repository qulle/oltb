import axios from 'axios';
import urlGeoJson from 'url:../geojson/countries.geojson';
import { bbox } from 'ol/loadingstrategy';
import { Toast } from '../../src/oltb/js/ui-common/ui-toasts/toast';
import { GeoJSON } from 'ol/format';
import { transform } from 'ol/proj';
import { getCenter } from 'ol/extent';
import { LogManager } from '../../src/oltb/js/toolbar-managers/log-manager/log-manager';
import { toStringHDMS } from 'ol/coordinate';
import { LayerManager } from '../../src/oltb/js/toolbar-managers/layer-manager/layer-manager';
import { ConfigManager } from '../../src/oltb/js/toolbar-managers/config-manager/config-manager';
import { getMeasureValue } from '../../src/oltb/js/ol-helpers/geometry-measurements';
import { FeatureProperties } from '../../src/oltb/js/ol-helpers/feature-properties';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';

const FILENAME = 'layers/Countries.js';
const CLASS__FUNC_BUTTON = 'oltb-func-btn';
const ID__PREFIX_INFO_WINDOW = 'oltb-info-window-marker';

const parseGeoJson = function(context, data, projection) {
    const features = new GeoJSON({
        featureProjection: projection.getCode()
    }).readFeatures(data);

    const config = ConfigManager.getConfig();
    features.forEach((feature) => {
        const coordinates = transform(
            getCenter(feature.getGeometry().getExtent()),
            config.projection.default,
            config.projection.wgs84
        );

        const prettyCoordinates = toStringHDMS(coordinates);
        const measureValue = getMeasureValue(feature.getGeometry());

        const title = feature.get('name');
        const description = `
            Based on the geometric data, we estimate the area to be ${measureValue.value} ${measureValue.unit}.
        `;

        const infoWindow = {
            title: title,
            content: `
                <p>${description}</p>
            `,
            footer: `
                <span class="oltb-info-window__coordinates">${prettyCoordinates}</span>
                <div class="oltb-info-window__buttons-wrapper">
                    <button class="${CLASS__FUNC_BUTTON} ${CLASS__FUNC_BUTTON}--copy oltb-tippy" title="Copy Marker Text" id="${ID__PREFIX_INFO_WINDOW}-copy-text" data-oltb-copy="${description}"></button>
                    <button class="${CLASS__FUNC_BUTTON} ${CLASS__FUNC_BUTTON}--layer oltb-tippy" title="Show Layer" id="${ID__PREFIX_INFO_WINDOW}-show-layer"></button>
                </div>
            `
        };

        feature.setProperties({
            oltb: {
                type: FeatureProperties.type.layer,
                title: title,
                description: description,
                settings: {
                    shouldHighlightOnHover: true,
                },
                infoWindow: infoWindow
            }
        });
    });

    context.addFeatures(features);

    return features;
}

const loadGeoJson = function(extent, resolution, projection, success, failure) {
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
        const features = parseGeoJson(this, data, projection);
        success(features);
    }).catch((error) => {
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
        name: 'Countries Overlay',
        layer: new VectorLayer({
            source: new VectorSource({
                format: new GeoJSON({
                    featureProjection: ConfigManager.getConfig().projection.default
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