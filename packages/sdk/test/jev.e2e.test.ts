import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect } from "chai";
import {
  SystemOneClient,
  SystemOneError,
  type Answer,
  type EvaluateResponse,
  type Question,
} from "../src/index.ts";

const JEV_BASE_URL = "https://api.typesafe.ai";
const casesDir = join(dirname(fileURLToPath(import.meta.url)), "../../../conformance/cases");

interface ConformanceCase {
  id: string;
  request: {
    state: string | Record<string, unknown> | unknown[];
    questions: Record<string, Question>;
  };
}

describe("Jev API", () => {
  it("returns a spec-shaped answer for every conformance case", async () => {
    const client = jevClient(jevApiKey());
    const cases = await loadCases();
    expect(cases).to.not.be.empty;

    for (const testCase of cases) {
      const result = await client.evaluate({
        state: testCase.request.state,
        questions: testCase.request.questions,
      });
      expectSpecResponse(testCase.request.questions, result);
    }
  });

  it("rejects a bad credential with HTTP 401", async () => {
    const client = jevClient("not-a-real-key");

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

  it("rejects a request with no questions with HTTP 422", async () => {
    const client = jevClient(jevApiKey());

    try {
      await client.evaluate({
        state: "hello",
        questions: {},
      });
      expect.fail("expected SystemOneError");
    } catch (error) {
      expect(error).to.be.instanceOf(SystemOneError);
      expect((error as SystemOneError).status).to.equal(422);
    }
  });
});

/** Points the client at hosted Jev. `SYSTEM_ONE_MODEL` overrides `jev-latest`. */
function jevClient(apiKey: string): SystemOneClient {
  return new SystemOneClient({
    apiKey,
    baseUrl: JEV_BASE_URL,
    model: process.env.SYSTEM_ONE_MODEL ?? "jev-latest",
  });
}

/** Reads the Jev credential named in registry/providers.yaml. */
function jevApiKey(): string {
  const apiKey = process.env.TYPESAFE_API_KEY;
  if (!apiKey) {
    throw new Error("TYPESAFE_API_KEY is required");
  }
  return apiKey;
}

/** Loads the shared conformance requests. Fixture numbers are not live Jev output. */
async function loadCases(): Promise<ConformanceCase[]> {
  const names = (await readdir(casesDir)).filter((name) => name.endsWith(".json")).sort();
  const cases = await Promise.all(
    names.map(async (name) => JSON.parse(await readFile(join(casesDir, name), "utf8")) as ConformanceCase),
  );
  return cases;
}

/**
 * Checks the parsed Jev body: one answer per question, matching type, and the
 * fields the spec requires. Does not compare conformance fixture values.
 */
function expectSpecResponse(questions: Record<string, Question>, result: EvaluateResponse): void {
  expect(result.model).to.be.a("string").and.not.empty;
  expect(Object.keys(result.answers).sort()).to.deep.equal(Object.keys(questions).sort());
  expect(Number.isInteger(result.usage.input_tokens)).to.equal(true);
  expect(result.usage.input_tokens).to.be.at.least(0);
  expect(Number.isInteger(result.usage.output_tokens)).to.equal(true);
  expect(result.usage.output_tokens).to.be.at.least(0);

  for (const [id, question] of Object.entries(questions)) {
    expectSpecAnswer(question, result.answers[id]);
  }
}

/** Checks one live answer against the question that produced it. */
function expectSpecAnswer(question: Question, answer: Answer): void {
  expect(answer.type).to.equal(question.type);

  if (question.type === "noul" && answer.type === "noul") {
    expect(answer.noul).to.be.within(0, 1);
    if (answer.confidence !== undefined) {
      expect(answer.confidence).to.be.within(0, 1);
    }
    return;
  }

  if (question.type === "choice" && answer.type === "choice") {
    const options = Object.keys(question.criteria);
    expect(answer.choice).to.be.oneOf(options);
    expect(answer.confidence).to.be.within(0, 1);
    expect(Object.keys(answer.probabilities).sort()).to.deep.equal([...options].sort());
    for (const option of options) {
      expect(answer.probabilities[option]).to.be.within(0, 1);
    }
    return;
  }

  if (question.type === "score" && answer.type === "score") {
    const last = question.criteria.length - 1;
    expect(answer.score).to.be.within(0, last);
    expect(answer.confidence).to.be.within(0, 1);
    for (let index = 0; index <= last; index += 1) {
      const key = String(index);
      const level = question.criteria[index];
      expect(answer.probabilities[key]).to.be.within(0, 1);
      if (typeof level === "string") {
        expect(answer.legend[key]).to.equal(level);
      } else {
        expect(answer.legend[key]).to.exist;
      }
    }
  }
}
