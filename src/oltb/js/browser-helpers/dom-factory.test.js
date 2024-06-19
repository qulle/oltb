import { jest, describe, it, expect } from '@jest/globals';
import { DOM } from './dom-factory';

describe('DomFactory', () => {
    it('should create basic element', () => {
        const element = DOM.createElement({
            element: 'div'
        });

        expect(element).toBeTruthy();
        expect(element.nodeName).toBe('DIV');
    });

    it('should test common attributes [id, class, value, html, style, title]', () => {
        const element = DOM.createElement({
            element: 'div',
            id: '1',
            class: 'jest-class',
            title: 'jest-title',
            html: 'jest-html',
            style: {
                'color': 'red',
                'font-weight': 'bold'
            }
        });

        expect(element.id).toBe('1');
        expect(element.className).toBe('jest-class');
        expect(element.title).toBe('jest-title');
        expect(element.innerHTML).toBe('jest-html');
        expect(element.style.cssText).toBe('color: red; font-weight: bold;');
    });

    it('should test setAttribute', () => {
        const element = DOM.createElement({
            element: 'div',
            attributes: {
                'i18n': 'jest'
            }
        });

        expect(element.getAttribute('i18n')).toBe('jest');
    });

    it('should test listeners', () => {
        const callbacks = {onClick: () => {}};
        const spy = jest.spyOn(callbacks, 'onClick');

        const element = DOM.createElement({
            element: 'div',
            listeners: {
                'click': callbacks.onClick
            }
        });
        
        element.click();
        expect(spy).toHaveBeenCalled();
    });

    it('should test clear-methods', () => {
        const elementOne = DOM.createElement({
            element: 'div',
            text: 'jest'
        });

        expect(elementOne.innerText).toBe('jest');
        DOM.clearText(elementOne);
        expect(elementOne.innerText).toBe('');

        const elementTwo = DOM.createElement({
            element: 'div',
            html: 'jest'
        });

        expect(elementTwo.innerHTML).toBe('jest');
        DOM.clearElement(elementTwo);
        expect(elementTwo.innerHTML).toBe('');
    });

    it('should test appendChildren', () => {
        const parent = DOM.createElement({
            element: 'div'
        });

        const child = DOM.createElement({
            element: 'div',
            text: 'jest'
        });

        expect(parent.childNodes.length).toBe(0);
        DOM.appendChildren(parent, [child]);
        expect(parent.childNodes.length).toBe(1);
    });

    it('should test prependChildren', () => {
        const parent = DOM.createElement({
            element: 'div'
        });

        const child = DOM.createElement({
            element: 'div',
            text: 'jest'
        });

        expect(parent.childNodes.length).toBe(0);
        DOM.prependChildren(parent, [child]);
        expect(parent.childNodes.length).toBe(1);
    });
});