import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import yaml from 'yaml';
import { z } from 'zod';
import type { Devgraph, DevgraphBlock, ParseError, ServiceBlock, ApiBlock, EnvBlock } from '../index.js';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type ValidationErrorCode =
  | 'UNKNOWN_BLOCK_TYPE'
  | 'YAML_PARSE_ERROR'
  | 'SCHEMA_VALIDATION_ERROR'
  | 'MISSING_DEPENDENCY'
  | 'DUPLICATE_SERVICE'
  | 'ORPHAN_API_BLOCK'
  | 'ORPHAN_ENV_BLOCK'
  | 'DEPENDENCY_CYCLE'
  | 'RULE_VIOLATION'
  | 'CONFIG_ERROR';

export interface ValidationError {
  level: 'error' | 'warning';
  code: ValidationErrorCode;
  message: string;
  file?: string;
  line?: number;
  service?: string;
}

export interface ValidationResult {
  ok: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Config Schema
// ─────────────────────────────────────────────────────────────────────────────

const ruleSchema = z.object({
  name: z.string().min(1),
  kind: z.enum(['denyDependency']),
  from: z.string().min(1),
  to: z.string().min(1),
});

const configSchema = z.object({
  rules: z.array(ruleSchema).optional(),
});

export type DevgraphRule = z.infer<typeof ruleSchema>;
export type DevgraphConfig = z.infer<typeof configSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Config Loading
// ─────────────────────────────────────────────────────────────────────────────

export async function loadConfig(configPath?: string): Promise<{ config: DevgraphConfig | null; error?: ValidationError }> {
  const defaultPath = path.join(process.cwd(), '.devgraph', 'config.yaml');
  const targetPath = configPath ?? defaultPath;

  if (!existsSync(targetPath)) {
    return { config: null };
  }

  try {
    const content = await readFile(targetPath, 'utf8');
    const parsed = yaml.parse(content);
    const result = configSchema.safeParse(parsed);

    if (!result.success) {
      return {
        config: null,
        error: {
          level: 'error',
          code: 'CONFIG_ERROR',
          message: `Invalid config: ${result.error.message}`,
          file: targetPath,
        },
      };
    }

    return { config: result.data };
  } catch (error) {
    return {
      config: null,
      error: {
        level: 'error',
        code: 'CONFIG_ERROR',
        message: `Failed to read config: ${(error as Error).message}`,
        file: targetPath,
      },
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Consistency Checks
// ─────────────────────────────────────────────────────────────────────────────

export function validateConsistency(
  blocks: DevgraphBlock[],
  graph: Devgraph
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Track service definitions for duplicate detection
  const serviceDefinitions = new Map<string, { file: string; line?: number }[]>();

  // Collect service blocks
  for (const block of blocks) {
    if (block.type === 'service') {
      const data = block.data as ServiceBlock;
      const existing = serviceDefinitions.get(data.name) ?? [];
      existing.push({ file: block.file, line: block.line });
      serviceDefinitions.set(data.name, existing);
    }
  }

  // Check for duplicate service names
  for (const [serviceName, definitions] of serviceDefinitions) {
    if (definitions.length > 1) {
      const locations = definitions.map(d => d.line ? `${d.file}:${d.line}` : d.file).join(', ');
      errors.push({
        level: 'error',
        code: 'DUPLICATE_SERVICE',
        message: `Duplicate service name "${serviceName}" defined in: ${locations}`,
        service: serviceName,
        file: definitions[0].file,
        line: definitions[0].line,
      });
    }
  }

  // Check that all dependency targets exist
  for (const block of blocks) {
    if (block.type === 'service') {
      const data = block.data as ServiceBlock;
      for (const dep of data.depends ?? []) {
        if (!graph.services[dep]) {
          errors.push({
            level: 'error',
            code: 'MISSING_DEPENDENCY',
            message: `Service "${data.name}" depends on "${dep}" which is not defined`,
            file: block.file,
            line: block.line,
            service: data.name,
          });
        }
      }
    }
  }

  // Check that API blocks reference existing services
  for (const block of blocks) {
    if (block.type === 'api') {
      const data = block.data as ApiBlock;
      if (!graph.services[data.service]) {
        errors.push({
          level: 'error',
          code: 'ORPHAN_API_BLOCK',
          message: `API block references unknown service "${data.service}"`,
          file: block.file,
          line: block.line,
          service: data.service,
        });
      }
    }
  }

  // Check that ENV blocks reference existing services
  for (const block of blocks) {
    if (block.type === 'env') {
      const data = block.data as EnvBlock;
      if (!graph.services[data.service]) {
        errors.push({
          level: 'error',
          code: 'ORPHAN_ENV_BLOCK',
          message: `Env block references unknown service "${data.service}"`,
          file: block.file,
          line: block.line,
          service: data.service,
        });
      }
    }
  }

  // Check for dependency cycles
  const cycleErrors = detectCycles(graph);
  errors.push(...cycleErrors);

  return errors;
}

// ─────────────────────────────────────────────────────────────────────────────
// Cycle Detection
// ─────────────────────────────────────────────────────────────────────────────

function detectCycles(graph: Devgraph): ValidationError[] {
  const errors: ValidationError[] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(serviceName: string, path: string[]): string[] | null {
    if (recursionStack.has(serviceName)) {
      // Found a cycle
      const cycleStart = path.indexOf(serviceName);
      return [...path.slice(cycleStart), serviceName];
    }

    if (visited.has(serviceName)) {
      return null;
    }

    visited.add(serviceName);
    recursionStack.add(serviceName);

    const service = graph.services[serviceName];
    if (service?.depends) {
      for (const dep of service.depends) {
        if (graph.services[dep]) {
          const cycle = dfs(dep, [...path, serviceName]);
          if (cycle) {
            return cycle;
          }
        }
      }
    }

    recursionStack.delete(serviceName);
    return null;
  }

  for (const serviceName of Object.keys(graph.services)) {
    if (!visited.has(serviceName)) {
      const cycle = dfs(serviceName, []);
      if (cycle) {
        errors.push({
          level: 'error',
          code: 'DEPENDENCY_CYCLE',
          message: `Dependency cycle detected: ${cycle.join(' → ')}`,
          service: cycle[0],
        });
        break; // Report only the first cycle found
      }
    }
  }

  return errors;
}

// ─────────────────────────────────────────────────────────────────────────────
// Rules Validation
// ─────────────────────────────────────────────────────────────────────────────

export function validateRules(
  graph: Devgraph,
  config: DevgraphConfig,
  blocks: DevgraphBlock[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!config.rules) {
    return errors;
  }

  // Build a map of service blocks for location info
  const serviceBlockMap = new Map<string, { file: string; line?: number }>();
  for (const block of blocks) {
    if (block.type === 'service') {
      const data = block.data as ServiceBlock;
      serviceBlockMap.set(data.name, { file: block.file, line: block.line });
    }
  }

  for (const rule of config.rules) {
    if (rule.kind === 'denyDependency') {
      const fromService = graph.services[rule.from];
      if (fromService?.depends?.includes(rule.to)) {
        const location = serviceBlockMap.get(rule.from);
        errors.push({
          level: 'error',
          code: 'RULE_VIOLATION',
          message: `Rule "${rule.name}": ${rule.from} may not depend on ${rule.to}`,
          file: location?.file,
          line: location?.line,
          service: rule.from,
        });
      }
    }
  }

  return errors;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Validation Function
// ─────────────────────────────────────────────────────────────────────────────

export interface ValidateOptions {
  configPath?: string;
}

export async function validate(
  blocks: DevgraphBlock[],
  graph: Devgraph,
  parseErrors: ParseError[],
  options: ValidateOptions = {}
): Promise<ValidationResult> {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Convert parse errors to validation errors
  for (const parseError of parseErrors) {
    errors.push({
      level: 'error',
      code: 'SCHEMA_VALIDATION_ERROR',
      message: parseError.message,
      file: parseError.file,
      line: parseError.line,
    });
  }

  // Run consistency checks
  const consistencyErrors = validateConsistency(blocks, graph);
  errors.push(...consistencyErrors);

  // Load and validate config
  const { config, error: configError } = await loadConfig(options.configPath);
  if (configError) {
    errors.push(configError);
  }

  // Run rules validation if config exists
  if (config) {
    const ruleErrors = validateRules(graph, config, blocks);
    errors.push(...ruleErrors);
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Formatters
// ─────────────────────────────────────────────────────────────────────────────

export function formatValidationResult(result: ValidationResult): string {
  if (result.ok) {
    return '✓ DevGraph validation passed';
  }

  const lines: string[] = [];
  lines.push(`✗ DevGraph validation failed (${result.errors.length} error${result.errors.length === 1 ? '' : 's'})`);
  lines.push('');

  for (let i = 0; i < result.errors.length; i++) {
    const error = result.errors[i];
    lines.push(`${i + 1}) ${formatErrorCode(error.code)}`);

    if (error.service) {
      lines.push(`   service: ${error.service}`);
    }

    lines.push(`   ${error.message}`);

    if (error.file) {
      const location = error.line ? `${error.file}:${error.line}` : error.file;
      lines.push(`   file: ${location}`);
    }

    lines.push('');
  }

  return lines.join('\n').trim();
}

function formatErrorCode(code: ValidationErrorCode): string {
  const codeMap: Record<ValidationErrorCode, string> = {
    UNKNOWN_BLOCK_TYPE: 'Unknown block type',
    YAML_PARSE_ERROR: 'YAML parse error',
    SCHEMA_VALIDATION_ERROR: 'Schema validation error',
    MISSING_DEPENDENCY: 'Missing dependency',
    DUPLICATE_SERVICE: 'Duplicate service',
    ORPHAN_API_BLOCK: 'Orphan API block',
    ORPHAN_ENV_BLOCK: 'Orphan env block',
    DEPENDENCY_CYCLE: 'Dependency cycle',
    RULE_VIOLATION: 'Rule violation',
    CONFIG_ERROR: 'Config error',
  };
  return codeMap[code] ?? code;
}

export function formatValidationResultJson(result: ValidationResult): string {
  return JSON.stringify(result, null, 2);
}
