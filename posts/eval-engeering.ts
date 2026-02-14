import type { BlogPost } from './hello-github';

export const post: BlogPost = {
  slug: 'eval-engineering',
  title: 'Evaluator Backend: Architecture & Design Patterns',
  date: '2026-02-14',
  author: 'Carter Wu',
  content: `
# Evaluator Backend: Architecture & Design Patterns

Deep dive into the design logic of the Engineer Skill Evaluator backend - a plugin-based evaluation system with intelligent caching, incremental sync, and multi-alias identity aggregation.

## Overview

The Engineer Skill Evaluator is a comprehensive backend system built with FastAPI that analyzes developer capabilities through LLM-powered evaluation of GitHub/Gitee commits. The system is designed around extensibility, performance optimization, and intelligent caching.

## System Architecture

### Core Components

\`\`\`
evaluator/
├── server.py              # FastAPI entry point (189 lines)
├── core.py                # Legacy evaluation engine (297 lines)
├── plugin_registry.py     # Plugin discovery & loading (219 lines)
├── paths.py               # XDG-compliant path management
├── config/                # Configuration layer
│   ├── env.py             # Environment variables
│   └── tokens.py          # API token management
├── collectors/            # Data extraction
│   ├── github.py          # GitHub API client
│   └── gitee.py           # Gitee API client
├── analyzers/             # Code analysis
│   ├── code_analyzer.py
│   ├── commit_analyzer.py
│   └── collaboration_analyzer.py
├── services/              # Business logic layer
│   ├── evaluation_service.py    # Evaluation orchestration (315 lines)
│   ├── plugin_service.py        # Plugin resolution
│   └── merge_service.py         # Multi-alias merging
├── routes/                # API endpoints
│   ├── evaluation.py      # Author evaluation (337 lines)
│   ├── plugins.py         # Plugin management
│   ├── config.py          # Configuration API
│   ├── data.py            # Data extraction
│   ├── batch.py           # Batch operations
│   └── benchmark.py       # Validation
└── schemas/               # Pydantic models
    ├── evaluation.py      # API response schemas (129 lines)
    └── trajectory.py      # Trajectory schemas
\`\`\`

### Request Flow

\`\`\`
┌─────────────────────────────────────────────────────────┐
│  Client Request                                         │
│  POST /api/evaluate/owner/repo/author                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Middleware Layer                                       │
│  - TrailingSlashMiddleware (strips trailing slashes)   │
│  - CORSMiddleware (allow all origins)                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Route Handler (routes/evaluation.py)                   │
│  - Parse query parameters (plugin, model, caching)     │
│  - Validate LLM API key configuration                  │
│  - Handle multi-alias evaluation if needed             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Plugin Resolution (services/plugin_service.py)         │
│  - Resolve plugin ID (default or specified)            │
│  - Load plugin scan module dynamically                 │
│  - Create evaluator factory function                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Evaluation Service (services/evaluation_service.py)    │
│  - Load commits from local data                        │
│  - Check evaluation cache (use_cache=true)             │
│  - Perform incremental evaluation                      │
│  - Weighted merge for multi-alias                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  LLM Evaluation (plugin scan module)                    │
│  - Chunked processing for large histories              │
│  - Linear evaluation with context accumulation         │
│  - Six-dimensional scoring                             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Response Serialization                                 │
│  - Pydantic schema validation (EvaluationResponseSchema)│
│  - Cache evaluation result (JSON file)                 │
│  - Return standardized API response                    │
└─────────────────────────────────────────────────────────┘
\`\`\`

## Key Design Patterns

### 1. Plugin Architecture (Strategy Pattern)

The system uses a plugin-based architecture to support multiple evaluation strategies. Each plugin is self-contained and provides both backend logic and frontend UI components.

**Design Benefits:**
- Extensible evaluation strategies without core code changes
- Self-contained plugins with their own UI components
- Runtime discovery and loading
- Multiple evaluation rubrics (e.g., zgc_simple, zgc_ai_native_2026)

### 2. Three-Tier Caching Strategy

The system implements intelligent caching at three levels to minimize API calls and reduce costs:

**Tier 1: API Response Caching**
- Raw GitHub/Gitee API responses cached to disk
- Repository metadata and commit lists
- Sync state tracking for incremental updates

**Tier 2: Extracted Data Caching**
- Commit metadata + diffs stored as JSON
- File contents at HEAD
- Commits index for fast lookup

**Tier 3: Evaluation Result Caching**
- LLM evaluation results per author per plugin
- Plugin-specific cache keys
- Instant retrieval on cache hit

**Cache Hit Benefits:**
- First access: 1-2 minutes (extraction + evaluation)
- Second access: <1 second (instant from cache)
- Token savings: 80-90% reduction in LLM API calls
- Cost savings: Cached evaluations = $0 API cost

### 3. Incremental Sync with State Tracking

The system tracks repository sync state to only fetch new commits, dramatically reducing processing time and API usage.

**Sync State Format (sync_state.json):**
\`\`\`json
{
  "last_commit_sha": "abc123def456...",
  "last_commit_date": "2026-01-20T10:30:45Z",
  "last_synced_at": "2026-01-22T15:20:10Z"
}
\`\`\`

**Incremental Evaluation Logic:**
1. Load all commits for repository
2. Check previous evaluation for author
3. If previous exists, find commits after last_commit_sha
4. Evaluate only new commits
5. Weighted merge: (prev_score × prev_count + new_score × new_count) / total_count
6. Update last_commit_sha and save

**Benefits:**
- Initial evaluation: 100 commits → ~230k tokens
- Incremental update: +20 commits → ~70k tokens (70% savings)
- Weighted merging maintains historical context
- Atomic state tracking prevents data corruption

### 4. Multi-Alias Identity Aggregation

The system intelligently merges contributor identities (e.g., "CarterWu", "wu-yanbiao") to provide a unified evaluation across all aliases.

**Algorithm:**
1. Evaluate each alias separately (reuse cache if available)
2. Weight each evaluation by commit count
3. Merge numeric scores: weighted_avg = Σ(score_i × weight_i) / Σ(weight_i)
4. LLM-synthesize reasoning text across all identities
5. Return unified evaluation

**Benefits:**
- ~88% token savings (evaluate each alias once, reuse cache)
- Weighted merging based on commit count
- LLM-synthesized unified analysis
- Handles name variations across repositories

### 5. Chunked Linear Evaluation

For large commit histories, the system uses chunked evaluation with linear (sequential) processing to maintain context and accuracy.

**Algorithm: Linear Chunked Evaluation**

\`\`\`
Input: 100 commits (newest first)
Max tokens per chunk: 190,000

Step 1: Divide into chunks based on token estimates
  Chunk 1 (commits 76-100) ← oldest 25
  Chunk 2 (commits 51-75)
  Chunk 3 (commits 26-50)
  Chunk 4 (commits 1-25)  ← newest 25

Step 2: Evaluate chunks sequentially (not parallel!)

  Evaluate Chunk 1:
    Context: None (first chunk)
    Result: Initial scores + insights

  Evaluate Chunk 2:
    Context: Summary of Chunk 1 results
    Result: Updated scores informed by progression

  Evaluate Chunk 3:
    Context: Summary of Chunks 1-2 results
    Result: Refined scores based on patterns

  Evaluate Chunk 4:
    Context: Summary of Chunks 1-3 results
    Result: Final scores with full historical context

Step 3: Synthesize final evaluation
  - Overall scores (weighted by chunk size)
  - Growth trajectory analysis
  - Key strengths/weaknesses
  - Contextual insights across all chunks
\`\`\`

**Why Linear Instead of Parallel?**
- ✅ Better accuracy - LLM sees progression over time
- ✅ Stronger correlation - Later chunks informed by earlier insights
- ✅ Contextual understanding - Growth patterns visible
- ❌ Slower - Must wait for each chunk (~2-3 minutes vs 30-45 seconds)

### 6. Service Layer Architecture

The system uses a service layer to encapsulate business logic and keep routes thin.

**Routes Layer (routes/evaluation.py)**
- Request parsing & validation
- Parameter normalization
- Response serialization
- Error handling

**Service Layer (services/)**
- evaluation_service.py: Incremental evaluation logic
- plugin_service.py: Plugin resolution
- merge_service.py: Multi-alias merging
- extraction_service.py: Data extraction

**Benefits:**
- Thin routes - only handle HTTP concerns
- Reusable business logic
- Easier testing and mocking
- Clear separation of concerns

### 7. Schema-Driven API Design

All API responses use Pydantic schemas for validation and documentation.

**Key Schemas:**
- ScoresSchema: Six-dimensional scores + reasoning
- CommitsSummarySchema: Code statistics
- EvaluationSchema: Complete evaluation result
- EvaluationResponseSchema: Standard API wrapper

**Benefits:**
- Automatic request/response validation
- Auto-generated OpenAPI documentation
- Type safety and IDE autocomplete
- Consistent API contracts

## Server.py: The FastAPI Heart

The server.py file (189 lines) is the entry point that orchestrates the entire system.

### Environment Configuration Loading

**Priority order:**
1. .env.local (project-local overrides)
2. ~/.local/share/oscanner/.env.local (user config)
3. .env (default template)

### Middleware Stack

**TrailingSlashMiddleware:** Strips trailing slashes for Next.js compatibility
**CORSMiddleware:** Allow all origins (development mode)

### Modular Router Organization

Routes are organized by domain:
- plugins: Plugin management
- config: LLM configuration
- data: Repository extraction
- evaluation: Author evaluation (primary)
- batch: Multi-repo operations
- benchmark: Validation
- trajectory: Trajectory analysis
- runner_proxy: External runner integration
- checkers: Validation checkers

### Optional Dashboard Bundling

The server can optionally serve a bundled Next.js dashboard from dashboard_dist/ if available in the CLI package.

## Data Flow Example: Evaluating an Author

**Request:**
\`\`\`
POST /api/evaluate/facebook/react/Dan%20Abramov?plugin_id=zgc_simple&use_cache=true
Body: {"aliases": ["Dan Abramov", "gaearon"]}
\`\`\`

**Flow:**
1. Middleware: TrailingSlashMiddleware → CORSMiddleware
2. Route handler validates LLM API key
3. Plugin resolution: "zgc_simple" → load scan module
4. Multi-alias evaluation:
   - Evaluate "dan abramov" (check cache first)
   - Evaluate "gaearon" (check cache first)
   - Collect weights: {150 commits, 80 commits}
5. Weighted merge: (150×score1 + 80×score2) / 230
6. LLM synthesis of unified reasoning
7. Response serialization with metadata

**Result:**
- Total time: <1 second (cache hit) or ~20 seconds (cache miss)
- Token usage: 0 tokens (both cached) or ~100k tokens (first eval)

## Performance Characteristics

### Token Usage Optimization

**Scenario 1: First-time evaluation (100 commits, 4 chunks)**
- Chunk 1: ~50k tokens (no context)
- Chunk 2: ~55k tokens (Ch1 summary)
- Chunk 3: ~60k tokens (Ch1-2 summary)
- Chunk 4: ~65k tokens (Ch1-3 summary)
- Total: ~230k tokens

**Scenario 2: Incremental evaluation (+20 commits, 1 new chunk)**
- Chunk 5: ~70k tokens (Ch1-4 summary reused)
- Total: ~70k tokens (70% savings)

**Scenario 3: Multi-alias evaluation (2 aliases)**
- Without caching: 230k × 2 = 460k tokens
- With caching: 230k × 1 = 230k tokens (50% savings)
- With incremental: 70k × 1 = 70k tokens (85% savings)

### Response Time Benchmarks

| Operation | First Access | Cached Access |
|-----------|-------------|---------------|
| Get authors list | 1-2 minutes | <1 second |
| Evaluate author (30 commits) | 10-20 seconds | <1 second |
| Evaluate author (100 commits, chunked) | 2-3 minutes | <1 second |
| Multi-alias merge (2 aliases) | 20-40 seconds | 1-2 seconds |
| Batch common contributors (3 repos) | 3-6 minutes | <2 seconds |

## Key Design Decisions

### 1. Why Plugin-Based Architecture?

**Problem:** Different use cases need different evaluation rubrics (e.g., AI-native vs general engineering).

**Solution:** Plugin system with dynamic loading.

**Trade-offs:**
- ✅ Extensible without core changes
- ✅ Multiple evaluation standards
- ❌ More complex than monolithic design
- ❌ Plugin contract must be maintained

### 2. Why Linear Chunked Evaluation?

**Problem:** Large commit histories exceed LLM context limits.

**Solution:** Sequential chunk processing with context accumulation.

**Trade-offs:**
- ✅ Better accuracy (temporal context)
- ✅ Growth patterns visible
- ❌ 4x slower than parallel
- ❌ Higher complexity

### 3. Why Three-Tier Caching?

**Problem:** Repeated API calls are slow and expensive.

**Solution:** Multi-level caching (API → Data → Evaluations).

**Trade-offs:**
- ✅ 80-90% token savings
- ✅ Sub-second response times
- ✅ Cost reduction
- ❌ Disk space usage (1-5 GB per large repo)
- ❌ Cache invalidation complexity

### 4. Why Multi-Alias Aggregation?

**Problem:** Same person uses different names across repos (e.g., "CarterWu" vs "wu-yanbiao").

**Solution:** Evaluate each alias separately, then merge with weighted averaging.

**Trade-offs:**
- ✅ ~88% token savings (cache reuse)
- ✅ Handles identity variations
- ✅ Unified evaluation across identities
- ❌ Requires alias discovery upfront
- ❌ Merge logic complexity

## Lessons Learned

### 1. Plugin Isolation is Critical

Initially, plugins imported from the main evaluator package, causing circular dependencies and making plugins non-portable. Now, plugins are fully self-contained.

### 2. Linear Evaluation Worth the Wait

Parallel chunk evaluation was 4x faster but produced fragmented, inconsistent results. Linear evaluation with context accumulation significantly improved accuracy despite slower processing.

### 3. Cache Invalidation is Hard

Early versions didn't track sync state, causing stale cache issues. Now, sync_state.json ensures cache is invalidated when new commits arrive.

### 4. Service Layer Simplifies Testing

Moving business logic from routes to services made the codebase much more testable and maintainable.

## Future Improvements

- **Distributed Caching:** Redis for multi-instance deployments
- **Async LLM Calls:** Fully async evaluation pipeline
- **Incremental Chunk Evaluation:** Cache chunk results separately
- **Real-time Updates:** WebSocket notifications for long evaluations
- **Plugin Versioning:** Backward compatibility for plugin updates
- **Batch Parallelization:** Parallel evaluation of multiple authors

## Conclusion

The Engineer Skill Evaluator backend demonstrates how thoughtful architecture can balance extensibility, performance, and cost efficiency. The plugin system enables diverse evaluation strategies, while the three-tier caching and incremental sync minimize API usage. Multi-alias aggregation and linear chunked evaluation ensure accurate, contextualized assessments even for large commit histories.

**Key takeaways:**
- Plugin architecture enables extensibility without core changes
- Multi-tier caching reduces costs by 80-90%
- Incremental sync and linear evaluation improve accuracy
- Service layer separation enhances testability
- Schema-driven APIs provide type safety and documentation

The result is a robust, scalable backend that can evaluate thousands of developers across hundreds of repositories while maintaining sub-second response times and minimal API costs.
  `.trim()
};
