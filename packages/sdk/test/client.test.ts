import { expect } from "chai";
import sinon from "sinon";
import { SystemOneClient, SystemOneError } from "../src/index.ts";

const options = {
  apiKey: "test-key",
  baseUrl: "http://127.0.0.1:8009",
  model: "example",
};

const noulBody = {
  model: "example-1.0.0",
  answers: { same_day: { type: "noul", noul: 0.91 } },
  usage: { input_tokens: 42, output_tokens: 4 },
  latency_ms: 18,
};

describe("SystemOneClient", () => {
  afterEach(() => sinon.restore());

  it("posts state and questions to /v1/systemone", async () => {
    const fetchStub = sinon.stub().resolves(jsonResponse(200, noulBody));
    const client = new SystemOneClient({ ...options, fetch: fetchStub });

    const result = await client.evaluate({
      state: "Please reverse one charge today.",
      questions: { same_day: { type: "noul", instructions: "Is it same-day?" } },
    });

    expect(result.answers.same_day).to.deep.equal({ type: "noul", noul: 0.91 });
    const [url, init] = fetchStub.firstCall.args;
    expect(url).to.equal("http://127.0.0.1:8009/v1/systemone");
    expect(init.method).to.equal("POST");
    expect(init.headers.Authorization).to.equal("Bearer test-key");
    expect(JSON.parse(init.body)).to.deep.include({ model: "example" });
  });

  it("throws SystemOneError when the server rejects the credential", async () => {
    const fetchStub = sinon.stub().resolves(jsonResponse(401, { detail: "unauthorized" }));
    const client = new SystemOneClient({ ...options, fetch: fetchStub });

    try {
      await client.evaluate({
        state: "hello",
        questions: { same_day: { type: "noul" } },
      });
      expect.fail("expected SystemOneError");
    } catch (error) {
      expect(error).to.be.instanceOf(SystemOneError);
      expect((error as SystemOneError).status).to.equal(401);
    }
  });

  it("strips a trailing slash so the path is appended once", async () => {
    const fetchStub = sinon.stub().resolves(jsonResponse(200, noulBody));
    const client = new SystemOneClient({
      ...options,
      baseUrl: "http://127.0.0.1:8009/",
      fetch: fetchStub,
    });

    await client.evaluate({
      state: "hello",
      questions: { same_day: { type: "noul" } },
    });

    expect(fetchStub.firstCall.args[0]).to.equal("http://127.0.0.1:8009/v1/systemone");
  });
});

/** Builds a fetch Response whose body is JSON. */
function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
