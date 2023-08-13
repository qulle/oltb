import _ from "lodash";
import { hasNestedProperty } from "../../helpers/browser/HasNestedProperty";
import { metersPerSecondToKnots, roundDownToNearest, roundToNearest } from "../../helpers/Conversions";

const WindBarb = Object.freeze({
    knot0: '<path fill="#1A232D" d="M125,120c2.762,0,5,2.239,5,5c0,2.762-2.238,5-5,5c-2.761,0-5-2.238-5-5C120,122.239,122.239,120,125,120z"/><path fill="none" stroke="#1A232D" stroke-width="2" d="M125,115c5.523,0,10,4.477,10,10c0,5.523-4.477,10-10,10 c-5.523,0-10-4.477-10-10C115,119.477,119.477,115,125,115z "/>',
    knot2: '<path d="M125,112V76 M125,125l7-12.1h-14L125,125z"/>',
    knot5: '<path d="M125,112V76 M125,89l7-7 M125,125l7-12.1h-14L125,125z"/>',
    knot10: '<path d="M125,112V89 M125,89l14-14 M125,125l7-12.1h-14L125,125z"/>',
    knot15: '<path d="M125,112V89 M125,89l14-14 M125,100l7-7 M125,125l7-12.1h-14L125,125z"/>',
    knot20: '<path d="M125,112V89 M125,89l14-14 M125,100l14-14 M125,125l7-12.1h-14L125,125z"/>',
    knot25: '<path d="M125,112V79 M125,79l14-14 M125,90l14-14 M125,100l7-7 M125,125l7-12.1h-14L125,125z"/>',
    knot30: '<path d="M125,112V79 M125,79l14-14 M125,90l14-14 M125,100l14-14 M125,125l7-12.1h-14L125,125z"/>',
    knot35: '<path d="M125,112V69 M125,69l14-14 M125,80l14-14 M125,90l14-14 M125,100l7-7 M125,125l7-12.1h-14L125,125z"/>',
    knot40: '<path d="M125,112V69 M125,69l14-14 M125,80l14-14 M125,90l14-14 M125,100l14-14 M125,125l7-12.1h-14L125,125z"/>',
    knot45: '<path d="M125,112V59 M125,59l14-14 M125,70l14-14 M125,80l14-14 M125,90l14-14 M125,100l7-7 M125,125l7-12.1h-14 L125,125z"/>',
    knot50: '<path d="M125,112V76 M125,76h14l-14,14V76z M125,125l7-12.1h-14L125,125z"/>',
    knot55: '<path d="M125,112V76 M125,76h14l-14,14V76z M125,100l7-7 M125,125l7-12.1h-14L125,125z"/>',
    knot60: '<path d="M125,112V76 M125,76h14l-14,14V76z M125,100l14-14 M125,125l7-12.1h-14L125,125z"/>',
    knot65: '<path d="M125,112V66 M125,66h14l-14,14V66z M125,90l14-14 M125,100l7-7 M125,125l7-12.1h-14L125,125z"/>',
    knot70: '<path d="M125,112V66 M125,66h14l-14,14V66z M125,90l14-14 M125,100l14-14 M125,125l7-12.1h-14L125,125z"/>',
    knot75: '<path d="M125,112V56 M125,56h14l-14,14V56z M125,80l14-14 M125,90l14-14 M125,100l7-7 M125,125l7-12.1h-14L125,125z"/>',
    knot80: '<path d="M125,112V56 M125,56h14l-14,14V56z M125,80l14-14 M125,90l14-14 M125,100l14-14 M125,125l7-12.1h-14L125,125z"/>',
    knot85: '<path d="M125,112V46 M125,46h14l-14,14V46z M125,70l14-14 M125,80l14-14 M125,90l14-14 M125,100l7-7 M125,125l7-12.1 h-14L125,125z"/>',
    knot90: '<path d="M125,112V46 M125,46h14l-14,14V46z M125,70l14-14 M125,80l14-14 M125,90l14-14 M125,100l14-14 M125,125l7-12.1 h-14L125,125z"/>',
    knot95: '<path d="M125,112V36 M125,36h14l-14,14V36z M125,60l14-14 M125,70l14-14 M125,80l14-14 M125,90l14-14 M125,100l7-7 M125,125l7-12.1h-14L125,125z"/>',
    knot100: '<path d="M125,112V62 M125,62h14l-14,14V62z M125,76h14l-14,14V76z M125,125l7-12.1h-14L125,125z"/>',
    knot105: '<path d="M125,112V62 M125,62h14l-14,14V62z M125,76h14l-14,14V76z M125,100l7-7 M125,125l7-12.1h-14L125,125z"/>',
    knot110: '<path d="M125,112V62 M125,62h14l-14,14V62z M125,76h14l-14,14V76z M125,100l14-14 M125,125l7-12.1h-14L125,125z"/>',
    knot115: '<path d="M125,112V52 M125,52h14l-14,14V52z M125,66h14l-14,14V66z M125,90l14-14 M125,100l7-7 M125,125l7-12.1h-14 L125,125z"/>',
    knot120: '<path d="M125,112V52 M125,52h14l-14,14V52z M125,66h14l-14,14V66z M125,90l14-14 M125,100l14-14 M125,125l7-12.1h-14 L125,125z"/>',
    knot125: '<path d="M125,112V42 M125,42h14l-14,14V42z M125,56h14l-14,14V56z M125,80l14-14 M125,90l14-14 M125,100l7-7 M125,125 l7-12.1h-14L125,125z"/>',
    knot130: '<path d="M125,112V42 M125,42h14l-14,14V42z M125,56h14l-14,14V56z M125,80l14-14 M125,90l14-14 M125,100l14-14 M125,125 l7-12.1h-14L125,125z"/>',
    knot135: '<path d="M125,112V32 M125,32h14l-14,14V32z M125,46h14l-14,14V46z M125,70l14-14 M125,80l14-14 M125,90l14-14 M125,100 l7-7 M125,125l7-12.1h-14L125,125z"/>',
    knot140: '<path d="M125,112V32 M125,32h14l-14,14V32z M125,46h14l-14,14V46z M125,70l14-14 M125,80l14-14 M125,90l14-14 M125,100 l14-14 M125,125l7-12.1h-14L125,125z"/>',
    knot145: '<path d="M125,112V22 M125,22h14l-14,14V22z M125,36h14l-14,14V36z M125,60l14-14 M125,70l14-14 M125,80l14-14 M125,90 l14-14 M125,100l7-7 M125,125l7-12.1h-14L125,125z"/>',
    knot150: '<path d="M125,112V48 M125,48h14l-14,14V48z M125,62h14l-14,14V62z M125,76h14l-14,14V76z M125,125l7-12.1h-14L125,125z"/>',
    knot155: '<path d="M125,112V48 M125,48h14l-14,14V48z M125,62h14l-14,14V62z M125,76h14l-14,14V76z M125,100l7-7 M125,125l7-12.1 h-14L125,125z"/>',
    knot160: '<path d="M125,112V48 M125,48h14l-14,14V48z M125,62h14l-14,14V62z M125,76h14l-14,14V76z M125,100l14-14 M125,125 l7-12.1h-14L125,125z"/>',
    knot165: '<path d="M125,112V38 M125,38h14l-14,14V38z M125,52h14l-14,14V52z M125,66h14l-14,14V66z M125,90l14-14 M125,100l7-7 M125,125l7-12.1h-14L125,125z"/>',
    knot170: '<path d="M125,112V38 M125,38h14l-14,14V38z M125,52h14l-14,14V52z M125,66h14l-14,14V66z M125,90l14-14 M125,100l14-14 M125,125l7-12.1h-14L125,125z"/>',
    knot175: '<path d="M125,112V28 M125,28h14l-14,14V28z M125,42h14l-14,14V42z M125,56h14l-14,14V56z M125,80l14-14 M125,90l14-14 M125,100l7-7 M125,125l7-12.1h-14L125,125z"/>',
    knot180: '<path d="M125,112V28 M125,28h14l-14,14V28z M125,42h14l-14,14V42z M125,56h14l-14,14V56z M125,80l14-14 M125,90l14-14 M125,100l14-14 M125,125l7-12.1h-14L125,125z"/>',
    knot185: '<path d="M125,112V18 M125,18h14l-14,14V18z M125,32h14l-14,14V32z M125,46h14l-14,14V46z M125,70l14-14 M125,80l14-14 M125,90l14-14 M125,100l7-7 M125,125l7-12.1h-14L125,125z"/>',
    knot190: '<path d="M125,112V18 M125,18h14l-14,14V18z M125,32h14l-14,14V32z M125,46h14l-14,14V46z M125,70l14-14 M125,80l14-14 M125,90l14-14 M125,100l14-14 M125,125l7-12.1h-14L125,125z"/>'
});

