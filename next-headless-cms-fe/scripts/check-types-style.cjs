#!/usr/bin/env node
/**
 * Types-style compliance: positional-arity (3+) and colocated-props.
 * See specs/005-fe-options-types-coverage/contracts/types-style-check.md
 */
const fs = require("fs");
const path = require("path");
const ts = require("typescript");

const ROOT = path.join(__dirname, "..", "src");
const CACHE_ALLOWLIST = new Set(["getPageCachedImpl"]);

/** @type {{ kind: string, file: string, symbol: string, detail: string }[]} */
const findings = [];

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(name) && !name.endsWith(".d.ts")) out.push(full);
  }
  return out;
}

function rel(file) {
  return path.relative(path.join(__dirname, ".."), file).replace(/\\/g, "/");
}

function paramCount(params) {
  return params.filter((p) => !p.dotDotDotToken).length;
}

function isSingleOptionsObject(params) {
  if (params.length !== 1) return false;
  const p = params[0];
  return (
    ts.isObjectBindingPattern(p.name) ||
    (p.type &&
      (ts.isTypeReferenceNode(p.type) ||
        ts.isTypeLiteralNode(p.type) ||
        ts.isIntersectionTypeNode(p.type)))
  );
}

function checkArity(node, file, nameHint) {
  if (!node.parameters) return;
  const name =
    nameHint ||
    (node.name && ts.isIdentifier(node.name) ? node.name.text : "<anonymous>");
  if (CACHE_ALLOWLIST.has(name)) return;
  const count = paramCount(node.parameters);
  if (count < 3) return;
  if (isSingleOptionsObject(node.parameters)) return;
  // Error subclass constructors mirroring Error(message, ...) — allow if named *Error
  if (
    ts.isConstructorDeclaration(node) &&
    /Error$/.test(path.basename(file, path.extname(file)))
  ) {
    return;
  }
  if (name === "constructor") {
    const className = node.parent && node.parent.name && ts.isIdentifier(node.parent.name)
      ? node.parent.name.text
      : "";
    if (/Error$/.test(className)) return;
  }
  findings.push({
    kind: "positional-arity",
    file: rel(file),
    symbol: name,
    detail: `${count} positional parameters`,
  });
}

function checkColocatedProps(sourceFile, file) {
  const base = path.basename(file);
  if (base === "types.ts" || base === "types.tsx") return;
  // Domain contracts live under core/types/*.ts (not always named types.ts)
  const normalized = file.replace(/\\/g, "/");
  if (normalized.includes("/src/core/types/")) return;
  if (!file.endsWith(".tsx") && !file.endsWith(".ts")) return;

  const visit = (node) => {
    if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) {
      const name = node.name.text;
      if (/Props$/.test(name) || name === "Props") {
        findings.push({
          kind: "colocated-props",
          file: rel(file),
          symbol: name,
          detail: "props type declared outside types.ts",
        });
      }
    }
    // Inline props object type on exported component: (...): { ... }
    if (
      (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node)) &&
      node.parameters.length === 1
    ) {
      const p = node.parameters[0];
      if (
        ts.isObjectBindingPattern(p.name) &&
        p.type &&
        ts.isTypeLiteralNode(p.type) &&
        file.endsWith(".tsx")
      ) {
        const fnName =
          (node.name && ts.isIdentifier(node.name) && node.name.text) ||
          (ts.isVariableDeclaration(node.parent) &&
          node.parent.name &&
          ts.isIdentifier(node.parent.name)
            ? node.parent.name.text
            : "component");
        findings.push({
          kind: "colocated-props",
          file: rel(file),
          symbol: fnName,
          detail: "inline props type literal in component signature",
        });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
}

function visitArity(node, file) {
  if (ts.isFunctionDeclaration(node) && node.body) {
    checkArity(node, file, node.name ? node.name.text : "<anonymous>");
  }
  if (ts.isMethodDeclaration(node) && node.body) {
    const name = node.name && ts.isIdentifier(node.name) ? node.name.text : "<method>";
    checkArity(node, file, name);
  }
  if (ts.isConstructorDeclaration(node) && node.body) {
    checkArity(node, file, "constructor");
  }
  if (
    ts.isVariableDeclaration(node) &&
    node.initializer &&
    (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer))
  ) {
    const name = ts.isIdentifier(node.name) ? node.name.text : "<anonymous>";
    checkArity(node.initializer, file, name);
  }
  ts.forEachChild(node, (child) => visitArity(child, file));
}

const files = walk(ROOT);
for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  const kind = file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sourceFile = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, kind);
  visitArity(sourceFile, file);
  checkColocatedProps(sourceFile, file);
}

// Dedupe
const seen = new Set();
const unique = findings.filter((f) => {
  const k = `${f.kind}|${f.file}|${f.symbol}|${f.detail}`;
  if (seen.has(k)) return false;
  seen.add(k);
  return true;
});

for (const f of unique) {
  console.log(`${f.kind}\t${f.file}\t${f.symbol}\t${f.detail}`);
}

if (unique.length > 0) {
  console.error(`\ncheck-types-style: ${unique.length} finding(s)`);
  process.exit(1);
}

console.log("check-types-style: ok");
process.exit(0);
