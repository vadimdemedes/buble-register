'use strict';

const path = require('path');
const fs = require('fs');
const makeDir = require('make-dir').sync;
const findCacheDir = require('find-cache-dir');
const homeOrTmp = require('home-or-tmp');
const buble = require('buble');

const DEFAULT_CACHE_DIR = findCacheDir({name: 'buble-register'}) || homeOrTmp;
const DEFAULT_FILENAME = path.join(DEFAULT_CACHE_DIR, `.buble.${buble.VERSION}.json`);
const FILENAME = process.env.BUBLE_CACHE_PATH || DEFAULT_FILENAME;
let data = {};

const save = () => {
	let serialized = '{}';

	try {
		serialized = JSON.stringify(data, null, '  ');
	} catch (err) {
		if (err.message === 'Invalid string length') {
			err.message = 'Cache too large so it\'s been cleared';
			console.error(err.stack);
		} else {
			throw err;
		}
	}

	makeDir(path.dirname(FILENAME));
	fs.writeFileSync(FILENAME, serialized);
};

exports.save = save;

exports.load = () => {
	if (process.env.BUBLE_DISABLE_CACHE) {
		return;
	}

	process.on('exit', save);
	process.nextTick(save);

	if (!fs.existsSync(FILENAME)) {
		return;
	}

	try {
		data = JSON.parse(fs.readFileSync(FILENAME));
	} catch (err) {}
};

exports.get = () => data;
