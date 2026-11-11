export const MOCK_RFC_MARKDOWN = `# 1. Problem Statement

Our current user onboarding flow performs heavy synchronous database writes and third-party webhook dispatches inside a single HTTP request lifecycle. Under peak load (>1,500 req/sec), connection pool exhaustion on PostgreSQL leads to client timeouts and 504 Gateway errors.

## Current Bottlenecks
- Synchronous database transactions block Edge API workers for up to 650ms.
- Unhandled downstream webhook retries create cascading latency spikes.
- Lack of an intermediate buffer causes spike traffic to hit PostgreSQL connection limits directly.

---

# 2. Proposed Cloud Architecture Flow

We propose decoupling client HTTP requests from persistence commits using an asynchronous event-driven queue topology.

## Architectural Boundary
Client requests receive an immediate \`202 Accepted\` receipt with an idempotent transaction ID. Background workers ingest messages from the queue and batch-commit them to Supabase PostgreSQL.

\`\`\`
[ Client (Next.js 16) ]
         │ (HTTP POST /api/v1/workspaces)
         ▼
[ Vercel Edge Runtime ] ────► Push message to Queue
                                       │
                                       ▼
                       [ Worker (Serverless Consumer) ]
                                       │
                                       ▼
                       [ Supabase PostgreSQL 15.6 ]
\`\`\`

---

# 3. Database Schema Migration

The following additive migration introduces the idempotent message processing log and tenant status constraints:

\`\`\`sql
-- Migration: 20261110_create_event_queue.sql
CREATE TABLE IF NOT EXISTS workspace_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id TEXT NOT NULL REFERENCES "Workspace"(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'PENDING',
  retry_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_workspace_events_status 
ON workspace_events(status, created_at);
\`\`\`

---

# 4. Implementation Code

The Next.js Server Action encapsulates tenant validation and payload staging:

\`\`\`typescript
"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";

const IngestEventSchema = z.object({
  workspaceId: z.string().cuid(),
  eventType: z.enum(["WORKSPACE_CREATED", "STATUS_PROMOTED"]),
  payload: z.record(z.string(), z.unknown()),
});

export async function ingestWorkspaceEvent(input: z.infer<typeof IngestEventSchema>) {
  const validated = IngestEventSchema.parse(input);

  // Stage event into transactional queue table
  return await prisma.$executeRaw\`
    INSERT INTO workspace_events (workspace_id, event_type, payload, status)
    VALUES (\${validated.workspaceId}, \${validated.eventType}, \${JSON.stringify(validated.payload)}::jsonb, 'PENDING')
  \`;
}
\`\`\`

---

# 5. Non-Functional Requirements (NFR)

The target architectural SLAs for production deployment on Vercel and Supabase:

| Metric | Target SLA | Verification Method |
| :--- | :--- | :--- |
| **P99 API Latency** | < 80ms | Vercel Edge Analytics |
| **Database Connection Pool** | Max 85% utilization | Supabase Pooler Metrics |
| **Queue Ingestion Throughput**| 10,000 events/sec | Load-tested via k6 |
| **Data Durability** | RPO < 1s, RTO < 30s | Supabase Point-in-time Recovery |

---

# 6. Security & Tenant Isolation

- **Tenant Scoping:** All operations enforce Clerk session organization claims and verify workspace creator ownership.
- **Row-Level Security (RLS):** Supabase RLS policies restrict read and write operations strictly to authenticated workspace members.
- **Payload Encryption:** Sensitive API tokens are encrypted with AES-256-GCM before persistent queuing.
`;

export const MOCK_GITHUB_PR = {
  url: "https://github.com/hogiabao7725/CloudFlow/pull/4",
  number: 4,
  title:
    "refactor(core): streamline architecture schema, add manual rfc saving and github pr tracking",
  state: "merged" as const,
  branch: "review/phase-2",
  ciStatus: "passed" as const,
  author: {
    login: "hogiabao7725",
    avatarUrl: "https://github.com/hogiabao7725.png",
  },
};
