# Tessl Demo - Sonar Summit 2026

## Premise

Show how Tessl's tile ecosystem transforms garbage-tier AI coding skills into production-quality, reviewed, and scored tiles -- validated by SonarQube's own analysis.

## Demo Flow

1. **Show the bad skill** - a community Express API generator full of anti-patterns
2. **Generate an app** using the bad skill - a task tracker API
3. **Sonar MCP analysis** - reveal the horror (SQL injection, XSS, hardcoded secrets, eval, etc.)
4. **Run tile-creator** - Tessl improves the skill and packages it as a reviewed tile
5. **Publish to registry** - show the review scores and quality gates
6. **Install the tile** and regenerate - same app, dramatically better code
7. **Sonar MCP analysis again** - clean results, audience applauds

## Prerequisites

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) installed
- [Tessl CLI](https://tessl.io) installed and authenticated
- [Docker](https://docker.com) installed and running (for Sonar MCP)
- SonarQube Cloud account with API token

## Setup

### 1. Sonar MCP Server

Generate a token at https://sonarcloud.io/account/security

```bash
export SONAR_TOKEN="your-sonarqube-cloud-token"
export SONAR_ORG="your-org-key"

claude mcp add sonarqube \
  --env SONARQUBE_TOKEN=$SONAR_TOKEN \
  --env SONARQUBE_ORG=$SONAR_ORG \
  -- \
  docker run -i --rm --init --pull=always \
  -e SONARQUBE_TOKEN \
  -e SONARQUBE_ORG \
  mcp/sonarqube
```

Verify it works:
```
claude> Use sonarqube to ping the system
```

### 2. Install the Bad Skill

Copy the bad skill to your Claude Code skills directory:
```bash
cp skills/bad-api-generator.md ~/.claude/skills/
```

Or for project-level (this demo only):
```bash
mkdir -p .claude/skills
cp skills/bad-api-generator.md .claude/skills/
```

### 3. Tessl CLI

```bash
tessl auth login
```

## Files

```
tessl-demo/
├── README.md              # This file
├── demo-script.md         # Step-by-step presenter script
├── skills/
│   └── bad-api-generator.md   # The deliberately bad skill
├── app-bad/               # Generated during demo (bad version)
└── app-good/              # Generated during demo (good version)
```
