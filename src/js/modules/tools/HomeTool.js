import CONFIG from '../core/Config';
import DOM from '../helpers/Browser/DOM';
import Toast from '../common/Toast';
import { Control } from 'ol/control';
import { fromLonLat } from 'ol/proj';
import { easeOut } from 'ol/easing';
import { TOOLBAR_ELEMENT } from '../core/ElementReferences';
import { addContextMenuItem } from '../common/ContextMenu';
import { SVG_PATHS, getIcon } from '../core/SVGIcons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';
import { SHORTCUT_KEYS } from '../helpers/constants/ShortcutKeys';
import { EVENTS } from '../helpers/constants/Events';
import { CONTEXT_MENUS } from '../helpers/constants/ContextMenus';

const DEFAULT_OPTIONS = {
    zoom: 1,
    lon: 0,
    lat: 0
};

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

        addContextMenuItem(CONTEXT_MENUS.MainMap, {icon: icon, name: 'Set as home', fn: this.onContextMenuSetHomeLocation.bind(this)});

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
        
        this.handleResetToHome();
    }

    onWindowClearHomeLocation() {
        this.userDefinedHomeLocation = null;
        this.userDefinedHomeZoom = null;
    }

    handleResetToHome() {
        const view = this.getMap().getView();

        if(view.getAnimating()) {
            view.cancelAnimations();
        }

        view.animate({
            zoom: this.userDefinedHomeZoom ? this.userDefinedHomeZoom : this.homeZoom,
            center: this.userDefinedHomeLocation ? this.userDefinedHomeLocation : this.homeLocation,
            duration: CONFIG.animationDuration,
            easing: easeOut
        });

        setTimeout(() => {
            // User defined callback from constructor
            if(typeof this.options.home === 'function') {
                this.options.home();
            }
        }, CONFIG.animationDuration);
    }

    onContextMenuSetHomeLocation() {
        const view = this.getMap().getView();

        this.userDefinedHomeZoom = view.getZoom();
        this.userDefinedHomeLocation = view.getCenter();

        Toast.success({text: 'Home location successfully set'});
    }
}

export default HomeTool;