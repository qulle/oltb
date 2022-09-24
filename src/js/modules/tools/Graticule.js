import Graticule from 'ol/layer/Graticule';
import Stroke from 'ol/style/Stroke';
import DOM from '../helpers/Browser/DOM';
import { Control } from 'ol/control';
import { toolbarElement } from '../core/ElementReferences';
import { SVGPaths, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';

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
            element: toolbarElement
        });
        
        const icon = getIcon({
            path: SVGPaths.Globe,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': 'Show graticule (J)'
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

        window.addEventListener('keyup', (event) => {
            if(isShortcutKeyOnly(event, 'j')) {
                this.handleClick(event);
            }
        });
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