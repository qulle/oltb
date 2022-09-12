import LayerManager from "../core/Managers/LayerManager";
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Config from "../core/Config";

import urlContinentsGeoJSON from 'url:../../../json/continents.geojson';

const isSilent = true;
LayerManager.addMapLayers([
    {
        name: 'Continents overlay',
        layer: new VectorLayer({
            source: new VectorSource({
                url: urlContinentsGeoJSON,
                format: new GeoJSON({
                    featureProjection: Config.projection
                })
            }),
            visible: true
        })
    }
], isSilent);