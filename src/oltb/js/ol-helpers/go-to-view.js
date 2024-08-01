import _ from 'lodash';
import { easeOut } from 'ol/easing';
import { fromLonLat } from 'ol/proj';
import { ConfigManager } from '../toolbar-managers/config-manager/config-manager';

const DurationNormal = ConfigManager.getConfig().animationDuration.normal;
const DefaultOptions = Object.freeze({
    map: undefined,
    coordinates: [0, 0],
    zoom: undefined,
    rotation: undefined,
    duration: DurationNormal,
    onDone: undefined
});

const goToView = function(options) {
    options = _.merge(_.cloneDeep(DefaultOptions), options);

    if(!options.map) {
        return;
    }

    const view = options.map.getView();
    if(!view) {
        return;
    }

    if(view.getAnimating()) {
        view.cancelAnimations();
    }

    view.animate({
        rotation: options.rotation,
        center: fromLonLat(options.coordinates),
        zoom: options.zoom,
        duration: options.duration,
        easing: easeOut
    }, function(result) {
        // Note: 
        // @Consumer callback
        if(options.onDone) {
            options.onDone(result);
        }
    });
}

export { goToView };