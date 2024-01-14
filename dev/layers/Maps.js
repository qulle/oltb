import { Tile } from 'ol/layer';
import { OSM, XYZ } from 'ol/source';
import { LayerManager } from '../../src/oltb/js/managers/LayerManager';

LayerManager.addMapLayers([
    {
        id: '7b5399a8-9e57-4304-a233-cdf363c8ed93',
        name: 'Open Street Map',
        layer: new Tile({
            source: new OSM({
                crossOrigin: 'anonymous'
            }),
            visible: true
        })
    }, {
        id: '97485b21-6a9d-48fb-9838-645543648daa',
        name: 'ArcGIS World Topo',
        layer: new Tile({
            source: new XYZ({
                crossOrigin: 'anonymous',
                attributions: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
                url:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
            }),
            visible: false
        })
    }
], {
    isSilent: true
});