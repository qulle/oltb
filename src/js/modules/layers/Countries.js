import LayerManager from "../core/managers/LayerManager";
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Toast from "../common/Toast";
import CONFIG from '../core/Config';
import { bbox } from 'ol/loadingstrategy';
import { getMeasureTooltipValue } from "../helpers/ol-functions/Measurements";

import urlCountriesGeoJSON from 'url:../../../json/countries.geojson';

const IS_SILENT = true;
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
                                    highlightOnHover: true,
                                    infoWindow: `
                                        <h3 class="oltb-text-center">${feature.getProperties().name}</h3>
                                        <p class="oltb-text-center">Approximate <strong>${getMeasureTooltipValue(feature.getGeometry())}</strong></p>
                                    `
                                });
                            });

                            this.addFeatures(features);
                            success(features);
                        })
                        .catch((error) => {
                            console.error(`Error loading Capitals [${error}]`);
                            Toast.error({text: 'Error loading Capitals layer'});

                            failure();
                        });
                }, strategy: bbox,
            }),
            visible: false
        })
    }
], IS_SILENT);