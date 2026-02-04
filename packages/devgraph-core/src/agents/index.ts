import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Devgraph } from '../index.js';
import { inferServiceData, type InferredData } from './inference.js';
import {
  renderArchitectureReference,
  renderOverviewSkillMd,
  renderRoutesReference,
  renderServiceSkillMd,
  renderServicesReference,
} from './skill-template.js';
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

// --- Agent Skills generation ---

export interface GenerateSkillsOptions {
  servicePath?: string | ((serviceName: string) => string | undefined);
  bestEffort?: boolean;
  services?: string[];
}

export interface SkillFile {
  relativePath: string;
  content: string;
}

export interface GenerateSkillsResult {
  files: SkillFile[];
  warnings: string[];
}

function computeDownstreamConsumers(graph: Devgraph): Map<string, string[]> {
  const consumers = new Map<string, string[]>();
  for (const name of Object.keys(graph.services)) {
    consumers.set(name, []);
  }
  for (const [name, service] of Object.entries(graph.services)) {
    for (const dep of service.depends ?? []) {
      const existing = consumers.get(dep);
      if (existing) {
        existing.push(name);
      } else {
        consumers.set(dep, [name]);
      }
    }
  }
  return consumers;
}

export function generateSkills(
  graph: Devgraph,
  options: GenerateSkillsOptions = {}
): GenerateSkillsResult {
  const { servicePath: servicePathOption, bestEffort = false, services: filterServices } = options;
  const result: GenerateSkillsResult = {
    files: [],
    warnings: [],
  };

  const downstreamMap = computeDownstreamConsumers(graph);
  const inferredDataMap = new Map<string, InferredData>();

  const serviceNames = filterServices ?? Object.keys(graph.services);

  // Infer data for all services (needed for overview references)
  for (const serviceName of Object.keys(graph.services)) {
    const servicePath = resolveServicePath(serviceName, servicePathOption);
    if (servicePath) {
      inferredDataMap.set(serviceName, inferServiceData(servicePath));
    } else {
      inferredDataMap.set(serviceName, { commands: {}, landmarks: [] });
    }
  }

  // Layer 1: Overview skill (always generated)
  result.files.push({
    relativePath: 'querying-architecture/SKILL.md',
    content: renderOverviewSkillMd(graph),
  });
  result.files.push({
    relativePath: 'querying-architecture/references/ARCHITECTURE.md',
    content: renderArchitectureReference(graph),
  });
  result.files.push({
    relativePath: 'querying-architecture/references/SERVICES.md',
    content: renderServicesReference(graph, inferredDataMap),
  });

  // Layer 2: Per-service skills
  for (const serviceName of serviceNames) {
    const service = graph.services[serviceName];
    if (!service) {
      result.warnings.push(`Service not found: ${serviceName}`);
      continue;
    }

    const inferred = inferredDataMap.get(serviceName) ?? { commands: {}, landmarks: [] };

    const hasCommands = Object.keys(service.commands ?? {}).length > 0 ||
                        Object.keys(inferred.commands).length > 0;

    if (!hasCommands && !bestEffort) {
      result.warnings.push(
        `Service "${serviceName}" has no commands defined and no package.json found. Use --best-effort to generate anyway.`
      );
      continue;
    }

    const servicePath = resolveServicePath(serviceName, servicePathOption);
    const skillDirName = `${serviceName}-context`;

    result.files.push({
      relativePath: `services/${skillDirName}/SKILL.md`,
      content: renderServiceSkillMd({
        service,
        graph,
        inferred,
        servicePath,
        bestEffort,
        downstreamConsumers: downstreamMap.get(serviceName) ?? [],
      }),
    });

    // Generate routes reference if service has API routes
    const hasAPIs = service.apis && service.apis.length > 0 &&
      service.apis.some(api => Object.keys(api.routes || {}).length > 0);
    if (hasAPIs) {
      result.files.push({
        relativePath: `services/${skillDirName}/references/ROUTES.md`,
        content: renderRoutesReference(service),
      });
    }
  }

  return result;
}

export function formatSkillsResult(result: GenerateSkillsResult): string {
  const lines: string[] = [];
  const fileCount = result.files.length;

  if (fileCount > 0) {
    lines.push(`Generated ${fileCount} skill file(s):`);
    for (const file of result.files) {
      lines.push(`  - ${file.relativePath}`);
    }
  } else {
    lines.push('No skill files generated.');
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
