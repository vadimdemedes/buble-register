# buble-register [![Build Status](https://travis-ci.org/vadimdemedes/buble-register.svg?branch=master)](https://travis-ci.org/vadimdemedes/buble-register)

> [Bublé](https://www.npmjs.com/package/buble) require hook.

Based on the excellent [babel-register](https://www.npmjs.com/package/babel-register) and adapted for Bublé.


## Install

```
$ npm install --save buble-register
```


## Usage

```js
require('buble-register');
```

All subsequent files required with the extensions `.js`, `.jsx`, `.es6` and `.es` will be transformed by Bublé.


## API

### bubleRegister([options])

#### options

##### extensions

Type: `Array`<br>
Default: `['.js', '.jsx', '.es6', '.es']`

Extensions to install a require hook for.

##### only
##### ignore

Type: `String`, `Array<String, RegExp>`, `Boolean`, `RegExp`, `Function`

Patterns to ignore or exclusively include for compiling.

```js
const bubleRegister = require('buble-register');

bubleRegister({
	only: 'a.js'
});

bubleRegister({
	only: ['a.js', 'b.js']
});

// override `node_modules` ignoring
bubleRegister({
	only: false
});

bubleRegister({
	only: /regex/
});

bubleRegister({
	only: filename => {
		if (filename === '/path/to/es6-file.js') {
			return true;
		} else {
			return false;
		}
	}
});
```

##### cache

Type: `Boolean`<br>
Default: `true`

Enable or disable caching of compiled sources.


## Environment variables

By default `buble-register` saves to a file in temporary directory.

**BUBLE_CACHE_PATH**

Specify a different cache location.

```
BUBLE_CACHE_PATH=/path/to/cache.json node with-register.js
```

**BUBLE_DISABLE_CACHE**

Disable the cache.

```
BUBLE_DISABLE_CACHE=1 node with-register.js
```

## License

MIT © [Vadim Demedes](https://github.com/vadimdemedes)
