import GeoJSON from 'ol/format/GeoJSON';
import Config from '../../core/Config';

const importLayerAsGeoJSON = function(fileResult) {
    const geoJSON = JSON.parse(fileResult);
    const features = new GeoJSON().readFeatures(geoJSON, {
        featureProjection: Config.baseProjection,
        dataProjection: Config.baseProjection
    });

    return features;
}

const exportLayerAsGeoJSON = function(layer) {
    const features = layer.getSource().getFeatures();
    const geoJSON = new GeoJSON().writeFeatures(features, {
        featureProjection: Config.baseProjection,
        dataProjection: Config.baseProjection
    });

    return geoJSON;
}

export { importLayerAsGeoJSON, exportLayerAsGeoJSON };