import _ from 'lodash';
import { DOM } from '../../helpers/browser/dom-factory';
import { Stroke } from 'ol/style';
import { Events } from '../../helpers/constants/events';
import { Control } from 'ol/control';
import { Graticule } from 'ol/layer';
import { LogManager } from '../../managers/log-manager/log-manager';
import { StateManager } from '../../managers/state-manager/state-manager';
import { ShortcutKeys } from '../../helpers/constants/shortcut-keys';
import { ElementManager } from '../../managers/element-manager/element-manager';
import { LocalStorageKeys } from '../../helpers/constants/local-storage-keys';
import { isShortcutKeyOnly } from '../../helpers/browser/is-shortcut-key-only';
import { TranslationManager } from '../../managers/translation-manager/translation-manager';
import { SvgPaths, getSvgIcon } from '../../ui-icons/get-svg-icon/get-svg-icon';

const FILENAME = 'graticule-tool.js';
const CLASS__TOOL_BUTTON = 'oltb-tool-button';
const I18N__BASE = 'tools.graticuleTool';
const DASHED_ON = [1, 4];
const DASHED_OFF = [0, 0];

const DefaultOptions = Object.freeze({
    color: '#3B4352E6',
    dashed: true,
    width: 2,
    showLabels: true,
    wrapX: true,
    onInitiated: undefined,
    onClicked: undefined,
    onBrowserStateCleared: undefined
});

const LocalStorageNodeName = LocalStorageKeys.graticuleTool;
const LocalStorageDefaults = Object.freeze({
    isActive: false
});

/**
 * About:
 * Graphical depiction of a coordinate system as a grid of lines
 * 
 * Description:
 * Show a graphical depiction of a coordinate system as a grid of lines both in vertical and horizontal directions.
 */
class GraticuleTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');

        super({
            element: ElementManager.getToolbarElement()
        });
        
        const icon = getSvgIcon({
            path: SvgPaths.globe.stroked,
            class: `${CLASS__TOOL_BUTTON}__icon`
        });

        const i18n = TranslationManager.get(I18N__BASE);
        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: CLASS__TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `${i18n.title} (${ShortcutKeys.graticuleTool})`,
                'data-tippy-content-post': `(${ShortcutKeys.graticuleTool})`,
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
        this.isActive = false;
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);

        this.localStorage = StateManager.getAndMergeStateObject(
            LocalStorageNodeName, 
            LocalStorageDefaults
        );
        
        this.graticule = this.generateOLGraticule();

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
    // # Section: Generate Helpers
    //--------------------------------------------------------------------
    generateOLGraticule() {
        return new Graticule({
            strokeStyle: new Stroke({
                color: this.options.color,
                width: this.options.width,
                lineDash: this.options.dashed ? DASHED_ON : DASHED_OFF,
            }),
            showLabels: this.options.showLabels,
            isVisible: true,
            wrapX: this.options.wrapX,
        });
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
        const map = this.getMap();
        if(!map) {
            return;
        }

        this.doAddGraticuleLines(map);

        this.isActive = true;
        this.button.classList.add(`${CLASS__TOOL_BUTTON}--active`);

        this.localStorage.isActive = true;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    deactivateTool() {
        this.doRemoveGraticuleLines();

        this.isActive = false;
        this.button.classList.remove(`${CLASS__TOOL_BUTTON}--active`);

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
        if(isShortcutKeyOnly(event, ShortcutKeys.graticuleTool)) {
            this.onClickTool(event);
        }
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
    // # Section: Tool DoActions
    //--------------------------------------------------------------------
    doClearState() {
        this.localStorage = _.cloneDeep(LocalStorageDefaults);
        StateManager.setStateObject(LocalStorageNodeName, LocalStorageDefaults);
    }

    doAddGraticuleLines(map) {
        this.graticule.setMap(map);
    }

    doRemoveGraticuleLines() {
        this.graticule.setMap(null);
    }
}

export { GraticuleTool };