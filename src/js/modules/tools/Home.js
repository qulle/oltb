import Config from '../core/Config';
import DOM from '../helpers/Browser/DOM';
import Toast from '../common/Toast';
import { Control } from 'ol/control';
import { fromLonLat } from 'ol/proj';
import { easeOut } from 'ol/easing';
import { toolbarElement } from '../core/ElementReferences';
import { addContextMenuItem } from '../common/ContextMenu';
import { SVGPaths, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';
import { ShortcutKeys } from '../helpers/Constants/ShortcutKeys';

const DEFAULT_OPTIONS = {
    zoom: 1,
    lon: 0,
    lat: 0
};

class Home extends Control {
    constructor(options = {}) {
        super({
            element: toolbarElement
        });
        
        const icon = getIcon({
            path: SVGPaths.Home,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': `Zoom home (${ShortcutKeys.Home})`
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

        addContextMenuItem('main.map.context.menu', {icon: icon, name: 'Set as home', fn: this.setHomeLocation.bind(this)});

        window.addEventListener('oltb.settings.cleared', this.clearHomeLocation.bind(this));
        window.addEventListener('keyup', (event) => {
            if(isShortcutKeyOnly(event, ShortcutKeys.Home)) {
                this.handleResetToHome();
            }
        });
    }

    handleClick() {
        this.handleResetToHome();
    }

    clearHomeLocation() {
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
            duration: Config.animationDuration,
            easing: easeOut
        });

        setTimeout(() => {
            // User defined callback from constructor
            if(typeof this.options.home === 'function') {
                this.options.home();
            }
        }, Config.animationDuration);
    }

    setHomeLocation() {
        const view = this.getMap().getView();

        this.userDefinedHomeZoom = view.getZoom();
        this.userDefinedHomeLocation = view.getCenter();

        Toast.success({text: 'Home location successfully set'});
    }
}

export default Home;