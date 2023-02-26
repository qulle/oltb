import { OSM } from 'ol/source';
import { DOM } from '../helpers/browser/DOM';
import { Tile } from 'ol/layer';
import { CONFIG } from '../core/Config';
import { EVENTS } from '../helpers/constants/Events';
import { StateManager } from '../core/managers/StateManager';
import { SHORTCUT_KEYS } from '../helpers/constants/ShortcutKeys';
import { isShortcutKeyOnly } from '../helpers/browser/ShortcutKeyOnly';
import { SVG_PATHS, getIcon } from '../core/icons/GetIcon';
import { LOCAL_STORAGE_KEYS } from '../helpers/constants/LocalStorageKeys';
import { Control, OverviewMap } from 'ol/control';
import { TOOLBOX_ELEMENT, TOOLBAR_ELEMENT } from '../core/elements/index';

const FILENAME = 'tools/OverviewTool.js';
const ID_PREFIX = 'oltb-overview';
const DEFAULT_OPTIONS = Object.freeze({});

const LOCAL_STORAGE_NODE_NAME = LOCAL_STORAGE_KEYS.OverviewTool;
const LOCAL_STORAGE_DEFAULTS = Object.freeze({
    active: false,
    collapsed: false
});

class OverviewTool extends Control {
    constructor(options = {}) {
        super({
            element: TOOLBAR_ELEMENT
        });
        
        const icon = getIcon({
            path: SVG_PATHS.AspectRatio.Stroked,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': `Area overview (${SHORTCUT_KEYS.Overview})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        this.element.appendChild(button);
        this.button = button;
        this.active = false;
        this.options = { ...DEFAULT_OPTIONS, ...options };

        // Load stored data from localStorage
        const localStorageState = StateManager.getStateObject(LOCAL_STORAGE_NODE_NAME);
        this.localStorage = { ...LOCAL_STORAGE_DEFAULTS, ...localStorageState };

        TOOLBOX_ELEMENT.insertAdjacentHTML('beforeend', `
            <div id="${ID_PREFIX}-toolbox" class="oltb-toolbox-section">
                <div class="oltb-toolbox-section__header">
                    <h4 class="oltb-toolbox-section__title oltb-toggleable" data-oltb-toggleable-target="${ID_PREFIX}-toolbox-collapsed">
                        Overview tool
                        <span class="oltb-toolbox-section__icon oltb-tippy" title="Toggle section"></span>
                    </h4>
                </div>
                <div class="oltb-toolbox-section__groups" id="${ID_PREFIX}-toolbox-collapsed" style="display: ${this.localStorage.collapsed ? 'none' : 'block'}">
                    <div class="oltb-toolbox-section__group" id="${ID_PREFIX}-target"></div>
                </div>
            </div>
        `);

        this.overviewToolbox = document.querySelector(`#${ID_PREFIX}-toolbox`);

        const toggleableTriggers = this.overviewToolbox.querySelectorAll('.oltb-toggleable');
        toggleableTriggers.forEach((toggle) => {
            toggle.addEventListener(EVENTS.Browser.Click, this.onToggleToolbox.bind(this, toggle));
        });

        this.overviewMap = new OverviewMap({
            target: 'oltb-overview-target',
            collapsed: false,
            collapsible: false,
            layers: [
                new Tile({
                    source: new OSM(),
                }),
            ]
        });

        window.addEventListener(EVENTS.Browser.KeyUp, this.onWindowKeyUp.bind(this));
        window.addEventListener(EVENTS.Custom.SettingsCleared, this.onWindowSettingsCleared.bind(this));
        window.addEventListener(EVENTS.Browser.ContentLoaded, this.onDOMContentLoaded.bind(this));
    }

    onToggleToolbox(toggle) {
        const targetName = toggle.dataset.oltbToggleableTarget;
        document.getElementById(targetName).slideToggle(CONFIG.AnimationDuration.fast, (collapsed) => {
            this.localStorage.collapsed = collapsed;
            StateManager.setStateObject(LOCAL_STORAGE_NODE_NAME, this.localStorage);
        
            // Force render of overview, 
            // Other solutions will not render the dashed box correctly until the map is moved
            this.overviewMap.setMap(null);
            this.overviewMap.setMap(this.getMap());
        });
    }

    onDOMContentLoaded() {
        if(this.localStorage.active) {
            this.activateTool();
        }
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, SHORTCUT_KEYS.Overview)) {
            this.handleClick(event);
        }
    }
    
    onWindowSettingsCleared() {
        this.localStorage = { ...LOCAL_STORAGE_DEFAULTS };
    }

    handleClick() {
        // User defined callback from constructor
        if(typeof this.options.click === 'function') {
            this.options.click();
        }

        if(this.active) {
            this.deActivateTool();
        }else {
            this.activateTool(); 
        }
    }

    activateTool() {
        // The class must be added before setMap or the overview will not render correctly
        this.overviewToolbox.classList.add('oltb-toolbox-section--show');
        this.overviewMap.setMap(this.getMap());

        this.active = true;
        this.button.classList.add('oltb-tool-button--active');

        this.localStorage.active = true;
        StateManager.setStateObject(LOCAL_STORAGE_NODE_NAME, this.localStorage);
    }

    deActivateTool() {
        this.overviewMap.setMap(null);

        this.active = false;
        this.button.classList.remove('oltb-tool-button--active');
        this.overviewToolbox.classList.remove('oltb-toolbox-section--show');

        this.localStorage.active = false;
        StateManager.setStateObject(LOCAL_STORAGE_NODE_NAME, this.localStorage);
    }
}

export { OverviewTool };