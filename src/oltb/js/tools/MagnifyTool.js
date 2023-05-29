import { DOM } from '../helpers/browser/DOM';
import { Keys } from '../helpers/constants/Keys';
import { Toast } from '../common/Toast';
import { Events } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { unByKey } from 'ol/Observable';
import { LogManager } from '../core/managers/LogManager';
import { StateManager } from '../core/managers/StateManager';
import { ShortcutKeys } from '../helpers/constants/ShortcutKeys';
import { getRenderPixel } from 'ol/render';
import { ElementManager } from '../core/managers/ElementManager';
import { LocalStorageKeys } from '../helpers/constants/LocalStorageKeys';
import { SvgPaths, getIcon } from '../core/icons/GetIcon';
import { isShortcutKeyOnly } from '../helpers/browser/IsShortcutKeyOnly';

const FILENAME = 'tools/MagnifyTool.js';
const TOOL_BUTTON_CLASS = 'oltb-tool-button';

const DefaultOptions = Object.freeze({
    radius: 75,
    min: 25,
    max: 150,
    click: undefined
});

const LocalStorageNodeName = LocalStorageKeys.magnifyTool;
const LocalStorageDefaults = Object.freeze({
    active: false
});

class MagnifyTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');
        
        super({
            element: ElementManager.getToolbarElement()
        });
        
        const icon = getIcon({
            path: SvgPaths.search.stroked,
            class: `${TOOL_BUTTON_CLASS}__icon`
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: TOOL_BUTTON_CLASS,
            attributes: {
                type: 'button',
                'data-tippy-content': `Magnifier (${ShortcutKeys.magnifyTool})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        DOM.appendChildren(this.element, [
            button
        ]);
        
        this.button = button;
        this.options = { ...DefaultOptions, ...options };

        // Load stored data from localStorage
        const localStorageState = StateManager.getStateObject(LocalStorageNodeName);
        this.localStorage = { ...LocalStorageDefaults, ...localStorageState };

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));
        window.addEventListener(Events.browser.contentLoaded, this.onDOMContentLoaded.bind(this));
    }

    onDOMContentLoaded() {
        if(this.localStorage.active) {
            this.activateTool();
        }
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.magnifyTool)) {
            this.handleClick(event);
        }
    }

    handleClick() {
        LogManager.logDebug(FILENAME, 'handleClick', 'User clicked tool');
        
        // User defined callback from constructor
        if(this.options.click instanceof Function) {
            this.options.click();
        }

        if(this.active) {
            this.deActivateTool();
        }else {
            this.activateTool();
        }
    }

    activateTool() {
        const map = this.getMap();
        if(!map) {
            return;
        }

        const mapContainer = map.getTarget();
    
        this.onMousemoveListenert = this.onMousemove.bind(this);
        mapContainer.addEventListener(Events.browser.mouseMove, this.onMousemoveListenert);

        this.onMouseoutListenert = this.onMouseout.bind(this);
        mapContainer.addEventListener(Events.browser.mouseOut, this.onMouseoutListenert);

        this.onKeydownListener = this.onKeydown.bind(this);
        document.addEventListener(Events.browser.keyDown, this.onKeydownListener);

        this.onPostrenderListeners = [];
        map.getLayers().getArray().forEach((layer) => {
            this.onPostrenderListeners.push(layer.on(Events.openLayers.postRender, this.onPostrender.bind(this)));
        });

        this.active = true;
        this.button.classList.add(`${TOOL_BUTTON_CLASS}--active`);

        this.localStorage.active = true;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    deActivateTool() {
        const map = this.getMap();
        if(!map) {
            return;
        }

        const mapContainer = map.getTarget();

        // Remove the eventlisteners
        mapContainer.removeEventListener(Events.browser.mouseMove, this.onMousemoveListenert);
        mapContainer.removeEventListener(Events.browser.mouseOut, this.onMouseoutListenert);
        document.removeEventListener(Events.browser.keyDown, this.onKeydownListener);

        this.onPostrenderListeners.forEach((listener) => {
            unByKey(listener);
        });

        // Render to remove the magnifier
        map.render();

        this.active = false;
        this.button.classList.remove(`${TOOL_BUTTON_CLASS}--active`);

        this.localStorage.active = false;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    onKeydown(event) {
        // Disable map-zoom when changing size of magnifier
        event.preventDefault();

        const map = this.getMap();
        if(!map) {
            return;
        }
        
        const key = event.key;

        if(key === Keys.valueAdd) {
            this.options.radius = Math.min(this.options.radius + 5, this.options.max);
        }else if(key === Keys.valueSubtract) {
            this.options.radius = Math.max(this.options.radius - 5, this.options.min);
        }

        map.render();
    }

    onMousemove(event) {
        const map = this.getMap();
        if(!map) {
            return;
        }
        
        this.mousePosition = map.getEventPixel(event);
        map.render();
    }

    onMouseout(event) {
        const map = this.getMap();
        if(!map) {
            return;
        }

        this.mousePosition = undefined;
        map.render();
    }

    onPostrender(event) {
        if(this.mousePosition) {
            const mousePosition = this.mousePosition;
            const radius = this.options.radius;

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

            try {
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
                context.strokeStyle = '#3b4352FF';
                context.putImageData(dest, originX, originY);
                context.stroke();
                context.restore();
            }catch(error) {
                // Click the tool-button to deactivate
                this.button.click();

                const errorMessage = 'Unexpected error using magnifyer';
                LogManager.logError(FILENAME, 'onPostrender', {
                    message: errorMessage,
                    error: error
                });
                
                Toast.error({
                    title: 'Error',
                    message: (error.name === 'SecurityError' 
                        ? 'CORS error with one of the layers'
                        : errorMessage
                    )
                });
            }
        }
    }
}

export { MagnifyTool };