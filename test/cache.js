import fs from 'fs';
import tempfile from 'tempfile';
import decache from 'decache';
import test from 'ava';

const cachePath = tempfile();
const oldBubleDisableCacheValue = process.env.BUBLE_DISABLE_CACHE;
let cache;

process.env.BUBLE_CACHE_PATH = cachePath;
delete process.env.BUBLE_DISABLE_CACHE;

const writeCache = data => {
	if (typeof data === 'object') {
		data = JSON.stringify(data);
	}

	fs.writeFileSync(cachePath, data);
};

const cleanCache = () => {
	try {
		fs.unlinkSync(cachePath);
	} catch (err) {}
};

const resetCache = () => {
	process.env.BUBLE_CACHE_PATH = null;
	process.env.BUBLE_DISABLE_CACHE = oldBubleDisableCacheValue;
};

test.beforeEach(() => {
	decache('../cache');
	cache = require('../cache');
});

test.afterEach(cleanCache);
test.after(resetCache);

test('load and get cached data', t => {
	writeCache({key: 'value'});
	cache.load();

	t.deepEqual(cache.get(), {key: 'value'});
});

test('load and get an object with no cached data', t => {
	cache.load();

	t.deepEqual(cache.get(), {});
});

test('load and get an object with invalid cached data', t => {
	writeCache('invalid');
	cache.load();

	t.deepEqual(cache.get(), {});
});

test('create cache on save', t => {
	cache.save();

	t.true(fs.existsSync(cachePath));
	t.deepEqual(cache.get(), {});
});
