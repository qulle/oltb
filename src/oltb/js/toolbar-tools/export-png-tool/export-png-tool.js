import _ from 'lodash';
import html2canvas from 'html2canvas';
import { DOM } from '../../browser-helpers/dom-factory';
import { Toast } from '../../ui-common/ui-toasts/toast';
import { Events } from '../../browser-constants/events';
import { BaseTool } from '../base-tool';
import { LogManager } from '../../toolbar-managers/log-manager/log-manager';
import { UrlManager } from '../../toolbar-managers/url-manager/url-manager';
import { downloadFile } from '../../browser-helpers/download-file';
import { ShortcutKeys } from '../../browser-constants/shortcut-keys';
import { ConfigManager } from '../../toolbar-managers/config-manager/config-manager';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { isShortcutKeyOnly } from '../../browser-helpers/is-shortcut-key-only';
import { TranslationManager } from '../../toolbar-managers/translation-manager/translation-manager';
import { SvgPaths, getSvgIcon } from '../../ui-icons/get-svg-icon/get-svg-icon';

const FILENAME = 'export-png-tool.js';
const CLASS__TOOL_BUTTON = 'oltb-tool-button';
const I18N__BASE = 'tools.exportPngTool';

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
class ExportPngTool extends BaseTool {
    constructor(options = {}) {
        super({
            filename: FILENAME
        });
        
        const icon = getSvgIcon({
            path: SvgPaths.image.mixed,
            class: `${CLASS__TOOL_BUTTON}__icon`
        });

        const i18n = TranslationManager.get(I18N__BASE);
        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: CLASS__TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `${i18n.title} (${ShortcutKeys.exportPngTool})`,
                'data-tippy-content-post': `(${ShortcutKeys.exportPngTool})`,
                'data-oltb-i18n': `${I18N__BASE}.title`
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
        
        this.#initDebugState();
        this.attachGlobalListeners();

        // Note: 
        // @Consumer callback
        if(this.options.onInitiated) {
            this.options.onInitiated();
        }
    }

    attachGlobalListeners() {
        this.onWindowKeyUpBind = this.#onWindowKeyUp.bind(this);
        this.onOLTBReadyBind = this.#onOLTBReady.bind(this);

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUpBind);
        window.addEventListener(Events.custom.ready, this.onOLTBReadyBind);
    }

    detachGlobalListeners() {
        window.removeEventListener(Events.browser.keyUp, this.onWindowKeyUpBind);
        window.removeEventListener(Events.custom.ready, this.onOLTBReadyBind);
    }

    //--------------------------------------------------------------------
    // # Section: Overridden
    //--------------------------------------------------------------------
    getName() {
        return super.getName();
    }

    onClickTool(event) {
        super.onClickTool(event);
        this.momentaryActivation();

        // Note: 
        // @Consumer callback
        if(this.options.onClicked) {
            this.options.onClicked();
        }
    }

    //--------------------------------------------------------------------
    // # Section: Init Helpers
    //--------------------------------------------------------------------
    #initDebugState() {
        const debugKey = ConfigManager.getConfig().urlParameter.debug;
        this.isDebug = UrlManager.getParameter(debugKey) === 'true';
    }

    //--------------------------------------------------------------------
    // # Section: Tool Control
    //--------------------------------------------------------------------
    momentaryActivation() {
        this.doRenderOnce();
    }

    //--------------------------------------------------------------------
    // # Section: Browser Events
    //--------------------------------------------------------------------
    #onOLTBReady(event) {
        const uiRefMapElement = ElementManager.getMapElement();
        const uiRefAttribution = uiRefMapElement.querySelector('.ol-attribution');

        if(uiRefAttribution) {
            uiRefAttribution.setAttribute('data-html2canvas-ignore', 'true');
        }
    }

    #onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.exportPngTool)) {
            this.onClickTool(event);
        }
    }

    //--------------------------------------------------------------------
    // # Section: Map/UI Callbacks
    //--------------------------------------------------------------------
    async #onRenderCompleteAsync() {
        const map = this.getMap();
        if(!map) {
            return;
        }

        await this.doRenderCompleteAsync(map);
    }

    //--------------------------------------------------------------------
    // # Section: User Interface
    //--------------------------------------------------------------------
    #createUICanvas(width, height) {
        return DOM.createElement({
            element: 'canvas',
            attributes: {
                'width': width,
                'height': height
            }
        }); 
    }

    //--------------------------------------------------------------------
    // # Section: Getters and Setters
    //--------------------------------------------------------------------
    getCanvasMatrix(uiRefCanvas) {
        return uiRefCanvas.style.transform
            .match(/^matrix\(([^(]*)\)$/)[1]
            .split(',')
            .map(Number);
    }

    //--------------------------------------------------------------------
    // # Section: Tool DoActions
    //--------------------------------------------------------------------
    async doRenderCompleteAsync(map) {
        try {
            const uiRefMapElement = ElementManager.getMapElement();
            const size = map.getSize();
            const pngCanvas = this.#createUICanvas(size[0], size[1]);
            const pngContext = pngCanvas.getContext('2d');

            // Note:
            // When the overview tool is active a second map-canvas is present in the DOM
            // Appending the :not selector in the querySelector makes it possible to target the correct canvas 
            // Draw map layers (Canvases)
            const fullOpacity = 1;
            const uiRefMapCanvas = uiRefMapElement.querySelector('.ol-layer canvas:not(.ol-overviewmap-map canvas)');
            const opacity = uiRefMapCanvas.parentNode.style.opacity;
            pngContext.globalAlpha = opacity === '' ? fullOpacity : Number(opacity);
    
            const matrix = this.getCanvasMatrix(uiRefMapCanvas);
            CanvasRenderingContext2D.prototype.setTransform.apply(pngContext, matrix);
            pngContext.drawImage(uiRefMapCanvas, 0, 0);

            // Note:
            // When the overview tool is active a second map-canvas is present in the DOM
            // Appending the :not selector in the querySelector makes it possible to target the correct canvas 
            // Draw overlays souch as Tooltips and InfoWindows
            const uiRefOverlay = uiRefMapElement.querySelector('.ol-overlaycontainer-stopevent:not(.ol-overviewmap-map .ol-overlaycontainer-stopevent)');
            const overlayCanvas = await html2canvas(uiRefOverlay, {
                scrollX: 0,
                scrollY: 0,
                backgroundColor: null,
                logging: this.isDebug
            });

            pngContext.drawImage(overlayCanvas, 0, 0);
            this.doDownloadCanvas(pngCanvas);
        }catch(error) {
            // Note: 
            // @Consumer callback
            if(this.options.onError) {
                this.options.onError(error);
            }

            LogManager.logError(FILENAME, 'doRenderCompleteAsync', {
                message: 'Failed to export canvas image',
                error: error
            });
            
            Toast.error({
                i18nKey: `${I18N__BASE}.toasts.errors.renderCanvas`
            });
        }
    }

    doRenderOnce() {
        const map = this.getMap();
        if(!map) {
            return;
        }

        // Note: 
        // RenderSync will trigger the export the png
        map.once(Events.openLayers.renderComplete, this.#onRenderCompleteAsync.bind(this));
        map.renderSync();
    }

    doDownloadCanvas(pngCanvas) {
        const locale = ConfigManager.getConfig().localization.active;
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
            downloadFile(filename, content);
        }

        // Note: 
        // @Consumer callback
        if(this.options.onExported) {
            this.options.onExported(filename, content);
        }
    }
}

export { ExportPngTool };