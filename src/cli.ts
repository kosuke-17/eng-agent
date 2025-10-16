#!/usr/bin/env node

import { Command } from "commander";
import * as readline from "readline";
import { HumanMessage } from "@langchain/core/messages";
import { createRequirementsAgent } from "@/agents/requirements/index";
import type { RequirementsStateInput } from "@/agents/requirements/state";
import { createSpecToTasksAgent } from "@/agents/spec_to_tasks/index";
import type { SpecToTasksStateInput } from "@/agents/spec_to_tasks/state";
import * as fs from "fs";

const program = new Command();

program
  .name("eng-agent")
  .description("RE-Architect: AI Requirements Engineering Agent")
  .version("1.0.0");

// Requirements Agent Command
program
  .command("requirements")
  .description("Run the Requirements Agent to generate/update specification")
  .option("-i, --input <file>", "Input file with initial requirements")
  .option("-o, --output <file>", "Output specification file", "specs/draft.md")
  .option(
    "-m, --mode <mode>",
    "Interaction mode: interactive or batch",
    "interactive"
  )
  .option("--thread-id <id>", "Thread ID for conversation continuity")
  .action(async (options) => {
    console.log("🚀 Starting Requirements Agent...\n");

    const agent = createRequirementsAgent();
    const threadId = options.threadId || `thread_${Date.now()}`;
    const config = {
      recursionLimit: 100,
      configurable: { thread_id: threadId },
    };

    try {
      // Read input if provided
      let initialInput = "";
      if (options.input && fs.existsSync(options.input)) {
        initialInput = fs.readFileSync(options.input, "utf-8");
        console.log(`📄 Loaded input from: ${options.input}\n`);
      }

      if (options.mode === "interactive") {
        console.log("💬 Interactive Mode");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        console.log("Thread ID:", threadId);
        console.log(
          "Type your requirements or answer questions. Type 'exit' to quit.\n"
        );

        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });

        let isFirstMessage = true;

        const askQuestion = () => {
          rl.question("You: ", async (userInput) => {
            if (userInput.toLowerCase() === "exit") {
              console.log("\n👋 Goodbye!");
              rl.close();
              return;
            }

            if (!userInput.trim()) {
              askQuestion();
              return;
            }

            try {
              const message =
                isFirstMessage && initialInput
                  ? `${initialInput}\n\n${userInput}`
                  : userInput;
              isFirstMessage = false;

              console.log("\n🤖 Agent is thinking...\n");

              const result = await agent.invoke(
                {
                  messages: [new HumanMessage(message)],
                },
                config
              );

              // Display agent response
              const lastMessage = result.messages[result.messages.length - 1];
              console.log("Agent:", lastMessage.content);
              console.log("\n" + "━".repeat(50) + "\n");

              // Check if done
              if (result.decided) {
                console.log("✅ Requirements specification is complete!\n");
                console.log(`📄 Specification saved to: ${options.output}\n`);
                console.log(
                  "Type 'exit' to quit or continue the conversation.\n"
                );
              }

              askQuestion();
            } catch (error) {
              console.error("❌ Error:", error);
              askQuestion();
            }
          });
        };

        askQuestion();
      } else {
        // Batch mode
        console.log("📦 Batch Mode\n");

        if (!initialInput) {
          console.error("❌ Error: Input file is required for batch mode");
          process.exit(1);
        }

        const result = await agent.invoke(
          {
            messages: [new HumanMessage(initialInput)],
          },
          config
        );

        console.log("✅ Processing complete!\n");
        console.log(`📄 Specification saved to: ${options.output}\n`);

        // Display summary
        if (result.openQuestions && result.openQuestions.length > 0) {
          console.log(
            `⚠️  ${result.openQuestions.length} open questions remaining\n`
          );
        }
      }
    } catch (error) {
      console.error("❌ Error running Requirements Agent:", error);
      process.exit(1);
    }
  });

