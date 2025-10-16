/**
 * Knowledge Search Agent 基本的な使用例
 */

import { createKnowledgeSearchAgent } from '../index.js';

async function basicUsageExample() {
  console.log('=== Knowledge Search Agent - Basic Usage ===\n');
  
  // Agentの作成
  const agent = createKnowledgeSearchAgent();
  
  // 例1: シンプルな検索
  console.log('Example 1: Simple search');
  const result1 = await agent.simpleSearch('search agent', {
    searchType: 'keyword',
    sources: ['code', 'docs'],
    limit: 5,
  });
  
  console.log(`Found ${result1.results.length} results in ${result1.metadata.searchTime}ms`);
  result1.results.forEach((item, index) => {
    console.log(`\n${index + 1}. ${item.title} (${item.source})`);
    console.log(`   Score: ${item.score.toFixed(2)}`);
    console.log(`   Location: ${item.location.filePath}:${item.location.lineNumber || 0}`);
    console.log(`   Excerpt: ${item.excerpt.substring(0, 100)}...`);
  });
  
  // 例2: ハイブリッド検索
  console.log('\n\nExample 2: Hybrid search');
  const result2 = await agent.simpleSearch('authentication function', {
    searchType: 'hybrid',
    limit: 3,
  });
  
  console.log(`Found ${result2.results.length} results`);
  result2.results.forEach((item, index) => {
    console.log(`\n${index + 1}. ${item.title}`);
    console.log(`   Source: ${item.source}, Score: ${item.score.toFixed(2)}`);
  });
  
  // 例3: フィルタを使った検索
  console.log('\n\nExample 3: Filtered search');
  const result3 = await agent.simpleSearch('class', {
    searchType: 'keyword',
    sources: ['code'],
    limit: 5,
  });
  
  console.log(`Found ${result3.results.length} results`);
  if (result3.suggestions && result3.suggestions.length > 0) {
    console.log('\nSuggestions:');
    result3.suggestions.forEach(suggestion => {
      console.log(`  - ${suggestion}`);
    });
  }
}

// 実行
if (import.meta.url === `file://${process.argv[1]}`) {
  basicUsageExample().catch(console.error);
}

export { basicUsageExample };
