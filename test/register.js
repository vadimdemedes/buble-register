import decache from 'decache';
import test from 'ava';

const aFixturePath = require.resolve('./fixtures/a');
const bFixturePath = require.resolve('./fixtures/b');

let bubleRegister;

const setupRegister = opts => {
	bubleRegister = require('..');
	bubleRegister(opts);
};

const revertRegister = () => {
	if (bubleRegister) {
		bubleRegister.revert();
		bubleRegister = null;
	}
};

test.afterEach(() => {
	revertRegister();
	decache(aFixturePath);
});

test('register', t => {
	setupRegister();

	t.notThrows(() => {
		require(aFixturePath);
	});
});

test('revert', t => {
	setupRegister();

	t.notThrows(() => {
		require(aFixturePath);
	});

	decache(aFixturePath);
	revertRegister();

	t.throws(() => {
		require(aFixturePath);
	}, SyntaxError);
});

test('only', t => {
	setupRegister({
		only: 'a.js'
	});

	t.notThrows(() => {
		require(aFixturePath);
	});

	t.throws(() => {
		require(bFixturePath);
	}, SyntaxError);
});

test('ignore', t => {
	setupRegister({
		ignore: 'b.js'
	});

	t.notThrows(() => {
		require(aFixturePath);
	});

	t.throws(() => {
		require(bFixturePath);
	}, SyntaxError);
});
