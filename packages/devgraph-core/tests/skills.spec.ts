import { describe, expect, it } from 'vitest';
import type { Devgraph } from '../src/index';
import { generateSkills } from '../src/agents/index';

function makeGraph(overrides?: Partial<Devgraph>): Devgraph {
  return {
    services: {
      'api-gateway': {
        name: 'api-gateway',
        type: 'node',
        commands: { dev: 'pnpm dev', build: 'pnpm build', test: 'pnpm test', lint: 'pnpm lint' },
        depends: ['user-service', 'postgres'],
        ports: [3000],
        apis: [
          {
            service: 'api-gateway',
            routes: {
              'GET /health': 'Health check',
              'GET /users/:id': 'Get user by ID',
              'POST /users': 'Create user',
            },
          },
        ],
        env: [{ service: 'api-gateway', vars: { PORT: '3000', NODE_ENV: 'development' } }],
      },
      'user-service': {
        name: 'user-service',
        type: 'node',
        commands: { dev: 'pnpm dev', build: 'pnpm build', test: 'pnpm test' },
        depends: ['postgres'],
      },
      postgres: {
        name: 'postgres',
        type: 'database',
        commands: { start: 'docker-compose up -d db' },
      },
    },
    apis: {
      'api-gateway': {
        service: 'api-gateway',
        routes: {
          'GET /health': 'Health check',
          'GET /users/:id': 'Get user by ID',
          'POST /users': 'Create user',
        },
      },
    },
    ...overrides,
  };
}

