const visit = require('unist-util-visit');
const fs = require('fs');
const child_process = require('child_process');
const pretty = require('prettysize');
const { inject } = require('njct');

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

module.exports = function remarkPackageDependencies(options = {}) {
    options = { ...defaultOptions, ...options };
    return root => {
        visit(root, 'heading', (node, index, parent) => {
            const child = node.children.length > 0 && node.children[0];
            if (child && child.type === 'text' && child.value === options.heading) {
                debugger;
                const nextIndex = index + 1;
                let next = parent.children[nextIndex];
                if (!next || next.type !== 'table') {
                    parent.children.splice(nextIndex, 0, {
                        type: 'table',
                        align: [],
                        children: [],
                    });
                    next = parent.children[nextIndex];
                }
                const dependencies = getDependencies(options);
                const table = markdownTableDependencies(dependencies);
                next.align = table.align;
                next.children = table.children;
            }
        });
    };
};

/**
 * Returns array of dependency:
 * name: dependency name (package name)
 * version: dependency version
 * description: dependency description
 * license: license
 * size: dependency size ()
 */
function getDependencies(options) {
    const packagePath = options.packagePath;
    const result = [];
    const packageData = JSON.parse(fs.readFileSync(packagePath, { encoding: 'utf8' }));
    for (const name of Object.keys(packageData.dependencies)) {
        const packageJson = require(`${name}/package.json`);
        const { description, version } = packageJson;
        const license = getLicense(packageJson);
        const size = getSize(name);
        const dependency = { name, version, description, size, license };
        result.push(dependency);
    }
    return result;
}

function getSize(name, defaultValue = 'unknown') {
    const execSync = inject('execSync', () => child_process.execSync);
    let result = defaultValue;
    try {
        const size = execSync(`node node_modules/bundle-phobia-cli/index.js ${name} --size`, {
            encoding: 'utf8',
        });
        result = pretty(Number(size.trim()), true, true, 1);
    } catch (e) {}
    return result;
}

function markdownTableDependencies(dependencies) {
    const headers = ['Name', 'Description', 'Version', 'Size', 'License'];
    const rows = [
        tableRow(headers),
        ...dependencies.map(dependency => {
            return tableRow([
                dependency.name,
                dependency.description || '-',
                dependency.version,
                dependency.size,
                dependency.license || '-',
            ]);
        }),
    ];
    const result = {
        type: 'table',
        align: ['left', 'left', 'left', 'right', 'center'],
        children: rows,
    };
    return result;
}

function tableRow(values) {
    return {
        type: 'tableRow',
        children: values.map(value => ({
            type: 'tableCell',
            children: [{ type: 'text', value }],
        })),
    };
}

function getLicense(packageJson) {
    let result = packageJson.license;
    if (typeof result === 'string') {
        return result;
    }
    if (packageJson.licenses && Array.isArray(packageJson.licenses)) {
        result = packageJson.licenses
            .map(license => {
                if (typeof license === 'string') {
                    return license;
                }
                if (typeof license === 'object' && typeof license.type === 'string') {
                    return license.type;
                }
                return undefined;
            })
            .filter(Boolean)
            .join(', ');
        return result;
    }
    return '';
}
