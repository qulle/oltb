import _ from 'lodash';
import { DOM } from '../../helpers/browser/dom-factory';
import { Events } from '../../helpers/constants/events';
import { Control } from 'ol/control';
import { toLonLat } from 'ol/proj';
import { goToView } from '../../helpers/go-to-view';
import { LogManager } from '../../managers/log-manager/log-manager';
import { ShortcutKeys } from '../../helpers/constants/shortcut-keys';
import { ElementManager } from '../../managers/element-manager/element-manager';
import { SvgPaths, getIcon } from '../../icons/get-icon';
import { isShortcutKeyOnly } from '../../helpers/browser/is-shortcut-key-only';
import { TranslationManager } from '../../managers/translation-manager/translation-manager';

const FILENAME = 'ZoomOutTool.js';
const CLASS_TOOL_BUTTON = 'oltb-tool-button';
const I18N_BASE = 'tools.zoomOutTool';

const DefaultOptions = Object.freeze({
    delta: -1,
    onInitiated: undefined,
    onClicked: undefined,
    onZoomed: undefined
});

/**
 * About:
 * Zoom out of the Map
 * 
 * Description:
 * Reduce zooming and get a more comprehensive view of the surroundings in the Map.
 */
class ZoomOutTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');
        
        super({
            element: ElementManager.getToolbarElement()
        });
        
        const icon = getIcon({
            path: SvgPaths.zoomOut.stroked,
            class: `${CLASS_TOOL_BUTTON}__icon`
        });

        const i18n = TranslationManager.get(I18N_BASE);
        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: CLASS_TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `${i18n.title} (${ShortcutKeys.zoomOutTool})`,
                'data-tippy-content-post': `(${ShortcutKeys.zoomOutTool})`,
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

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));

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
        
        this.momentaryActivation();

        // Note: 
        // @Consumer callback
        if(this.options.onClicked instanceof Function) {
            this.options.onClicked();
        }
    }

    momentaryActivation() {
        const map = this.getMap();
        if(!map) {
            return;
        }
        
        this.doZoomOut(map);
    }

    //--------------------------------------------------------------------
    // # Section: Browser Events
    //--------------------------------------------------------------------
    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.zoomOutTool)) {
            this.onClickTool(event);
        }
    }

    //--------------------------------------------------------------------
    // # Section: Tool DoActions
    //--------------------------------------------------------------------
    doZoomOut(map) {
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
                if(this.options.onZoomed instanceof Function) {
                    this.options.onZoomed(result);
                }
            }
        });
    }
}

export { ZoomOutTool };