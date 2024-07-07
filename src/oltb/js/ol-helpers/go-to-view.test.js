import { jest, describe, it, expect } from '@jest/globals';
import { goToView } from './go-to-view';

describe('GoToView', () => {
    it('should block due to falsy map', () => {
        const options = {
            map: undefined,
            onDone: () => {}
        };
        const spy = jest.spyOn(options, 'onDone');

        goToView(options)
        expect(spy).not.toHaveBeenCalled();
    });

    it('should block due to falsy view', () => {
        const options = {
            map: {
                getView: () => undefined
            },
            onDone: () => {}
        };
        const spy = jest.spyOn(options, 'onDone');

        goToView(options)
        expect(spy).not.toHaveBeenCalled();
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
        const spy = jest.spyOn(options, 'onDone');

        goToView(options)
        expect(spy).toHaveBeenCalled();
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