// Spec to Tasks Agent Command
program
  .command("tasks")
  .description("Run the SpecToTasks Agent to generate implementation tasks")
  .option("-i, --input <file>", "Input specification file", "specs/draft.md")
  .option("-o, --output <directory>", "Output directory for tasks", "tasks/")
  .action(async (options) => {
    console.log("🚀 Starting SpecToTasks Agent...\n");

    const agent = createSpecToTasksAgent();

    try {
      // Check if input file exists
      if (!fs.existsSync(options.input)) {
        console.error(
          `❌ Error: Specification file not found: ${options.input}`
        );
        process.exit(1);
      }

      console.log(`📄 Reading specification from: ${options.input}\n`);

      const result = await agent.invoke({
        spec: undefined,
        tasks: [],
        notes: [],
        decided: false,
      });

      console.log("✅ Task generation complete!\n");
      console.log(`📁 Tasks saved to: ${options.output}\n`);

      // Display summary
      if (result.tasks && result.tasks.length > 0) {
        console.log(`📊 Generated ${result.tasks.length} tasks\n`);
      }
    } catch (error) {
      console.error("❌ Error running SpecToTasks Agent:", error);
      process.exit(1);
    }
  });

// Full Flow Command
program
  .command("full")
  .description("Run the complete flow: requirements → tasks")
  .option("-i, --input <file>", "Input file with initial requirements")
  .option("-s, --spec <file>", "Specification file", "specs/draft.md")
  .option("-t, --tasks <directory>", "Tasks output directory", "tasks/")
  .action(async (options) => {
    console.log("🚀 Starting Full Flow...\n");
    console.log("Step 1: Requirements Agent");
    console.log("━".repeat(50) + "\n");

    const reqAgent = createRequirementsAgent();
    const threadId = `thread_${Date.now()}`;

    try {
      // Step 1: Run Requirements Agent
      let initialInput = "";
      if (options.input && fs.existsSync(options.input)) {
        initialInput = fs.readFileSync(options.input, "utf-8");
      } else {
        console.error("❌ Error: Input file is required for full flow");
        process.exit(1);
      }

      const reqResult = await reqAgent.invoke(
        {
          messages: [new HumanMessage(initialInput)],
        },
        { configurable: { thread_id: threadId } }
      );

      console.log("✅ Requirements specification generated!\n");

      if (reqResult.openQuestions && reqResult.openQuestions.length > 0) {
        console.log(
          `⚠️  Warning: ${reqResult.openQuestions.length} open questions remaining`
        );
        console.log(
          "You may want to run 'requirements' command interactively to resolve them.\n"
        );
      }

      // Step 2: Run SpecToTasks Agent
      console.log("Step 2: SpecToTasks Agent");
      console.log("━".repeat(50) + "\n");

      // const tasksAgent = createSpecToTasksAgent();

      // const tasksResult = await tasksAgent.invoke({
      //   spec: undefined,
      //   tasks: [],
      //   notes: [],
      //   decided: false,
      // });

      console.log("✅ Implementation tasks generated!\n");
      console.log("━".repeat(50));
      console.log("🎉 Full flow complete!\n");
      console.log(`📄 Specification: ${options.spec}`);
      console.log(`📁 Tasks: ${options.tasks}\n`);
    } catch (error) {
      console.error("❌ Error running full flow:", error);
      process.exit(1);
    }
  });

// Init Command - Create example files
program
  .command("init")
  .description("Initialize project with example files")
  .action(() => {
    console.log("🔧 Initializing project...\n");

    // Create directories
    const dirs = ["specs", "tasks"];
    dirs.forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Created directory: ${dir}/`);
      }
    });

    // Create example input if it doesn't exist
    const exampleInputPath = "specs/example_input.md";
    if (!fs.existsSync(exampleInputPath)) {
      const exampleInput = `# プロジェクト要件

## プロジェクト名
ToDoアプリケーション

## 概要
シンプルなタスク管理アプリケーションを開発したい。
ユーザーがタスクを作成、編集、削除、完了マークができる機能が必要。

## 主な機能
- タスクの作成
- タスクの編集
- タスクの削除
- タスクの完了/未完了の切り替え
- タスク一覧表示

## その他
- Webアプリケーションとして実装
- レスポンシブデザイン対応
`;
      fs.writeFileSync(exampleInputPath, exampleInput);
      console.log(`✅ Created: ${exampleInputPath}`);
    }

    console.log("\n🎉 Initialization complete!");
    console.log("\nNext steps:");
    console.log("  1. Set up your .env file with OPENAI_API_KEY");
    console.log(
      "  2. Run: npm run agent:requirements -- -i specs/example_input.md"
    );
    console.log("\n");
  });

program.parse();
