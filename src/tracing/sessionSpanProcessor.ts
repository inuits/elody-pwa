import type { Span, SpanProcessor } from "@opentelemetry/sdk-trace-web";

// Puts the tab's session id on every browser span, so the traces of one
// session can be found from its usage events or error reports.
export class SessionSpanProcessor implements SpanProcessor {
  constructor(private readonly sessionId: string) {}

  onStart(span: Span): void {
    span.setAttribute("session.id", this.sessionId);
  }

  onEnd(): void {}

  async forceFlush(): Promise<void> {}

  async shutdown(): Promise<void> {}
}
