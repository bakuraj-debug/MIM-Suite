import test from "node:test";
import assert from "node:assert/strict";
import { getPath, render, fmtClock } from "../src/lib/util.js";
import { validateSlot } from "../src/data/slots.js";
import { deriveView, emptyLocal, layoutTopology, sparkPath } from "../src/lib/view.js";
import { demo } from "../src/data/demo.js";

test("getPath handles dots, indexes and empty path", () => {
  const o = { a: { b: [{ c: 5 }] } };
  assert.equal(getPath(o, "a.b[0].c"), 5);
  assert.equal(getPath(o, ""), o);
  assert.equal(getPath(o, "a.x.y"), undefined);
});
test("render substitutes and JSON-escapes", () => {
  assert.equal(render("/i/{{id}}", { id: "X1" }), "/i/X1");
  assert.equal(render('{"t":"{{n}}"}', { n: 'a"b\nc' }, { json: true }), '{"t":"a\\"b\\nc"}');
});
test("fmtClock", () => assert.equal(fmtClock(2781), "00:46:21"));
test("validateSlot accepts demo shapes and rejects bad ones", () => {
  for (const k of ["incident", "kpis", "topology", "hypotheses", "precedents", "timeline", "actions", "bridge"]) validateSlot(k, demo[k]);
  assert.throws(() => validateSlot("kpis", { x: 1 }), /expects an array/);
  assert.throws(() => validateSlot("timeline", [{ time: "1" }]), /missing required/);
  assert.throws(() => validateSlot("topology", { nodes: [{ id: "a" }] }), /missing/);
});
test("bound slot never falls back to demo data", () => {
  const v = deriveView({ timeline: { status: "error", data: undefined } }, emptyLocal());
  assert.deepEqual(v.timeline, []);
  assert.equal(deriveView({}, emptyLocal()).timeline.length, demo.timeline.length);
});
test("local overlay: notes, done, phase, recovery", () => {
  const l = { ...emptyLocal(), phase: "mitigating", notes: [{ time: "1", src: "IC", text: "n" }], done: { a1: { done: true } } };
  const v = deriveView({}, l);
  assert.equal(v.timeline[0].text, "n");
  assert.equal(v.actions.find((a) => a.id === "a1").done, true);
  assert.equal(v.usersImpacted, 1200);
  assert.equal(v.decision, null);
});
test("layout places nodes by tier and drops dangling edges", () => {
  const L = layoutTopology({ nodes: [{ id: "a", tier: 1 }, { id: "b", tier: 2 }, { id: "c", tier: 2 }], edges: [{ from: "a", to: "b" }, { from: "a", to: "zzz" }] });
  assert.equal(L.edges.length, 1);
  assert.ok(L.pos.b.x > L.pos.a.x && L.pos.c.y > L.pos.b.y);
});
test("sparkPath", () => { assert.equal(sparkPath([1]), ""); assert.match(sparkPath([1, 2, 3]), /^M /); });
