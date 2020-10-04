# remark-package-dependencies

Inject to markdown the list of dependencies of your package

## Install

```sh
npm install --save-dev remark-package-dependencies
```

## Usage

```js
const remark = require('remark');
const gfm = require('remark-gfm');
const remarkPackageDependencies = require('remark-package-dependencies');
const input = '## Dependencies';
const output = remark()
    .use(gfm)
    .use(remarkPackageDependencies, options)
    .processSync(input)
    .toString();
```

Output:

```
## Dependencies

| Name              | Description                                       | Version |   Size | License |
| :---------------- | :------------------------------------------------ | :------ | -----: | :-----: |
| bundle-phobia-cli | Cli for the node BundlePhobia Service             | 0.14.1  | 151.7k |   MIT   |
| prettysize        | Convert bytes to other sizes for prettier logging | 2.0.0   |   592B |   BSD   |
| unist-util-visit  | Recursively walk over unist nodes                 | 2.0.0   |   1.6k |   MIT   |
```

## Options

```js
const defaultOptions = {
    /**
     * Content will be inserted after heading with this text value
     */
    heading: 'Dependencies',
    /**
     * Path to `package.json`
     */
    packagePath: 'package.json',
};
```
