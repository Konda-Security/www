---
title: "The Agent Identity Problem: Why OAuth Isn't Enough for MCP"
date: 2026-07-31
summary: "When an AI agent calls a tool, three principals are involved but only one has an identity. OAuth authenticates the user — but not the agent's intent. Here's what enterprise auth architecture for MCP actually needs, and how to build toward it without waiting for the ecosystem to figure it out."
tags: ["MCP", "AI security", "authentication", "authorization", "agent identity", "enterprise security", "OWASP"]
draft: false
---

Traditional authentication answers: *Who is this?*
Traditional authorization answers: *Can they do this?*

Agent systems introduce a third question that neither framework addresses: **Did the human intend this?**

I've been using MCP servers with Claude for months — filesystem access, database queries, API integrations. The workflow is excellent. I've also been watching how tool calls get authorized, and that's where it gets interesting.

When an agent calls a tool, three principals are involved:

```
┌──────────┐      ┌──────────┐      ┌──────────┐
│   User   │─────▶│  Agent   │─────▶│   Tool   │
│ (Human)  │      │  (LLM)   │      │(MCP Srv) │
│          │      │          │      │          │
│ Has      │      │ Makes    │      │ Executes │
│ Identity │      │ Decisions│      │ Actions  │
│ Has      │      │ Has No   │      │ Sees     │
│ Intent   │      │ Identity │      │ Only     │
│          │      │ of Its   │      │ OAuth    │
│          │      │ Own      │      │ Token    │
└──────────┘      └──────────┘      └──────────┘
     ▲                                    │
     └────── Attributed to ◀──────────────┘
```

The tool sees the user's OAuth token. It attributes the action to the user. That works — until the LLM decides to do something the user didn't request, or gets manipulated into acting on another server's behalf. The protocol can't distinguish between those scenarios.

