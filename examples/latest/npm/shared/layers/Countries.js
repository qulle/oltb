import LayerManager from "../../../../../src/oltb/js/modules/core/managers/LayerManager";
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Toast from "../../../../../src/oltb/js/modules/common/Toast";
import CONFIG from '../../../../../src/oltb/js/modules/core/Config';
import { bbox } from 'ol/loadingstrategy';
import { getMeasureValue } from "../../../../../src/oltb/js/modules/helpers/Measurements";
import { FEATURE_PROPERTIES } from "../../../../../src/oltb/js/modules/helpers/constants/FeatureProperties";

import urlCountriesGeoJSON from 'url:../geojson/countries.geojson';

LayerManager.addMapLayers([
    {
        name: 'Countries overlay',
        layer: new VectorLayer({
            source: new VectorSource({
                format: new GeoJSON({
                    featureProjection: CONFIG.projection
                }),
                loader: function(extent, resolution, projection, success, failure) {
                    fetch(urlCountriesGeoJSON)
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
                                feature.setProperties({
                                    oltb: {
                                        type: FEATURE_PROPERTIES.type.layer,
                                        highlightOnHover: true,
                                        infoWindow: `
                                            <h3 class="oltb-text-center">${feature.getProperties().name}</h3>
                                            <p class="oltb-text-center">Approximate <strong>${getMeasureValue(feature.getGeometry())}</strong></p>
                                        `
                                    }
                                });
                            });

                            this.addFeatures(features);
                            success(features);
                        })
                        .catch((error) => {
                            const errorMessage = 'Error loading Capitals layer';

                            console.error(`${errorMessage} [${error}]`);
                            Toast.error({text: errorMessage});

                            failure();
                        });
                }, strategy: bbox,
            }),
            visible: false
        })
    }
], true);