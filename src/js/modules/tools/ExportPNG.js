import DOM from '../helpers/Browser/DOM';
import Toast from '../common/Toast';
import { Control } from 'ol/control';
import { download } from '../helpers/Browser/Download';
import { toolbarElement } from '../core/ElementReferences';
import { SVGPaths, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';

const DEFAULT_OPTIONS = {};
const FILE_NAME = 'map.png';

class ExportPNG extends Control {
    constructor(options = {}) {
        super({
            element: toolbarElement
        });
        
        const icon = getIcon({
            path: SVGPaths.Export,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': 'Export PNG (E)'
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        this.element.appendChild(button);
        this.options = { ...DEFAULT_OPTIONS, ...options };
        
        window.addEventListener('keyup', (event) => {
            if(isShortcutKeyOnly(event, 'e')) {
                this.handleClick(event);
            }
        });
    }

    handleClick() {
        this.handleExportPNG();
    }

    handleExportPNG() {
        const map = this.getMap();

        map.once('rendercomplete', () => {
            try {
                const size = map.getSize();
                const mapCanvas = DOM.createElement({
                    element: 'canvas',
                    attributes: {
                        width: size[0],
                        height: size[1]
                    }
                });
        
                const mapContext = mapCanvas.getContext('2d');
                const canvases = document.querySelectorAll('.ol-layer canvas');
        
                canvases.forEach((canvas) => {
                    if(canvas.width > 0) {
                        const opacity = canvas.parentNode.style.opacity;
                        mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
        
                        const transform = canvas.style.transform;
                        const matrix = transform.match(/^matrix\(([^\(]*)\)$/)[1].split(',').map(Number);
        
                        CanvasRenderingContext2D.prototype.setTransform.apply(mapContext, matrix);
        
                        mapContext.drawImage(canvas, 0, 0);
                    }
                });

                if(navigator.msSaveBlob) {
                    navigator.msSaveBlob(mapCanvas.msToBlob(), FILE_NAME);
                }else {
                    download(FILE_NAME, mapCanvas.toDataURL());
                }
    
                // User defined callback from constructor
                if(typeof this.options.exported === 'function') {
                    this.options.exported();
                }
            }catch(error) {
                console.error(`Error exporting PNG [${error}]`);
                Toast.error({text: 'Could not export the PNG'});
            }
        });

        // This will trigger the above code to export the png
        map.renderSync();
    }
}

export default ExportPNG;