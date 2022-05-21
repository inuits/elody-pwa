import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { ParentBasedSampler, TraceIdRatioBasedSampler } from '@opentelemetry/core';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';

// Plugins
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const init = function (isTraceEnabled: string, serviceName: string, otlpHost: string, otlpPort: string) {
    if (isTraceEnabled == "False") return;

    const otelExporter = new OTLPTraceExporter({
        url: `http://${otlpHost}:${otlpPort}/v1/traces`, 
        headers: {},
    });

    const provider = new WebTracerProvider({
        resource: new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: serviceName
        }), 
        sampler:new ParentBasedSampler({
            root: new TraceIdRatioBasedSampler(1)
        })
    });

    // provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter())); // Uncomment this, if you want print data on console for e.g. for  debugging purposes.
    provider.addSpanProcessor(new BatchSpanProcessor(otelExporter));

    provider.register({
        // Changing default contextManager to use ZoneContextManager - supports asynchronous operations - optional
        contextManager: new ZoneContextManager(),
    });
    registerInstrumentations({
        instrumentations: [
            new UserInteractionInstrumentation(),
            new XMLHttpRequestInstrumentation(),
            new FetchInstrumentation()
        ],
    });
  
    const tracer = provider.getTracer(serviceName);

    return { tracer, provider, otelExporter };
};

export default init;