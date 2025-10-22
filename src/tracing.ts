import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { W3CTraceContextPropagator } from "@opentelemetry/core";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { Resource } from "@opentelemetry/resources";

const exporter = new OTLPTraceExporter({
  url: "http://alloy.localhost:8000/otlp/v1/traces",
});

const provider = new WebTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "frontend",
  }),
});
provider.addSpanProcessor(new BatchSpanProcessor(exporter));

provider.register({
  propagator: new W3CTraceContextPropagator(),
});

console.log("[Tracing] Frontend OpenTelemetry initialized");
