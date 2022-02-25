import 'ol/ol.css';
import EventType from 'ol/events/EventType';
import Dialog from '../common/Dialog';
import Toast from '../common/Toast';
import DOM from '../helpers/DOM';
import Config from '../core/Config';
import StateManager from '../core/Managers/StateManager';
import { Control } from 'ol/control';
import { toolboxElement, toolbarElement } from '../core/ElementReferences';
import { addContextMenuItem } from '../common/ContextMenu';
import { generateAnimalName } from '../helpers/NameGenerator/NameGenerator';
import { easeOut } from 'ol/easing';
import { randomNumber } from '../helpers/Random';
import { SVGPaths, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';

const bookmarkButtonDefaultClasses = 'oltb-func-btn';

class Bookmark extends Control {
    constructor(callbacksObj = {}) {
        super({
            element: toolbarElement
        });
        
        const icon = getIcon({
            path: SVGPaths.Bookmark,
            class: 'oltb-tool-button__icon'
        });

        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.setAttribute('data-tippy-content', 'Bookmarks (B)');
        button.className = 'oltb-tool-button';
        button.innerHTML = icon;
        button.addEventListener(
            EventType.CLICK,
            this.handleClick.bind(this),
            false
        );

        this.element.appendChild(button);
        this.button = button;
        this.active = false;
        this.callbacksObj = callbacksObj;
        this.bookmarks = JSON.parse(StateManager.getStateObject('bookmarks')) || [];

        toolboxElement.insertAdjacentHTML('beforeend', `
            <div id="oltb-bookmarks-box" class="oltb-toolbox-section">
                <div class="oltb-toolbox-section__group">
                    <h4 class="oltb-toolbox-section__title">Bookmarks</h4>
                    <button type="button" id="oltb-add-bookmark-btn" class="oltb-btn oltb-btn--dark-green oltb-w-100">Add bookmark</button>
                </div>
                <div class="oltb-toolbox-section__group">
                    <ul id="oltb-bookmark-stack" class="oltb-toolbox-list"></ul>
                </div>
            </div>
        `);

        const bookmarksBox = document.querySelector('#oltb-bookmarks-box');
        this.bookmarksBox = bookmarksBox;

        const addBookmarkBtn = bookmarksBox.querySelector('#oltb-add-bookmark-btn');
        addBookmarkBtn.addEventListener('click', this.addBookmark.bind(this));

        const bookmarkStack = bookmarksBox.querySelector('#oltb-bookmark-stack');
        this.bookmarkStack = bookmarkStack;

        // Add all saved bookmarks from localstorage
        this.bookmarks.forEach(bookmark => {
            this.createBookmark(bookmark);
        });

        addContextMenuItem('main.map.context.menu', {icon: icon, name: 'Add location as bookmark', fn: this.addBookmark.bind(this)});
        addContextMenuItem('main.map.context.menu', {icon: icon, name: 'Clear all bookmarks', fn: () => {
            Dialog.confirm({
                text: 'Do you want to clear all bookmarks?',
                onConfirm: () => {
                    this.clearBookmarks();

                    Toast.success({text: "All bookmarks was cleared", autoremove: 3000});
                }
            });
        }});

        window.addEventListener('keyup', (event) => {
            if(isShortcutKeyOnly(event, 'b')) {
                this.handleClick(event);
            }
        });
    }

    handleClick(event) {
        event.preventDefault();
        this.handleBookmarks();
    }

    handleBookmarks() {
        this.active = !this.active;
        this.bookmarksBox.classList.toggle('oltb-toolbox-section--show');
        this.button.classList.toggle('oltb-tool-button--active');
    }

    addBookmark() {
        const view = this.getMap().getView();
        const zoom = view.getZoom();
        const location = view.getCenter();
        const randomAnimal = generateAnimalName();

        const bookmark = {
            id: randomNumber(),
            name: randomAnimal,
            zoom: zoom,
            location: location
        };

        this.bookmarks.push(bookmark);
        StateManager.updateStateObject('bookmarks', JSON.stringify(this.bookmarks));

        // Create the bookmark UI element
        this.createBookmark(bookmark);

        if(!this.active) {
            Toast.success({text: 'Bookmark created', autoremove: 3000});
        }

        // User defined callback from constructor
        if(typeof this.callbacksObj.added === 'function') {
            this.callbacksObj.added(bookmark);
        }
    }

    clearBookmarks() {
        StateManager.updateStateObject('bookmarks', '[]');
        this.bookmarkStack.innerHTML = '';

        // User defined callback from constructor
        if(typeof this.callbacksObj.cleared === 'function') {
            this.callbacksObj.cleared();
        }
    }

    createBookmark(bookmark) {
        // Create bookmark item
        const bookmarkElement = DOM.createElement({element: 'li', 
            attributes: {
                id: `oltb-bookmark-${bookmark.id}`,
                class: 'oltb-toolbox-list__item'
            }
        });

        // Create bookmark name label
        const bookmarkName = DOM.createElement({element: 'span', 
            text: bookmark.name.ellipsis(20),
            attributes: {
                class: 'oltb-toolbox-list__title oltb-tippy',
                title: bookmark.name,
            }
        });

        // Create div for holding left side of bookmark item
        const leftButtonWrapper = DOM.createElement({element: 'div', 
            attributes: {
                class: 'oltb-toolbox-list__wrapper'
            }
        });

        leftButtonWrapper.appendChild(bookmarkName);
        bookmarkElement.appendChild(leftButtonWrapper);

        // Create div for holding right side of bookmark item
        const rightButtonWrapper = DOM.createElement({element: 'div', 
            attributes: {
                class: 'oltb-toolbox-list__wrapper'
            }
        });

        // Add all buttons to the bookmark
        const zoomToButton = DOM.createElement({element: 'button',
            attributes: {
                type: 'button',
                class: bookmarkButtonDefaultClasses + ' oltb-func-btn--geo-pin oltb-tippy',
                title: 'Zoom to location'
            }
        });

        zoomToButton.addEventListener('click', this.zoomToBookmark.bind(this, bookmark));

        const editButton = DOM.createElement({element: 'button',
            attributes: {
                type: 'button',
                class: bookmarkButtonDefaultClasses + ' oltb-func-btn--edit oltb-tippy',
                title: 'Rename bookmark'
            }
        });

        editButton.addEventListener('click', this.editBookmark.bind(this, bookmark, bookmarkName));

        const deleteButton = DOM.createElement({element: 'button',
            attributes: {
                type: 'button',
                class: bookmarkButtonDefaultClasses + ' oltb-func-btn--delete oltb-tippy',
                title: 'Delete bookmark'
            }
        });

        deleteButton.addEventListener('click', this.deleteBookmark.bind(this, bookmark, bookmarkElement));

        DOM.appendChildren(rightButtonWrapper, [zoomToButton, editButton, deleteButton]);
        bookmarkElement.appendChild(rightButtonWrapper);

        // Add the bookmark to the user interface
        this.bookmarkStack.prepend(bookmarkElement);
    }

    zoomToBookmark(bookmark) {
        const view = this.getMap().getView();

        if(view.getAnimating()) {
            view.cancelAnimations();
        }

        view.animate({
            zoom: bookmark.zoom,
            center: bookmark.location,
            duration: Config.animationDuration,
            easing: easeOut
        });

        // User defined callback from constructor
        if(typeof this.callbacksObj.zoomedTo === 'function') {
            this.callbacksObj.zoomedTo(bookmark);
        }
    }

    deleteBookmark(bookmark, bookmarkElement) {
        Dialog.confirm({
            html: `Do you want to delete bookmark <strong>${bookmark.name}</strong>?`,
            onConfirm: () => {
                bookmarkElement.remove();

                // Remove the bookmark from the collection
                this.bookmarks = this.bookmarks.filter((item => {
                    return item.id !== bookmark.id;
                }));

                StateManager.updateStateObject('bookmarks', JSON.stringify(this.bookmarks));

                // User defined callback from constructor
                if(typeof this.callbacksObj.removed === 'function') {
                    this.callbacksObj.removed(bookmark);
                }
            }
        });
    }

    editBookmark(bookmark, bookmarkName) {
        Dialog.prompt({
            text: 'Edit bookmark name',
            value: bookmark.name,
            confirmText: 'Rename',
            onConfirm: (result) => {
                if(result !== null && !!result.length) {
                    bookmark.name = result;
                    bookmarkName.innerText = result.ellipsis(20);
                    bookmarkName._tippy.setContent(result);

                    StateManager.updateStateObject('bookmarks', JSON.stringify(this.bookmarks));

                    // User defined callback from constructor
                    if(typeof this.callbacksObj.renamed === 'function') {
                        this.callbacksObj.renamed(bookmark);
                    }
                }
            }
        });
    }
}

export default Bookmark;