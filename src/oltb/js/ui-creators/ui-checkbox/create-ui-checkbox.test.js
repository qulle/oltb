import { jest, describe, it, expect } from '@jest/globals';
import { createUICheckbox } from './create-ui-checkbox';
import { TranslationManager } from '../../toolbar-managers/translation-manager/translation-manager';

const CLASS__CHECKBOX_WRAPPER = 'oltb-checkbox-wrapper';

describe('createUICheckbox', () => {
    it('should create a ui-checkbox', () => {
        const uiCheckbox = createUICheckbox();

        expect(uiCheckbox).toBeTruthy();
        expect(uiCheckbox.length).toBe(2);
    });

    it('should contain one DIV and one INPUT', () => {
        const uiCheckbox = createUICheckbox({
            idPrefix: 'pre',
            idPostfix: 'post',
        });
        const [ wrapper, checkbox ] = uiCheckbox;

        expect(checkbox.getAttribute('id')).toBe('prepost');
        expect(wrapper.nodeName).toBe('DIV');
        expect(checkbox.nodeName).toBe('INPUT');
    });

    it('should be two childs in the wrapper of type INPUT and LABEL', () => {
        const uiCheckbox = createUICheckbox({
            bottomMargin: true
        });
        const wrapper = uiCheckbox[0];

        expect(wrapper.childNodes.length).toBe(2);
        expect(wrapper.childNodes[0].nodeName).toBe('INPUT');
        expect(wrapper.childNodes[1].nodeName).toBe('LABEL');
        expect(wrapper.classList.contains(`${CLASS__CHECKBOX_WRAPPER}--margin`)).toBe(true);
    });

    it('should be a checked checkbox', () => {
        const uiCheckbox = createUICheckbox({
            checked: true
        });
        const checkbox = uiCheckbox[1];

        expect(checkbox.hasAttribute('checked')).toBe(true);
        expect(checkbox.getAttribute('checked')).toBe('');
    });

    it('should be translated using i18n', () => {
        const spyOnGetTranslatedValue = jest.spyOn(TranslationManager, 'get').mockImplementation(() => {
            return 'jest-translated-value';
        });

        const uiCheckbox = createUICheckbox({
            i18nKey: 'jest-key'
        });
        
        const wrapper = uiCheckbox[0];
        const label = wrapper.childNodes[1];

        expect(spyOnGetTranslatedValue).toHaveBeenCalledTimes(1);
        expect(label.innerText).toBe('jest-translated-value');
    });

    it('should trigger one callback', () => {
        const callbacks = {onClick: () => {}};
        const spyOnOnClick = jest.spyOn(callbacks, 'onClick');
        const uiCheckbox = createUICheckbox({
            listeners: {
                'click': callbacks.onClick
            }
        });

        const checkbox = uiCheckbox[1];
        checkbox.click();

        expect(spyOnOnClick).toHaveBeenCalledTimes(1);
    });

    it('should trigger two callbacks', () => {
        const callbacks = {
            onClick: () => {},
            onSecondClick: () => {}
        };
        
        const spyOnOnClick = jest.spyOn(callbacks, 'onClick');
        const spyOnOnSecondClick = jest.spyOn(callbacks, 'onSecondClick');

        const uiCheckbox = createUICheckbox({
            listeners: {
                'click': [
                    callbacks.onClick,
                    callbacks.onSecondClick
                ]
            }
        });

        const checkbox = uiCheckbox[1];
        checkbox.click();

        expect(spyOnOnClick).toHaveBeenCalledTimes(1);
        expect(spyOnOnSecondClick).toHaveBeenCalledTimes(1);
    });
});