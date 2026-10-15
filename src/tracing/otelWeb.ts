import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { DocumentLoadInstrumentation } from "@opentelemetry/instrumentation-document-load";
import { FetchInstrumentation } from "@opentelemetry/instrumentation-fetch";
import { UserInteractionInstrumentation } from "@opentelemetry/instrumentation-user-interaction";
import { resourceFromAttributes } from "@opentelemetry/resources";
import {
  BatchSpanProcessor,
  WebTracerProvider,
} from "@opentelemetry/sdk-trace-web";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import type { BrowserTracingSettings } from "@/tracing/browserTracing";

export const startBrowserTracing = ({
  tracesUrl,
  serviceName,
}: BrowserTracingSettings) => {
  const provider = new WebTracerProvider({
    resource: resourceFromAttributes({ [ATTR_SERVICE_NAME]: serviceName }),
    spanProcessors: [
      new BatchSpanProcessor(new OTLPTraceExporter({ url: tracesUrl })),
    ],
  });
  // No ZoneContextManager: zone.js patches browser globals app-wide and still
  // loses the context across native async/await, so a click and the GraphQL
  // request it causes stay separate traces.
  provider.register();

  registerInstrumentations({
    instrumentations: [
      new DocumentLoadInstrumentation(),
      new UserInteractionInstrumentation({ eventNames: ["click", "submit"] }),
      // Same-origin requests, such as /api/graphql, carry a traceparent header
      // by default, so GraphQL and collection-api join the browser's trace.
      new FetchInstrumentation({ ignoreUrls: [tracesUrl] }),
    ],
  });
};
