# Sample Documentation

This is a sample documentation file for testing purposes.

## Search Features

The knowledge search agent provides the following features:

- Keyword search
- Semantic search
- Hybrid search
- Code search
- Document search

## Usage

To use the search agent:

```typescript
import { createKnowledgeSearchAgent } from './agents/knowledge-search';

const agent = createKnowledgeSearchAgent();
const result = await agent.simpleSearch('my query');
```

## API Reference

### search(query: SearchQuery)

Performs a search with the given query parameters.

**Parameters:**
- `query`: The search query object

**Returns:**
- `SearchResult`: The search results
