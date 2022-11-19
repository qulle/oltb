import DOM from '../helpers/Browser/DOM';
import Toast from '../common/Toast';
import html2canvas from 'html2canvas';
import { EVENTS } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { download } from '../helpers/Browser/Download';
import { SHORTCUT_KEYS } from '../helpers/constants/ShortcutKeys';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';
import { SVG_PATHS, getIcon } from '../core/SVGIcons';
import { MAP_ELEMENT, TOOLBAR_ELEMENT } from '../core/ElementReferences';

const DEFAULT_OPTIONS = {};
const FILE_NAME = 'map.png';

class ExportPNGTool extends Control {
    constructor(options = {}) {
        super({
            element: TOOLBAR_ELEMENT
        });
        
        const icon = getIcon({
            path: SVG_PATHS.Export,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': `Export PNG (${SHORTCUT_KEYS.ExportPNG})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        this.element.appendChild(button);
        this.options = { ...DEFAULT_OPTIONS, ...options };
        
        window.addEventListener(EVENTS.Browser.DOMContentLoaded, this.onWindowLoaded.bind(this));
        window.addEventListener(EVENTS.Browser.KeyUp, this.onWindowKeyUp.bind(this));
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, SHORTCUT_KEYS.ExportPNG)) {
            this.handleClick(event);
        }
    }

    onWindowLoaded() {
        const attributions = MAP_ELEMENT.querySelector('.ol-attribution');

        if(attributions) {
            attributions.setAttribute('data-html2canvas-ignore', 'true');
        }
    }

    handleClick() {
        // Note: User defined callback from constructor
        if(typeof this.options.click === 'function') {
            this.options.click();
        }

        this.momentaryActivation();
    }

    momentaryActivation() {
        const map = this.getMap();

        // RenderSync will trigger the export the png
        map.once(EVENTS.Ol.RenderComplete, this.onRenderComplete.bind(this));
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

            // (1). Draw map layers (Canvases)
            const mapCanvas = MAP_ELEMENT.querySelector('.ol-layer canvas');
            const opacity = mapCanvas.parentNode.style.opacity;
            pngContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
    
            const matrix = mapCanvas.style.transform
                .match(/^matrix\(([^\(]*)\)$/)[1]
                .split(',')
                .map(Number);

            CanvasRenderingContext2D.prototype.setTransform.apply(pngContext, matrix);
            pngContext.drawImage(mapCanvas, 0, 0);

            // (2). Draw overlays souch as Tooltips and InfoWindows
            const overlay = MAP_ELEMENT.querySelector('.ol-overlaycontainer-stopevent');
            const overlayCanvas = await html2canvas(overlay, {
                backgroundColor: null,
                logging: false
            });

            pngContext.drawImage(overlayCanvas, 0, 0);

            this.downloadCanvas(pngCanvas);
        }catch(error) {
            console.error(`Error exporting PNG [${error}]`);
            Toast.error({text: 'Could not export the PNG'});
        }
    }

    downloadCanvas(pngCanvas) {
        if(navigator.msSaveBlob) {
            navigator.msSaveBlob(pngCanvas.msToBlob(), FILE_NAME);
        }else {
            download(FILE_NAME, pngCanvas.toDataURL());
        }

        // Note: User defined callback from constructor
        if(typeof this.options.exported === 'function') {
            this.options.exported();
        }
    }
}

export default ExportPNGTool;