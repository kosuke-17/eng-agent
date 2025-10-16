/**
 * CodeRetriever のユニットテスト
 */

import { CodeRetriever } from '../../src/retrievers/code-retriever.js';
import { ProcessedQuery } from '../../src/types/search.js';

describe('CodeRetriever Tests', () => {
  let retriever: CodeRetriever;
  
  beforeAll(() => {
    retriever = new CodeRetriever('./src');
  });
  
  test('should create retriever instance', () => {
    expect(retriever).toBeDefined();
    expect(retriever.getName()).toBe('CodeRetriever');
    expect(retriever.getSource()).toBe('code');
  });
  
  test('should search for functions', async () => {
    const query: ProcessedQuery = {
      original: 'search',
      normalized: 'search',
      expanded: ['search', 'find', 'query'],
      type: 'code',
    };
    
    const results = await retriever.search(
      query,
      {
        methods: ['keyword'],
        weights: { keyword: 1.0, semantic: 0.0, hybrid: 0.0 },
        sources: ['code'],
      },
      { limit: 10 }
    );
    
    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
    
    if (results.length > 0) {
      expect(results[0].source).toBe('code');
      expect(results[0].metadata.type).toBeDefined();
      expect(['function', 'class', 'interface', 'type']).toContain(results[0].metadata.type);
    }
  }, 30000);
  
  test('should respect limit parameter', async () => {
    const query: ProcessedQuery = {
      original: 'function',
      normalized: 'function',
      expanded: ['function'],
      type: 'code',
    };
    
    const limit = 5;
    const results = await retriever.search(
      query,
      {
        methods: ['keyword'],
        weights: { keyword: 1.0, semantic: 0.0, hybrid: 0.0 },
        sources: ['code'],
      },
      { limit }
    );
    
    expect(results.length).toBeLessThanOrEqual(limit);
  }, 30000);
  
  test('should filter by file types', async () => {
    const query: ProcessedQuery = {
      original: 'class',
      normalized: 'class',
      expanded: ['class'],
      type: 'code',
    };
    
    const results = await retriever.search(
      query,
      {
        methods: ['keyword'],
        weights: { keyword: 1.0, semantic: 0.0, hybrid: 0.0 },
        sources: ['code'],
      },
      {
        limit: 10,
        fileTypes: ['ts'],
      }
    );
    
    expect(results).toBeDefined();
    
    // すべての結果が.tsファイルであることを確認
    results.forEach(result => {
      if (result.location.filePath) {
        expect(result.location.filePath.endsWith('.ts') || result.location.filePath.endsWith('.tsx')).toBe(true);
      }
    });
  }, 30000);
});
