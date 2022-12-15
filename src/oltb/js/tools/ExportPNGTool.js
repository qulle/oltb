import DOM from '../helpers/browser/DOM';
import Toast from '../common/Toast';
import CONFIG from '../core/Config';
import URLManager from '../core/managers/URLManager';
import html2canvas from 'html2canvas';
import { EVENTS } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { download } from '../helpers/browser/Download';
import { SHORTCUT_KEYS } from '../helpers/constants/ShortcutKeys';
import { isShortcutKeyOnly } from '../helpers/browser/ShortcutKeyOnly';
import { SVG_PATHS, getIcon } from '../core/icons/GetIcon';
import { MAP_ELEMENT, TOOLBAR_ELEMENT } from '../core/elements/index';

const DEFAULT_OPTIONS = {
    filename: 'map-image-export',
    appendTime: false
};

class ExportPNGTool extends Control {
    constructor(options = {}) {
        super({
            element: TOOLBAR_ELEMENT
        });
        
        const icon = getIcon({
            path: SVG_PATHS.export,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': `Export PNG (${SHORTCUT_KEYS.exportPNG})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        this.element.appendChild(button);
        this.options = { ...DEFAULT_OPTIONS, ...options };

        // If the tool should activate detailed logging in the html2canvas process (?debug=true)
        this.isDebug = URLManager.getParameter('debug') === 'true';
        
        window.addEventListener(EVENTS.browser.contentLoaded, this.onDOMContentLoaded.bind(this));
        window.addEventListener(EVENTS.browser.keyUp, this.onWindowKeyUp.bind(this));
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, SHORTCUT_KEYS.exportPNG)) {
            this.handleClick(event);
        }
    }

    onDOMContentLoaded() {
        const attributions = MAP_ELEMENT.querySelector('.ol-attribution');

        if(attributions) {
            attributions.setAttribute('data-html2canvas-ignore', 'true');
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
        const map = this.getMap();

        // RenderSync will trigger the export the png
        map.once(EVENTS.ol.renderComplete, this.onRenderComplete.bind(this));
        map.renderSync();
    }

    async onRenderComplete() {
        try {
            const size = this.getMap().getSize();
            const pngCanvas = DOM.createElement({
                element: 'canvas',
                attributes: {
                    width: size[0],
                    height: size[1]
                }
            });
            
            const pngContext = pngCanvas.getContext('2d');

            // Draw map layers (Canvases)
            const mapCanvas = MAP_ELEMENT.querySelector('.ol-layer canvas');
            const opacity = mapCanvas.parentNode.style.opacity;
            pngContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
    
            const matrix = mapCanvas.style.transform
                .match(/^matrix\(([^\(]*)\)$/)[1]
                .split(',')
                .map(Number);

            CanvasRenderingContext2D.prototype.setTransform.apply(pngContext, matrix);
            pngContext.drawImage(mapCanvas, 0, 0);

            // Draw overlays souch as Tooltips and InfoWindows
            const overlay = MAP_ELEMENT.querySelector('.ol-overlaycontainer-stopevent');
            const overlayCanvas = await html2canvas(overlay, {
                scrollX: 0,
                scrollY: 0,
                backgroundColor: null,
                logging: this.isDebug
            });

            pngContext.drawImage(overlayCanvas, 0, 0);

            this.downloadCanvas(pngCanvas);
        }catch(error) {
            console.error(`Error exporting PNG [${error}]`);
            Toast.error({text: 'Could not export the PNG'});
        }
    }

    downloadCanvas(pngCanvas) {
        const timestamp = this.options.appendTime 
            ? `-${new Date().toLocaleDateString(CONFIG.locale)}`
            : '';

        if(navigator.msSaveBlob) {
            navigator.msSaveBlob(pngCanvas.msToBlob(), `${this.options.filename}${timestamp}.png`);
        }else {
            download(`${this.options.filename}${timestamp}.png`, pngCanvas.toDataURL());
        }

        // User defined callback from constructor
        if(typeof this.options.exported === 'function') {
            this.options.exported();
        }
    }
}

export default ExportPNGTool;