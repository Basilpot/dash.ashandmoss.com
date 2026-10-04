import assert from "node:assert/strict";
import { test } from "node:test";

import { getFullImageUrl } from "./getFullImageUrl.ts";

// Stored media URLs are absolute and production includes the API prefix
// (https://host/api/v1/uploads/...). An earlier version anchored the match at
// the start of the path, so every one of those fell through to the raw host and
// next/image rejected it as an unconfigured hostname.
test("re-points absolute upload URLs at the same-origin proxy", () => {
  assert.equal(
    getFullImageUrl("https://eapi.basilpot.com/api/v1/uploads/demo/furniture-1.webp"),
    "/api/uploads/demo/furniture-1.webp",
  );
  assert.equal(
    getFullImageUrl("https://eapi.basilpot.com/uploads/a.webp"),
    "/api/uploads/a.webp",
  );
  assert.equal(
    getFullImageUrl("http://localhost:3000/api/v1/uploads/x.png"),
    "/api/uploads/x.png",
  );
});

test("prefixes relative upload paths", () => {
  assert.equal(getFullImageUrl("/uploads/rel.webp"), "/api/uploads/rel.webp");
  assert.equal(getFullImageUrl("uploads/rel2.webp"), "/api/uploads/rel2.webp");
});

test("leaves non-upload remote URLs and empty input alone", () => {
  assert.equal(
    getFullImageUrl("https://images.unsplash.com/photo-1.jpg"),
    "https://images.unsplash.com/photo-1.jpg",
  );
  assert.equal(getFullImageUrl(""), "");
});