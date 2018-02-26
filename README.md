# json-union
An es6 library used to merge JSON files that match a set of glob patterns.

## features
- perfoms a shallow or deep merge of all JSON files that match any of the [glob](https://www.npmjs.com/package/glob) patterns
- writes to stdout if no outfile is provided
- will create outfile directory and file if it does not exist
- will overwrite outfile if it does exist
- can optionally ignore parsing errors
- asynchronous; returns an es6 promise

## installation

```bash
$ npm i jsonUnion -g
```

## cli

```bash
# simple usage
$ jsonUnion src/**/*.json

# multiple glob patterns
$ jsonUnion src/**/*.json config/**/*.json

# using stdout to write to file
$ jsonUnion src/**/*.json > my.json

# using pipes
$ jsonUnion src/**/*.json | myApp

# saving to file in a directory that does not exist
$ jsonUnion src/**/*.json -o my/new/directory/file.json

# using other options
$ jsonUnion src/**/*.json -d -e ascii -i
```

### options
|Name|Alias|Type|Default|Description|
|---|---|---|---|---|
|--deepMerge|-d|boolean|false|merges JSON files recursively
|--encoding|-e|string|'utf8'|encoding used to read and write files
|--ignoreParseErrors|-i|boolean|false|ignores any errors that are raised from parsing the JSON file
|--outfile|-o|string|undefined|the directory and filename of where the merged JSON file should be saved

Note: if --outfile or -o is not provided then the merged JSON is sent to sdtout

## module
``` js
const jsonUnion = require('json-union').default;

// simple usage
jsonUnion('src/**/*.json')
    .then((json) => console.log(json))
    .catch((error) => console.error(error));

// multiple glob patterns
jsonUnion(['src/**/*.json', 'config/**/*.json'])
    .then((json) => console.log(json))
    .catch((error) => console.error(error));

// with options
jsonUnion('src/**/en.json', {
    deepMerge: true,
    encoding: 'ascii',
    ignoreParseErrors: true,
    outfile: 'dist/public/en.json'
})
    .then((json) => console.log(json))
    .catch((error) => console.error(error));
```

### params
|Name|Type|Description|
|---|---|---|
|patterns|string, string[]|a string or string array of glob patterns to match against
|options|Options?|jsonUnion options object

### Options
|Name|Type|Default|Description|
|---|---|---|---|
|deepMerge|boolean|false|merges JSON files recursively
|encoding|string|'utf8'|encoding used to read and write files
|ignoreParseErrors|boolean|false|ignores any errors that are raised from parsing the JSON file
|outfile|string|undefined|the directory and filename of where the merged JSON file should be saved

Note: if outfile is not provided then no file will be created on the file system

### returns
A promise to the merged JSON object