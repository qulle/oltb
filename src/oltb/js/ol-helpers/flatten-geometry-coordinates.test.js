import { describe, it, expect } from '@jest/globals';
import { flattenGeometryCoordinates } from "./flatten-geometry-coordinates";

describe('flattenGeometryCoordinates', () => {
    it('should convert geometry coordinates to flattened', () => {
        const array1Input = [
            [-4906216.308417939, 7767546.812731933],
            [-3666915.409850756, 8211475.492815699],
            [-3642252.705401658, 8963687.978513192]
        ];

        const array1Output = [
            [-4906216.308417939, 7767546.812731933],
            [-3666915.409850756, 8211475.492815699],
            [-3642252.705401658, 8963687.978513192]
        ];

        expect(flattenGeometryCoordinates(array1Input)).toStrictEqual(array1Output);

        const array2Input = [
            [
                [-3284643.490889735, 7761381.136619657],
                [-3913542.454341738, 8482765.241755778],
                [-2131662.0578943966, 8852705.80849225],
                [-1693899.0539229047, 7662730.318823265],
                [-2378289.102385378, 7064659.735932635],
                [-2945531.3047146355, 7144813.5253922045],
                [-3284643.490889735, 7761381.136619657]
            ]
        ];

        const array2Output = [
            [-3284643.490889735, 7761381.136619657],
            [-3913542.454341738, 8482765.241755778],
            [-2131662.0578943966, 8852705.80849225],
            [-1693899.0539229047, 7662730.318823265],
            [-2378289.102385378, 7064659.735932635],
            [-2945531.3047146355, 7144813.5253922045],
            [-3284643.490889735, 7761381.136619657]
        ];

        expect(flattenGeometryCoordinates(array2Input)).toStrictEqual(array2Output);
    });
});