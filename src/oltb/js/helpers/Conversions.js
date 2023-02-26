const FILENAME = 'helpers/Conversions.js';

const degreesToRadians = function(degrees) {
    return degrees * (Math.PI / 180);
}

const radiansToDegrees = function(radians) {
    return radians * (180 / Math.PI);
}

const metersPerSecondToKnots = function(mps) {
    return mps * 1.943844;
}

const knotsToMetersPerSecond = function(knots) {
    return knots * 0.514444;
}

export {
    degreesToRadians,
    radiansToDegrees,
    metersPerSecondToKnots,
    knotsToMetersPerSecond
}