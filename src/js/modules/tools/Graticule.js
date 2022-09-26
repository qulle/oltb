import Graticule from 'ol/layer/Graticule';
import Stroke from 'ol/style/Stroke';
import DOM from '../helpers/Browser/DOM';
import { Control } from 'ol/control';
import { TOOLBAR_ELEMENT } from '../core/ElementReferences';
import { SVG_PATHS, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';
import { SHORTCUT_KEYS } from '../helpers/Constants/ShortcutKeys';
import { EVENTS } from '../helpers/Constants/Events';

const DEFAULT_OPTIONS = {
    color: 'rgba(59, 67, 82, 0.9)',
    dashed: true,
    width: 2,
    showLabels: true,
    wrapX: true
};

class GraticuleTool extends Control {
    constructor(options = {}) {
        super({
            element: TOOLBAR_ELEMENT
        });
        
        const icon = getIcon({
            path: SVG_PATHS.Globe,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': `Show graticule (${SHORTCUT_KEYS.Graticule})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        this.element.appendChild(button);
        this.button = button;
        this.active = false;
        this.options = { ...DEFAULT_OPTIONS, ...options };
        
        this.graticule = new Graticule({
            strokeStyle: new Stroke({
                color: this.options.color,
                width: this.options.width,
                lineDash: this.options.dashed ? [1, 4] : [0, 0],
            }),
            showLabels: this.options.showLabels,
            visible: true,
            wrapX: this.options.wrapX,
        });

        window.addEventListener(EVENTS.Browser.KeyUp, this.onWindowKeyUp.bind(this));
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, SHORTCUT_KEYS.Graticule)) {
            this.handleClick(event);
        }
    }    

    handleClick() {
        if(this.active) {
            this.graticule.setMap(null);
        }else {
            this.graticule.setMap(this.getMap());
        }

        this.active = !this.active;
        this.button.classList.toggle('oltb-tool-button--active');
    }
}

export default GraticuleTool;