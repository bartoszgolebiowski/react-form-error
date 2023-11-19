import "@testing-library/jest-dom";
import fetch, { Headers, Request, Response } from "node-fetch";
import { beforeAll, afterEach, afterAll } from "vitest";
import { server } from "./mocks/node";

if (!globalThis.fetch) {
  globalThis.fetch = fetch;
  globalThis.Headers = Headers;
  globalThis.Request = Request;
  globalThis.Response = Response;
}

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
