import { DOM } from '../helpers/browser/DOM';
import { Toast } from '../common/Toast';
import { CONFIG } from '../core/Config';
import { EVENTS } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { easeOut } from 'ol/easing';
import { fromLonLat } from 'ol/proj';
import { ContextMenu } from '../common/ContextMenu';
import { SHORTCUT_KEYS } from '../helpers/constants/ShortcutKeys';
import { TOOLBAR_ELEMENT } from '../core/elements/index';
import { isShortcutKeyOnly } from '../helpers/browser/ShortcutKeyOnly';
import { SVG_PATHS, getIcon } from '../core/icons/GetIcon';

const DEFAULT_OPTIONS = Object.freeze({
    zoom: 3,
    lon: 0,
    lat: 0
});

class HomeTool extends Control {
    constructor(options = {}) {
        super({
            element: TOOLBAR_ELEMENT
        });
        
        const icon = getIcon({
            path: SVG_PATHS.Home,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': `Zoom home (${SHORTCUT_KEYS.Home})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        this.element.appendChild(button);
        this.options = { ...DEFAULT_OPTIONS, ...options };

        this.homeLocation = fromLonLat([this.options.lon, this.options.lat]);;
        this.homeZoom = this.options.zoom;
        
        this.userDefinedHomeLocation = null;
        this.userDefinedHomeZoom = null;

        ContextMenu.addItem({
            icon: icon, 
            name: 'Set as home', 
            fn: this.onContextMenuSetHomeLocation.bind(this)
        });

        window.addEventListener(EVENTS.Custom.SettingsCleared, this.onWindowClearHomeLocation.bind(this));
        window.addEventListener(EVENTS.Browser.KeyUp, this.onWindowKeyUp.bind(this));
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, SHORTCUT_KEYS.Home)) {
            this.handleClick(event);
        }
    }

    handleClick() {
        // User defined callback from constructor
        if(typeof this.options.click === 'function') {
            this.options.click();
        }
        
        this.momentaryActivation();
    }

    momentaryActivation() {
        const view = this.getMap().getView();

        if(view.getAnimating()) {
            view.cancelAnimations();
        }

        const zoom = this.userDefinedHomeZoom ? this.userDefinedHomeZoom : this.homeZoom;
        const center = this.userDefinedHomeLocation ? this.userDefinedHomeLocation : this.homeLocation;

        view.animate({
            zoom: zoom,
            center: center,
            duration: CONFIG.AnimationDuration.Normal,
            easing: easeOut
        });

        setTimeout(() => {
            // User defined callback from constructor
            if(typeof this.options.home === 'function') {
                this.options.home();
            }
        }, CONFIG.AnimationDuration.Normal);
    }

    onWindowClearHomeLocation() {
        this.userDefinedHomeLocation = null;
        this.userDefinedHomeZoom = null;
    }

    onContextMenuSetHomeLocation() {
        const view = this.getMap().getView();

        this.userDefinedHomeZoom = view.getZoom();
        this.userDefinedHomeLocation = view.getCenter();

        Toast.success({text: 'Home location successfully set'});
    }
}

export { HomeTool };