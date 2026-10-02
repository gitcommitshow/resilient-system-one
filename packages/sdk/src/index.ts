/** Spec version this client implements. */
export const SPEC_VERSION = "1.0.0-draft";

export type State = string | Record<string, unknown> | unknown[];

export type RichText = string | Record<string, unknown> | unknown[];

export interface NoulQuestion {
  type: "noul";
  instructions?: RichText;
  criteria?: {
    true?: RichText | null;
    false?: RichText | null;
  } | null;
}

export interface ChoiceQuestion {
  type: "choice";
  instructions?: RichText;
  criteria: Record<string, RichText | null>;
}

export interface ScoreQuestion {
  type: "score";
  instructions?: RichText;
  criteria: RichText[];
}

export type Question = NoulQuestion | ChoiceQuestion | ScoreQuestion;

export interface EvaluateInput {
  state: State;
  questions: Record<string, Question>;
  /** Overrides the model set on the client. */
  model?: string;
}

export interface Usage {
  input_tokens: number;
  output_tokens: number;
}

export interface NoulAnswer {
  type: "noul";
  noul: number;
  confidence?: number;
}

export interface ChoiceAnswer {
  type: "choice";
  choice: string;
  probabilities: Record<string, number>;
  confidence: number;
}

export interface ScoreAnswer {
  type: "score";
  score: number;
  legend: Record<string, string>;
  probabilities: Record<string, number>;
  confidence: number;
}

export type Answer = NoulAnswer | ChoiceAnswer | ScoreAnswer;

export interface EvaluateResponse {
  model: string;
  answers: Record<string, Answer>;
  usage: Usage;
}

export interface SystemOneClientOptions {
  apiKey: string;
  baseUrl: string;
  model: string;
  /** Replaces global fetch. Tests pass a stub here. */
  fetch?: (url: string, init?: RequestInit) => Promise<Response>;
}

/** Failure from the client or from a non-2xx System One response. */
export class SystemOneError extends Error {
  readonly status: number | undefined;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "SystemOneError";
    this.status = status;
  }
}

/**
 * Calls POST /v1/systemone on any server that implements the spec.
 * The same questions work across servers. Change baseUrl and model to switch.
 */
export class SystemOneClient {
  constructor(private readonly options: SystemOneClientOptions) {}

  /** Evaluate state against typed questions and return the parsed body. */
  async evaluate(input: EvaluateInput): Promise<EvaluateResponse> {
    if (!this.options.apiKey) {
      throw new SystemOneError("apiKey is required");
    }

    const fetchFn = this.options.fetch ?? globalThis.fetch;
    if (!fetchFn) {
      throw new SystemOneError("fetch is not available");
    }

    const baseUrl = this.options.baseUrl.replace(/\/+$/, "");
    const response = await fetchFn(`${baseUrl}/v1/systemone`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.options.apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        state: input.state,
        model: input.model ?? this.options.model,
        questions: input.questions,
      }),
    });

    if (!response.ok) {
      throw new SystemOneError(`System One request failed with HTTP ${response.status}`, response.status);
    }

    let body: unknown;
    try {
      body = await response.json();
    } catch {
      throw new SystemOneError("System One response was not JSON", response.status);
    }

    if (!isEvaluateResponse(body)) {
      throw new SystemOneError("System One response is missing model, answers, or usage", response.status);
    }

    return body;
  }
}

/** Checks the three fields every conforming evaluate response carries. */
function isEvaluateResponse(value: unknown): value is EvaluateResponse {
  if (!value || typeof value !== "object") return false;
  const body = value as Record<string, unknown>;
  const hasModel = typeof body.model === "string";
  const hasAnswers = !!body.answers && typeof body.answers === "object";
  const hasUsage = !!body.usage && typeof body.usage === "object";
  return hasModel && hasAnswers && hasUsage;
}
