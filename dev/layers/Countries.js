import Toast from "../../src/oltb/js/common/Toast";
import CONFIG from '../../src/oltb/js/core/Config';
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import LayerManager from "../../src/oltb/js/core/managers/LayerManager";
import { bbox } from 'ol/loadingstrategy';
import { getMeasureValue } from "../../src/oltb/js/helpers/Measurements";
import { FEATURE_PROPERTIES } from "../../src/oltb/js/helpers/constants/FeatureProperties";

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