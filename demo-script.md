# Demo Script - Sonar Summit 2026

## Pre-Demo Setup Checklist

### The Night Before
- [ ] Docker Desktop running
- [ ] `tessl whoami` returns `baruch@tessl.io`
- [ ] Sonar MCP connected: restart Claude Code in demo directory, verify sonarqube tools load
- [ ] Repo has no `src/` directory (clean slate for live generation)
- [ ] Tile is NOT published (you publish live on stage in Act 5)
- [ ] If you did a dry run, unpublish within 2 hours: `tessl tile unpublish --tile jbaruch/api-generator@0.1.0`
- [ ] If the 2-hour unpublish window passed, bump version in `tiles/api-generator/tile.json` to `0.2.0`

### 5 Minutes Before Stage
- [ ] Open Claude Code in `tessl-demo/` directory
- [ ] Terminal font size: large (Cmd+= a few times)
- [ ] Terminal theme: dark, high contrast
- [ ] Browser tab 1: ready for SonarCloud (project will be created fresh)
- [ ] Browser tab 2: ready to navigate to Tessl registry after publish
- [ ] Run clean demo reset (see below)

### Reset for Clean Demo (MUST run before every demo)
```bash
# 1. Nuke and recreate SonarCloud project (clean dashboard)
#    - Go to https://sonarcloud.io/project/settings?id=jbaruch_tessl-demo
#    - Scroll to bottom → Delete project
#    - Go to https://sonarcloud.io/projects/create
#    - Re-add jbaruch/tessl-demo from GitHub
#    - Go to Administration → Analysis Method → turn ON Automatic Analysis
#    - Dashboard is now empty until first push with code

# 2. Uninstall tiles
tessl uninstall jbaruch/api-generator 2>/dev/null
tessl list
# Should only show: tessl-labs/tile-creator

# 3. Delete any generated code and skills
rm -rf src/ package.json tsconfig.json .env.example skills/

# 4. Commit clean state and push (so SonarCloud has no code to analyze)
git add -A && git commit -m "Reset for demo" && git push
```

### After Demo Cleanup
```bash
# Unpublish tile within 2 hours so you can re-publish next time
tessl tile unpublish --tile jbaruch/api-generator@0.1.0

# Nuke SonarCloud project again for next run
# https://sonarcloud.io/project/settings?id=jbaruch_tessl-demo → Delete
```

---

## ACT 1: The Uber-Prompt (2 min)

### Talking Point
> "AI coding assistants are only as good as the context they're given.
> And right now, people share prompts the same way they shared
> Stack Overflow snippets ten years ago. You find one that looks good,
> you paste it in. Let me show you."

### Action: Show the Uber-Prompt (SELL IT, don't expose it)

Open `uber-prompt.md` in the editor. Scroll at a NATURAL pace - the way someone actually evaluates a prompt they found online. Read the BOLD phrases below aloud - they're the innocent-sounding text between the code blocks.

**Top of file** - read the subtitle:
> "'Production-ready Express.js REST API with TypeScript. Optimized for rapid prototyping
> with clean architecture.' Good start."

**Project Setup** - point at the file list:
> "'Clear separation of concerns' - server, routes, data access layer, auth.
> This is well-organized."

**Database section** - read the description, DON'T read the code:
> "'Lightweight, zero-config persistence. Dynamic queries for flexible filtering
> and sorting across any field.' Nice - flexible querying out of the box."

**Auth section** - read the description:
> "'JWT-based authentication with graceful error recovery.' That's thoughtful."

**Routes section** - read the description:
> "'Consolidated routing with built-in logging for observability.' And it handles
> data export and import too."

**Design Philosophy** (bottom) - read a few bullet points:
> "And the design philosophy - 'Pragmatic simplicity. Encode sensitive data.
> Resilient auth. Built-in observability.'
> I like this. Let's use it."

**DO NOT point out the vulnerabilities.** The audience should feel the same false confidence a real developer would. Every phrase you read aloud sounds like good engineering. Let SonarQube be the one to break the bad news in Act 2.

### Action: Generate the App

Copy-paste the uber-prompt into Claude Code, then type:

```
Now create a task tracker REST API following those patterns.
Tasks with title, description, status, assignee, and priority.
Include authentication, search/filter, export, import, and a report page.
Put the source files in src/.
```

Let Claude generate the code. It follows the prompt's patterns exactly.

