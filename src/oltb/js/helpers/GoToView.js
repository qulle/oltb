import { CONFIG } from "../core/Config";
import { easeOut } from 'ol/easing';
import { fromLonLat } from "ol/proj";

const FILENAME = 'helpers/GoToView.js';

const goToView = function (map, coordinates, zoom, rotation) {
    if(!Boolean(map)) {
        return;
    }

    const view = map.getView();
    
    if(view.getAnimating()) {
        view.cancelAnimations();
    }

    view.animate({
        rotation: rotation,
        center: fromLonLat(coordinates),
        zoom: zoom,
        duration: CONFIG.AnimationDuration.Normal,
        easing: easeOut
    });
}

export { goToView };