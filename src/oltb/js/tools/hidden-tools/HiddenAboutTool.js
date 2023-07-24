import { Modal } from '../../common/Modal';
import { Config } from '../../core/Config';
import { Control } from 'ol/control';
import { LogManager } from '../../core/managers/LogManager';
import { ContextMenu } from '../../common/ContextMenu';
import { ElementManager } from '../../core/managers/ElementManager';
import { SvgPaths, getIcon } from '../../core/icons/GetIcon';

const FILENAME = 'hidden-tools/HiddenAboutTool.js';

/**
 * About:
 * Show information about OLTB
 * 
 * Description:
 * Show information about the project, version and links to the source code etc.
 */
class HiddenAboutTool extends Control {
    constructor() {
        LogManager.logDebug(FILENAME, 'constructor', 'init');

        super({
            element: ElementManager.getToolbarElement()
        });

        this.icon = getIcon({
            path: SvgPaths.gitHub.mixed
        });

        this.aboutInfoModal = undefined;

        this.initContextMenuItems();
    }

    // -------------------------------------------------------------------
    // # Section: Init Helpers
    // -------------------------------------------------------------------

    initContextMenuItems() {
        ContextMenu.addItem({});
        ContextMenu.addItem({
            icon: this.icon, 
            name: 'About OLTB', 
            fn: this.onContextMenuAbout.bind(this)
        });
    }

    // -------------------------------------------------------------------
    // # Section: ContextMenu Callbacks
    // -------------------------------------------------------------------

    onContextMenuAbout(map, coordinates, target) {        
        if(this.aboutInfoModal) {
            return;
        }

        this.showAboutModal();
    }
    
    // -------------------------------------------------------------------
    // # Section: Tool Actions
    // -------------------------------------------------------------------

    showAboutModal() {
        const content = (`
            <p>Version ${Config.toolbar.version}</p>
            <p>Developed by Qulle <a href="//github.com/qulle/oltb" target="_blank" class="oltb-link">github.com/qulle/oltb</a></p>
            <p>Using OpenLayers <a href="//openlayers.org/en/v${Config.openLayers.version}/apidoc/" target="_blank" class="oltb-link">${Config.openLayers.version}</a></p>
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