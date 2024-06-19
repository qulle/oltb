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
        const options = {
            map: {
                coordinates: [50, 100],
                getView: () => {
                    return {
                        getAnimating: () => {},
                        cancelAnimations: () => {},
                        animate: (options, onResult) => {
                            onResult();
                        }
                    }
                }
            },
            onDone: () => {}
        };
        const spy = jest.spyOn(options, 'onDone');

        goToView(options)
        expect(spy).toHaveBeenCalled();
    });
});