import LayerManager from "../core/Managers/LayerManager";
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Toast from "../common/Toast";
import Config from '../core/Config';
import { bbox } from 'ol/loadingstrategy';
import { getMeasureTooltipValue } from "../helpers/olFunctions/Measure";

import urlCountriesGeoJSON from 'url:../../../json/countries.geojson';

const isSilent = true;
LayerManager.addMapLayers([
    {
        name: 'Countries overlay',
        layer: new VectorLayer({
            source: new VectorSource({
                format: new GeoJSON({
                    featureProjection: Config.projection
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
], isSilent);