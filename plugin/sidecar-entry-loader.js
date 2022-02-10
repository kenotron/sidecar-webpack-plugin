// @ts-check
const recast = require("recast");
const acorn = require("acorn");

/**
 *
 * @param {string} source
 * @param {string} remote
 */
function visit(source, remote) {
  const ast = recast.parse(source, {
    parser: acorn,
  });

  const b = recast.types.builders;

  const namedExports = {};

  recast.visit(ast, {
    // TODO: support default exports OR have a linting tool to warn against it

    visitExportNamedDeclaration(path) {
      const exportSpecifiers = path.node.specifiers;
      const exportSource = path.node.source;

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

function agilePackageLoader(content) {
  const { remote } = this.getOptions();
  const ast = visit(content, remote);
  return recast.print(ast).code;
}

module.exports = agilePackageLoader;

if (module === require.main) {
  const ast = visit(`export {getName} from './getName';export {ExampleLibComponent} from './ExampleLibComponent';`, "example-lib");
  console.log(recast.print(ast).code);
}
