---
title: "AI Security: Separating What's Real from What's Marketing"
date: 2026-05-20
summary: "Everyone is selling AI security. Most of it is repackaged application security with a new label. Here's what actually matters when securing AI systems — and using AI to secure yours."
tags: ["AI security", "LLM", "application security"]
draft: false
---

The security industry has a reliable pattern: a new technology emerges, vendors rebrand existing products around it, and CISOs are left trying to figure out what's genuinely new versus what's last year's tool with a fresh coat of paint.

AI security is in that phase right now. Let me try to cut through it.

## Two Distinct Problems

"AI security" conflates two very different challenges:

**Securing AI systems** — How do you protect applications that use LLMs, machine learning models, or AI agents from attack? This includes prompt injection, training data poisoning, model theft, data leakage through model outputs, and supply chain risks in model dependencies.

**Using AI for security** — How do you leverage AI to find vulnerabilities faster, triage incidents more effectively, or automate remediation? This is about augmenting your security team, not protecting AI.

Most vendor pitches blur these together. They shouldn't — the skill sets, tools, and threat models are different.

## What's Genuinely New About Securing AI

Some AI security risks are novel. Prompt injection is a real problem without a clean solution — it's fundamentally different from SQL injection because the "query" and the "data" travel through the same channel (natural language). You can't parameterize your way out of it.

Training data poisoning is concerning at scale but largely theoretical for most enterprises using commercial models. Model theft matters for organizations training proprietary models — less so for API consumers.

The risk I see most often in practice: **data leakage through careless AI integration**. Organizations connecting LLMs to internal data sources without thinking carefully about what the model can access and what it might include in responses. This isn't an exotic AI attack — it's a classic access control failure in a new context.

## What's Just Application Security with a New Name

A lot of "AI security" is standard application security applied to AI-powered applications:

- API authentication and authorization for model endpoints
- Input validation on user-facing prompts
- Rate limiting and abuse prevention
- Logging and monitoring of model interactions
- Dependency management for ML libraries

These are important. They're also not new. If your application security program is solid, you're already halfway there. If it isn't, an "AI security" product won't fix the foundation.

## Using AI for Security: What Actually Works

I build security tools with Claude and Codex daily. Here's what I've found genuinely useful:

**Code review augmentation.** LLMs are surprisingly good at identifying security issues in code — not perfect, but they catch things that pattern-based scanners miss, especially logic flaws and business logic vulnerabilities. The key is using them as a collaborator, not a replacement for human review.

**Vulnerability analysis and triage.** When you're staring at a list of 500 findings from a scanner, an LLM can help prioritize by understanding context — what the code actually does, whether a vulnerable function is reachable, whether the finding is a false positive.

**Security policy and documentation.** Drafting policies, mapping controls to frameworks, generating risk assessments — LLMs accelerate the tedious parts of GRC work dramatically.

**What doesn't work yet:** Fully autonomous security testing. Despite the demos, LLMs can't reliably replace a skilled penetration tester. They're a force multiplier for competent practitioners, not a substitute for expertise.

## The Practical Advice

If you're a CISO trying to figure out your AI security strategy:

1. **Start with your existing application security program.** Most AI security risks are application security risks. Shore up the basics first.

2. **Inventory your AI usage.** Know where LLMs and AI tools are being used across your organization — both sanctioned and shadow IT. You can't govern what you can't see.

3. **Focus on data flows.** The highest-risk scenarios involve AI systems with access to sensitive data. Map those flows and apply least-privilege principles.

4. **Skip the AI security platform buy.** At this stage, you probably don't need a dedicated AI security product. You need policies, training for your engineering teams, and integration of AI considerations into your existing security review processes.

5. **Experiment with AI for security.** Give your security team access to LLMs and let them figure out where it helps. The ROI is in augmenting skilled practitioners, not replacing them.

The organizations that will get AI security right are the ones with strong security fundamentals and a willingness to learn the new threat landscape — not the ones that buy the flashiest new product.

[Reach out](/contact/) if you'd like to discuss AI security strategy for your organization.
