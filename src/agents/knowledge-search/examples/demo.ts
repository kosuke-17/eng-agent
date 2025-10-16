#!/usr/bin/env tsx
/**
 * Knowledge Search Agent デモスクリプト
 */

import { createKnowledgeSearchAgent } from '../index.js';

async function runDemo() {
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║    Knowledge Search Agent - Interactive Demo                 ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log('');
  
  const agent = createKnowledgeSearchAgent({
    search: {
      maxResults: 15,
      enableCache: true,
    },
  });
  
  // デモクエリ
  const queries = [
    {
      title: 'Code Search - Function',
      query: 'search function',
      options: { searchType: 'keyword' as const, sources: ['code'], limit: 5 },
    },
    {
      title: 'Documentation Search',
      query: 'how to use knowledge search agent',
      options: { searchType: 'keyword' as const, sources: ['docs'], limit: 5 },
    },
    {
      title: 'Hybrid Search',
      query: 'agent implementation',
      options: { searchType: 'hybrid' as const, limit: 8 },
    },
  ];
  
  for (const demo of queries) {
    console.log('\n' + '═'.repeat(70));
    console.log(`🔍 ${demo.title}`);
    console.log('═'.repeat(70));
    console.log(`Query: "${demo.query}"`);
    console.log(`Options: ${JSON.stringify(demo.options, null, 2)}`);
    console.log('');
    
    try {
      const startTime = Date.now();
      const result = await agent.simpleSearch(demo.query, demo.options);
      const duration = Date.now() - startTime;
      
      console.log('✅ Search Results:');
      console.log(`   Total found: ${result.metadata.totalCount}`);
      console.log(`   Displayed: ${result.results.length}`);
      console.log(`   Time: ${duration}ms`);
      console.log(`   Sources: ${result.metadata.sources.join(', ')}`);
      console.log('');
      
      result.results.slice(0, 3).forEach((item, index) => {
        console.log(`${index + 1}. ${item.title}`);
        console.log(`   📁 ${item.source}`);
        console.log(`   ⭐ Score: ${item.score.toFixed(3)}`);
        if (item.location.filePath) {
          const location = item.location.lineNumber
            ? `${item.location.filePath}:${item.location.lineNumber}`
            : item.location.filePath;
          console.log(`   📍 ${location}`);
        }
        const excerpt = item.excerpt.replace(/\n/g, ' ').substring(0, 100);
        console.log(`   📝 ${excerpt}...`);
        console.log('');
      });
      
      if (result.suggestions && result.suggestions.length > 0) {
        console.log('💡 Suggestions:');
        result.suggestions.forEach(suggestion => {
          console.log(`   - ${suggestion}`);
        });
      }
    } catch (error) {
      console.error('❌ Error:', error);
    }
    
    // 次のデモの前に少し待つ
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '═'.repeat(70));
  console.log('🎉 Demo completed!');
  console.log('═'.repeat(70));
  console.log('\nTo use the agent in your code:');
  console.log('');
  console.log('  import { createKnowledgeSearchAgent } from "./agents/knowledge-search";');
  console.log('  const agent = createKnowledgeSearchAgent();');
  console.log('  const result = await agent.simpleSearch("your query");');
  console.log('');
  console.log('Or use the CLI:');
  console.log('');
  console.log('  npm run agent:knowledge -- -q "your query"');
  console.log('');
}

// 実行
runDemo().catch(console.error);
