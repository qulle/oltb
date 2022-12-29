const WIND_BARB = Object.freeze({
    _0: '<path fill="#1A232D" d="M125,120c2.762,0,5,2.239,5,5c0,2.762-2.238,5-5,5c-2.761,0-5-2.238-5-5C120,122.239,122.239,120,125,120z"/><path fill="none" stroke="#1A232D" stroke-width="2" d="M125,115c5.523,0,10,4.477,10,10c0,5.523-4.477,10-10,10 c-5.523,0-10-4.477-10-10C115,119.477,119.477,115,125,115z "/>',
    _2: '<path class="svg-wb" d="M125,112V76 M125,125l7-12.1h-14L125,125z"/>',
    _5: '<path class="svg-wb" d="M125,112V76 M125,89l7-7 M125,125l7-12.1h-14L125,125z"/>',
    _10: '<path class="svg-wb" d="M125,112V89 M125,89l14-14 M125,125l7-12.1h-14L125,125z"/>',
    _15: '<path class="svg-wb" d="M125,112V89 M125,89l14-14 M125,100l7-7 M125,125l7-12.1h-14L125,125z"/>',
    _20: '<path class="svg-wb" d="M125,112V89 M125,89l14-14 M125,100l14-14 M125,125l7-12.1h-14L125,125z"/>',
    _25: '<path class="svg-wb" d="M125,112V79 M125,79l14-14 M125,90l14-14 M125,100l7-7 M125,125l7-12.1h-14L125,125z"/>',
    _30: '<path class="svg-wb" d="M125,112V79 M125,79l14-14 M125,90l14-14 M125,100l14-14 M125,125l7-12.1h-14L125,125z"/>',
    _35: '<path class="svg-wb" d="M125,112V69 M125,69l14-14 M125,80l14-14 M125,90l14-14 M125,100l7-7 M125,125l7-12.1h-14L125,125z"/>',
    _40: '<path class="svg-wb" d="M125,112V69 M125,69l14-14 M125,80l14-14 M125,90l14-14 M125,100l14-14 M125,125l7-12.1h-14L125,125z"/>',
    _45: '<path class="svg-wb" d="M125,112V59 M125,59l14-14 M125,70l14-14 M125,80l14-14 M125,90l14-14 M125,100l7-7 M125,125l7-12.1h-14 L125,125z"/>',
    _50: '<path class="svg-wb" d="M125,112V76 M125,76h14l-14,14V76z M125,125l7-12.1h-14L125,125z"/>',
    _55: '<path class="svg-wb" d="M125,112V76 M125,76h14l-14,14V76z M125,100l7-7 M125,125l7-12.1h-14L125,125z"/>',
    _60: '<path class="svg-wb" d="M125,112V76 M125,76h14l-14,14V76z M125,100l14-14 M125,125l7-12.1h-14L125,125z"/>',
    _65: '<path class="svg-wb" d="M125,112V66 M125,66h14l-14,14V66z M125,90l14-14 M125,100l7-7 M125,125l7-12.1h-14L125,125z"/>',
    _70: '<path class="svg-wb" d="M125,112V66 M125,66h14l-14,14V66z M125,90l14-14 M125,100l14-14 M125,125l7-12.1h-14L125,125z"/>',
    _75: '<path class="svg-wb" d="M125,112V56 M125,56h14l-14,14V56z M125,80l14-14 M125,90l14-14 M125,100l7-7 M125,125l7-12.1h-14L125,125z"/>',
    _80: '<path class="svg-wb" d="M125,112V56 M125,56h14l-14,14V56z M125,80l14-14 M125,90l14-14 M125,100l14-14 M125,125l7-12.1h-14L125,125z"/>',
    _85: '<path class="svg-wb" d="M125,112V46 M125,46h14l-14,14V46z M125,70l14-14 M125,80l14-14 M125,90l14-14 M125,100l7-7 M125,125l7-12.1 h-14L125,125z"/>',
    _90: '<path class="svg-wb" d="M125,112V46 M125,46h14l-14,14V46z M125,70l14-14 M125,80l14-14 M125,90l14-14 M125,100l14-14 M125,125l7-12.1 h-14L125,125z"/>',
    _95: '<path class="svg-wb" d="M125,112V36 M125,36h14l-14,14V36z M125,60l14-14 M125,70l14-14 M125,80l14-14 M125,90l14-14 M125,100l7-7 M125,125l7-12.1h-14L125,125z"/>',
    _100: '<path class="svg-wb" d="M125,112V62 M125,62h14l-14,14V62z M125,76h14l-14,14V76z M125,125l7-12.1h-14L125,125z"/>',
    _105: '<path class="svg-wb" d="M125,112V62 M125,62h14l-14,14V62z M125,76h14l-14,14V76z M125,100l7-7 M125,125l7-12.1h-14L125,125z"/>',
    _110: '<path class="svg-wb" d="M125,112V62 M125,62h14l-14,14V62z M125,76h14l-14,14V76z M125,100l14-14 M125,125l7-12.1h-14L125,125z"/>',
    _115: '<path class="svg-wb" d="M125,112V52 M125,52h14l-14,14V52z M125,66h14l-14,14V66z M125,90l14-14 M125,100l7-7 M125,125l7-12.1h-14 L125,125z"/>',
    _120: '<path class="svg-wb" d="M125,112V52 M125,52h14l-14,14V52z M125,66h14l-14,14V66z M125,90l14-14 M125,100l14-14 M125,125l7-12.1h-14 L125,125z"/>',
    _125: '<path class="svg-wb" d="M125,112V42 M125,42h14l-14,14V42z M125,56h14l-14,14V56z M125,80l14-14 M125,90l14-14 M125,100l7-7 M125,125 l7-12.1h-14L125,125z"/>',
    _130: '<path class="svg-wb" d="M125,112V42 M125,42h14l-14,14V42z M125,56h14l-14,14V56z M125,80l14-14 M125,90l14-14 M125,100l14-14 M125,125 l7-12.1h-14L125,125z"/>',
    _135: '<path class="svg-wb" d="M125,112V32 M125,32h14l-14,14V32z M125,46h14l-14,14V46z M125,70l14-14 M125,80l14-14 M125,90l14-14 M125,100 l7-7 M125,125l7-12.1h-14L125,125z"/>',
    _140: '<path class="svg-wb" d="M125,112V32 M125,32h14l-14,14V32z M125,46h14l-14,14V46z M125,70l14-14 M125,80l14-14 M125,90l14-14 M125,100 l14-14 M125,125l7-12.1h-14L125,125z"/>',
    _145: '<path class="svg-wb" d="M125,112V22 M125,22h14l-14,14V22z M125,36h14l-14,14V36z M125,60l14-14 M125,70l14-14 M125,80l14-14 M125,90 l14-14 M125,100l7-7 M125,125l7-12.1h-14L125,125z"/>',
    _150: '<path class="svg-wb" d="M125,112V48 M125,48h14l-14,14V48z M125,62h14l-14,14V62z M125,76h14l-14,14V76z M125,125l7-12.1h-14L125,125z"/>',
    _155: '<path class="svg-wb" d="M125,112V48 M125,48h14l-14,14V48z M125,62h14l-14,14V62z M125,76h14l-14,14V76z M125,100l7-7 M125,125l7-12.1 h-14L125,125z"/>',
    _160: '<path class="svg-wb" d="M125,112V48 M125,48h14l-14,14V48z M125,62h14l-14,14V62z M125,76h14l-14,14V76z M125,100l14-14 M125,125 l7-12.1h-14L125,125z"/>',
    _165: '<path class="svg-wb" d="M125,112V38 M125,38h14l-14,14V38z M125,52h14l-14,14V52z M125,66h14l-14,14V66z M125,90l14-14 M125,100l7-7 M125,125l7-12.1h-14L125,125z"/>',
    _170: '<path class="svg-wb" d="M125,112V38 M125,38h14l-14,14V38z M125,52h14l-14,14V52z M125,66h14l-14,14V66z M125,90l14-14 M125,100l14-14 M125,125l7-12.1h-14L125,125z"/>',
    _175: '<path class="svg-wb" d="M125,112V28 M125,28h14l-14,14V28z M125,42h14l-14,14V42z M125,56h14l-14,14V56z M125,80l14-14 M125,90l14-14 M125,100l7-7 M125,125l7-12.1h-14L125,125z"/>',
    _180: '<path class="svg-wb" d="M125,112V28 M125,28h14l-14,14V28z M125,42h14l-14,14V42z M125,56h14l-14,14V56z M125,80l14-14 M125,90l14-14 M125,100l14-14 M125,125l7-12.1h-14L125,125z"/>',
    _185: '<path class="svg-wb" d="M125,112V18 M125,18h14l-14,14V18z M125,32h14l-14,14V32z M125,46h14l-14,14V46z M125,70l14-14 M125,80l14-14 M125,90l14-14 M125,100l7-7 M125,125l7-12.1h-14L125,125z"/>',
    _190: '<path class="svg-wb" d="M125,112V18 M125,18h14l-14,14V18z M125,32h14l-14,14V32z M125,46h14l-14,14V46z M125,70l14-14 M125,80l14-14 M125,90l14-14 M125,100l14-14 M125,125l7-12.1h-14L125,125z"/>'
});

