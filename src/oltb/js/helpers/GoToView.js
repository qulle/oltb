import { Config } from "../core/Config";
import { easeOut } from 'ol/easing';
import { fromLonLat } from "ol/proj";

const goToView = function (map, coordinates, zoom, rotation) {
    if(!map) {
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
        duration: Config.animationDuration.normal,
        easing: easeOut
    });
}

export { goToView };