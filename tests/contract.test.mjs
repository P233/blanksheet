import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import stylelint from "stylelint";

const ruleName = "blanksheet/reset-layer";
const layerContract = stylelint.createPlugin(ruleName, () => (root) => {
  const nodes = root.nodes.filter((node) => node.type !== "comment");
  assert.equal(nodes.length, 1, "only the reset layer may appear at the top level");
  const [layer] = nodes;
  assert.equal(layer.type, "atrule");
  assert.equal(layer.name, "layer");
  assert.equal(layer.params, "reset");
  assert.ok(layer.nodes?.length, "reset must be a nonempty layer block");
  root.walkAtRules("layer", (node) => assert.equal(node, layer, "no additional layers"));
});

for (const file of ["blanksheet.css", "blanksheet.min.css"]) {
  test(`${file}: all rules belong to one reset layer`, async () => {
    const code = await readFile(new URL(`../${file}`, import.meta.url), "utf8");
    const result = await stylelint.lint({
      code,
      config: {
        plugins: [layerContract],
        rules: { [ruleName]: true, "declaration-no-important": true }
      }
    });
    assert.equal(result.errored, false, result.report);
  });
}
