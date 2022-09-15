import LayerManager from "../core/Managers/LayerManager";
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Stamen from 'ol/source/Stamen';
import { XYZ } from 'ol/source';

const isSilent = true;
LayerManager.addMapLayers([
    {
        name: 'Open street map',
        layer: new TileLayer({
            source: new OSM(),
            visible: true
        })
    }, {
        name: 'ArcGIS World Topo',
        layer: new TileLayer({
            source: new XYZ({
                attributions: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
                url:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
            }),
            visible: false
        })
    }, {
        name: 'Watercolor',
        layer: new TileLayer({
            source: new Stamen({
                layer: 'watercolor'
            }),
            visible: false
        })
    }
], isSilent);