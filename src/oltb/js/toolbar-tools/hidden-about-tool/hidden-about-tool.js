import { Modal } from '../../ui-common/ui-modals/modal';
import { BaseTool } from '../base-tool';
import { ConfigManager } from '../../toolbar-managers/config-manager/config-manager';
import { ContextMenuTool } from '../context-menu-tool/context-menu-tool';
import { TranslationManager } from '../../toolbar-managers/translation-manager/translation-manager';
import { SvgPaths, getSvgIcon } from '../../ui-icons/get-svg-icon/get-svg-icon';

const FILENAME = 'hidden-about-tool.js';
const I18N__BASE = 'tools.hiddenAboutTool';

/**
 * About:
 * Show information about OLTB
 * 
 * Description:
 * Show information about the project, version and links to the source code etc.
 */
class HiddenAboutTool extends BaseTool {
    constructor() {
        super({
            filename: FILENAME
        });

        this.icon = getSvgIcon({
            path: SvgPaths.gitHub.mixed
        });

        this.aboutInfoModal = undefined;

        this.#initContextMenuItems();
    }

    //--------------------------------------------------------------------
    // # Section: Overridden
    //--------------------------------------------------------------------
    getName() {
        return super.getName();
    }

    //--------------------------------------------------------------------
    // # Section: Init Helpers
    //--------------------------------------------------------------------
    #initContextMenuItems() {
        ContextMenuTool.addItem({});
        ContextMenuTool.addItem({
            icon: this.icon, 
            i18nKey: `${I18N__BASE}.contextItems.about`, 
            fn: this.#onContextMenuAbout.bind(this)
        });
    }

    //--------------------------------------------------------------------
    // # Section: ContextMenu Callbacks
    //--------------------------------------------------------------------
    #onContextMenuAbout(map, coordinates, target) {        
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
        const i18n = TranslationManager.get(`${I18N__BASE}.modals.about`);
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