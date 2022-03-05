import 'ol/ol.css';
import EventType from 'ol/events/EventType';
import Config from '../core/Config';
import { Control } from 'ol/control';
import { fromLonLat } from 'ol/proj';
import { easeOut } from 'ol/easing';
import { toolbarElement } from '../core/ElementReferences';
import { addContextMenuItem } from '../common/ContextMenu';
import { SVGPaths, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';

class Home extends Control {
    constructor(options = {}) {
        super({
            element: toolbarElement
        });
        
        const icon = getIcon({
            path: SVGPaths.Home,
            class: 'oltb-tool-button__icon'
        });

        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.setAttribute('data-tippy-content', 'Zoom home (H)');
        button.className = 'oltb-tool-button';
        button.innerHTML = icon;
        button.addEventListener(
            EventType.CLICK,
            this.handleClick.bind(this),
            false
        );

        this.element.appendChild(button);
        
        const {
            zoom = 1,
            lon = 0,
            lat = 0
        } = options;

        this.options = options;

        this.homeLocation = fromLonLat([lon, lat]);;
        this.homeZoom = zoom;
        
        this.userDefinedHomeLocation = null;
        this.userDefinedHomeZoom = null;

        addContextMenuItem('main.map.context.menu', {icon: icon, name: 'Set as home', fn: this.setHomeLocation.bind(this)});

        window.addEventListener('oltb.settings.cleared', this.clearHomeLocation.bind(this));
        window.addEventListener('keyup', (event) => {
            if(isShortcutKeyOnly(event, 'h')) {
                this.handleResetToHome();
            }
        });
    }

    handleClick(event) {
        event.preventDefault();
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
    }
}

export default Home;