const getSVGPath = function(windSpeed) {
         if(windSpeed >= 0.0  && windSpeed < 1.0)  return WIND_BARB._0;
    else if(windSpeed >= 1.0  && windSpeed < 2.5)  return WIND_BARB._2;
    else if(windSpeed >= 2.5  && windSpeed < 5.0)  return WIND_BARB._5;
    else if(windSpeed >= 5.0  && windSpeed < 7.5)  return WIND_BARB._10;
    else if(windSpeed >= 7.5  && windSpeed < 10.0) return WIND_BARB._15;
    else if(windSpeed >= 10.0 && windSpeed < 12.5) return WIND_BARB._20;
    else if(windSpeed >= 12.5 && windSpeed < 15.0) return WIND_BARB._25;
    else if(windSpeed >= 15.0 && windSpeed < 17.5) return WIND_BARB._30;
    else if(windSpeed >= 17.5 && windSpeed < 20.0) return WIND_BARB._35;
    else if(windSpeed >= 20.0 && windSpeed < 22.5) return WIND_BARB._40;
    else if(windSpeed >= 22.5 && windSpeed < 25.0) return WIND_BARB._45;
    else if(windSpeed >= 25.0 && windSpeed < 27.5) return WIND_BARB._50;
    else if(windSpeed >= 27.5 && windSpeed < 30.0) return WIND_BARB._55;
    else if(windSpeed >= 30.0 && windSpeed < 32.5) return WIND_BARB._60;
    else if(windSpeed >= 32.5 && windSpeed < 35.0) return WIND_BARB._65;
    else if(windSpeed >= 35.0 && windSpeed < 37.5) return WIND_BARB._70;
    else if(windSpeed >= 37.5 && windSpeed < 40.0) return WIND_BARB._75;
    else if(windSpeed >= 40.0 && windSpeed < 42.5) return WIND_BARB._80;
    else if(windSpeed >= 42.5 && windSpeed < 45.0) return WIND_BARB._85;
    else if(windSpeed >= 45.0 && windSpeed < 47.5) return WIND_BARB._90;
    else if(windSpeed >= 47.5 && windSpeed < 50.0) return WIND_BARB._95;
    else if(windSpeed >= 50.0 && windSpeed < 52.5) return WIND_BARB._100;
    else if(windSpeed >= 52.5 && windSpeed < 55.0) return WIND_BARB._105;
    else if(windSpeed >= 55.0 && windSpeed < 57.5) return WIND_BARB._110;
    else if(windSpeed >= 57.5 && windSpeed < 60.0) return WIND_BARB._115;
    else if(windSpeed >= 60.0 && windSpeed < 62.5) return WIND_BARB._120;
    else if(windSpeed >= 62.5 && windSpeed < 65.0) return WIND_BARB._125;
    else if(windSpeed >= 65.0 && windSpeed < 67.5) return WIND_BARB._130;
    else if(windSpeed >= 67.5 && windSpeed < 70.0) return WIND_BARB._135;
    else if(windSpeed >= 70.0 && windSpeed < 72.5) return WIND_BARB._140;
    else if(windSpeed >= 72.5 && windSpeed < 75.0) return WIND_BARB._145;
    else if(windSpeed >= 75.0 && windSpeed < 77.5) return WIND_BARB._150;
    else if(windSpeed >= 77.5 && windSpeed < 80.0) return WIND_BARB._155;
    else if(windSpeed >= 80.0 && windSpeed < 82.5) return WIND_BARB._160;
    else if(windSpeed >= 82.5 && windSpeed < 85.0) return WIND_BARB._165;
    else if(windSpeed >= 85.0 && windSpeed < 87.5) return WIND_BARB._170;
    else if(windSpeed >= 87.5 && windSpeed < 90.0) return WIND_BARB._175;
    else if(windSpeed >= 90.0 && windSpeed < 92.5) return WIND_BARB._180;
    else if(windSpeed >= 92.5 && windSpeed < 95.0) return WIND_BARB._185;
    else if(windSpeed >= 95.0 && windSpeed < 97.5) return WIND_BARB._190;
    else return WIND_BARB._0;
}

const DEFAULT_OPTIONS = Object.freeze({
    windSpeed: 0,
    width: 250,
    height: 250,
    fill: 'rgba(59, 67, 82)',
    stroke: 'rgba(59, 67, 82)',
    strokeWidth: 3
});

const getWindBarb = function(options = {}) {
    options = { ...DEFAULT_OPTIONS, ...options };

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
            ${getSVGPath(options.windSpeed)}
        </svg>
    `);
}

export { WIND_BARB, getWindBarb };