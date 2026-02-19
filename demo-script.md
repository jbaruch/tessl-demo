# Demo Script - Sonar Summit 2026

## Setup Before Going on Stage

- [ ] Docker running
- [ ] Sonar MCP connected (test with ping)
- [ ] Claude Code open in terminal, font size large
- [ ] Clean demo directory (delete app-bad/ and app-good/ if they exist)
- [ ] Bad skill installed in .claude/skills/
- [ ] Tessl CLI authenticated
- [ ] Terminal theme: dark, high contrast

---

## ACT 1: The Problem (2 min)

### Talking Point
> "AI coding assistants are only as good as the skills and context they're given.
> And right now, the ecosystem of community skills is... let's say, unreviewed.
> Let me show you what I mean."

### Show the Bad Skill

Open and scroll through `skills/bad-api-generator.md` in the editor.

Point out (don't dwell, audience will get it fast):
- SQL string concatenation
- `eval()` for parsing
- Hardcoded JWT secret
- Base64 "encryption" for passwords
- Auth middleware that lets everyone through
- `exec()` with user input

> "This is a real pattern -- someone wraps their habits into a reusable skill,
> shares it, and now every app generated with it inherits these... choices."

---

## ACT 2: Generate the Bad App (2 min)

### In Claude Code:

```
Create a task tracker REST API using the Express API generator skill.
The API should manage tasks with title, description, status, assignee, and priority.
Include authentication, search/filter, export, and a report page.
Put it in the app-bad/ directory.
```

Let Claude generate the code. It should follow the skill's patterns.

### Sonar Analysis

```
Use sonarqube to analyze the code in app-bad/src/.
Show me all security vulnerabilities, bugs, and code smells.
```

### Talking Point
> "So let's see what SonarQube thinks of this...
> [wait for results]
> SQL injection. Command injection. XSS. Hardcoded credentials.
> eval(). Path traversal. And that's just the security findings.
> This is what happens when unvetted skills generate your code."

Pause. Let the findings sink in.

---

## ACT 3: Tessl to the Rescue (3 min)

### Talking Point
> "Now, what if instead of this wild-west skill, we had a skill that went through
> actual review? That got scored for security, quality, and best practices?
> That's what Tessl does. Let me show you."

### Run tile-creator

```
/tile-creator

Take the skill in skills/bad-api-generator.md and create a proper Tessl tile from it.
The tile should generate Express TypeScript REST APIs that follow security best practices:
- Parameterized SQL queries
- Proper input validation with zod
- bcrypt for password hashing
- Secure JWT handling with environment variables
- Proper error handling and HTTP status codes
- Helmet for security headers
- Rate limiting
- No eval, no exec with user input
- Typed request/response handlers
```

Let tile-creator work. It will:
1. Analyze the bad skill
2. Identify all the anti-patterns
3. Create an improved tile with proper patterns
4. Package it with metadata and review criteria

---

## ACT 4: Publish & Review Scores (1 min)

### Publish the tile

```bash
tessl publish
```

### Talking Point
> "When we publish to the Tessl registry, every tile goes through automated review.
> Security patterns, code quality, best practices -- all scored.
> [show the registry page with scores]
> Other developers can see these scores before they install.
> No more blind trust."

Show the registry page with the tile's review scores.

---

## ACT 5: The Better App (2 min)

### Install the published tile

```bash
tessl install <tile-name>
```

### Generate the same app, now with the good tile

```
Create a task tracker REST API using the [tile-name] tile.
Same requirements: tasks with title, description, status, assignee, priority.
Include authentication, search/filter, export, and a report page.
Put it in the app-good/ directory.
```

### Sonar Analysis on the Good Version

```
Use sonarqube to analyze the code in app-good/src/.
Show me all security vulnerabilities, bugs, and code smells.
```

### Talking Point
> "Same prompt. Same requirements. Completely different result.
> [show Sonar results - should be clean or near-clean]
> No SQL injection. No hardcoded secrets. Input validation everywhere.
> Proper error handling. Security headers.
>
> The difference isn't the AI -- it's the skill that guided it.
> And that's what Tessl solves: a reviewed, scored, trusted ecosystem
> for the skills that shape your AI-generated code.
>
> Because the best time to catch bad patterns is before they're in your codebase.
> And SonarQube and Tessl together make that happen."

---

## Closing (30 sec)

> "Tessl registry for reviewed skills. SonarQube for validating the output.
> Together, they close the loop on AI code quality.
> Thank you."

---

## Fallback Notes

- If Sonar MCP is slow: have pre-captured screenshots of the analysis results
- If tile-creator takes too long: have a pre-built tile ready to switch to
- If network issues: entire demo can work offline with local Sonar analysis
- Keep `app-bad/` and `app-good/` pre-generated as backup in case live generation stalls

## Timing

| Act | Duration | Cumulative |
|-----|----------|------------|
| 1. The Problem | 2 min | 2 min |
| 2. Bad App + Sonar | 2 min | 4 min |
| 3. Tile Creator | 3 min | 7 min |
| 4. Publish & Scores | 1 min | 8 min |
| 5. Good App + Sonar | 2 min | 10 min |
| Closing | 0.5 min | 10.5 min |

**Total: ~10 minutes**
