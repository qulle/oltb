import _ from 'lodash';
import { DOM } from '../../helpers/browser/dom-factory';
import { Keys } from '../../helpers/constants/keys';
import { Toast } from '../../common/toasts/toast';
import { Events } from '../../helpers/constants/events';
import { Control } from 'ol/control';
import { unByKey } from 'ol/Observable';
import { LogManager } from '../../managers/log-manager/log-manager';
import { StateManager } from '../../managers/state-manager/state-manager';
import { ShortcutKeys } from '../../helpers/constants/shortcut-keys';
import { getRenderPixel } from 'ol/render';
import { ElementManager } from '../../managers/element-manager/element-manager';
import { LocalStorageKeys } from '../../helpers/constants/local-storage-keys';
import { SvgPaths, getIcon } from '../../icons/get-icon';
import { isShortcutKeyOnly } from '../../helpers/browser/is-shortcut-key-only';
import { TranslationManager } from '../../managers/translation-manager/translation-manager';

const FILENAME = 'MagnifyTool.js';
const CLASS_TOOL_BUTTON = 'oltb-tool-button';
const I18N_BASE = 'tools.magnifyTool';

const DefaultOptions = Object.freeze({
    radius: 75,
    min: 25,
    max: 150,
    onInitiated: undefined,
    onClicked: undefined,
    onBrowserStateCleared: undefined
});

const LocalStorageNodeName = LocalStorageKeys.magnifyTool;
const LocalStorageDefaults = Object.freeze({
    isActive: false
});

/**
 * About:
 * Enlarge parts of the Map under the mouse
 * 
 * Description:
 * The magnifying glass allows you to enlarge parts of the map that are under the mouse. 
 * The image often becomes pixelated as it is bitmap images that are enlarged.
 */
class MagnifyTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');
        
        super({
            element: ElementManager.getToolbarElement()
        });
        
        const icon = getIcon({
            path: SvgPaths.search.stroked,
            class: `${CLASS_TOOL_BUTTON}__icon`
        });

        const i18n = TranslationManager.get(I18N_BASE);
        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: CLASS_TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `${i18n.title} (${ShortcutKeys.magnifyTool})`,
                'data-tippy-content-post': `(${ShortcutKeys.magnifyTool})`,
                'data-oltb-i18n': `${I18N_BASE}.title`
            },
            listeners: {
                'click': this.onClickTool.bind(this)
            }
        });

        DOM.appendChildren(this.element, [
            button
        ]);
        
        this.button = button;
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);

        this.localStorage = StateManager.getAndMergeStateObject(
            LocalStorageNodeName, 
            LocalStorageDefaults
        );

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));
        window.addEventListener(Events.custom.ready, this.onOLTBReady.bind(this));
        window.addEventListener(Events.custom.browserStateCleared, this.onWindowBrowserStateCleared.bind(this));

        // Note: 
        // @Consumer callback
        if(this.options.onInitiated instanceof Function) {
            this.options.onInitiated();
        }
    }

    getName() {
        return FILENAME;
    }

    //--------------------------------------------------------------------
    // # Section: Tool Control
    //--------------------------------------------------------------------
    onClickTool(event) {
        LogManager.logDebug(FILENAME, 'onClickTool', 'User clicked tool');

        if(this.isActive) {
            this.deactivateTool();
        }else {
            this.activateTool();
        }

        // Note: 
        // @Consumer callback
        if(this.options.onClicked instanceof Function) {
            this.options.onClicked();
        }
    }

    activateTool() {
        this.attachMapListeners();

        this.isActive = true;
        this.button.classList.add(`${CLASS_TOOL_BUTTON}--active`);

        this.localStorage.isActive = true;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    deactivateTool() {
        this.detachMapListeners();

        this.isActive = false;
        this.button.classList.remove(`${CLASS_TOOL_BUTTON}--active`);

        this.localStorage.isActive = false;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    //--------------------------------------------------------------------
    // # Section: Browser Events
    //--------------------------------------------------------------------
    onOLTBReady(event) {
        if(this.localStorage.isActive) {
            this.activateTool();
        }
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.magnifyTool)) {
            this.onClickTool(event);
        }
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

    onWindowBrowserStateCleared() {
        this.doClearState();
    
        if(this.isActive) {
            this.deactivateTool();
        }
    
        // Note: 
        // @Consumer callback
        if(this.options.onBrowserStateCleared instanceof Function) {
            this.options.onBrowserStateCleared();
        }
    }

    //--------------------------------------------------------------------
    // # Section: Map/UI Callbacks
    //--------------------------------------------------------------------
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
        if(!this.mousePosition) {
            return;
        }

        this.doPostRender(event);
    }

    //--------------------------------------------------------------------
    // # Section: Listeners Subscriptions
    //--------------------------------------------------------------------
    attachMapListeners() {
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
        window.document.addEventListener(Events.browser.keyDown, this.onKeydownListener);

        this.onPostrenderListeners = [];
        map.getLayers().getArray().forEach((layer) => {
            this.onPostrenderListeners.push(layer.on(Events.openLayers.postRender, this.onPostrender.bind(this)));
        });
    }

    detachMapListeners() {
        const map = this.getMap();
        if(!map) {
            return;
        }

        const mapContainer = map.getTarget();

        // Remove the eventlisteners
        mapContainer.removeEventListener(Events.browser.mouseMove, this.onMousemoveListenert);
        mapContainer.removeEventListener(Events.browser.mouseOut, this.onMouseoutListenert);
        window.document.removeEventListener(Events.browser.keyDown, this.onKeydownListener);

        this.onPostrenderListeners.forEach((listener) => {
            unByKey(listener);
        });

        // Note: 
        // Render to remove the magnifier
        map.render();
    }

    //--------------------------------------------------------------------
    // # Section: Tool DoActions
    //--------------------------------------------------------------------
    doClearState() {
        this.localStorage = _.cloneDeep(LocalStorageDefaults);
        StateManager.setStateObject(LocalStorageNodeName, LocalStorageDefaults);
    }

    doPostRender(event) {
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

            LogManager.logError(FILENAME, 'onPostrender', {
                message: 'Unexpected error using magnifyer',
                error: error
            });
            
            Toast.error({
                i18nKey: `${I18N_BASE}.toasts.errors.renderCanvas`
            });
        }
    }
}

export { MagnifyTool };