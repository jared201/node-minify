/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

import csso from '@node-minify/csso';
import { runOneTest, tests } from '../../../tests/fixtures';

const compressorLabel = 'csso';
const compressor = csso;

describe('csso', () => {
  tests.commoncss.forEach(options => {
    runOneTest({ options, compressorLabel, compressor });
  });
  tests.commoncss.forEach(options => {
    runOneTest({ options, compressorLabel, compressor, sync: true });
  });
});
