import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { ParentBasedSampler, TraceIdRatioBasedSampler, AlwaysOnSampler } from '@opentelemetry/core';
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

// Plugins
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

import { environment as env} from '../environment';

const init = function (serviceName: string, spanProcessor: any) {

    const otelExporter = new OTLPTraceExporter({
        url: `http://${env.otel.host}:${env.otel.port}/v1/traces`, 
        // headers: {
        //     "content-type": "application/json"
        // }
        headers: {},
    });

    const provider = new WebTracerProvider({
        resource: new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: serviceName
        }), 
         
    });

    // provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter())); // Uncomment this, if you want print data on console for e.g. for  debugging purposes.
    provider.addSpanProcessor(new spanProcessor(otelExporter));

    provider.register({
        // Changing default contextManager to use ZoneContextManager - supports asynchronous operations - optional
        contextManager: new ZoneContextManager(),
    });

    return { provider };
};

export default init;