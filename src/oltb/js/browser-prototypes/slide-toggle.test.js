import { jest, beforeAll, beforeEach, describe, it, expect } from '@jest/globals';
import './slide-toggle';

describe('HTMLElement slide methods', () => {
    const fps = 60;
    const milliseconds = 1000;
    const frameTime = milliseconds / fps;
    const duration = 250;
    let mockElement;

    beforeAll(() => {
        document.body.innerHTML = '<div id="mockElementRef"></div>';
    });

    beforeEach(() => {
        mockElement = document.getElementById('mockElementRef');

        // Reset styles
        mockElement.style.height = 'auto';
        mockElement.style.paddingTop = '0px';
        mockElement.style.paddingBottom = '0px';
        mockElement.style.marginTop = '0px';
        mockElement.style.marginBottom = '0px';
        mockElement.style.display = 'none';

        // Use fake timers to control the window.setTimeout
        jest.useFakeTimers();
        jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
            window.setTimeout(cb, frameTime)
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('slideToggle should call slideToggle with show=true if clientHeight is 0', () => {
        mockElement.style.display = 'none';
        mockElement.innerHTML = '';
        const spyOnRequestAnimationFrame = jest.spyOn(window, 'requestAnimationFrame');
        mockElement.slideToggle(duration, () => {
            expect(mockElement.style.display).toBe('block');
        });
        jest.advanceTimersByTime(duration);
        expect(spyOnRequestAnimationFrame).toHaveBeenCalled();
    });

    it('slideToggle should call slideToggle without show parameter if clientHeight is not 0', () => {
        mockElement.style.display = 'block';
        mockElement.innerHTML = '<div style="height: 100px;"></div>';
        const spyOnRequestAnimationFrame = jest.spyOn(window, 'requestAnimationFrame');
        mockElement.slideToggle(duration, () => {
            expect(mockElement.style.display).toBe('none');
        });
        jest.advanceTimersByTime(duration);
        expect(spyOnRequestAnimationFrame).toHaveBeenCalled();
    });

    it('slideUp should call slideToggle without show parameter', () => {
        mockElement.style.display = 'block';
        mockElement.innerHTML = '<div style="height: 100px;"></div>';
        const spyOnRequestAnimationFrame = jest.spyOn(window, 'requestAnimationFrame');
        mockElement.slideUp(duration, () => {
            expect(mockElement.style.display).toBe('none');
        });
        jest.advanceTimersByTime(duration);
        expect(spyOnRequestAnimationFrame).toHaveBeenCalled();
    });

    it('slideDown should call slideToggle with show=true', () => {
        // Ensure clientHeight is 0
        mockElement.style.display = 'none';
        mockElement.innerHTML = '';
        const spyOnRequestAnimationFrame = jest.spyOn(window, 'requestAnimationFrame');
        mockElement.slideDown(duration, () => {
            expect(mockElement.style.display).toBe('block');
        });
        jest.advanceTimersByTime(duration);
        expect(spyOnRequestAnimationFrame).toHaveBeenCalled();
    });
});