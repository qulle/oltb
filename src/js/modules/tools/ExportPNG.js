import 'ol/ol.css';
import EventType from 'ol/events/EventType';
import { Control } from 'ol/control';
import { download } from '../helpers/Download';
import { toolbarElement } from '../core/ElementReferences';
import { SVGPaths, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';

class ExportPNG extends Control {
    constructor(options = {}) {
        super({
            element: toolbarElement
        });
        
        const icon = getIcon({
            path: SVGPaths.Export,
            class: 'oltb-tool-button__icon'
        });

        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.setAttribute('data-tippy-content', 'Export PNG (E)');
        button.className = 'oltb-tool-button';
        button.innerHTML = icon;
        button.addEventListener(
            EventType.CLICK,
            this.handleClick.bind(this),
            false
        );

        this.element.appendChild(button);
        this.options = options;
        window.addEventListener('keyup', (event) => {
            if(isShortcutKeyOnly(event, 'e')) {
                this.handleClick(event);
            }
        });
    }

    handleClick(event) {
        event.preventDefault();
        this.handleExportPNG();
    }

    handleExportPNG() {
        const self = this;
        const map = this.getMap();

        map.once('rendercomplete', function() {
            const mapCanvas = document.createElement('canvas');
            const size = map.getSize();
    
            mapCanvas.width = size[0];
            mapCanvas.height = size[1];
    
            const mapContext = mapCanvas.getContext('2d');
            const canvases = document.querySelectorAll('.ol-layer canvas');
    
            canvases.forEach(canvas => {
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
                navigator.msSaveBlob(mapCanvas.msToBlob(), 'map.png');
            }else {
                download('map.png', mapCanvas.toDataURL());
            }

            // User defined callback from constructor
            if(typeof self.options.exported === 'function') {
                self.options.exported();
            }
        });

        // This will trigger the above code to export the png
        map.renderSync();
    }
}

export default ExportPNG;