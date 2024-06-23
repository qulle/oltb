describe('ColorPickerManager', () => {
    it('should be an empty test', () => {
        expect(1).toEqual(1);
    });
});

// import { jest, describe, it, expect } from '@jest/globals';
// import { ColorPickerManager } from './color-picker-manager';

// const FILENAME = 'color-picker-manager.js';

// describe('ColorPickerManager', () => {
//     it('should init the manager', async () => {
//         return ColorPickerManager.initAsync({}).then((result) => {
//             expect(result).toStrictEqual({
//                 filename: FILENAME,
//                 result: true
//             });
//         });
//     });

//     it('should have two overridden methods [setMap, getName]', () => {
//         const spy = jest.spyOn(ColorPickerManager, 'setMap');
//         const map = {};

//         ColorPickerManager.setMap(map);
//         expect(spy).toHaveBeenCalled();
//         expect(ColorPickerManager.getName()).toBe(FILENAME);
//     });
// });