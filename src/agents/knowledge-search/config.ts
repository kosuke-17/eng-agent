/**
 * Knowledge Search Agent の設定
 */

import { AgentConfig } from "../../types/agent.js";

export const DEFAULT_CONFIG: AgentConfig = {
  name: "Knowledge Search Agent",
  version: "1.0.0",
  description: "Multi-source knowledge search agent with semantic and keyword search capabilities",
  
  llm: {
    modelName: "gpt-4o-mini",
    temperature: 0.0,
    maxTokens: 4096,
  },
  
  search: {
    defaultSources: ['code', 'docs', 'knowledge-base'],
    defaultSearchType: 'hybrid',
    maxResults: 10,
    enableCache: true,
  },
  
  vectorStore: {
    provider: 'chroma',
    collectionName: 'knowledge-base',
    embeddingModel: 'text-embedding-3-small',
  },
  
  debug: false,
  logLevel: 'info',
};
