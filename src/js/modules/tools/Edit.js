import 'ol/ol.css';
import EventType from 'ol/events/EventType';
import Dialog from '../common/Dialog';
import LayerManager from '../core/Managers/LayerManager';
import SettingsManager from '../core/Managers/SettingsManager';
import { Control } from 'ol/control';
import { Select, Modify, Translate } from 'ol/interaction';
import { shiftKeyOnly } from 'ol/events/condition';
import { unByKey } from 'ol/Observable';
import { onFeatureChange } from '../helpers/Measure';
import { toolboxElement, toolbarElement } from '../core/ElementReferences';
import { SVGPaths, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';

class Edit extends Control {
    constructor(callbacksObj = {}) {
        super({
            element: toolbarElement
        });
        
        const icon = getIcon({
            path: SVGPaths.Edit,
            class: 'oltb-tool-button__icon'
        });

        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.setAttribute('data-tippy-content', 'Edit (V)');
        button.className = 'oltb-tool-button';
        button.innerHTML = icon;
        button.addEventListener(
            EventType.CLICK,
            this.handleClick.bind(this),
            false
        );

        this.element.appendChild(button);
        this.button = button;
        this.callbacksObj = callbacksObj;

        toolboxElement.insertAdjacentHTML('beforeend', `
            <div id="oltb-edit-settings-box" class="oltb-toolbox-section">
                <div class="oltb-toolbox-section__group">
                    <h4 class="oltb-toolbox-section__title">Edit tool</h4>
                    <button type="button" disabled id="oltb-delete-selected-btn" class="oltb-btn oltb-btn--dark-red oltb-w-100">Delete selected features</button>
                </div>
            </div>
        `);

        const self = this;

        const editSettingsBox = document.querySelector('#oltb-edit-settings-box');
        this.editSettingsBox = editSettingsBox;

        const deleteSelectedButton = editSettingsBox.querySelector('#oltb-delete-selected-btn');
        this.deleteSelectedButton = deleteSelectedButton;
        deleteSelectedButton.addEventListener('click', this.deleteSelectedFeatures.bind(this));

        const select = new Select({
            hitTolerance: 5,
            filter: function(feature, layer) {
                const selectable = !('attributes' in feature && 'notSelectable' in feature.attributes);
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

        select.getFeatures().on('add', function(event) {
            self.deleteSelectedButton.removeAttribute('disabled');

            // User defined callback from constructor
            if(typeof self.callbacksObj.selectadd === 'function') {
                self.callbacksObj.selectadd(event);
            }
        });

        select.getFeatures().on('remove', function(event) {
            if(!select.getFeatures().getLength()) {
                self.deleteSelectedButton.setAttribute('disabled', '');
            }

            // User defined callback from constructor
            if(typeof self.callbacksObj.selectremove === 'function') {
                self.callbacksObj.selectremove(event);
            }
        });

        this.select = select;
        this.modify = modify;
        this.translate = translate;

        this.modify.addEventListener('modifystart', function(event) {
            self.attachOnChange(event.features);

            // User defined callback from constructor
            if(typeof self.callbacksObj.modifystart === 'function') {
                self.callbacksObj.modifystart(event);
            }
        });

        this.modify.addEventListener('modifyend', function(event) {
            self.detachOnChange(event.features);

            // User defined callback from constructor
            if(typeof self.callbacksObj.modifyend === 'function') {
                self.callbacksObj.modifyend(event);
            }
        });

        this.translate.addEventListener('translatestart', function(event) {
            self.attachOnChange(event.features);

            // User defined callback from constructor
            if(typeof self.callbacksObj.translatestart === 'function') {
                self.callbacksObj.translatestart(event);
            }
        });

        this.translate.addEventListener('translateend', function(event) {
            self.detachOnChange(event.features);

            // User defined callback from constructor
            if(typeof self.callbacksObj.translateend === 'function') {
                self.callbacksObj.translateend(event);
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
                            if('attributes' in feature && 'tooltipOverlay' in feature.attributes) {
                                this.getMap().removeOverlay(feature.attributes.tooltipOverlay);
                            }

                            // User defined callback from constructor
                            if(typeof this.callbacksObj.removedfeature === 'function') {
                                this.callbacksObj.removedfeature(feature);
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
            if('attributes' in feature) {
                feature.attributes.tooltipElement.className = 'oltb-measure-tooltip';
                feature.attributes.onChangeListener = feature.getGeometry().on('change', onFeatureChange.bind(feature));
            }
        });
    }

    detachOnChange(features) {
        features.forEach(feature => {
            if('attributes' in feature) {
                unByKey(feature.attributes.onChangeListener);
                feature.attributes.tooltipElement.className = 'oltb-measure-tooltip oltb-measure-tooltip--ended';
            }
        });
    }

    // Called when user changes to another tool that first must deselect/cleanup this tool
    deSelect() {
        this.handleEdit();
    }

    handleClick(event) {
        event.preventDefault();

        // Check if there is a tool already in use that needs to be deselected
        const activeTool = window?.oltb?.activeTool; 
        if(activeTool && activeTool !== this) {
            activeTool.deSelect();
        }

        // Set this tool as the active global tool
        window.oltb = window.oltb || {};
        window.oltb['activeTool'] = this;

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
        this.editSettingsBox.classList.toggle('oltb-toolbox-section--show');
        this.button.classList.toggle('oltb-tool-button--active');
    }
}

export default Edit;