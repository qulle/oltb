import { DOM } from '../../helpers/browser/DOM';
import { Toast } from '../../common/Toast';
import { CONFIG } from '../../core/Config';
import { EVENTS } from '../../helpers/constants/Events';
import { ModalBase } from '../../common/modals/ModalBase';
import { PROJECTIONS } from '../../epsg/Projections';
import { getIcon, SVG_PATHS } from '../../core/icons/GetIcon';

const ID_PREFIX = 'oltb-debug';
const DEFAULT_OPTIONS = Object.freeze({
    map: undefined,
    maximized: true,
    onClose: undefined
});

class DebugInfoModal extends ModalBase {
    constructor(options = {}) {
        super(
            'Debug information', 
            DEFAULT_OPTIONS.maximized, 
            options.onClose
        );
        
        this.options = { ...DEFAULT_OPTIONS, ...options };

        // Browser LocalStorage
        const localStorageContent = {};
        Object.keys(localStorage).forEach((key) => {
            try {
                localStorageContent[key] = JSON.parse(localStorage.getItem(key) || '{}');
            }catch (error) {
                console.error('Error parsing localstorage', error);
            }
        });

        // Browser SectionStorage
        const sessionStorageContent = {};
        Object.keys(sessionStorage).forEach((key) => {
            try {
                sessionStorageContent[key] = JSON.parse(localStorage.getItem(key) || '{}');
            } catch (error) {
                console.error('Error parsing sessionStorage', error);
            }
        });

        // Browser Cookies
        const cookiesContent = Object.fromEntries(document.cookie.split('; ').map((c) => {
            return c.split('=');
        }));

        // OL Information
        const view = this.options.map?.getView();
        const debugContent = view ? {
            zoom: view.getZoom(),
            location: view.getCenter(),
            rotation: view.getRotation(),
            projection: view.getProjection(),
            proj4Defs: PROJECTIONS,
            defaultConfig: CONFIG
        } : {
            info: 'No map reference found'
        };

        // Generate sections
        const sectionFragment = document.createDocumentFragment(); 
        [
            {
                title: 'Local Storage',
                content: localStorageContent
            },
            {
                title: 'Session Storage',
                content: sessionStorageContent
            }, {
                title: 'Cookies',
                content: cookiesContent
            }, {
                title: 'App data',
                content: debugContent
            }, {
                title: 'Log',
                content: 'Test of Log content'
            }
        ].forEach((section, index) => {
            const sectionWrapper = DOM.createElement({
                element: 'div',
                class: 'oltb-debug'
            });
    
            const sectionHeader = DOM.createElement({
                element: 'div',
                class: 'oltb-debug__header oltb-toggleable',
                attributes: {
                    'data-oltb-toggleable-target': `${ID_PREFIX}-section-${index}`
                }
            });

            const sectionTitle = DOM.createElement({
                element: 'h4',
                class: 'oltb-debug__title',
                text: section.title
            });

            const sectionToggle = DOM.createElement({
                element: 'button', 
                html: getIcon({
                    path: SVG_PATHS.ChevronExpand.Stroked, 
                    fill: 'none', 
                    stroke: 'currentColor',
                    width: 16,
                    height: 16,
                }),
                title: 'Toggle section',
                class: 'oltb-debug__toggle oltb-btn oltb-btn--blank oltb-tippy',
                attributes: {
                    type: 'button'
                }
            });

            const sectionContent = DOM.createElement({
                element: 'div',
                class: 'oltb-debug__content',
                id: `${ID_PREFIX}-section-${index}`
            });

            const sectionPre = DOM.createElement({
                element: 'pre',
                class: 'oltb-debug__json oltb-thin-scrollbars'
            });

            const sectionCode = DOM.createElement({
                element: 'code',
                text: JSON.stringify(section.content, undefined, 4),
            });

            DOM.appendChildren(sectionPre, [
                sectionCode
            ]);

            DOM.appendChildren(sectionHeader, [
                sectionTitle, 
                sectionToggle
            ]);

            DOM.appendChildren(sectionContent, [
                sectionPre
            ]);

            DOM.appendChildren(sectionWrapper, [
                sectionHeader, 
                sectionContent
            ]);

            DOM.appendChildren(sectionFragment, [
                sectionWrapper
            ]);
        });

        // Executable commands
        const actionSelect = DOM.createElement({
            element: 'select',
            class: 'oltb-select'
        });

        [
            {
                name: 'Log map to browser console',
                action: 'log.map.to.console'
            }
        ].forEach((item) => {
            actionSelect.appendChild(
                DOM.createElement({
                    element: 'option', 
                    text: item.name, 
                    value: item.action
                }
            ));
        });

        const actionButton = DOM.createElement({
            element: 'button',
            text: 'Do action',
            class: 'oltb-btn oltb-btn--blue-mid oltb-ml-05',
            attributes: {
                type: 'button'
            },
            listeners: {
                'click': this.onDoAction.bind(this)
            }
        });
        
        const buttonsWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-d-flex oltb-justify-content-between oltb-mt-15'
        }); 

        DOM.appendChildren(buttonsWrapper, [
            actionSelect,
            actionButton
        ]);

        const modalContent = DOM.createElement({
            element: 'div',
            class: 'oltb-modal__content' 
        });
        
        DOM.appendChildren(modalContent, [
            sectionFragment, 
            buttonsWrapper
        ]);
        
        this.actionSelect = actionSelect;
        
        this.show(modalContent);

        const toggleableTriggers = modalContent.querySelectorAll('.oltb-toggleable');
        toggleableTriggers.forEach((toggle) => {
            toggle.addEventListener(EVENTS.Browser.Click, this.onToggleSection.bind(this, toggle));
        });
    }

    onToggleSection(toggle) {
        const targetName = toggle.dataset.oltbToggleableTarget;
        document.getElementById(targetName).slideToggle(CONFIG.AnimationDuration.Fast);
    }

    onDoAction() {
        const action = this.actionSelect.value;
        const actions = {
            'log.map.to.console': this.actionLoggingMap.bind(this)
        };

        const actionMethod = actions[action];

        if(actionMethod) {
            actionMethod.call();
        }
    }

    actionLoggingMap() {
        console.dir(this.options.map);
        Toast.success({
            title: 'Logged',
            message: 'Map object logged to console (F12)', 
            autoremove: CONFIG.AutoRemovalDuation.Normal
        });
    }
}

export { DebugInfoModal };