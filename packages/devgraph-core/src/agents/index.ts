import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Devgraph } from '../index.js';
import { inferServiceData, type InferredData } from './inference.js';
import { renderAgentMarkdown } from './template.js';

export { inferCommands, inferLandmarks, inferServiceData } from './inference.js';
export type { InferredCommands, InferredData } from './inference.js';

export interface GenerateAgentsOptions {
  servicePath?: string | ((serviceName: string) => string | undefined);
  bestEffort?: boolean;
  services?: string[];
}

export interface GenerateAgentsResult {
  agents: Record<string, string>;
  warnings: string[];
}

function resolveServicePath(
  serviceName: string,
  servicePathOption?: string | ((serviceName: string) => string | undefined)
): string | undefined {
  if (!servicePathOption) return undefined;

  if (typeof servicePathOption === 'function') {
    return servicePathOption(serviceName);
  }

  // If it's a string, assume it's a base path and the service is a subdirectory
  const candidatePath = join(servicePathOption, serviceName);
  if (existsSync(candidatePath)) {
    return candidatePath;
  }

  return undefined;
}

export function generateAgentsEnhanced(
  graph: Devgraph,
  options: GenerateAgentsOptions = {}
): GenerateAgentsResult {
  const { servicePath: servicePathOption, bestEffort = false, services: filterServices } = options;
  const result: GenerateAgentsResult = {
    agents: {},
    warnings: [],
  };

  const serviceNames = filterServices ?? Object.keys(graph.services);

  for (const serviceName of serviceNames) {
    const service = graph.services[serviceName];
    if (!service) {
      result.warnings.push(`Service not found: ${serviceName}`);
      continue;
    }

    // Resolve service path for inference
    const servicePath = resolveServicePath(serviceName, servicePathOption);
    let inferred: InferredData = { commands: {}, landmarks: [] };

    if (servicePath) {
      inferred = inferServiceData(servicePath);
    }

    // Check if we have enough data
    const hasCommands = Object.keys(service.commands ?? {}).length > 0 ||
                        Object.keys(inferred.commands).length > 0;

    if (!hasCommands && !bestEffort) {
      result.warnings.push(
        `Service "${serviceName}" has no commands defined and no package.json found. Use --best-effort to generate anyway.`
      );
      continue;
    }

    // Generate the agent markdown
    const markdown = renderAgentMarkdown({
      service,
      graph,
      inferred,
      servicePath,
      bestEffort,
    });

    result.agents[serviceName] = markdown;
  }

  return result;
}

export function formatAgentsResult(result: GenerateAgentsResult): string {
  const lines: string[] = [];
  const serviceCount = Object.keys(result.agents).length;

  if (serviceCount > 0) {
    lines.push(`Generated ${serviceCount} agent file(s):`);
    for (const name of Object.keys(result.agents).sort()) {
      lines.push(`  - ${name}.md`);
    }
  } else {
    lines.push('No agent files generated.');
  }

  if (result.warnings.length > 0) {
    lines.push('');
    lines.push('Warnings:');
    for (const warning of result.warnings) {
      lines.push(`  - ${warning}`);
    }
  }

  return lines.join('\n');
}