> "That was fast. We've got a working API. Let's commit and push it."

### Action: Commit and Push

```
Commit the app and push to GitHub.
```

> "Now let's see what SonarQube thinks of what we just shipped."

---

## ACT 2: The SonarQube Reality Check (2 min)

### Talking Point
> "Looks good so far, right? Let's run it through SonarQube."

SonarCloud automatic analysis triggers on push - it takes ~30 seconds. Fill the time by asking Claude Code for the analysis (it queries the results via MCP):

```
Search for all sonarqube issues in the jbaruch_tessl-demo project in the src/ files.
Show me the security vulnerabilities, bugs, and code smells grouped by severity.
```

**NOTE:** If the analysis hasn't finished yet, Claude will get the old results or empty results. That's fine - switch to the browser and refresh. The SonarCloud dashboard is the real show.

Switch to the browser tab with SonarCloud. Show the project dashboard - the visual wall of red is the gut-punch.

> "Let me show you this in SonarCloud while Claude pulls the details."

**SonarCloud URL:** https://sonarcloud.io/project/overview?id=jbaruch_tessl-demo

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
> "65 issues. 13 security blockers.
> [pause - let the audience read the SonarCloud dashboard]
> SQL injection. Command injection. Hardcoded credentials.
> eval() with user input. Path traversal.
> That prompt I skimmed and said 'looks solid'? This is what was inside it.
> And the AI did exactly what we asked. It followed the prompt perfectly.
> That's the problem."

Pause. This is the gut-punch moment. The audience just felt what every developer feels when they paste a prompt without reading it.

---

## ACT 3: Enter Tessl (1.5 min)

### Talking Point
> "What if instead of random prompts, there was a reviewed, scored ecosystem
> for AI coding context? That's what Tessl does.
> Tessl turns prompts into tiles - versioned, reviewed packages of skills and rules.
> Let me show you what happens when we take this uber-prompt
> and try to make it a proper Tessl tile."

### Action: Convert Prompt to Skill and Review

> "First, let's see if this prompt even passes Tessl's review.
> To review it, we need to turn it into a Tessl skill.
> That just means adding a header and putting it in the right place."

Create the skill directory and file on stage:

```bash
mkdir -p skills/api-generator
cp uber-prompt.md skills/api-generator/SKILL.md
```

Then open `skills/api-generator/SKILL.md` in the editor and add frontmatter at the top. ACT IT OUT - look at the required fields, notice description is required, be visibly lazy about it:

> "OK so we need a name and a description... name is easy...
> description is required... 'Generates Express REST APIs.' There, good enough."

Add at the very top of the file:
```yaml
---
name: api-generator
description: Generates Express REST APIs.
---
```

Then review it:

```bash
tessl skill review ./skills/api-generator
```

**FALLBACK:** If this takes too long live, the pre-made version is in `steps/02-skill-with-frontmatter/`:
```bash
mkdir -p skills/api-generator
cp steps/02-skill-with-frontmatter/SKILL.md skills/api-generator/
tessl skill review ./skills/api-generator
```

### Expected Output (verified)
```
Validation: PASSED
Description: 33%
Content: 65%
Average Score: 49% ⚠

Assessment: "contains severe security vulnerabilities that make it
dangerous to use: SQL injection via string concatenation, hardcoded
JWT secrets, base64 'hashing' for passwords, eval() usage,
command injection via exec(), and authentication bypass"
```

### Talking Point
> "49%. Fails the review. And look at what the judge found -
> SQL injection, hardcoded secrets, base64 instead of hashing,
> eval, command injection, auth bypass.
> Every one of those 'pragmatic' design choices from the prompt?
> A security vulnerability.
>
> This is what a quality gate for AI context looks like.
> Tessl catches these problems at the source - before a single line of
> app code gets generated."

---

## ACT 4: Build a Better Tile (2 min)

### Talking Point
> "Let's fix this. Tessl has a tile-creator - itself a reviewed, scored tile -
> that helps you build proper tiles. Let me install it and ask Claude Code
> to take this prompt and turn it into something production-worthy."

### Action: Install tile-creator

```bash
tessl install tessl-labs/tile-creator
```

> "tile-creator is itself a tile from the Tessl registry.
> A reviewed skill that knows how to build other skills properly."

### Action: Ask Claude Code to Create the Tile