This isn't a reason to avoid MCP. It's a design challenge with practical solutions today and better ones coming. The [OWASP AISVS](https://github.com/OWASP/AISVS/) has specific controls for agent identity (C9.4), authorization delegation (C9.5), and MCP auth (C10.2) — still v0.1, but the right framework for thinking about this systematically.

## What OAuth Gives You

MCP adopted OAuth 2.1 with PKCE for remote servers. This gives you proof of user authorization, token scoping, code interception protection, refresh and revocation.

That's a solid foundation. It means MCP is already better than most agent-to-tool integrations that rely on static API keys or ambient credentials.

Where it needs supplementing:

**Intent binding.** The token proves "user authorized this connection." It says nothing about "user intended this specific tool call." That distinction matters most for write operations.

**Authorization granularity.** OAuth scopes are coarse. MCP tools need per-resource authorization — "can read files in `/project/**` but not `~/.ssh/**`." AISVS `C10.2.5` targets this: access control on every invocation including argument validation.

**Cross-server authorization.** A token for Server A says nothing about what Server A's data should be allowed to trigger on Server B. This is the confused deputy gap.

**Temporal scoping.** Tokens expire, but there's no concept of "only valid while the user is actively supervising." AISVS `C9.5.6` recommends re-evaluation on every privileged action in long sessions — a practical approximation.

For local servers using stdio — which is most servers people actually use — there's no authentication at all. The server runs with the user's full permissions. That's the gap most organizations should address first.

## Three Scenarios, One Request

When a Jira server receives a "create issue" call with a valid OAuth token, the call could be:

**User-requested.** "Create a ticket for the login bug." Faithful execution of a clear instruction. Allow it. Make it fast.

**Agent-autonomous.** The agent decided a tracking ticket would be helpful. The user didn't ask. This might be fine — many organizations want proactive agents — but it should be governed by policy, not left to the model.

**Manipulated.** Another server's output influenced the agent to create a ticket containing exfiltrated data. Block it.

All three produce the same API call. The Jira server can't tell them apart.

You don't need to solve this perfectly to deploy safely. You need to ensure the highest-impact actions have a check — human approval, policy evaluation, or both. Read operations with lower consequences can proceed with lighter oversight. Focus your controls on impact, not on perfectly classifying intent.

## An Identity Stack — Built Incrementally

If I were designing this for an enterprise, I'd think in five layers but deploy them sequentially, getting value at each stage:

```
  Layer 4: Action Intent         "User asked for this"
  Layer 3: Agent Session         "This agent instance"
  Layer 2: Agent Identity        "This agent software"
  Layer 1: User Identity         "This human"
  Layer 0: Platform Identity     "This host application"
```

**Only Layer 1 exists today.** That's fine. Start there.

**Layer 3 is the first layer worth building.** Assign a session ID when an agent conversation starts, tie all tool calls to that session, expire it when the conversation ends. You get audit trails, session-scoped permissions, and the foundation for everything else. You can build this in a sprint. AISVS `C9.4.1` — unique cryptographic identity per agent instance.

**Layer 2 is next.** Attestable identity of the agent framework: "This request comes from an agent running Claude via the Acme Corp framework, v2.1." Enables per-framework authorization policies. AISVS `C9.4.2` — cryptographically bound execution chains.

**Layer 4 is the long game.** Was this tool call user-requested, agent-autonomous, or manipulated? This is inherently approximate. No system will classify intent perfectly. But even a noisy signal — "high confidence this was user-requested" vs. "uncertain provenance" — combined with risk-based policy is dramatically better than treating all calls identically. Heuristics (did the user's message reference this action?), behavioral baselines (is this typical?), risk-based defaults (when uncertain, require approval for writes).

## Tool-Call Interception Patterns

For organizations deploying MCP at scale, the interception layer is where identity signals get consumed and policy decisions get made. Three architectures:

**The Proxy.** Sits between client and server. No changes to MCP servers. Centralized enforcement. Challenges: stdio is hard to proxy, adds latency, the proxy itself becomes a high-value target.

**The Sidecar.** Runs inside the host, intercepts at the client level. Access to conversation context enables intent classification. Lower latency. Handles stdio naturally. Challenge: requires host integration, different per platform.

**The Gateway.** All agents connect through a centralized gateway. Single enforcement point, complete audit trail, cross-agent policies. This is the architecture enterprises are converging on. If you're evaluating agent platforms, the gateway is what you're buying.

The security bar for a gateway is high — it's a blast radius multiplier. Compromise it and you've compromised every connected agent and tool across every customer. But it's also the component that makes enterprise-grade MCP deployment possible. AISVS `C5.2.5` requires the policy decision point to be isolated from the agent's execution environment, which a gateway provides naturally.

### What the Interception Layer Does

**Inbound:** Check parameters for sensitive data. Evaluate against policy — is this user authorized for this tool with these arguments? Enforce rate limits and quotas.

**Outbound:** Scan responses for injection payloads. Validate against declared schemas. Watch for tool definition changes.

## What Authorization Should Look Like

Most MCP deployments today: "Allow Server X to use all its tools? [Yes] [No]."

Where it needs to go: granular, context-aware authorization that lets teams move fast on low-risk operations while maintaining oversight on high-risk ones.

**Resource-level permissions.** `read_file` works in `/project/**` but not `~/.ssh/**`. `write_file` requires approval in `/project/src/**`. Deny-by-default for everything else.

**Risk-tiered authorization.** Not every call needs the same oversight. User-explicit read operations — auto-approve. Agent-autonomous reads on allowed paths — auto-approve. High-risk writes — human approval with full context. Suspicious patterns — block and alert.

**Cross-server data flow policies.** This is the most underappreciated dimension. Express what data from Server A is allowed to appear in Server B's parameters. PII from the CRM can't flow to external analytics tools. Database data stays with internal tools. This is the systematic defense against the confused deputy.

No product ships this exactly today — the YAML policy format I'd imagine looks something like "deny flow from crm-server to external tools when data contains PII." It's aspirational architecture. But it's the right direction, and the teams building it now will have a real competitive advantage.

## The Tradeoff at the Heart of It

You want three things:

1. **Cross-server context sharing** — tools build on each other's outputs
2. **Context confidentiality** — Server A's data isn't visible to Server B
3. **Great UX** — seamless, fast agent interactions

Every real deployment trades between these. The answer isn't picking one architecture forever. It's making the tradeoff configurable — strict isolation for PII workflows, full sharing for internal analysis, trust groups for mixed scenarios. The platform that makes these policies easy to define and enforce wins.

## Practical Roadmap

**Deploy now — enables adoption.** Structured logging of every tool call. Human approval for write operations with a UI that shows the actual call, not just the tool name. OAuth scope review in your server approval process. These three controls let you start deploying and learning.

**Build out (3-6 months).** Session-level agent identity. Policy engine integration — Cedar for its clean authorization model, OPA for cross-cutting policies. Content scanning pipeline for descriptions and responses.

**Differentiate (6-12 months).** Cross-server data flow policies. Intent classification MVP. Behavioral anomaly detection using your logging data.

## What's Still Open

**Intent classification will always be approximate.** The engineering answer: risk-based defaults. When intent is unclear, required oversight matches the action's impact. Good enough is good enough.

**Context isolation and usefulness are in tension.** The AISVS provides architectural principles. The UX for configuring isolation policies is still being invented. This is a product design problem as much as a security one.

**Accountability is catching up.** When an agent causes harm, liability spans multiple principals. Immutable audit logs with execution chain provenance give you the forensic foundation. Legal and compliance frameworks will follow.

These are active areas of development. The organizations deploying MCP now — with practical controls and good telemetry — will have the data and experience to inform solutions as they mature. That's a better position than waiting.

## The Bottom Line

OAuth gives you a solid authentication foundation. Layer on session identity, approval gates for writes, and structured logging, and you have a posture that enables your teams to build with agents while giving security and compliance what they need.

The agent identity problem will be solved incrementally. Your job isn't to wait for perfection — it's to adopt with the right controls at each stage, capture the productivity gains, and build toward a more complete architecture as the ecosystem matures.

[Get in touch](/contact/) if you're building agent auth architecture or evaluating MCP platforms for enterprise deployment.
