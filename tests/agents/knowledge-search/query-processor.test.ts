/**
 * Query Processor ノードのユニットテスト
 */

import { queryProcessorNode } from '../../../src/agents/knowledge-search/nodes/query-processor.js';
import { KnowledgeSearchStateType } from '../../../src/agents/knowledge-search/state.js';

describe('QueryProcessor Node Tests', () => {
  test('should normalize query', async () => {
    const state = {
      query: '  SEARCH   Function  ',
      searchType: 'keyword' as const,
      sources: ['code'],
      filters: {},
      metadata: { startTime: Date.now(), nodeExecutionOrder: [] },
      errors: [],
      rawResults: [],
    };
    
    const result = await queryProcessorNode(state);
    
    expect(result.processedQuery).toBeDefined();
    expect(result.processedQuery!.normalized).toBe('search function');
    expect(result.processedQuery!.original).toBe('  SEARCH   Function  ');
  });
  
  test('should expand query terms', async () => {
    const state = {
      query: 'function authentication',
      searchType: 'keyword' as const,
      sources: ['code'],
      filters: {},
      metadata: { startTime: Date.now(), nodeExecutionOrder: [] },
      errors: [],
      rawResults: [],
    };
    
    const result = await queryProcessorNode(state);
    
    expect(result.processedQuery).toBeDefined();
    expect(result.processedQuery!.expanded.length).toBeGreaterThan(0);
    // 同義語が含まれているか確認
    const expanded = result.processedQuery!.expanded;
    expect(expanded.some(term => ['func', 'method', 'auth', 'login'].includes(term))).toBe(true);
  });
  
  test('should classify code query', async () => {
    const state = {
      query: 'function getUserById',
      searchType: 'keyword' as const,
      sources: ['code'],
      filters: {},
      metadata: { startTime: Date.now(), nodeExecutionOrder: [] },
      errors: [],
      rawResults: [],
    };
    
    const result = await queryProcessorNode(state);
    
    expect(result.processedQuery).toBeDefined();
    expect(result.processedQuery!.type).toBe('code');
  });
  
  test('should classify documentation query', async () => {
    const state = {
      query: 'how to use the search api',
      searchType: 'keyword' as const,
      sources: ['docs'],
      filters: {},
      metadata: { startTime: Date.now(), nodeExecutionOrder: [] },
      errors: [],
      rawResults: [],
    };
    
    const result = await queryProcessorNode(state);
    
    expect(result.processedQuery).toBeDefined();
    expect(result.processedQuery!.type).toBe('documentation');
  });
  
  test('should tokenize query', async () => {
    const state = {
      query: 'search for user authentication',
      searchType: 'keyword' as const,
      sources: ['code'],
      filters: {},
      metadata: { startTime: Date.now(), nodeExecutionOrder: [] },
      errors: [],
      rawResults: [],
    };
    
    const result = await queryProcessorNode(state);
    
    expect(result.processedQuery).toBeDefined();
    expect(result.processedQuery!.tokens).toBeDefined();
    expect(result.processedQuery!.tokens!.length).toBeGreaterThan(0);
  });
});
