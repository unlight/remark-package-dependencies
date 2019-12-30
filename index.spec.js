const { test } = require('zora');
const plugin = require('./index');
const remark = require('remark');
const { injector } = require('njct');

let execSyncMock = (command, options) => String(42);
injector.mock('execSync', () => execSyncMock);

function process(markdown, options) {
    return remark()
        .use(plugin, options)
        .processSync(markdown)
        .toString();
}

test('smoke', t => {
    injector.mock('execSync', () => execSyncMock);
    t.ok(plugin);
    t.ok(typeof plugin === 'function');
    t.ok(plugin.name === 'remarkPackageDependencies');
    injector.clear();
});

test('paste to dependencies section by default', t => {
    injector.mock('execSync', () => execSyncMock);
    const result = process(`### Dependencies`);
    t.ok(result.includes('prettysize'));
    t.ok(result.includes('Name'));
    t.ok(result.includes('Description'));
    t.ok(result.includes('Version'));
    t.ok(result.includes('Size'));
    t.ok(result.includes('License'));
    t.ok(!result.includes('\\|'));
    injector.clear();
});

test('execSync throws exception', t => {
    injector.mock('execSync', () => () => {
        throw new Error('Fail');
    });
    t.doesNotThrow(() => {
        const result = process(`### Dependencies`);
        t.ok(result.includes('unknown'));
    });
    injector.clear();
});

test('should overwrite existsing table', t => {
    injector.mock('execSync', () => execSyncMock);
    const result = process(`
## Dependencies

| ExistingTable | X  |
| :------------ |:-- |
`);
    t.ok(!result.includes('ExistingTable'));
});
