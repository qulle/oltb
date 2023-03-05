import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { LogManager } from '../core/managers/LogManager';
import { getProj4Defs } from './Projections';

const FILENAME = 'epsg/Registrate.js';
LogManager.logDebug(FILENAME, 'fileScope', 'Registrating projections');

proj4.defs(getProj4Defs());
register(proj4);