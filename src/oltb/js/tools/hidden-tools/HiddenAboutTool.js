import { Modal } from '../../common/Modal';
import { Control } from 'ol/control';
import { LogManager } from '../../managers/LogManager';
import { ContextMenu } from '../../common/ContextMenu';
import { ConfigManager } from '../../managers/ConfigManager';
import { ElementManager } from '../../managers/ElementManager';
import { SvgPaths, getIcon } from '../../icons/GetIcon';
import { TranslationManager } from '../../managers/TranslationManager';

const FILENAME = 'hidden-tools/HiddenAboutTool.js';
const I18N_BASE = 'tools.hiddenAboutTool';

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

    getName() {
        return FILENAME;
    }

    //--------------------------------------------------------------------
    // # Section: Init Helpers
    //--------------------------------------------------------------------

    initContextMenuItems() {
        ContextMenu.addItem({});
        ContextMenu.addItem({
            icon: this.icon, 
            i18nKey: `${I18N_BASE}.contextItems.about`, 
            fn: this.onContextMenuAbout.bind(this)
        });
    }

    //--------------------------------------------------------------------
    // # Section: ContextMenu Callbacks
    //--------------------------------------------------------------------

    onContextMenuAbout(map, coordinates, target) {        
        this.doShowAboutModal();
    }
    
    //--------------------------------------------------------------------
    // # Section: Tool DoActions
    //--------------------------------------------------------------------

    doShowAboutModal() {
        if(this.aboutInfoModal) {
            return;
        }
        
        const config = ConfigManager.getConfig();
        const i18n = TranslationManager.get(`${I18N_BASE}.modals.about`);
        const content = (`
            <p>${i18n.version} ${config.toolbar.version}</p>
            <p>${i18n.developedBy} <a href="//github.com/qulle/oltb" target="_blank" class="oltb-link">github.com/qulle/oltb</a></p>
            <p>${i18n.usingOpenLayers} <a href="//openlayers.org/en/v${config.openLayers.version}/apidoc/" target="_blank" class="oltb-link">${config.openLayers.version}</a></p>
        `);

        this.aboutInfoModal = Modal.create({
            title: i18n.title,
            content: content,
            onClose: () => {
                this.aboutInfoModal = undefined;
            }
        });
    }
}

export { HiddenAboutTool };