const getSvgPath = function(windSpeed) {
    // Note: Base case that breaks the pattern of 2.5 m/s steps
    if(windSpeed >= 1.0  && windSpeed < 2.5) {
        return WindBarb.knot2;
    }

    const meterPerSecondStep = 2.5;
    const lowerMeterPerSecond = roundDownToNearest(windSpeed, meterPerSecondStep);

    const knots = metersPerSecondToKnots(lowerMeterPerSecond);

    const knotPerSecondStep = 5;
    const lowerKnotPerSecond = roundToNearest(knots, knotPerSecondStep);
    
    const windBarbName = `knot${lowerKnotPerSecond}`;
    if(hasNestedProperty(WindBarb, windBarbName)) {
        return WindBarb[windBarbName];
    }

    return WindBarb.knot0;
}

const DefaultOptions = Object.freeze({
    windSpeed: 0,
    width: 250,
    height: 250,
    replaceHashtag: false,
    fill: '#3B4352FF',
    stroke: '#3B4352FF',
    strokeWidth: 3
});

const getWindBarb = function(options = {}) {
    options = _.merge(_.cloneDeep(DefaultOptions), options);

    // Note: HEX Colors are not valid in SVG 
    // Unless they are replaced with URL alternative char
    const ENCODED_HASHTAG = '%23';

    if(options.replaceHashtag) {   
        options.fill = options.fill.replace('#', ENCODED_HASHTAG);
        options.stroke = options.stroke.replace('#', ENCODED_HASHTAG);
    }

    return (`
        <svg xmlns="http://www.w3.org/2000/svg" 
            width="${options.width}" 
            height="${options.height}" 
            fill="${options.fill}"
            stroke="${options.stroke}"
            stroke-width="${options.strokeWidth}"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-miterlimit="10"
            viewBox="0 0 250 250">
            ${getSvgPath(options.windSpeed)}
        </svg>
    `);
}

export { WindBarb, getWindBarb };