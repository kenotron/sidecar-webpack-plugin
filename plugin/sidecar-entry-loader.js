// @ts-check
const recast = require("recast");
const acorn = require("acorn");

let counter = 0;
function generateUniqueId() {
  return `_sidecar_entry_tmp_${counter++}`;
}

/**
 *
 * @param {string} source
 * @param {string} remote
 */
function visit(source, remote) {
  const ast = recast.parse(source, {
    parser: {
      parse(source) {
        return acorn.parse(source, {
          ecmaVersion: 2020,
          allowImportExportEverywhere: true,
        });
      },
    },
  });

  const b = recast.types.builders;

  /** @type {{[key: string]: string}} */
  const namedExports = {};

  /** @type {string[]} */
  const starExports = [];

  recast.visit(ast, {
    // e.g. export * from './foo'; or export * as foo from './foo';
    visitExportAllDeclaration(path) {
      const exportSource = path.node.source;
      const exported = path.node.exported;

      if (exported) {
        // e.g. export * as foo from './foo';
        namedExports[exported.name] = exported.name;
        const importDeclaration = b.importDeclaration.from({
          source: exportSource,
          specifiers: [b.importNamespaceSpecifier(b.identifier(`_${exported.name}`))],
        });
        path.replace(importDeclaration);
      } else {
        // e.g. export * from './foo';
        throw new Error(
          `Sidecar Entry Loader: export star "export * from 'xyz';" not supported, please use named exports "export { ... } from 'xyz';" or star assigned to a var "export * as someVar from 'xyz';"`
        );
      }

      this.traverse(path);
    },

    visitExportDefaultDeclaration(path) {
      throw new Error("Sidecar Entry Loader: export default is not supported in a sidecar entry module");
    },

    visitExportNamedDeclaration(path) {
      const exportSpecifiers = path.node.specifiers;
      const exportSource = path.node.source;

      // Skip over if there is no source in the export declaration
      // exportSource would be null, e.g. export {getName};
      if (exportSource) {
        let newSpecifiers = [];

        for (const exportSpecifier of exportSpecifiers) {
          namedExports[exportSpecifier.exported.name] = exportSpecifier.local.name;
          newSpecifiers.push(
            b.importSpecifier.from({
              imported: exportSpecifier.local,
              local: b.identifier(`_${exportSpecifier.local.name}`),
            })
          );
        }

        const newNode = b.importDeclaration(newSpecifiers, exportSource);

        path.replace(newNode);
        return false;
      }

      this.traverse(path);
    },

    visitProgram(path) {
      this.traverse(path);

      // e.g. `let moduleExports = { getName, ExampleLibComponent };`
      path.node.body.push(
        b.variableDeclaration("let", [
          b.variableDeclarator(
            b.identifier("moduleExports"),

            // TODO: support named exports alias
            b.objectExpression(
              Object.keys(namedExports).map((k) =>
                b.objectProperty.from({
                  key: b.identifier(k),
                  value: b.identifier(`_${k}`),
                  shorthand: true,
                })
              )
            )
          ),
        ])
      );

      recast
        .parse(
          `const query = new URLSearchParams(window.location.search);
      if (query.has("_sidecar")) {
        moduleExports = require("${remote}-sidecar");
      }`
        )
        .program.body.forEach((node) => {
          path.node.body.push(node);
        });

      // e.g. `export const getName = moduleExports.getName;`

      Object.keys(namedExports).map((k) =>
        path.node.body.push(
          b.exportNamedDeclaration(
            b.variableDeclaration("const", [
              b.variableDeclarator.from({
                id: b.identifier(k),
                init: b.memberExpression.from({
                  object: b.identifier("moduleExports"),
                  property: b.identifier(k),
                }),
              }),
            ]),
            []
          )
        )
      );

      return false;
    },
  });

  return ast;
}

function sidecarEntryLoader(content) {
  const { remote } = this.getOptions();

  try {
    const ast = visit(content, remote);
    const recastResult = recast.print(ast);
    this.callback(null, recastResult.code, recastResult.map);
  } catch(e) {
    this.callback(e);
  }
}

module.exports = sidecarEntryLoader;

if (module === require.main) {
  const ast = visit(
    `export { getName } from "./getName";
export * as all from "./all";
export { ExampleLibComponent } from "./ExampleLibComponent";
`,
    "example-lib"
  );
  console.log(recast.print(ast).code);
}
