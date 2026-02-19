# Demo Script - Sonar Summit 2026

## Pre-Demo Setup Checklist

### The Night Before
- [ ] Docker Desktop running
- [ ] `tessl whoami` returns `baruch@tessl.io`
- [ ] Sonar MCP connected: restart Claude Code in demo directory, verify sonarqube tools load
- [ ] SonarCloud project `jbaruch_tessl-demo` has analysis results at sonarcloud.io
- [ ] Registry page loads: https://tessl.io/registry/jbaruch/express-api-generator/0.1.0
- [ ] Pre-generated backups exist: `app-bad/` and `app-good/` in repo

### 5 Minutes Before Stage
- [ ] Open Claude Code in `tessl-demo/` directory
- [ ] Terminal font size: large (Cmd+= a few times)
- [ ] Terminal theme: dark, high contrast
- [ ] Browser tab 1: SonarCloud project page (for fallback)
- [ ] Browser tab 2: Tessl registry page (for showing scores)
- [ ] Run a quick test: `tessl list` (should show express-api-generator installed)

### Reset for Clean Demo (if re-running)
```bash
# Delete generated apps (keep the pre-generated ones in git)
rm -rf app-bad/ app-good/
git checkout -- app-bad/ app-good/
```

---

## ACT 1: The Wild West of AI Skills (1.5 min)

### Talking Point
> "AI coding assistants are only as good as the context they're given.
> And right now, the ecosystem of community skills and prompts is... unreviewed.
> Anyone can write a skill, share it, and suddenly thousands of developers
> are generating code from it. Let me show you what that looks like."

### Action: Show the Bad Skill

Open `skills/bad-api-generator/SKILL.md` in the editor. Scroll through it slowly.

