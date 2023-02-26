import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { getProj4Defs } from './Projections';

const FILENAME = 'epsg/Registrate.js';

proj4.defs(getProj4Defs());
register(proj4);