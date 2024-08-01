import { describe, it, expect } from '@jest/globals';
import { Polygon, LineString } from 'ol/geom';
import { getMeasureCoordinates, getMeasureValue } from './geometry-measurements';

describe('Measurements', () => {
    it('should evaluate km2 polygon', () => {
        const geometry = new Polygon([[
            [-683247.0301355161,5532624.576599393],
            [1977984.5466411803,5532624.576599393],
            [1977984.5466411803,7939473.723243022],
            [-683247.0301355161,7939473.723243022],
            [-683247.0301355161,5532624.576599393]
        ]]);

        const area = getMeasureValue(geometry);
        const coordiantes = getMeasureCoordinates(geometry);

        expect(area).toStrictEqual({'unit': 'km<sup>2</sup>', 'value': 2485303.06});
        expect(coordiantes).toStrictEqual([647368.7582528321, 6736049.149921208, 2661231.5767766964]);
    });

    it('should evaluate m2 polygon', () => {
        const geometry = new Polygon([[
            [-263258.05497133266,7259891.741364763],
            [-263210.0832504495,7259891.741364763],
            [-263210.0832504495,7259924.362134964],
            [-263258.05497133266,7259924.362134964],
            [-263258.05497133266,7259891.741364763]
        ]]);

        const area = getMeasureValue(geometry);
        const coordiantes = getMeasureCoordinates(geometry);

        expect(area).toStrictEqual({'unit': 'm<sup>2</sup>', 'value': 527.26});
        expect(coordiantes).toStrictEqual([-263234.0691108911, 7259908.051749864, 47.971720883157104]);
    });

    it('should evaluate km length', () => {
        const geometry = new LineString([
            [-5281698.651771713, 5728303.369009441], 
            [-2600899.195754011, 7469844.621458896]
        ]);

        const length = getMeasureValue(geometry);
        const coordiantes = getMeasureCoordinates(geometry);

        expect(length).toStrictEqual({'unit': 'km', 'value': 2007.34});
        expect(coordiantes).toStrictEqual([-2600899.195754011, 7469844.621458896]);
    });

    it('should evaluate m length', () => {
        const geometry = new LineString([
            [-466348.3662992593, 7459031.100256054], 
            [-466219.6362990078, 7459131.223589583]
        ]);

        const length = getMeasureValue(geometry);
        const coordiantes = getMeasureCoordinates(geometry);

        expect(length).toStrictEqual({'unit': 'm', 'value': 92.27});
        expect(coordiantes).toStrictEqual([-466219.6362990078, 7459131.223589583]);
    });
});