import LayerManager from "../../../../../src/oltb/js/modules/core/managers/LayerManager";
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import CONFIG from "../../../../../src/oltb/js/modules/core/Config";

import urlContinentsGeoJSON from 'url:../geojson/continents.geojson';

LayerManager.addMapLayers([
    {
        name: 'Continents overlay',
        layer: new VectorLayer({
            source: new VectorSource({
                url: urlContinentsGeoJSON,
                format: new GeoJSON({
                    featureProjection: CONFIG.projection
                })
            }),
            visible: true
        })
    }
], true);