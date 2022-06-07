import 'ol/ol.css';
import Config from '../../core/Config';
import { Control } from 'ol/control';
import { toolbarElement } from '../../core/ElementReferences';
import { easeOut } from 'ol/easing';
import { fromLonLat } from 'ol/proj';
import { addContextMenuItem } from '../../common/ContextMenu';
import { SVGPaths, getIcon } from '../../core/Icons';

const DEFAULT_OPTIONS = {
    focusZoom: 2
};

class HiddenMapNavigation extends Control {
    constructor(options = {}) {
        super({
            element: toolbarElement
        });

        const moveCenterIcon = getIcon({path: SVGPaths.MoveCenter});
        const focusHereIcon = getIcon({path: SVGPaths.FocusHere});
        options = {...DEFAULT_OPTIONS, ...options};

        addContextMenuItem('main.map.context.menu', {icon: moveCenterIcon, name: 'Center map here', fn: function(map, coordinates, target) {
            const view = map.getView();
        
            if(view.getAnimating()) {
                view.cancelAnimations();
            }
        
            view.animate({
                center: fromLonLat(coordinates),
                duration: Config.animationDuration,
                easing: easeOut
            });
        }});

        addContextMenuItem('main.map.context.menu', {icon: focusHereIcon, name: 'Focus here', fn: function(map, coordinates, target) {
            const view = map.getView();
        
            if(view.getAnimating()) {
                view.cancelAnimations();
            }
        
            view.animate({
                center: fromLonLat(coordinates),
                zoom: options.focusZoom,
                duration: Config.animationDuration,
                easing: easeOut
            });
        }});

        addContextMenuItem('main.map.context.menu', {});
    }
}

export default HiddenMapNavigation;