describe('generateSkills', () => {
  it('generates overview skill with correct frontmatter', () => {
    const graph = makeGraph();
    const result = generateSkills(graph);

    const overviewSkill = result.files.find(
      (f) => f.relativePath === 'querying-architecture/SKILL.md'
    );
    expect(overviewSkill).toBeDefined();
    expect(overviewSkill!.content).toContain('name: querying-architecture');
    expect(overviewSkill!.content).toContain('description: >');
    expect(overviewSkill!.content).toContain('devgraph impact');
    expect(overviewSkill!.content).toContain('devgraph validate');
    expect(overviewSkill!.content).toContain('devgraph run');
    expect(overviewSkill!.content).toContain('3 service(s)');
  });

  it('generates architecture reference with mermaid diagram', () => {
    const graph = makeGraph();
    const result = generateSkills(graph);

    const archRef = result.files.find(
      (f) => f.relativePath === 'querying-architecture/references/ARCHITECTURE.md'
    );
    expect(archRef).toBeDefined();
    expect(archRef!.content).toContain('```mermaid');
    expect(archRef!.content).toContain('graph LR');
    expect(archRef!.content).toContain('api-gateway');
    expect(archRef!.content).toContain('user-service');
    expect(archRef!.content).toContain('postgres');
  });

  it('generates services reference table', () => {
    const graph = makeGraph();
    const result = generateSkills(graph);

    const servicesRef = result.files.find(
      (f) => f.relativePath === 'querying-architecture/references/SERVICES.md'
    );
    expect(servicesRef).toBeDefined();
    expect(servicesRef!.content).toContain('| api-gateway');
    expect(servicesRef!.content).toContain('| user-service');
    expect(servicesRef!.content).toContain('| postgres');
  });

  it('generates per-service skill with correct frontmatter', () => {
    const graph = makeGraph();
    const result = generateSkills(graph);

    const apiSkill = result.files.find(
      (f) => f.relativePath === 'services/api-gateway-context/SKILL.md'
    );
    expect(apiSkill).toBeDefined();
    expect(apiSkill!.content).toContain('name: api-gateway-context');
    expect(apiSkill!.content).toContain('description: >');
    expect(apiSkill!.content).toContain('api-gateway');
  });

  it('generates per-service skill with commands table', () => {
    const graph = makeGraph();
    const result = generateSkills(graph);

    const apiSkill = result.files.find(
      (f) => f.relativePath === 'services/api-gateway-context/SKILL.md'
    );
    expect(apiSkill!.content).toContain('## Commands');
    expect(apiSkill!.content).toContain('| dev | `pnpm dev` |');
    expect(apiSkill!.content).toContain('| build | `pnpm build` |');
    expect(apiSkill!.content).toContain('| test | `pnpm test` |');
  });

  it('generates before-submitting section with check commands', () => {
    const graph = makeGraph();
    const result = generateSkills(graph);

    const apiSkill = result.files.find(
      (f) => f.relativePath === 'services/api-gateway-context/SKILL.md'
    );
    expect(apiSkill!.content).toContain('## Before submitting changes');
    expect(apiSkill!.content).toContain('pnpm lint && pnpm test && pnpm build');
  });

  it('generates routes reference only for services with APIs', () => {
    const graph = makeGraph();
    const result = generateSkills(graph);

    const apiRoutes = result.files.find(
      (f) => f.relativePath === 'services/api-gateway-context/references/ROUTES.md'
    );
    expect(apiRoutes).toBeDefined();
    expect(apiRoutes!.content).toContain('GET');
    expect(apiRoutes!.content).toContain('/health');
    expect(apiRoutes!.content).toContain('/users/:id');
    expect(apiRoutes!.content).toContain('POST');

    // user-service has no APIs, so no routes reference
    const userRoutes = result.files.find(
      (f) => f.relativePath === 'services/user-service-context/references/ROUTES.md'
    );
    expect(userRoutes).toBeUndefined();
  });

  it('computes downstream consumers correctly', () => {
    const graph = makeGraph();
    const result = generateSkills(graph);

    // postgres is depended on by api-gateway and user-service
    const pgSkill = result.files.find(
      (f) => f.relativePath === 'services/postgres-context/SKILL.md'
    );
    expect(pgSkill).toBeDefined();
    expect(pgSkill!.content).toContain('## Downstream consumers');
    expect(pgSkill!.content).toContain('api-gateway');
    expect(pgSkill!.content).toContain('user-service');

    // user-service is depended on by api-gateway
    const userSkill = result.files.find(
      (f) => f.relativePath === 'services/user-service-context/SKILL.md'
    );
    expect(userSkill!.content).toContain('## Downstream consumers');
    expect(userSkill!.content).toContain('api-gateway');
  });

  it('filters to a single service when --service is specified', () => {
    const graph = makeGraph();
    const result = generateSkills(graph, { services: ['api-gateway'] });

    // Should still have overview
    const overviewSkill = result.files.find(
      (f) => f.relativePath === 'querying-architecture/SKILL.md'
    );
    expect(overviewSkill).toBeDefined();

    // Should have api-gateway service skill
    const apiSkill = result.files.find(
      (f) => f.relativePath === 'services/api-gateway-context/SKILL.md'
    );
    expect(apiSkill).toBeDefined();

    // Should NOT have user-service or postgres service skills
    const userSkill = result.files.find(
      (f) => f.relativePath === 'services/user-service-context/SKILL.md'
    );
    expect(userSkill).toBeUndefined();
  });

  it('warns for missing service names', () => {
    const graph = makeGraph();
    const result = generateSkills(graph, { services: ['nonexistent'] });

    expect(result.warnings).toContain('Service not found: nonexistent');
  });

  it('generates with best-effort mode for services without commands', () => {
    const graph: Devgraph = {
      services: {
        'bare-service': {
          name: 'bare-service',
          type: 'python',
        },
      },
      apis: {},
    };

    // Without best-effort: warns
    const resultWithout = generateSkills(graph);
    expect(resultWithout.warnings.length).toBeGreaterThan(0);
    const bareSkillWithout = resultWithout.files.find(
      (f) => f.relativePath === 'services/bare-service-context/SKILL.md'
    );
    expect(bareSkillWithout).toBeUndefined();

    // With best-effort: generates with TODO
    const resultWith = generateSkills(graph, { bestEffort: true });
    const bareSkill = resultWith.files.find(
      (f) => f.relativePath === 'services/bare-service-context/SKILL.md'
    );
    expect(bareSkill).toBeDefined();
    expect(bareSkill!.content).toContain('<!-- TODO');
  });

  it('generates dependencies section for services with depends', () => {
    const graph = makeGraph();
    const result = generateSkills(graph);

    const apiSkill = result.files.find(
      (f) => f.relativePath === 'services/api-gateway-context/SKILL.md'
    );
    expect(apiSkill!.content).toContain('## Dependencies');
    expect(apiSkill!.content).toContain('**user-service** (node)');
    expect(apiSkill!.content).toContain('**postgres** (database)');
  });

  it('overview skill description stays under 1024 characters', () => {
    const graph = makeGraph();
    const result = generateSkills(graph);

    const overviewSkill = result.files.find(
      (f) => f.relativePath === 'querying-architecture/SKILL.md'
    );
    const content = overviewSkill!.content;
    // Extract description from frontmatter (everything between the two ---)
    const frontmatterMatch = content.match(/---\n([\s\S]*?)\n---/);
    expect(frontmatterMatch).toBeDefined();
    // Extract just the description value (multiline, starts after "description: >" or "description:")
    const descriptionLines: string[] = [];
    let inDescription = false;
    for (const line of frontmatterMatch![1].split('\n')) {
      if (line.startsWith('description:')) {
        inDescription = true;
        continue;
      }
      if (inDescription && line.startsWith('  ')) {
        descriptionLines.push(line.trim());
      } else if (inDescription) {
        break;
      }
    }
    const descriptionText = descriptionLines.join(' ');
    expect(descriptionText.length).toBeGreaterThan(0);
    expect(descriptionText.length).toBeLessThan(1024);
  });

  it('skill names use lowercase hyphens only', () => {
    const graph = makeGraph();
    const result = generateSkills(graph);

    for (const file of result.files) {
      if (file.relativePath.endsWith('SKILL.md')) {
        const nameMatch = file.content.match(/name: (.+)/);
        expect(nameMatch).toBeDefined();
        const name = nameMatch![1].trim();
        expect(name).toMatch(/^[a-z][a-z0-9-]*[a-z0-9]$/);
      }
    }
  });
});
