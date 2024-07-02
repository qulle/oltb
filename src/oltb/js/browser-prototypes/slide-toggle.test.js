import { jest, beforeEach, describe, it, expect } from '@jest/globals';
import './slide-toggle';

describe('SlideToggle', () => {
    beforeEach(() => {
        window.document.body.innerHTML = '<div id="ref1" style="height: 100px; width: 10px;"></div>';
    });

    it('should have three methods [slideToggle, slideUp, slideDown]', () => {
        const element = window.document.getElementById('ref1');
        
        expect(typeof element.slideToggle === 'function');
        expect(typeof element.slideUp === 'function');
        expect(typeof element.slideDown === 'function');
    });

    it('should test [slideUp]', () => {
        const duration = 250;
        const callbacks = {onSlideUp: (collapsed) => {}};
        const spy = jest.spyOn(callbacks, 'onSlideUp');
        const element = window.document.getElementById('ref1');

        expect(element.style.height).toBe('100px');
        element.slideUp(duration, callbacks.onSlideUp);

        window.setTimeout(() => {
            expect(element.style.height).toBe('0px');
            expect(spy).toHaveBeenNthCalledWith(1, true)
        }, duration);
    });
});