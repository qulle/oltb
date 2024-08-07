import { jest, describe, it, expect } from '@jest/globals';
import { goToView } from './go-to-view';

describe('goToView', () => {
    it('should block due to falsy map', () => {
        const options = {
            map: undefined,
            onDone: () => {}
        };
        const spyOnOnDone = jest.spyOn(options, 'onDone');

        goToView(options)
        expect(spyOnOnDone).not.toHaveBeenCalled();
    });

    it('should block due to falsy view', () => {
        const options = {
            map: {
                getView: () => undefined
            },
            onDone: () => {}
        };
        const spyOnOnDone = jest.spyOn(options, 'onDone');

        goToView(options)
        expect(spyOnOnDone).not.toHaveBeenCalled();
    });

    it('should goToView [50, 100]', () => {
        const view = {
            getAnimating: () => {},
            cancelAnimations: () => {},
            animate: (options, onResult) => {
                onResult();
            }
        };
        const options = {
            map: {
                coordinates: [50, 100],
                getView: () => {
                    return view;
                }
            },
            onDone: () => {}
        };
        const spyOnOnDone = jest.spyOn(options, 'onDone');

        goToView(options)
        expect(spyOnOnDone).toHaveBeenCalled();
    });

    it('should goToView [50, 100] but cancel ongoing animation', () => {
        const view = {
            getAnimating: () => {
                return true;
            },
            cancelAnimations: () => {},
            animate: (options, onResult) => {
                onResult();
            }
        };
        const options = {
            map: {
                coordinates: [50, 100],
                getView: () => {
                    return view;
                }
            },
            onDone: () => {}
        };
        const spyOnDone = jest.spyOn(options, 'onDone');
        const spyCancelAnimation = jest.spyOn(view, 'cancelAnimations');

        goToView(options)
        expect(spyCancelAnimation).toHaveBeenCalled();
        expect(spyOnDone).toHaveBeenCalled();
    });
});