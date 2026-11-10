"use client";

import { WorkspaceItem } from "@/types/workspace";

interface WorkspaceDocumentProps {
  workspace: WorkspaceItem;
}

export function WorkspaceDocument({ workspace }: WorkspaceDocumentProps) {
  return (
    <main className="flex-1 h-full overflow-y-auto bg-background px-6 py-6 sm:px-8 scroll-smooth">
      <div className="w-full space-y-6 pb-12">
        {/* Title */}
        <div className="border-b border-border/80 pb-4">
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            RFC Specification
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
            {workspace.name}
          </h1>
        </div>

        {/* Section 1 */}
        <section id="sec-problem" className="space-y-3 scroll-mt-6">
          <h2 className="text-lg font-bold text-foreground border-b border-border/50 pb-1.5">
            1. Problem Statement
          </h2>
          <div id="sec-problem-context" className="space-y-2 scroll-mt-6">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Background & Bottlenecks
            </h3>
            <p className="text-sm text-foreground/90 leading-relaxed">
              Describe the technical context, existing bottlenecks, and primary objectives
              of this architecture specification. Highlight latency constraints, traffic spikes,
              and connection contention points.
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section id="sec-architecture" className="space-y-3 scroll-mt-6">
          <h2 className="text-lg font-bold text-foreground border-b border-border/50 pb-1.5">
            2. System Architecture Flow
          </h2>
          <div id="sec-architecture-sequence" className="space-y-2 scroll-mt-6">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Asynchronous Queue Pipeline
            </h3>
            <p className="text-sm text-foreground/90 leading-relaxed">
              Overview of the microservices and messaging boundaries participating in the pipeline.
              The boundary decouples synchronous user requests from backend billing commits.
            </p>
            <div className="w-full p-4 rounded-md border border-border bg-card/60 font-mono text-sm text-muted-foreground whitespace-pre-wrap">
{`Client -> API Gateway -> Message Queue (SQS FIFO) -> Worker Service (ECS Fargate) -> Database (Aurora PG)`}
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section id="sec-nfr" className="space-y-3 scroll-mt-6">
          <h2 className="text-lg font-bold text-foreground border-b border-border/50 pb-1.5">
            3. Non-Functional Requirements (NFR)
          </h2>
          <div id="sec-nfr-latency" className="space-y-2 scroll-mt-6">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              P99 Latency & Throughput SLA
            </h3>
            <ul className="list-disc list-inside text-sm text-foreground/90 space-y-1.5 leading-relaxed">
              <li>P99 Ingestion Latency: &lt; 100ms</li>
              <li>Peak Ingestion Throughput: 50,000 req/sec</li>
              <li>Service Availability: 99.99% Multi-AZ deployment</li>
              <li>Disaster Recovery Objective: RPO &lt; 1s, RTO &lt; 30s</li>
            </ul>
          </div>
        </section>

        {/* Section 4 */}
        <section id="sec-security" className="space-y-3 scroll-mt-6">
          <h2 className="text-lg font-bold text-foreground border-b border-border/50 pb-1.5">
            4. Security & Compliance
          </h2>
          <div id="sec-security-iam" className="space-y-2 scroll-mt-6">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              IAM Least Privilege & KMS Encryption
            </h3>
            <p className="text-sm text-foreground/90 leading-relaxed">
              Data encryption at rest using AWS KMS Customer Managed Keys and in transit via TLS 1.3.
              IAM task execution roles are strictly scoped to minimal permissions.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
