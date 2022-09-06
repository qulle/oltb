import 'ol/ol.css';
import Config from '../../core/Config';
import StateManager from '../../core/Managers/StateManager';
import { Control } from 'ol/control';
import { toolbarElement } from '../../core/ElementReferences';
import { easeOut } from 'ol/easing';
import { fromLonLat, toLonLat } from 'ol/proj';
import { addContextMenuItem } from '../../common/ContextMenu';
import { SVGPaths, getIcon } from '../../core/Icons';

// Note: This is the same NODE_NAME and PROPS that the map.js file is using
const LOCAL_STORAGE_NODE_NAME = 'mapData';
const LOCAL_STORAGE_DEFAULTS = {
    lon: 18.6435,
    lat: 60.1282,
    zoom: 4,
    rotation: 0
};

const DEFAULT_OPTIONS = {
    focusZoom: 2
};

class HiddenMapNavigation extends Control {
    constructor(options = {}) {
        super({
            element: toolbarElement
        });

        this.options = { ...DEFAULT_OPTIONS, ...options };

        // Load potential stored data from localStorage
        const localStorageState = JSON.parse(StateManager.getStateObject(LOCAL_STORAGE_NODE_NAME)) || {};
        this.localStorage = { ...LOCAL_STORAGE_DEFAULTS, ...localStorageState };

        const moveCenterIcon = getIcon({path: SVGPaths.MoveCenter});
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

        const focusHereIcon = getIcon({path: SVGPaths.FocusHere});
        addContextMenuItem('main.map.context.menu', {icon: focusHereIcon, name: 'Focus here', fn: function(map, coordinates, target) {
            const view = map.getView();
        
            if(view.getAnimating()) {
                view.cancelAnimations();
            }
        
            view.animate({
                center: fromLonLat(coordinates),
                zoom: this.options.focusZoom,
                duration: Config.animationDuration,
                easing: easeOut
            });
        }});

        addContextMenuItem('main.map.context.menu', {});

        // Track changes to zoom, paning etc. store in localStorage
        // The event needs to be delayed and wrapped in order for the getMap() to return the correct object
        window.addEventListener('DOMContentLoaded', (event) => {
            this.getMap().on('moveend', this.onMoveEnd.bind(this));
        });
    }

    onMoveEnd(event) {
        const view = this.getMap().getView();
        const center = toLonLat(view.getCenter());

        this.localStorage.lon = center[0];
        this.localStorage.lat = center[1];
        this.localStorage.zoom = view.getZoom();
        this.localStorage.rotation = view.getRotation();

        StateManager.updateStateObject(LOCAL_STORAGE_NODE_NAME, JSON.stringify(this.localStorage));
    }
}

export default HiddenMapNavigation;