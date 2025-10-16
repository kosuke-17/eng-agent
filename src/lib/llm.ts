import { ChatOpenAI, type ChatOpenAIFields } from "@langchain/openai";
import type { Tool } from "@langchain/core/tools";
import { Runnable } from "@langchain/core/runnables";
import { BaseMessage } from "@langchain/core/messages";

const DEFAULT_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

/**
 * Create a ChatOpenAI instance with the shared default configuration.
 * Consumers may override any option via the `overrides` parameter.
 */
export const createChatModel = (
  overrides: Partial<ChatOpenAIFields> = {}
): ChatOpenAI => {
  const modelName = overrides.model ?? DEFAULT_MODEL;
  return new ChatOpenAI({
    model: modelName,
    temperature: 0,
    maxTokens: 2048,
    ...overrides,
  });
};

/**
 * Bind a set of tools to a chat model, returning a runnable that is ready for invocation.
 */
export const bindTools = <TTools extends Tool[]>(
  model: ChatOpenAI,
  tools: TTools
) => model.bindTools(tools);
