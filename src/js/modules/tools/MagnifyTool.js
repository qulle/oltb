import Toast from '../common/Toast';
import DOM from '../helpers/Browser/DOM';
import { Control } from 'ol/control';
import { getRenderPixel } from 'ol/render';
import { unByKey } from 'ol/Observable';
import { TOOLBAR_ELEMENT } from '../core/ElementReferences';
import { SVG_PATHS, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';
import { SHORTCUT_KEYS } from '../helpers/constants/ShortcutKeys';
import { EVENTS } from '../helpers/constants/Events';

const DEFAULT_OPTIONS = {};

class MagnifyTool extends Control {
    constructor(options = {}) {
        super({
            element: TOOLBAR_ELEMENT
        });
        
        const icon = getIcon({
            path: SVG_PATHS.Magnify,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': `Magnifier (${SHORTCUT_KEYS.Magnify})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        this.element.appendChild(button);
        this.button = button;
        this.radius = 75;
        this.options = { ...DEFAULT_OPTIONS, ...options };

        window.addEventListener(EVENTS.Browser.KeyUp, this.onWindowKeyUp.bind(this));
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, SHORTCUT_KEYS.Magnify)) {
            this.handleClick(event);
        }
    }

    handleClick() {
        // User defined callback from constructor
        if(typeof this.options.click === 'function') {
            this.options.click();
        }

        this.handleMagnify();
    }

    handleMagnify() {
        const map = this.getMap();

        if(this.active) {
            const mapContainer = map.getTarget();

            // Remove the eventlisteners
            mapContainer.removeEventListener(EVENTS.Browser.MouseMove, this.onMousemoveListenert);
            mapContainer.removeEventListener(EVENTS.Browser.MouseOut, this.onMouseoutListenert);
            document.removeEventListener(EVENTS.Browser.KeyDown, this.onKeydownListener);

            this.onPostrenderListeners.forEach((listener) => {
                unByKey(listener);
            });

            // Update the map to remove the last rendering of the magnifier
            map.render();
        }else {
            const mapContainer = map.getTarget();
    
            this.onMousemoveListenert = this.onMousemove.bind(this);
            mapContainer.addEventListener(EVENTS.Browser.MouseMove, this.onMousemoveListenert);
    
            this.onMouseoutListenert = this.onMouseout.bind(this);
            mapContainer.addEventListener(EVENTS.Browser.MouseOut, this.onMouseoutListenert);
    
            this.onKeydownListener = this.onKeydown.bind(this);
            document.addEventListener(EVENTS.Browser.KeyDown, this.onKeydownListener);
    
            this.onPostrenderListeners = [];
            map.getLayers().getArray().forEach((layer) => {
                this.onPostrenderListeners.push(layer.on(EVENTS.Ol.PostRender, this.onPostrender.bind(this)));
            });
        }

        this.active = !this.active;
        this.button.classList.toggle('oltb-tool-button--active');
    }

    onKeydown(event) {
        // Disable map-zoom when changing size of magnifier
        event.preventDefault();
        
        const key = event.key;

        if(key === '+') {
            this.radius = Math.min(this.radius + 5, 150);
        }else if(key === '-') {
            this.radius = Math.max(this.radius - 5, 25);
        }

        this.getMap().render();
    }

    onMousemove(event) {
        const map = this.getMap();
        this.mousePosition = map.getEventPixel(event);
        map.render();
    }

    onMouseout(event) {
        this.mousePosition = null;
        this.getMap().render();
    }

    onPostrender(event) {
        if(this.mousePosition) {
            const mousePosition = this.mousePosition;
            const radius = this.radius;

            const pixel = getRenderPixel(event, mousePosition);
            const offset = getRenderPixel(event, [
                mousePosition[0] + radius,
                mousePosition[1] 
            ]);

            const half = Math.sqrt(
                Math.pow(offset[0] - pixel[0], 2) + Math.pow(offset[1] - pixel[1], 2)
            );
            
            const context = event.context;
            const centerX = pixel[0];
            const centerY = pixel[1];
            const originX = centerX - half;
            const originY = centerY - half;
            const size = Math.round(2 * half + 1);

            try
            {
                const sourceData = context.getImageData(originX, originY, size, size).data;
                const dest = context.createImageData(size, size);
                const destData = dest.data;
                
                for(let j = 0; j < size; ++j) {
                    for(let i = 0; i < size; ++i) {
                        const dI = i - half;
                        const dJ = j - half;
                        const dist = Math.sqrt(dI * dI + dJ * dJ);
                        let sourceI = i;
                        let sourceJ = j;
                        
                        if(dist < half) {
                            sourceI = Math.round(half + dI / 2);
                            sourceJ = Math.round(half + dJ / 2);
                        }
                    
                        const destOffset = (j * size + i) * 4;
                        const sourceOffset = (sourceJ * size + sourceI) * 4;
                        
                        destData[destOffset] = sourceData[sourceOffset];
                        destData[destOffset + 1] = sourceData[sourceOffset + 1];
                        destData[destOffset + 2] = sourceData[sourceOffset + 2];
                        destData[destOffset + 3] = sourceData[sourceOffset + 3];
                    }
                }
    
                context.beginPath();
                context.arc(centerX, centerY, half, 0, 2 * Math.PI);
                context.lineWidth = (3 * half) / radius;
                context.strokeStyle = 'rgba(59, 67, 82, 1)';
                context.putImageData(dest, originX, originY);
                context.stroke();
                context.restore();
            }catch(error) {
                // Click the tool-button to deactivate
                this.button.click();

                if(error.name == 'SecurityError') {
                    Toast.error({text: 'A CORS error with one of the layers occurred'});
                }else {
                    Toast.error({text: 'A unknown error occurred with the magnifyer'});
                }

                console.error(`Error using magnifyer [${error}]`);
            }
        }
    }
}

export default MagnifyTool;