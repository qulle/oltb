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
        const spyOnOnClick = jest.spyOn(callbacks, 'onClick');

        const element = DOM.createElement({
            element: 'div',
            listeners: {
                'click': callbacks.onClick
            }
        });
        
        element.click();
        expect(spyOnOnClick).toHaveBeenCalledTimes(1);
    });

    it('should test listeners given as array', () => {
        const callbacks = {onClick: () => {}, onSecondClick: () => {}};
        const spyOne = jest.spyOn(callbacks, 'onClick');
        const spyTwo = jest.spyOn(callbacks, 'onSecondClick');

        const element = DOM.createElement({
            element: 'div',
            listeners: {
                'click': [
                    callbacks.onClick,
                    callbacks.onSecondClick
                ]
            }
        });
        
        element.click();
        expect(spyOne).toHaveBeenCalledTimes(1);
        expect(spyTwo).toHaveBeenCalledTimes(1);
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

    it('should test removeElements', () => {
        const parent = DOM.createElement({element: 'div'});
        const childOne = DOM.createElement({element: 'div'});
        const childTwo = DOM.createElement({element: 'div'});

        DOM.appendChildren(parent, [childOne, childTwo]);
        expect(parent.childNodes.length).toBe(2);
        DOM.removeElements([childOne, childTwo]);
        expect(parent.childNodes.length).toBe(0);
    });

    it('should test clearElements', () => {
        const parent = DOM.createElement({element: 'div'});
        const childOne = DOM.createElement({element: 'div', html: 'jest-one'});
        const childTwo = DOM.createElement({element: 'div', html: 'jest-two'});

        DOM.appendChildren(parent, [childOne, childTwo]);
        expect(childOne.innerHTML).toBe('jest-one');
        expect(childTwo.innerHTML).toBe('jest-two');

        DOM.clearElements([childOne, childTwo]);
        expect(childOne.innerHTML).toBe('');
        expect(childTwo.innerHTML).toBe('');
    });

    it('should test runAnimation', () => {
        const duration = 250;
        const mockAnimationClass = 'jest-mock-animation-class';
        const element = DOM.createElement({element: 'div'});

        DOM.runAnimation(element, mockAnimationClass);
        expect(element.classList.contains(mockAnimationClass)).toBe(true);

        window.setTimeout(() => {
            expect(element.classList.contains(mockAnimationClass)).toBe(false);
        }, duration);
    });

    it('should test flashClass', () => {
        const duration = 250;
        const mockAnimationClass = 'jest-mock-animation-class';
        const element = DOM.createElement({element: 'div'});

        DOM.flashClass(element, mockAnimationClass);
        expect(element.classList.contains(mockAnimationClass)).toBe(true);

        window.setTimeout(() => {
            expect(element.classList.contains(mockAnimationClass)).toBe(false);
        }, duration);
    });
});