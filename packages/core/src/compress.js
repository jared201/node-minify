/*!
 * node-minify
 * Copyright(c) 2011-2019 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import fs from 'fs';
import mkdirp from 'mkdirp';

/**
 * Run compressor.
 *
 * @param {Object} settings
 */
const compress = settings => {
  if (typeof settings.compressor !== 'function') {
    throw new Error(`compressor should be a function, maybe you forgot to install the compressor`);
  }

  createDirectory(settings.output);

  if (Array.isArray(settings.output)) {
    return settings.sync ? compressArrayOfFilesSync(settings) : compressArrayOfFilesAsync(settings);
  } else {
    return compressSingleFile(settings);
  }
};

/**
 * Compress an array of files in sync.
 *
 * @param {Object} settings
 */
const compressArrayOfFilesSync = settings => {
  return settings.input.forEach((input, index) => {
    const content = getContentFromFiles(input);
    return runSync({ settings, content, index });
  });
};

/**
 * Compress an array of files in async.
 *
 * @param {Object} settings
 */
const compressArrayOfFilesAsync = settings => {
  let sequence = Promise.resolve();
  settings.input.forEach((input, index) => {
    const content = getContentFromFiles(input);
    sequence = sequence.then(() => runAsync({ settings, content, index }));
  });
  return sequence;
};

/**
 * Compress a single file.
 *
 * @param {Object} settings
 */
const compressSingleFile = settings => {
  const content = getContentFromFiles(settings.input);
  return settings.sync ? runSync({ settings, content }) : runAsync({ settings, content });
};

/**
 * Run compressor in sync.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Number} index - index of the file being processed
 * @return {String}
 */
const runSync = ({ settings, content, index }) => settings.compressor({ settings, content, callback: null, index });

/**
 * Run compressor in async.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Number} index - index of the file being processed
 * @return {Promise}
 */
const runAsync = ({ settings, content, index }) => {
  return new Promise((resolve, reject) => {
    settings.compressor({
      settings,
      content,
      callback: (err, min) => {
        if (err) {
          return reject(err);
        }
        resolve(min);
      },
      index
    });
  });
};

/**
 * Concatenate all input files and get the data.
 *
 * @param {String|Array} input
 * @return {String}
 */
const getContentFromFiles = input => {
  if (!Array.isArray(input)) {
    return fs.readFileSync(input, 'utf8');
  }

  return input.map(path => fs.readFileSync(path, 'utf8')).join('\n');
};

/**
 * Create folder of the target file.
 *
 * @param {String} file - Full path of the file
 */
const createDirectory = file => {
  if (Array.isArray(file)) {
    file = file[0];
  }

  mkdirp.sync(file.substr(0, file.lastIndexOf('/')));
};

/**
 * Expose `compress()`.
 */
export { compress };
