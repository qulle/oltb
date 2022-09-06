import 'ol/ol.css';
import Dialog from '../common/Dialog';
import LayerManager from '../core/Managers/LayerManager';
import SettingsManager from '../core/Managers/SettingsManager';
import StateManager from '../core/Managers/StateManager';
import DOM from '../helpers/Browser/DOM';
import { Control } from 'ol/control';
import { Select, Modify, Translate } from 'ol/interaction';
import { shiftKeyOnly } from 'ol/events/condition';
import { unByKey } from 'ol/Observable';
import { onFeatureChange } from '../helpers/olFunctions/Measure';
import { toolboxElement, toolbarElement } from '../core/ElementReferences';
import { SVGPaths, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';
import { setActiveTool } from '../helpers/ActiveTool';

const LOCAL_STORAGE_NODE_NAME = 'editTool';
const LOCAL_STORAGE_DEFAULTS = {
    collapsed: false
};

const DEFAULT_OPTIONS = {};

class Edit extends Control {
    constructor(options = {}) {
        super({
            element: toolbarElement
        });
        
        const icon = getIcon({
            path: SVGPaths.Edit,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': 'Edit (V)'
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        this.element.appendChild(button);
        this.button = button;
        this.options = { ...DEFAULT_OPTIONS, ...options };

        // Load potential stored data from localStorage
        const localStorageState = JSON.parse(StateManager.getStateObject(LOCAL_STORAGE_NODE_NAME)) || {};
        this.localStorage = { ...LOCAL_STORAGE_DEFAULTS, ...localStorageState };
        
        toolboxElement.insertAdjacentHTML('beforeend', `
            <div id="oltb-edit-toolbox" class="oltb-toolbox-section">
                <div class="oltb-toolbox-section__header">
                    <h4 class="oltb-toolbox-section__title oltb-toggleable" data-oltb-toggleable-target="oltb-edit-toolbox-collapsed">
                        Edit tool
                        <span class="oltb-toolbox-section__icon oltb-tippy" title="Toggle section"></span>
                    </h4>
                </div>
                <div class="oltb-toolbox-section__groups" id="oltb-edit-toolbox-collapsed" style="display: ${this.localStorage.collapsed ? 'none' : 'block'}">
                    <div class="oltb-toolbox-section__group">
                        <button type="button" disabled id="oltb-delete-selected-btn" class="oltb-btn oltb-btn--red-mid oltb-w-100">Delete selected features</button>
                    </div>
                </div>
            </div>
        `);

        const editToolbox = document.querySelector('#oltb-edit-toolbox');
        this.editToolbox = editToolbox;

        const deleteSelectedButton = editToolbox.querySelector('#oltb-delete-selected-btn');
        this.deleteSelectedButton = deleteSelectedButton;
        deleteSelectedButton.addEventListener('click', this.deleteSelectedFeatures.bind(this));

        const toggleableTriggers = editToolbox.querySelectorAll('.oltb-toggleable');
        toggleableTriggers.forEach(toggle => {
            toggle.addEventListener('click', (event) => {
                event.preventDefault();

                const targetName = toggle.dataset.oltbToggleableTarget;
                document.getElementById(targetName).slideToggle(200, (collapsed) => {
                    this.localStorage.collapsed = collapsed;
                    StateManager.updateStateObject(LOCAL_STORAGE_NODE_NAME, JSON.stringify(this.localStorage));
                });
            });
        });

        const select = new Select({
            hitTolerance: 5,
            filter: function(feature, layer) {
                const selectable = !('properties' in feature && 'notSelectable' in feature.properties);
                const isFeatureLayer = LayerManager.getFeatureLayers().find(layerObject => {
                    return layerObject.layer.getSource().hasFeature(feature);
                });
                
                return selectable && (isFeatureLayer || SettingsManager.getSetting('selectVectorMapShapes'));
            }
        });
        
        const modify = new Modify({
            features: select.getFeatures(),
            condition: function(event) {
                return shiftKeyOnly(event);
            }
        });

        const translate = new Translate({
            features: select.getFeatures(),
        });

        select.getFeatures().on('add', (event) => {
            this.deleteSelectedButton.removeAttribute('disabled');

            // User defined callback from constructor
            if(typeof this.options.selectadd === 'function') {
                this.options.selectadd(event);
            }
        });

        select.getFeatures().on('remove', (event) => {
            if(!select.getFeatures().getLength()) {
                this.deleteSelectedButton.setAttribute('disabled', '');
            }

            // User defined callback from constructor
            if(typeof this.options.selectremove === 'function') {
                this.options.selectremove(event);
            }
        });

        this.select = select;
        this.modify = modify;
        this.translate = translate;

        this.modify.addEventListener('modifystart', (event) => {
            this.attachOnChange(event.features);

            // User defined callback from constructor
            if(typeof this.options.modifystart === 'function') {
                this.options.modifystart(event);
            }
        });

        this.modify.addEventListener('modifyend', (event) => {
            this.detachOnChange(event.features);

            // User defined callback from constructor
            if(typeof this.options.modifyend === 'function') {
                this.options.modifyend(event);
            }
        });

        this.translate.addEventListener('translatestart', (event) => {
            this.attachOnChange(event.features);

            // User defined callback from constructor
            if(typeof this.options.translatestart === 'function') {
                this.options.translatestart(event);
            }
        });

        this.translate.addEventListener('translateend', (event) => {
            this.detachOnChange(event.features);

            // User defined callback from constructor
            if(typeof this.options.translateend === 'function') {
                this.options.translateend(event);
            }
        });

        window.addEventListener('oltb.featureLayer.removed', this.featureLayerRemoved.bind(this));
        window.addEventListener('keyup', (event) => {
            if(isShortcutKeyOnly(event, 'v')) {
                this.handleClick(event);
            }else if(isShortcutKeyOnly(event, 'delete')) {
                if(this.select.getFeatures().getArray().length > 0) {
                    this.deleteSelectedFeatures();
                }
            }
        });
        window.addEventListener('oltb.settings.cleared', () => {
            this.localStorage = LOCAL_STORAGE_DEFAULTS;
        });
    }

    deleteSelectedFeatures() {
        const numSelectedFeatures = this.select.getFeatures().getArray().length;
        Dialog.confirm({
            text: `Delete ${numSelectedFeatures} selected feature${numSelectedFeatures > 1 ? 's': ''}?`,
            onConfirm: () => {
                const layerObjects = LayerManager.getFeatureLayers();
                const features = [...this.select.getFeatures().getArray()];

                // The user can select features from any layer. Each feature needs to be removed from its associated layer. 
                features.forEach(feature => {
                    layerObjects.forEach(layerObject => {
                        const source = layerObject.layer.getSource();
                        if(source.hasFeature(feature)) {
                            // Remove feature from layer
                            source.removeFeature(feature);

                            // Remove feature from selected collection
                            this.select.getFeatures().remove(feature);

                            // Remove potential overlays associated with the feature
                            if('properties' in feature && 'tooltipOverlay' in feature.properties) {
                                this.getMap().removeOverlay(feature.properties.tooltipOverlay);
                            }

                            // User defined callback from constructor
                            if(typeof this.options.removedfeature === 'function') {
                                this.options.removedfeature(feature);
                            }
                        }
                    });
                });
            }
        });
    }

    featureLayerRemoved(event) {
        // Remove all potential selected features when a featurelayer is removed 
        // One solution is to filter out and de-select just the features that where associated with the removed layer
        this.select.getFeatures().clear();
    }

    attachOnChange(features) {
        features.forEach(feature => {
            if('properties' in feature) {
                feature.properties.tooltipElement.className = 'oltb-measure-tooltip';
                feature.properties.onChangeListener = feature.getGeometry().on('change', onFeatureChange.bind(feature));
            }
        });
    }

    detachOnChange(features) {
        features.forEach(feature => {
            if('properties' in feature) {
                unByKey(feature.properties.onChangeListener);
                feature.properties.tooltipElement.className = 'oltb-measure-tooltip oltb-measure-tooltip--ended';
            }
        });
    }

    // Called when the user activates a tool that cannot be used with this tool
    deSelect() {
        this.handleEdit();
    }

    handleClick() {
        setActiveTool(this);
        this.handleEdit();
    }

    handleEdit() {
        const map = this.getMap();

        if(this.active) {
            map.removeInteraction(this.select);
            map.removeInteraction(this.translate);
            map.removeInteraction(this.modify);

            // Remove this tool as the active global tool
            window.oltb.activeTool = null;
        }else {
            map.addInteraction(this.select);
            map.addInteraction(this.translate);
            map.addInteraction(this.modify);
        }
        
        this.active = !this.active;
        this.editToolbox.classList.toggle('oltb-toolbox-section--show');
        this.button.classList.toggle('oltb-tool-button--active');
    }
}

export default Edit;