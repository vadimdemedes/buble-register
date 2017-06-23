'use strict';

const path = require('path');
const fs = require('fs');
const sourceMapSupport = require('source-map-support');
const escapeRegExp = require('lodash.escaperegexp');
const isRegExp = require('lodash.isregexp');
const minimatch = require('minimatch');
const addHook = require('pirates').addHook;
const arrify = require('arrify');
const slash = require('slash');
const buble = require('buble');
const registerCache = require('./cache');

const startsWith = (str, match) => str.indexOf(match) === 0;

const regexify = val => {
	if (!val) {
		return new RegExp(/.^/);
	}

	if (Array.isArray(val)) {
		val = new RegExp(val.map(escapeRegExp).join('|'), 'i');
	}

	if (typeof val === 'string') {
		val = slash(val);

		if (startsWith(val, './') || startsWith(val, '*/')) {
			val = val.slice(2);
		}

		if (startsWith(val, '**/')) {
			val = val.slice(3);
		}

		const regex = minimatch.makeRe(val, {nocase: true});

		return new RegExp(regex.source.slice(1, -1), 'i');
	}

	if (isRegExp(val)) {
		return val;
	}

	return new TypeError('Illegial type for regexify');
};

const maps = {};
const transformOpts = {};
let piratesRevert;
let ignore;
let only;

sourceMapSupport.install({
	handleUncaughtExtensions: false,
	environment: 'node',
	retrieveSourceMap: source => {
		const map = maps[source];

		if (map) {
			return {
				url: null,
				map
			};
		}

		return null;
	}
});

registerCache.load();
let cache = registerCache.get();

const cwd = process.cwd();
const getRelativePath = filename => path.relative(cwd, filename);
const mtime = filename => Number(fs.statSync(filename).mtime);

const _shouldIgnore = (pattern, filename) => {
	return typeof pattern === 'function' ? pattern(filename) : pattern.test(filename);
};

const shouldIgnore = filename => {
	if (!ignore && !only) {
		return getRelativePath(filename).split(path.sep).indexOf('node_modules') >= 0;
	}

	filename = filename.replace(/\\/g, '/');

	if (only) {
		for (const pattern of only) {
			if (_shouldIgnore(pattern, filename)) {
				return false;
			}
		}

		return true;
	}

	if (ignore.length > 0) {
		for (const pattern of ignore) {
			if (_shouldIgnore(pattern, filename)) {
				return true;
			}
		}
	}

	return false;
};

const compile = (code, filename) => {
	if (shouldIgnore(filename)) {
		return code;
	}

	const cacheKey = `${filename}:${JSON.stringify(transformOpts)}:${buble.VERSION}`;

	if (cache) {
		const cached = cache[cacheKey];

		if (cached && cached.mtime === mtime(filename)) {
			return cached.code;
		}
	}

	const opts = Object.assign({}, transformOpts, {
		source: filename
	});

	const result = buble.transform(code, opts);

	if (cache) {
		result.mtime = mtime(filename);
		cache[cacheKey] = result;
	}

	maps[filename] = result.map;

	return result.code;
};

const hookExtensions = exts => {
	if (piratesRevert) {
		piratesRevert();
	}

	piratesRevert = addHook(compile, {
		exts,
		ignoreNodeModules: false
	});
};

const revert = () => {
	if (piratesRevert) {
		piratesRevert();
	}

	delete require.cache[require.resolve(__filename)];
};

const register = opts => {
	opts = opts || {};

	if (opts.extensions) {
		hookExtensions(opts.extensions);
	}

	if (opts.cache === false) {
		cache = null;
	}

	if (opts.ignore) {
		ignore = arrify(opts.ignore).map(regexify);
	}

	if (opts.only) {
		only = arrify(opts.only).map(regexify);
	}

	delete opts.extensions;
	delete opts.cache;
	delete opts.ignore;
	delete opts.only;

	Object.assign(transformOpts, opts);
};

register({
	extensions: ['.js', '.jsx', '.es6', '.es']
});

module.exports = register;
module.exports.revert = revert;
