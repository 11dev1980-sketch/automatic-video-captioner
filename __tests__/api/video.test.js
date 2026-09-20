/**
 * Unit tests for api/video.js handler
 * Tests action routing, CORS headers, and error cases.
 */

// We test the handler logic by simulating req/res objects
function makeMockRes() {
  const res = {
    _status: 200,
    _body: null,
    _headers: {},
    status(code) {
      this._status = code;
      return this;
    },
    json(body) {
      this._body = body;
      return this;
    },
    end() {
      return this;
    },
    send(body) {
      this._body = body;
      return this;
    },
    setHeader(key, value) {
      this._headers[key] = value;
    },
  };
  return res;
}

function makeMockReq(overrides = {}) {
  return {
    method: "POST",
    query: {},
    body: {},
    headers: {},
    ...overrides,
  };
}

// Mock global fetch before requiring the module
global.fetch = jest.fn();

const handler = require("../../api/video.js").default;

describe("api/video handler", () => {
  beforeEach(() => {
    global.fetch.mockClear();
  });

  test("OPTIONS request returns 200", async () => {
    const req = makeMockReq({ method: "OPTIONS" });
    const res = makeMockRes();
    await handler(req, res);
    expect(res._status).toBe(200);
  });

  test("CORS headers are always set", async () => {
    const req = makeMockReq({ method: "OPTIONS" });
    const res = makeMockRes();
    await handler(req, res);
    expect(res._headers["Access-Control-Allow-Origin"]).toBe("*");
  });

  test("missing action returns 400 with validActions", async () => {
    const req = makeMockReq({ query: {}, body: {} });
    const res = makeMockRes();
    await handler(req, res);
    expect(res._status).toBe(400);
    expect(res._body.success).toBe(false);
    expect(Array.isArray(res._body.validActions)).toBe(true);
    expect(res._body.validActions).toContain("extract");
  });

  test("invalid action returns 400", async () => {
    const req = makeMockReq({ query: { action: "invalid" }, body: {} });
    const res = makeMockRes();
    await handler(req, res);
    expect(res._status).toBe(400);
    expect(res._body.success).toBe(false);
    expect(res._body.code).toBe("VE-5001");
  });

  test("extract action with missing url returns 400", async () => {
    const req = makeMockReq({ query: { action: "extract" }, body: {} });
    const res = makeMockRes();
    await handler(req, res);
    expect(res._status).toBe(400);
    expect(res._body.code).toBe("VE-5001");
  });

  test("extract action with unsupported platform returns 400", async () => {
    const req = makeMockReq({
      query: { action: "extract" },
      body: { url: "https://youtube.com/watch?v=abc" },
    });
    const res = makeMockRes();
    await handler(req, res);
    expect(res._status).toBe(400);
    expect(res._body.code).toBe("VE-5002");
  });

  test("download action with missing videoUrl returns 400", async () => {
    const req = makeMockReq({ query: { action: "download" }, body: {} });
    const res = makeMockRes();
    await handler(req, res);
    expect(res._status).toBe(400);
  });

  test("cleanup action succeeds even without upstream", async () => {
    global.fetch.mockRejectedValue(new Error("Network error"));
    const req = makeMockReq({ query: { action: "cleanup" }, body: {} });
    const res = makeMockRes();
    await handler(req, res);
    // cleanup has a fallback that returns 200 even on error
    expect(res._status).toBe(200);
  });
});
