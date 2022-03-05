import 'ol/ol.css';
import Config from '../../core/Config';
import { Control } from 'ol/control';
import { toolbarElement } from '../../core/ElementReferences';
import { easeOut } from 'ol/easing';
import { fromLonLat } from 'ol/proj';
import { addContextMenuItem } from '../../common/ContextMenu';
import { SVGPaths, getIcon } from '../../core/Icons';

class HiddenMapNavigation extends Control {
    constructor(options = {}) {
        super({
            element: toolbarElement
        });

        const moveCenterIcon = getIcon({path: SVGPaths.MoveCenter});
        const focusHereIcon = getIcon({path: SVGPaths.FocusHere});
        const { focusZoom = 10 } = options;

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
                zoom: focusZoom,
                duration: Config.animationDuration,
                easing: easeOut
            });
        }});

        addContextMenuItem('main.map.context.menu', {});
    }
}

export default HiddenMapNavigation;