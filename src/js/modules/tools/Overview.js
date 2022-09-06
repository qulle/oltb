import 'ol/ol.css';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import StateManager from '../core/Managers/StateManager';
import DOM from '../helpers/Browser/DOM';
import { Control, OverviewMap } from 'ol/control';
import { toolboxElement, toolbarElement } from '../core/ElementReferences';
import { SVGPaths, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';

const LOCAL_STORAGE_NODE_NAME = 'overviewTool';
const LOCAL_STORAGE_DEFAULTS = {
    collapsed: false
};

class Overview extends Control {
    constructor() {
        super({
            element: toolbarElement
        });
        
        const icon = getIcon({
            path: SVGPaths.AspectRation,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': 'Area overview (A)'
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        this.element.appendChild(button);
        this.button = button;
        this.active = false;

        // Load potential stored data from localStorage
        const localStorageState = JSON.parse(StateManager.getStateObject(LOCAL_STORAGE_NODE_NAME)) || {};
        this.localStorage = { ...LOCAL_STORAGE_DEFAULTS, ...localStorageState };

        toolboxElement.insertAdjacentHTML('beforeend', `
            <div id="oltb-overview-toolbox" class="oltb-toolbox-section">
                <div class="oltb-toolbox-section__header">
                    <h4 class="oltb-toolbox-section__title oltb-toggleable" data-oltb-toggleable-target="oltb-overview-toolbox-collapsed">
                        Overview tool
                        <span class="oltb-toolbox-section__icon oltb-tippy" title="Toggle section"></span>
                    </h4>
                </div>
                <div class="oltb-toolbox-section__groups" id="oltb-overview-toolbox-collapsed" style="display: ${this.localStorage.collapsed ? 'none' : 'block'}">
                    <div class="oltb-toolbox-section__group" id="oltb-overview-target"></div>
                </div>
            </div>
        `);

        const overviewToolbox = document.querySelector('#oltb-overview-toolbox');
        this.overviewToolbox = overviewToolbox;

        const toggleableTriggers = overviewToolbox.querySelectorAll('.oltb-toggleable');
        toggleableTriggers.forEach(toggle => {
            toggle.addEventListener('click', (event) => {
                event.preventDefault();

                const targetName = toggle.dataset.oltbToggleableTarget;
                document.getElementById(targetName).slideToggle(200, (collapsed) => {
                    this.localStorage.collapsed = collapsed;
                    StateManager.updateStateObject(LOCAL_STORAGE_NODE_NAME, JSON.stringify(this.localStorage));
                    
                    // Force render of overview, other solutions will not render the dashed box correctly until the map is moved
                    this.overviewMap.setMap(null);
                    this.overviewMap.setMap(this.getMap());
                });
            });
        });

        this.overviewMap = new OverviewMap({
            target: 'oltb-overview-target',
            collapsed: false,
            collapsible: false,
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
            ]
        });

        window.addEventListener('keyup', (event) => {
            if(isShortcutKeyOnly(event, 'a')) {
                this.handleClick(event);
            }
        });
        window.addEventListener('oltb.settings.cleared', () => {
            this.localStorage = LOCAL_STORAGE_DEFAULTS;
        });
    }

    handleClick() {
        // This must come before the setMap method or it will sometimes fail to render the overview
        this.overviewToolbox.classList.toggle('oltb-toolbox-section--show');

        if(this.active) {
            this.overviewMap.setMap(null);
        }else {
            this.overviewMap.setMap(this.getMap());  
        }

        this.active = !this.active;
        this.button.classList.toggle('oltb-tool-button--active');
    }
}

export default Overview;