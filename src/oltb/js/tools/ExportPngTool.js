import _ from 'lodash';
import html2canvas from 'html2canvas';
import { DOM } from '../helpers/browser/DOM';
import { Toast } from '../common/Toast';
import { Events } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { download } from '../helpers/browser/Download';
import { LogManager } from '../managers/LogManager';
import { UrlManager } from '../managers/UrlManager';
import { ShortcutKeys } from '../helpers/constants/ShortcutKeys';
import { ConfigManager } from '../managers/ConfigManager';
import { ElementManager } from '../managers/ElementManager';
import { SvgPaths, getIcon } from '../icons/GetIcon';
import { isShortcutKeyOnly } from '../helpers/browser/IsShortcutKeyOnly';
import { TranslationManager } from '../managers/TranslationManager';

const FILENAME = 'tools/ExportPngTool.js';
const CLASS_TOOL_BUTTON = 'oltb-tool-button';
const I18N_BASE = 'tools.exportPngTool';

const DefaultOptions = Object.freeze({
    filename: 'map-image-export',
    appendTime: false,
    onInitiated: undefined,
    onClicked: undefined,
    onExported: undefined,
    onError: undefined
});

/**
 * About:
 * Take a picture of the Map
 * 
 * Description:
 * Instead of taking a screenshot, a complete PNG-image can be exported. 
 * The export combines the actual canvas that makes up the Map with various overlays such as information boxes that are actual HTML elements.
 */
class ExportPngTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');

        super({
            element: ElementManager.getToolbarElement()
        });
        
        const icon = getIcon({
            path: SvgPaths.image.mixed,
            class: `${CLASS_TOOL_BUTTON}__icon`
        });

        const i18n = TranslationManager.get(I18N_BASE);
        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: CLASS_TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `${i18n.title} (${ShortcutKeys.exportPngTool})`
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
        
        this.initDebugState();

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));
        window.addEventListener(Events.custom.ready, this.onOLTBReady.bind(this));

        // Note: Consumer callback
        if(this.options.onInitiated instanceof Function) {
            this.options.onInitiated();
        }
    }

    getName() {
        return FILENAME;
    }

    // -------------------------------------------------------------------
    // # Section: Init Helpers
    // -------------------------------------------------------------------

    initDebugState() {
        const debugKey = ConfigManager.getConfig().urlParameter.debug;
        this.isDebug = UrlManager.getParameter(debugKey) === 'true';
    }

    // -------------------------------------------------------------------
    // # Section: Tool Control
    // -------------------------------------------------------------------

    onClickTool(event) {
        LogManager.logDebug(FILENAME, 'onClickTool', 'User clicked tool');

        this.momentaryActivation();

        // Note: Consumer callback
        if(this.options.onClicked instanceof Function) {
            this.options.onClicked();
        }
    }

    momentaryActivation() {
        this.doRenderOnce();
    }

    // -------------------------------------------------------------------
    // # Section: Browser Events
    // -------------------------------------------------------------------

    onOLTBReady(event) {
        const uiRefMapElement = ElementManager.getMapElement();
        const uiRefAttribution = uiRefMapElement.querySelector('.ol-attribution');

        if(uiRefAttribution) {
            uiRefAttribution.setAttribute('data-html2canvas-ignore', 'true');
        }
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.exportPngTool)) {
            this.onClickTool(event);
        }
    }

    // -------------------------------------------------------------------
    // # Section: Map/UI Callbacks
    // -------------------------------------------------------------------

    async onRenderCompleteAsync() {
        const map = this.getMap();
        if(!map) {
            return;
        }

        this.doRenderCompleteAsync(map);
    }

    // -------------------------------------------------------------------
    // # Section: User Interface
    // -------------------------------------------------------------------

    createUICanvas(width, height) {
        return DOM.createElement({
            element: 'canvas',
            attributes: {
                'width': width,
                'height': height
            }
        }); 
    }

    // -------------------------------------------------------------------
    // # Section: Getters and Setters
    // -------------------------------------------------------------------

    getCanvasMatrix(uiRefCanvas) {
        return uiRefCanvas.style.transform
            .match(/^matrix\(([^(]*)\)$/)[1]
            .split(',')
            .map(Number);
    }

    // -------------------------------------------------------------------
    // # Section: Tool DoActions
    // -------------------------------------------------------------------

    async doRenderCompleteAsync(map) {
        try {
            const uiRefMapElement = ElementManager.getMapElement();
            const size = map.getSize();
            const pngCanvas = this.createUICanvas(size[0], size[1]);
            const pngContext = pngCanvas.getContext('2d');

            // Draw map layers (Canvases)
            const fullOpacity = 1;
            const uiRefMapCanvas = uiRefMapElement.querySelector('.ol-layer canvas');
            const opacity = uiRefMapCanvas.parentNode.style.opacity;
            pngContext.globalAlpha = opacity === '' ? fullOpacity : Number(opacity);
    
            const matrix = this.getCanvasMatrix(uiRefMapCanvas);
            CanvasRenderingContext2D.prototype.setTransform.apply(pngContext, matrix);
            pngContext.drawImage(uiRefMapCanvas, 0, 0);

            // Draw overlays souch as Tooltips and InfoWindows
            const uiRefOverlay = uiRefMapElement.querySelector('.ol-overlaycontainer-stopevent');
            const overlayCanvas = await html2canvas(uiRefOverlay, {
                scrollX: 0,
                scrollY: 0,
                backgroundColor: null,
                logging: this.isDebug
            });

            pngContext.drawImage(overlayCanvas, 0, 0);
            this.doDownloadCanvas(pngCanvas);
        }catch(error) {
            // Note: Consumer callback
            if(this.options.onError instanceof Function) {
                this.options.onError(error);
            }

            LogManager.logError(FILENAME, 'doRenderCompleteAsync', {
                message: 'Failed to export canvas image',
                error: error
            });
            
            const i18n = TranslationManager.get(`${I18N_BASE}.toasts.renderError`);
            Toast.error({
                title: i18n.title,
                message: i18n.message
            });
        }
    }

    doRenderOnce() {
        const map = this.getMap();
        if(!map) {
            return;
        }

        // Note: RenderSync will trigger the export the png
        map.once(Events.openLayers.renderComplete, this.onRenderCompleteAsync.bind(this));
        map.renderSync();
    }

    doDownloadCanvas(pngCanvas) {
        const locale = ConfigManager.getConfig().locale;
        const timestamp = this.options.appendTime 
            ? `-${new Date().toLocaleString(locale)}`
            : '';

        const filename = `${this.options.filename}${timestamp}.png`;
        const content = window.navigator.msSaveBlob
            ? pngCanvas.msToBlob()
            : pngCanvas.toDataURL();

        if(window.navigator.msSaveBlob) {
            window.navigator.msSaveBlob(content, filename);
        }else {
            download(filename, content);
        }

        // Note: Consumer callback
        if(this.options.onExported instanceof Function) {
            this.options.onExported(filename, content);
        }
    }
}

export { ExportPngTool };