Call out these lines (don't read every one - the audience will get it fast):

**Line 25** - SQL concatenation:
> "Here's the database layer. See this? `username = '` plus username plus `'`. Direct string concatenation into SQL. Every query in this skill uses this pattern."

**Line 41** - Base64 passwords:
> "And here's the authentication. Password hashing? Base64 encoding. That's not hashing, that's... encoding."

**Line 27** - Auth bypass:
> "The auth middleware catches JWT errors and... calls `next()` anyway. Everyone gets through."

**Line 102** - eval():
> "And for importing data? `eval()`. With user input. In 2026."

> "This isn't hypothetical. This is a real pattern - someone wraps their habits
> into a reusable skill, shares it, and every app generated from it inherits
> these vulnerabilities. And nobody reviewed it."

---

## ACT 2: What SonarQube Thinks (2 min)

### Talking Point
> "Let's not take my word for it. Let's ask SonarQube."

### Action: Run Sonar Analysis

Type in Claude Code:

```
Search for all sonarqube issues in the jbaruch_tessl-demo project in the app-bad/src files.
Show me the security vulnerabilities, bugs, and code smells grouped by severity.
```

### Expected Results (verified)
- **65 total issues**
- **13 BLOCKER** (all security vulnerabilities):
  - 8x SQL injection (S3649)
  - 3x Hardcoded credentials (S6437)
  - 2x Path traversal (S2083)
  - 1x Command injection (S2076)
  - 1x Code injection via eval (S5334)
- **31 CRITICAL** - `var` instead of `const/let`
- **2 MAJOR** - identical if/else, missing optional chain
- **8 MINOR** - empty catch, import style, loop style

### Talking Point
> "65 issues. 13 security blockers. SQL injection, command injection,
> code injection through eval, path traversal, hardcoded credentials.
> [pause]
> This is what happens when unvetted skills generate your code.
> The AI did exactly what the skill told it to do. The skill was the problem."

Pause. Let it sink in.

---

## ACT 3: Enter Tessl (1.5 min)

### Talking Point
> "What if there was a way to review and score skills BEFORE they generate code?
> That's what Tessl does. Let me show you."

### Action: Review the Bad Skill with Tessl

Type in Claude Code:
```bash
tessl skill review ./skills/bad-api-generator
```

### Expected Output (verified)
```
Validation: PASSED
Description: 92%
Content: 65%
Average Score: 79% ⚠

Assessment: "teaches extremely dangerous anti-patterns including
SQL injection vulnerabilities, hardcoded secrets, eval() usage,
command injection, and broken authentication"
```

### Talking Point
> "79% average. Sounds okay, right? But look at the content score: 65%.
> And read what the judge says: 'extremely dangerous anti-patterns,
> SQL injection, hardcoded secrets, eval, command injection, broken auth.'
> Tessl catches the problem at the skill level, before a single line of
> app code is generated."

---

## ACT 4: Build a Better Tile (2 min)

### Talking Point
> "Let's fix this. Tessl has a tile-creator skill that helps you build
> proper, reviewed tiles. Let me create a new tile from this bad skill."

### Action: Create the Improved Tile

Type in Claude Code:
```bash
tessl install tessl-labs/tile-creator
```

Then:
```bash
tessl tile new \
  --name jbaruch/express-api-generator \
  --summary "Generates secure, production-ready Express.js REST APIs with TypeScript" \
  --skill-name express-api-generator \
  --skill-description "Generates Express.js REST API endpoints with TypeScript following security best practices. Use when the user asks to create a REST API, backend service, or CRUD endpoints." \
  --rules express-security \
  --workspace jbaruch \
  --path "$PWD/tiles/express-api-generator"
```

> "The tile-creator scaffolds the right structure: a skill with proper frontmatter,
> a rules file for security constraints, and a references directory for code patterns.
> Skills for workflows, rules for constraints, docs for reference - each has its place."

### Action: Show the Improved Content

Show the key files briefly (they're pre-written, you're just showing them):

1. **rules/express-security.md** - "Always-on security constraints. Parameterized queries only. No hardcoded secrets. No eval. No silent auth bypass. These load into every agent session."

2. **SKILL.md** - "A step-by-step workflow with checkpoints. Every step has a validation gate. And look - actual code examples showing the RIGHT way to do it."

### Action: Review the Improved Skill

```bash
tessl skill review ./tiles/express-api-generator/skills/express-api-generator
```

### Expected Output (verified)
```
Validation: PASSED (11/11)
Description: 100%
Content: 100%
Average Score: 100% ✔

Assessment: "excellent skill that demonstrates best practices
across all dimensions"
```

### Talking Point
> "From 79% to 100%. From 'extremely dangerous anti-patterns' to
> 'demonstrates best practices across all dimensions.'
> Same concept, properly structured."

---

## ACT 5: Publish and Show Registry (1 min)

### Action: Publish

```bash
tessl tile publish tiles/express-api-generator
```

### Action: Show Registry

Switch to browser, show https://tessl.io/registry/jbaruch/express-api-generator/0.1.0

Point at:
- **Overall score: 100%**
- **Review: 100%**
- **Validation: 11/11 Passed** (all green boxes)
- The security rules visible on the overview tab

### Talking Point
> "When we publish to the Tessl registry, every tile gets scored.
> Review score, validation checks - all visible.
> Any developer can see this before they install.
> No more blind trust in random markdown files from the internet."

---

## ACT 6: The Proof - Same App, Different Outcome (2 min)

### Action: Install and Generate

```bash
tessl install jbaruch/express-api-generator
```

Then in Claude Code:
```
Create a task tracker REST API with the express-api-generator skill.
Tasks with title, description, status, assignee, and priority.
Include authentication, search/filter, bulk operations, and stats.
Put it in the app-good/ directory.
```

### Action: Sonar Analysis on Good App

```
Search for all sonarqube issues in the jbaruch_tessl-demo project in the app-good/src files.
Show me security vulnerabilities, bugs, and code smells.
```

### Expected Results (verified)
- **1 total issue**
- **0 BLOCKER** (zero security vulnerabilities)
- **0 CRITICAL**
- **1 MAJOR** - "prefer optional chaining" (code style suggestion)
- **0 MINOR**

### Talking Point
> "65 issues down to 1. Thirteen security blockers down to zero.
> And that one remaining issue? A style suggestion - 'prefer optional chaining.'
> Not a security vulnerability. Not a bug. A style preference.
>
> Same prompt. Same requirements. Same AI.
> The only difference is the skill that guided it.
> A reviewed, scored, trusted skill from the Tessl registry."

---

## Closing (30 sec)

> "Here's the takeaway. AI coding assistants are force multipliers.
> They multiply whatever patterns you give them - good or bad.
>
> Tessl makes sure the patterns are good before they reach your codebase.
> SonarQube validates the output.
> Together, they close the loop on AI code quality.
>
> The tile we just built is live in the registry right now.
> You can install it today and start generating secure Express APIs.
>
> Thank you."

---

## The Numbers (Cheat Sheet)

Keep this visible on your phone or a second screen:

```
BAD SKILL                    GOOD TILE
─────────────────────────────────────────
Tessl Review:   79%          100%
Content Score:  65%          100%
Validation:     passed       11/11

BAD APP (Sonar)              GOOD APP (Sonar)
─────────────────────────────────────────
Total issues:   65           1
Blockers:       13           0
Critical:       31           0
Major:          2            1
Minor:          8            0
SQL injection:  8            0
Cmd injection:  1            0
eval() inject:  1            0
Path traversal: 2            0
Hardcoded creds: 3           0
```

---

## Fallback Plans

### If SonarCloud is slow or down
- Use the pre-analyzed numbers above (they're verified and committed)
- Show the SonarCloud screenshot from browser tab
- Say: "I ran this earlier, let me show you the results"

### If tile-creator install fails
- The tile is already scaffolded in `tiles/express-api-generator/` - just show the files

### If `tessl skill review` is slow
- The scores are deterministic for these files - use the cheat sheet numbers
- Say: "This typically takes a few seconds, let me show you what it returns"

### If `tessl publish` fails
- The tile is already published - just show the registry page in the browser

### If live code generation takes too long
- Both `app-bad/` and `app-good/` are pre-generated and in the repo
- `git checkout -- app-bad/ app-good/` to restore them instantly
- Say: "In the interest of time, let me use the version I generated earlier"

### If network is completely down
- The entire demo can run with pre-generated files and cached Sonar results
- Show the files, read the numbers, tell the story

---

## Timing

| Act | Duration | Cumulative |
|-----|----------|------------|
| 1. The Wild West | 1.5 min | 1.5 min |
| 2. Sonar on Bad App | 2 min | 3.5 min |
| 3. Enter Tessl | 1.5 min | 5 min |
| 4. Build Better Tile | 2 min | 7 min |
| 5. Publish + Registry | 1 min | 8 min |
| 6. Good App + Sonar | 2 min | 10 min |
| Closing | 0.5 min | 10.5 min |

**Total: ~10.5 minutes**

Buffer: if running long, skip showing the tile-creator scaffolding in Act 4 and jump straight to reviewing the pre-built tile. Saves ~1 minute.

---

## Exact Commands Quick Reference

```bash
# Act 2: Sonar on bad app
# (in Claude Code) Search for all sonarqube issues in jbaruch_tessl-demo project in app-bad/src files

# Act 3: Review bad skill
tessl skill review ./skills/bad-api-generator

# Act 4: Install tile-creator
tessl install tessl-labs/tile-creator

# Act 4: Scaffold tile
tessl tile new --name jbaruch/express-api-generator \
  --summary "Generates secure, production-ready Express.js REST APIs" \
  --skill-name express-api-generator \
  --skill-description "Generates Express.js REST API endpoints with TypeScript following security best practices. Use when the user asks to create a REST API, backend service, or CRUD endpoints." \
  --rules express-security \
  --workspace jbaruch \
  --path "$PWD/tiles/express-api-generator"

# Act 4: Review improved skill
tessl skill review ./tiles/express-api-generator/skills/express-api-generator

# Act 5: Publish
tessl tile publish tiles/express-api-generator

# Act 6: Install
tessl install jbaruch/express-api-generator

# Act 6: Sonar on good app
# (in Claude Code) Search for sonarqube issues in jbaruch_tessl-demo project in app-good/src files
```
