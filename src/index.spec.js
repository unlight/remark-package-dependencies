const plugin = require('./index');
const remark = require('remark');
const gfm = require('remark-gfm');
const { injector } = require('njct');
const assert = require('assert');

let execSyncMock = () => String(42);
injector.mock('execSync', () => execSyncMock);

function process(markdown, options) {
    return remark().use(gfm).use(plugin, options).processSync(markdown).toString();
}

describe('index', () => {
    beforeEach(() => {
        injector.mock('execSync', () => execSyncMock);
    });

    afterEach(() => {
        injector.clear();
    });

    it('smoke', () => {
        assert(plugin);
        assert(typeof plugin === 'function');
        assert(plugin.name === 'remarkPackageDependencies');
    });

    it('paste to dependencies section by default', () => {
        const result = process(`### Dependencies`);
        assert(result.includes('prettysize'));
        assert(result.includes('Name'));
        assert(result.includes('Description'));
        assert(result.includes('Version'));
        assert(result.includes('Size'));
        assert(result.includes('License'));
        assert(!result.includes('\\|'));
    });

    it('execSync throws exception', () => {
        injector.mock('execSync', () => () => {
            throw new Error('Fail');
        });
        const result = process(`### Dependencies`);
        assert(result.includes('unknown'));
    });

    it('should overwrite existsing table', () => {
        const result = process(`## Dependencies\n\n| ExistingTable | X  |\n| :------------ |:-- |`);
        assert(!result.includes('ExistingTable'));
    });
});
