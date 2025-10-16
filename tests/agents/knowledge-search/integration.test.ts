/**
 * Knowledge Search Agent 統合テスト
 */

import { KnowledgeSearchAgent } from '../../../src/agents/knowledge-search/index.js';

describe('KnowledgeSearchAgent Integration Tests', () => {
  let agent: KnowledgeSearchAgent;
  
  beforeAll(() => {
    agent = new KnowledgeSearchAgent();
  });
  
  test('should create agent instance', () => {
    expect(agent).toBeDefined();
    expect(agent.getConfig().name).toBe('Knowledge Search Agent');
  });
  
  test('should perform simple search', async () => {
    const result = await agent.simpleSearch('function', {
      searchType: 'keyword',
      sources: ['code'],
      limit: 5,
    });
    
    expect(result).toBeDefined();
    expect(result.results).toBeDefined();
    expect(Array.isArray(result.results)).toBe(true);
    expect(result.metadata).toBeDefined();
    expect(result.metadata.searchTime).toBeGreaterThan(0);
  }, 30000); // 30秒タイムアウト
  
  test('should handle empty query', async () => {
    const result = await agent.simpleSearch('', {
      searchType: 'keyword',
      limit: 5,
    });
    
    expect(result).toBeDefined();
    expect(result.results).toBeDefined();
  }, 30000);
  
  test('should perform hybrid search', async () => {
    const result = await agent.simpleSearch('search agent', {
      searchType: 'hybrid',
      sources: ['code', 'docs'],
      limit: 10,
    });
    
    expect(result).toBeDefined();
    expect(result.results).toBeDefined();
    expect(result.metadata.sources.length).toBeGreaterThan(0);
  }, 30000);
  
  test('should respect limit parameter', async () => {
    const limit = 3;
    const result = await agent.simpleSearch('test', {
      limit,
    });
    
    expect(result.results.length).toBeLessThanOrEqual(limit);
  }, 30000);
  
  test('should include metadata in results', async () => {
    const result = await agent.simpleSearch('agent', {
      limit: 5,
    });
    
    expect(result.metadata).toBeDefined();
    expect(result.metadata.totalCount).toBeDefined();
    expect(result.metadata.searchTime).toBeDefined();
    expect(result.metadata.sources).toBeDefined();
  }, 30000);
});
