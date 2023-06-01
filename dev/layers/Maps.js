import { Tile } from 'ol/layer';
import { LayerManager } from "../../src/oltb/js/core/managers/LayerManager";
import { OSM, XYZ, Stamen } from 'ol/source';

LayerManager.addMapLayers([
    {
        name: 'Open Street Map',
        layer: new Tile({
            source: new OSM({
                crossOrigin: 'anonymous'
            }),
            visible: true
        })
    }, {
        name: 'ArcGIS World Topo',
        layer: new Tile({
            source: new XYZ({
                crossOrigin: 'anonymous',
                attributions: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
                url:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
            }),
            visible: false
        })
    }, {
        name: 'Stamen Watercolor',
        layer: new Tile({
            maxZoom: 12,
            source: new Stamen({
                crossOrigin: 'anonymous',
                layer: 'watercolor',
                attributions: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'
            }),
            visible: false
        })
    }, {
        name: 'Stamen Terrain',
        layer: new Tile({
            maxZoom: 12,
            source: new Stamen({
                crossOrigin: 'anonymous',
                layer: 'terrain',
                attributions: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'
            }),
            visible: false
        })
    }
], true);