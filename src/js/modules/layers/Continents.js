import LayerManager from "../core/managers/LayerManager";
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import CONFIG from "../core/Config";

import urlContinentsGeoJSON from 'url:../../../json/continents.geojson';

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