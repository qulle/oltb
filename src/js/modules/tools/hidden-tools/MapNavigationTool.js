import CONFIG from '../../core/Config';
import StateManager from '../../core/managers/StateManager';
import { Control } from 'ol/control';
import { TOOLBAR_ELEMENT } from '../../core/ElementReferences';
import { easeOut } from 'ol/easing';
import { fromLonLat, toLonLat } from 'ol/proj';
import { addContextMenuItem } from '../../common/ContextMenu';
import { SVG_PATHS, getIcon } from '../../core/SVGIcons';
import { EVENTS } from '../../helpers/constants/Events';
import { CONTEXT_MENUS } from '../../helpers/constants/ContextMenus';

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

class HiddenMapNavigationTool extends Control {
    constructor(options = {}) {
        super({
            element: TOOLBAR_ELEMENT
        });

        this.options = { ...DEFAULT_OPTIONS, ...options };

        // Load potential stored data from localStorage
        const localStorageState = JSON.parse(StateManager.getStateObject(LOCAL_STORAGE_NODE_NAME)) || {};
        this.localStorage = { ...LOCAL_STORAGE_DEFAULTS, ...localStorageState };

        const moveCenterIcon = getIcon({
            path: SVG_PATHS.MoveCenter
        });
        
        const focusHereIcon = getIcon({
            path: SVG_PATHS.FocusHere
        });

        addContextMenuItem(CONTEXT_MENUS.MainMap, {icon: moveCenterIcon, name: 'Center map here', fn: this.onContextMenuCenterMap.bind(this)});
        addContextMenuItem(CONTEXT_MENUS.MainMap, {icon: focusHereIcon, name: 'Focus here', fn: this.onContextMenuFocusHere.bind(this)});
        addContextMenuItem(CONTEXT_MENUS.MainMap, {});

        // Track changes to zoom, paning etc. store in localStorage
        // The event needs to be delayed and wrapped in order for the getMap() to return the correct object
        window.addEventListener(EVENTS.Browser.DOMContentLoaded, this.onDOMContentLoaded.bind(this));
    }

    onDOMContentLoaded(event) {
        this.getMap().on(EVENTS.Ol.MoveEnd, this.onMoveEnd.bind(this));
    }

    onContextMenuCenterMap(map, coordinates, target) {
        const view = map.getView();
        
        if(view.getAnimating()) {
            view.cancelAnimations();
        }
    
        view.animate({
            center: fromLonLat(coordinates),
            duration: CONFIG.animationDuration.normal,
            easing: easeOut
        });
    }

    onContextMenuFocusHere(map, coordinates, target) {
        const view = map.getView();
        
        if(view.getAnimating()) {
            view.cancelAnimations();
        }
    
        view.animate({
            center: fromLonLat(coordinates),
            zoom: this.options.focusZoom,
            duration: CONFIG.animationDuration.normal,
            easing: easeOut
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

export default HiddenMapNavigationTool;