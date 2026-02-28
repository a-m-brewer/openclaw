import { SessionManager } from "@mariozechner/pi-coding-agent";

type AppendMessageArg = Parameters<SessionManager["appendMessage"]>[0];

function buildUserMessage(text: string, timestamp: number): AppendMessageArg {
  return {
    role: "user",
    content: [{ type: "text", text }],
    timestamp,
  };
}

function buildAssistantMessage(
  text: string,
  timestamp: number,
): AppendMessageArg & Record<string, unknown> {
  return {
    role: "assistant",
    content: [{ type: "text", text }],
    timestamp,
    stopReason: "stop",
    usage: {
      input: 0,
      output: 0,
      cacheRead: 0,
      cacheWrite: 0,
      totalTokens: 0,
      cost: {
        input: 0,
        output: 0,
        cacheRead: 0,
        cacheWrite: 0,
        total: 0,
      },
    },
    // Marked explicitly as OpenClaw transcript injection so this never appears
    // as model-native output provenance.
    api: "openai-responses",
    provider: "openclaw",
    model: "acp-transcript",
  };
}

export function appendAcpTurnToTranscript(params: {
  transcriptPath: string;
  userText: string;
  assistantText: string;
  now?: number;
}): { ok: true } | { ok: false; error: string } {
  const userText = params.userText.trim();
  const assistantText = params.assistantText.trim();
  if (!userText || !assistantText) {
    return { ok: true };
  }

  const now = params.now ?? Date.now();

  try {
    const sessionManager = SessionManager.open(params.transcriptPath);
    sessionManager.appendMessage(buildUserMessage(userText, now));
    sessionManager.appendMessage(buildAssistantMessage(assistantText, now));
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
