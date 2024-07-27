import { jest, describe, it, expect } from '@jest/globals';
import { ProjectionManager } from './projection-manager';

const FILENAME = 'projection-manager.js';

describe('ProjectionManager', () => {
    it('should init the manager', async () => {
        return ProjectionManager.initAsync({}).then((result) => {
            expect(result).toStrictEqual({
                filename: FILENAME,
                result: true
            });
        });
    });

    it('should have two overridden methods [setMap, getName]', () => {
        const spyOnSetMap = jest.spyOn(ProjectionManager, 'setMap');
        const map = {};

        ProjectionManager.setMap(map);
        expect(spyOnSetMap).toHaveBeenCalled();
        expect(ProjectionManager.getName()).toBe(FILENAME);
    });

    it('should contain five default projections', () => {
        const projections = ProjectionManager.getProjections();
        const size = ProjectionManager.getSize();

        expect(size).toBe(5);
        expect(projections.length).toBe(5);
        expect(projections[0].code).toBe('EPSG:3857');
        expect(projections[1].code).toBe('EPSG:4326');
        expect(projections[2].code).toBe('EPSG:7789');
        expect(projections[3].code).toBe('EPSG:3006');
        expect(projections[4].code).toBe('EPSG:3021');
    });

    it('should contain projection [EPSG:3857]', () => {
        expect(ProjectionManager.hasProjection('EPSG:3857')).toBe(true);
    });

    it('should not contain projection [EPSG:ABC123]', () => {
        expect(ProjectionManager.hasProjection('EPSG:ABC123')).toBe(false);
    });

    it('should throw Error for unknown projection', () => {
        const wrapper = () => {
            ProjectionManager.addProjection('EPSG:ABC123', 'jest', '+proj=jest')
        };

        expect(wrapper).toThrow();
    });
});