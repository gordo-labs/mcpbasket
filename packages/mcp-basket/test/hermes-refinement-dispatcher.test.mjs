import assert from "node:assert/strict";
import test from "node:test";
import { HermesRefinementDispatcher } from "../build/infrastructure/index.js";

const request = {
  id: "refinement-one",
  searchId: "search-one",
  prompt: "Only show lower-cost options.",
  searchSnapshot: {
    id: "search-one",
    context: { title: "Desk speakers" },
    items: [],
    createdAt: "2026-06-19T00:00:00.000Z",
    updatedAt: "2026-06-19T00:00:00.000Z",
  },
  status: "queued",
  createdAt: "2026-06-19T00:00:00.000Z",
  updatedAt: "2026-06-19T00:00:00.000Z",
};

test("HermesRefinementDispatcher is opt-in and confirms a spawned local command", async () => {
  const unconfigured = new HermesRefinementDispatcher();
  assert.equal(unconfigured.isConfigured(), false);
  assert.equal(await unconfigured.dispatch(request), false);

  const configured = new HermesRefinementDispatcher(process.execPath);
  assert.equal(configured.isConfigured(), true);
  assert.equal(await configured.dispatch(request), true);
});
