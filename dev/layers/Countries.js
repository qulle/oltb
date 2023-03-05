import { bbox } from 'ol/loadingstrategy';
import { Toast } from "../../src/oltb/js/common/Toast";
import { CONFIG } from '../../src/oltb/js/core/Config';
import { GeoJSON } from 'ol/format';
import { transform } from 'ol/proj';
import { getCenter } from 'ol/extent';
import { LogManager } from '../../src/oltb/js/core/managers/LogManager';
import { toStringHDMS } from "ol/coordinate";
import { LayerManager } from "../../src/oltb/js/core/managers/LayerManager";
import { getMeasureValue } from "../../src/oltb/js/helpers/Measurements";
import { FEATURE_PROPERTIES } from "../../src/oltb/js/helpers/constants/FeatureProperties";
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';

import urlCountriesGeoJSON from 'url:../geojson/countries.geojson';

const LOG_ORIGIN = 'Countries.js';
const ID_PREFIX = 'oltb-info-window-marker';
LayerManager.addMapLayers([
    {
        name: 'Countries overlay',
        layer: new VectorLayer({
            source: new VectorSource({
                format: new GeoJSON({
                    featureProjection: CONFIG.Projection.Default
                }),
                loader: function(extent, resolution, projection, success, failure) {
                    const geoJsonPromise = fetch(urlCountriesGeoJSON)
                        .then((response) => {
                            if(!response.ok) {
                                throw new Error(`Fetch error [${response.status}] [${response.statusText}]`);
                            }

                            return response.json();
                        })
                        .then((json) => {
                            const features = new GeoJSON({
                                featureProjection: projection.getCode()
                            }).readFeatures(json);

                            features.forEach((feature) => {
                                const coordinates = transform(
                                    getCenter(feature.getGeometry().getExtent()), 
                                    CONFIG.Projection.Default, 
                                    CONFIG.Projection.WGS84
                                );

                                const prettyCoordinates = toStringHDMS(coordinates);
                                const measureValue = getMeasureValue(feature.getGeometry());

                                feature.setProperties({
                                    oltb: {
                                        type: FEATURE_PROPERTIES.Type.Layer,
                                        highlightOnHover: true,
                                        infoWindow: {
                                            title: feature.getProperties().name,
                                            content: `
                                                <p>
                                                    Based on the geometric data, we estimate the area to be <strong>${measureValue.value} ${measureValue.unit}</strong>.
                                                </p>
                                            `,
                                            footer: `
                                                <span class="oltb-info-window__coordinates">${prettyCoordinates}</span>
                                                <div class="oltb-info-window__buttons-wrapper">
                                                    <button class="oltb-func-btn oltb-func-btn--copy oltb-tippy" title="Copy marker text" id="${ID_PREFIX}-copy-text" data-copy="Based on the geometric data, we estimate the area to be ${measureValue.value} ${measureValue.unit}"></button>
                                                </div>
                                            `
                                        }
                                    }
                                });
                            });

                            this.addFeatures(features);
                            success(features);
                        })
                        .catch((error) => {
                            const errorMessage = 'Failed to load Countries layer';

                            LogManager.logError(LOG_ORIGIN, 'addMapLayers', `${errorMessage} [${error}]`);
                            Toast.error({
                                title: 'Error',
                                message: errorMessage
                            });

                            failure();
                        });
                }, strategy: bbox,
            }),
            visible: false
        })
    }
], true);