import _ from 'lodash';
import { DOM } from '../../browser-helpers/dom-factory';
import { Events } from '../../browser-constants/events';
import { toLonLat } from 'ol/proj';
import { BaseTool } from '../base-tool';
import { goToView } from '../../ol-helpers/go-to-view';
import { ShortcutKeys } from '../../browser-constants/shortcut-keys';
import { isShortcutKeyOnly } from '../../browser-helpers/is-shortcut-key-only';
import { TranslationManager } from '../../toolbar-managers/translation-manager/translation-manager';
import { SvgPaths, getSvgIcon } from '../../ui-icons/get-svg-icon/get-svg-icon';

const FILENAME = 'zoom-in-tool.js';
const CLASS__TOOL_BUTTON = 'oltb-tool-button';
const I18N__BASE = 'tools.zoomInTool';

const DefaultOptions = Object.freeze({
    delta: 1,
    onInitiated: undefined,
    onClicked: undefined,
    onZoomed: undefined
});

/**
 * About:
 * Zoom into the Map
 * 
 * Description:
 * Increase zoom and go deeper into the Map's more detailed images.
 */
class ZoomInTool extends BaseTool {
    constructor(options = {}) {
        super({
            filename: FILENAME
        });
        
        const icon = getSvgIcon({
            path: SvgPaths.zoomIn.stroked,
            class: `${CLASS__TOOL_BUTTON}__icon`
        });

        const i18n = TranslationManager.get(I18N__BASE);
        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: CLASS__TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `${i18n.title} (${ShortcutKeys.zoomInTool})`,
                'data-tippy-content-post': `(${ShortcutKeys.zoomInTool})`,
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

        this.attachGlobalListeners();

        // Note: 
        // @Consumer callback
        if(this.options.onInitiated) {
            this.options.onInitiated();
        }
    }

    attachGlobalListeners() {
        this.onWindowKeyUpBind = this.#onWindowKeyUp.bind(this);
        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUpBind);
    }

    detachGlobalListeners() {
        window.removeEventListener(Events.browser.keyUp, this.onWindowKeyUpBind);
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
    // # Section: Tool Control
    //--------------------------------------------------------------------
    momentaryActivation() {
        const map = this.getMap();
        if(!map) {
            return;
        }

        this.doZoomIn(map);
    }

    //--------------------------------------------------------------------
    // # Section: Browser Events
    //--------------------------------------------------------------------
    #onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.zoomInTool)) {
            this.onClickTool(event);
        }
    }

    //--------------------------------------------------------------------
    // # Section: Tool DoActions
    //--------------------------------------------------------------------
    doZoomIn(map) {
        const view = map.getView();
        const coordinates = toLonLat(view.getCenter());
        const currentZoom = view.getZoom();
        const calculatedZoom = view.getConstrainedZoom(currentZoom + this.options.delta);

        goToView({
            map: map, 
            coordinates: coordinates,
            zoom: calculatedZoom,
            onDone: (result) => {
                // Note: 
                // @Consumer callback
                if(this.options.onZoomed) {
                    this.options.onZoomed(result);
                }
            }
        });
    }
}

export { ZoomInTool };