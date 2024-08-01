import { describe, it, expect } from '@jest/globals';
import { createUISelect } from './create-ui-select';

describe('createUISelect', () => {
    it('should create a ui-select', () => {
        const uiSelect = createUISelect();

        expect(uiSelect).toBeTruthy();
        expect(uiSelect.length).toBe(2);
    });

    it('should contain one DIV and one SELECT', () => {
        const uiSelect = createUISelect({
            idPrefix: 'pre',
            idPostfix: 'post',
        });
        const [ wrapper, select ] = uiSelect;

        expect(select.getAttribute('id')).toBe('prepost');
        expect(wrapper.nodeName).toBe('DIV');
        expect(select.nodeName).toBe('SELECT');
    });

    it('should be two childs in the wrapper of type LABEL and SELECT', () => {
        const uiSelect = createUISelect({});
        const wrapper = uiSelect[0];

        expect(wrapper.childNodes.length).toBe(2);
        expect(wrapper.childNodes[0].nodeName).toBe('LABEL');
        expect(wrapper.childNodes[1].nodeName).toBe('SELECT');
    });

    it('should be a label with text "User selection expected"', () => {
        const uiSelect = createUISelect({
            text: 'User selection expected'
        });
        const wrapper = uiSelect[0];
        const label = wrapper.childNodes[0];

        expect(label.innerText).toBe('User selection expected');
    });

    it('should contain three options with "hp" selected', () => {
        const uiSelect = createUISelect({
            options: [
                {text: 'Lord Of The Rings', value: 'lotr'},
                {text: 'Game Of Thrones', value: 'got'},
                {text: 'Harry Potter', value: 'hp'}
            ],
            value: 'hp'
        });
        const select = uiSelect[1];

        expect(select.childNodes.length).toBe(3);
        expect(select.value).toBe('hp');
    });
});