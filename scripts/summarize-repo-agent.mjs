#!/usr/bin/env node
import { Agent } from "@cursor/sdk";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const DEFAULT_MODEL = "composer-2";

const DEFAULT_PROMPT = `Summarize this repository for a developer who has not seen it before.

Read the relevant source, configuration, tests, and database/schema files before answering. Do not edit files or make destructive changes.

Return a concise Markdown report with these sections:
- Purpose
- Tech stack
- Project structure
- Key routes/components/modules
- Data model and external integrations
- How to run, build, and test
- Notable gaps, risks, or follow-up questions`;

function printUsage() {
  console.log(`Usage: npm run summarize:repo -- [options]

Runs a local Cursor Agent SDK agent that inspects this repository and prints a Markdown summary.

Required environment:
  CURSOR_API_KEY       Cursor API key used by @cursor/sdk

Options:
  -C, --cwd <path>     Repository path to summarize (default: current directory)
  -m, --model <id>     Cursor model id (default: ${DEFAULT_MODEL})
  -o, --output <path>  Write the final summary to a file
  -p, --prompt <text>  Override the default summarization prompt
      --force          Expire any stuck local run before starting
      --verbose        Print task/tool/thinking status to stderr
  -h, --help           Show this help message
`);
}

function readOption(rawArgs, index, name) {
  const value = rawArgs[index + 1];
  if (!value || value.startsWith("-")) {
    throw new Error(`Missing value for ${name}`);
  }
  return value;
}

function parseArgs(rawArgs) {
  const options = {
    cwd: process.cwd(),
    model: process.env.CURSOR_MODEL || DEFAULT_MODEL,
    output: undefined,
    prompt: DEFAULT_PROMPT,
    force: false,
    verbose: false,
  };

  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];

    switch (arg) {
      case "-C":
      case "--cwd":
        options.cwd = readOption(rawArgs, index, arg);
        index += 1;
        break;
      case "-m":
      case "--model":
        options.model = readOption(rawArgs, index, arg);
        index += 1;
        break;
      case "-o":
      case "--output":
        options.output = readOption(rawArgs, index, arg);
        index += 1;
        break;
      case "-p":
      case "--prompt":
        options.prompt = readOption(rawArgs, index, arg);
        index += 1;
        break;
      case "--force":
        options.force = true;
        break;
      case "--verbose":
        options.verbose = true;
        break;
      case "-h":
      case "--help":
        printUsage();
        process.exit(0);
        break;
      default:
        throw new Error(`Unknown option: ${arg}`);
    }
  }

  return {
    ...options,
    cwd: resolve(options.cwd),
    output: options.output ? resolve(options.output) : undefined,
  };
}

function requireApiKey() {
  const apiKey = process.env.CURSOR_API_KEY;
  if (!apiKey) {
    throw new Error("CURSOR_API_KEY must be set before running the repo summary agent.");
  }
  return apiKey;
}

function writeSummary(outputPath, summary) {
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${summary.trimEnd()}\n`, "utf8");
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const apiKey = requireApiKey();

  if (!existsSync(options.cwd)) {
    throw new Error(`Repository path does not exist: ${options.cwd}`);
  }

  let streamedSummary = "";
  let agent;

  try {
    agent = await Agent.create({
      apiKey,
      name: "Repository summary agent",
      model: { id: options.model },
      local: {
        cwd: options.cwd,
        sandboxOptions: { enabled: true },
      },
    });

    const run = await agent.send(options.prompt, {
      local: { force: options.force },
      onDelta: ({ update }) => {
        if (update.type === "text-delta") {
          streamedSummary += update.text;
          process.stdout.write(update.text);
        }

        if (!options.verbose) return;

        if (update.type === "thinking-delta") {
          process.stderr.write(update.text);
        } else if (update.type === "summary") {
          process.stderr.write(`\n[summary] ${update.summary}\n`);
        } else if (update.type === "tool-call-started") {
          process.stderr.write(`\n[tool:start] ${update.toolCall.type}\n`);
        } else if (update.type === "tool-call-completed") {
          process.stderr.write(`\n[tool:done] ${update.toolCall.type}\n`);
        }
      },
    });

    const result = await run.wait();
    if (result.status !== "finished") {
      throw new Error(`Repo summary agent ended with status: ${result.status}`);
    }

    const finalSummary = streamedSummary.trim()
      ? streamedSummary
      : result.result || "";

    if (!finalSummary.trim()) {
      throw new Error("Repo summary agent finished without producing a summary.");
    }

    if (!streamedSummary.endsWith("\n")) {
      process.stdout.write("\n");
    }

    if (options.output) {
      writeSummary(options.output, finalSummary);
      console.error(`Wrote summary to ${options.output}`);
    }
  } finally {
    agent?.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
