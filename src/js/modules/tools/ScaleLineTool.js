import DOM from '../helpers/Browser/DOM';
import { Control, ScaleLine } from 'ol/control';
import { TOOLBAR_ELEMENT } from '../core/ElementReferences';
import { SVG_PATHS, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';
import { SHORTCUT_KEYS } from '../helpers/Constants/ShortcutKeys';
import { EVENTS } from '../helpers/Constants/Events';

const DEFAULT_OPTIONS = {
    units: 'metric'
};

class ScaleLineTool extends Control {
    constructor(options = {}) {
        super({
            element: TOOLBAR_ELEMENT
        });
        
        const icon = getIcon({
            path: SVG_PATHS.ScaleLine,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': `Scale line (${SHORTCUT_KEYS.ScaleLine})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        this.element.appendChild(button);
        this.button = button;
        this.active = false;
        this.options = { ...DEFAULT_OPTIONS, ...options };
        this.scaleLine = new ScaleLine({units: this.options.units});
        
        window.addEventListener(EVENTS.Browser.KeyUp, (event) => {
            if(isShortcutKeyOnly(event, SHORTCUT_KEYS.ScaleLine)) {
                this.handleClick(event);
            }
        });
    }

    handleClick() {
        if(this.active) {
            this.scaleLine.setMap(null);
        }else {
            this.scaleLine.setMap(this.getMap());
        }

        this.active = !this.active;
        this.button.classList.toggle('oltb-tool-button--active');
    }
}

export default ScaleLineTool;