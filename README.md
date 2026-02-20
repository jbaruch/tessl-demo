# Tessl Demo - Sonar Summit 2026

## Premise

Show how Tessl's tile ecosystem transforms unreviewed AI coding prompts into production-quality, reviewed, and scored tiles -- validated by SonarQube's own analysis.

## Demo Flow

1. **Show the uber-prompt** - a copy-pasted Express API generator full of anti-patterns
2. **Generate an app** by pasting it into Claude Code - a task tracker API
3. **Sonar MCP analysis** - reveal the horror (SQL injection, command injection, hardcoded secrets, eval, etc.)
4. **Tessl review** - show the prompt fails quality checks (79%, content 65%)
5. **Build a proper tile** with tile-creator - skill + security rules + code patterns
6. **Publish to registry** - show the 100% review score
7. **Install the tile** and regenerate - same app, dramatically better code
8. **Sonar MCP analysis again** - 65 issues down to 1, zero security vulnerabilities

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

### 2. Tessl CLI

```bash
tessl login
tessl install tessl-labs/tile-creator
```

## Files

```
tessl-demo/
├── README.md                # This file
├── demo-script.md           # Step-by-step presenter script with exact commands
├── uber-prompt.md           # The prompt (copy-pasted into Claude Code on stage)
├── tiles/
│   └── express-api-generator/   # The improved tile (published to registry)
└── steps/                   # Versioned snapshots of each demo stage (fallbacks)
```
