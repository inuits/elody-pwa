import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { W3CTraceContextPropagator } from "@opentelemetry/core";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { Resource } from "@opentelemetry/resources";
import { ZoneContextManager } from "@opentelemetry/context-zone";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { FetchInstrumentation } from "@opentelemetry/instrumentation-fetch";
import { UserInteractionInstrumentation } from "@opentelemetry/instrumentation-user-interaction";
import { XMLHttpRequestInstrumentation } from "@opentelemetry/instrumentation-xml-http-request";

const exporter = new OTLPTraceExporter({
  url: "/api/traces",
});

export const provider = new WebTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "frontend",
  }),
});

provider.addSpanProcessor(new BatchSpanProcessor(exporter));
provider.register({
  propagator: new W3CTraceContextPropagator(),
  contextManager: new ZoneContextManager(),
});

registerInstrumentations({
  tracerProvider: provider,
  instrumentations: [
    new FetchInstrumentation(),
    new XMLHttpRequestInstrumentation(),
    new UserInteractionInstrumentation(),
  ],
});
