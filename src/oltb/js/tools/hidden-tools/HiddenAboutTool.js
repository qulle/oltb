import { Modal } from '../../common/Modal';
import { CONFIG } from '../../core/Config';
import { Control } from 'ol/control';
import { ContextMenu } from '../../common/ContextMenu';
import { ElementManager } from '../../core/managers/ElementManager';
import { SVG_PATHS, getIcon } from '../../core/icons/GetIcon';

const FILENAME = 'hidden-tools/HiddenAboutTool.js';

class HiddenAboutTool extends Control {
    constructor() {
        super({
            element: ElementManager.getToolbarElement()
        });

        const icon = getIcon({
            path: SVG_PATHS.GitHub.Mixed
        });

        this.aboutInfoModal = undefined;

        ContextMenu.addItem({});
        ContextMenu.addItem({
            icon: icon, 
            name: 'About OLTB', 
            fn: this.onContextMenuAbout.bind(this)
        });
    }

    onContextMenuAbout(map, coordinates, target) {        
        if(Boolean(this.aboutInfoModal)) {
            return;
        }

        const content = (`
            <p>Version ${CONFIG.Version}</p>
            <p>Developed by Qulle <a href="//github.com/qulle/oltb" target="_blank" class="oltb-link">github.com/qulle/oltb</a></p>
            <p>Using OpenLayers <a href="//openlayers.org/en/v${CONFIG.OpenLayers.Version}/apidoc/" target="_blank" class="oltb-link">${CONFIG.OpenLayers.Version}</a></p>
        `);

        this.aboutInfoModal = Modal.create({
            title: 'About OLTB',
            content: content,
            onClose: () => {
                this.aboutInfoModal = undefined;
            }
        });
    }
}

export { HiddenAboutTool };