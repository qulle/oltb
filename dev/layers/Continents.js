// Url imports
import urlContinentsGeoJson from 'url:../geojson/continents.geojson';

// Module imports
import { Config } from "../../src/oltb/js/core/Config";
import { GeoJSON } from 'ol/format';
import { LayerManager } from "../../src/oltb/js/core/managers/LayerManager";
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';

LayerManager.addMapLayers([
    {
        name: 'Continents overlay',
        layer: new VectorLayer({
            source: new VectorSource({
                url: urlContinentsGeoJson,
                format: new GeoJSON({
                    featureProjection: Config.projection.default
                })
            }),
            visible: true
        })
    }
], true);