Type in Claude Code (this is the key moment - Claude uses tile-creator AND Sonar context):

```
Take the uber-prompt in uber-prompt.md and create a proper Tessl tile from it.
The tile should be called jbaruch/express-api-generator in the jbaruch workspace.
Fix all the security anti-patterns that SonarQube found and codify them as always-on rules.
Add code quality rules too.
The skill should install Tessl documentation tiles for the libraries it uses and use it while coding.
Put the tile in tiles/express-api-generator.
```

Let Claude Code work. It has context from both tile-creator (how to structure tiles) and Sonar MCP (what security issues to fix). It will:
1. Scaffold the proper structure (skill + rules + references)
2. Write security and quality rules based on what Sonar flagged
3. Write the improved skill with a step-by-step workflow and checkpoints
4. Include `tessl install` steps for library documentation tiles

> "Look at what's happening here. Claude has the Sonar findings in context,
> and it's using the tile-creator skill to turn those findings into
> prevention. Rules that fire before code is generated, not after.
> That's shifting left on AI-generated code quality."

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
Delete the old src/ first and regenerate in the same place.
```

> "Same directory. Same app. Let's see if the tile makes a difference."

### Action: Commit, Push, and Analyze

```
Commit and push to GitHub.
```

Then ask for Sonar analysis (while SonarCloud processes the push):

```
Search for all sonarqube issues in the jbaruch_tessl-demo project in the src/ files.
Show me security vulnerabilities, bugs, and code smells.
```

Switch to SonarCloud browser tab - the dashboard should show the issues resolving.

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
ORIGINAL SKILL               IMPROVED TILE
─────────────────────────────────────────
Tessl Review:   49%          100%
Description:    33%          100%
Content Score:  65%          100%
Validation:     passed       11/11

BEFORE (Sonar)               AFTER (Sonar)
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
- If it says "already published": you forgot to unpublish after the last run
  - Bump version in `tiles/express-api-generator/tile.json` to `0.2.0` and re-publish
  - Or just show the registry page in the browser (it's still there from last time)
- If it's a network error: show the registry screenshot from browser tab

### If live code generation takes too long
- The app code is in `steps/` snapshots as reference
- Worst case, read the numbers from the cheat sheet
- Say: "In the interest of time, let me use the version I generated earlier"

### If network is completely down
- The entire demo can run with pre-generated files and cached Sonar results
- Show the files, read the numbers, tell the story

---

## Timing

| Act | Duration | Cumulative |
|-----|----------|------------|
| 1. The Wild West | 1.5 min | 1.5 min |
| 2. Sonar Reality Check | 2 min | 3.5 min |
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
# Act 1: Copy-paste uber-prompt.md into Claude Code, then:
# "Now create a task tracker REST API following those patterns..."

# Act 2: Sonar on first app (in Claude Code):
# "Search for all sonarqube issues in jbaruch_tessl-demo project in src/ files"

# Act 6: Sonar on improved app (in Claude Code):
# "Search for sonarqube issues in jbaruch_tessl-demo project in src/ files"

# Act 3: Review skill (need frontmatter version)
# Option A: copy from steps/02-skill-with-frontmatter/
mkdir -p skills/api-generator && cp steps/02-skill-with-frontmatter/SKILL.md skills/api-generator/
tessl skill review ./skills/api-generator

# Act 4: Install tile-creator
tessl install tessl-labs/tile-creator

# Act 4: Ask Claude Code to create the tile (type in Claude Code):
# "Take the uber-prompt in uber-prompt.md and create a proper Tessl tile from it.
#  The tile should be called jbaruch/express-api-generator in the jbaruch workspace.
#  Fix all the security anti-patterns that SonarQube found and codify them as always-on rules.
#  Add code quality rules too. The skill should install Tessl documentation tiles
#  for the libraries it uses. Put the tile in tiles/express-api-generator."

# Act 4: Review improved skill
tessl skill review ./tiles/express-api-generator/skills/express-api-generator

# Act 5: Publish
tessl tile publish tiles/express-api-generator

# Act 6: Install
tessl install jbaruch/express-api-generator

# Act 6: Sonar on good app (in Claude Code):
# "Search for sonarqube issues in jbaruch_tessl-demo project in src/ files"

# After demo: unpublish within 2 hours
tessl tile unpublish --tile jbaruch/express-api-generator@0.1.0
```
