# Welcome to your Lovable project

TODO: Document your project here

## Repo summary agent

This repository includes a local Cursor Agent SDK script that inspects the working tree and prints a Markdown summary of the app.

```bash
export CURSOR_API_KEY="your-cursor-api-key"
npm run summarize:repo
```

Useful options:

```bash
npm run summarize:repo -- --output repo-summary.md
npm run summarize:repo -- --model composer-2 --verbose
```

The script lives at `scripts/summarize-repo-agent.mjs` and uses `@cursor/sdk` to create a local agent against the current repository. It asks the agent to read relevant source, configuration, tests, and Supabase files without editing them.
