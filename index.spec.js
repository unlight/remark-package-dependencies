const { test } = require('zora');
const plugin = require('./index');
const remark = require('remark');
const { injector } = require('njct');

injector.mock('execSync', () => {
    return (command, options) => {
        return String(42);
    };
});

test('smoke', t => {
    t.ok(plugin);
    t.ok(typeof plugin === 'function');
    t.ok(plugin.name === 'remarkPackageDependencies');
});

function process(markdown, options) {
    return remark()
        .use(plugin, options)
        .processSync(markdown)
        .toString();
}

test('paste to dependencies section by default', t => {
    const result = process(`### Dependencies`);
    t.ok(result.includes('prettysize'));
    t.ok(result.includes('Name'));
    t.ok(result.includes('Description'));
    t.ok(result.includes('Version'));
    t.ok(result.includes('Size'));
    t.ok(result.includes('License'));
});

