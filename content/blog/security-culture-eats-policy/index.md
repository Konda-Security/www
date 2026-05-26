---
title: "Security Culture Eats Policy for Breakfast"
date: 2026-05-14
summary: "You can write perfect security policies and still have a terrible security posture. What actually changes behavior is culture — and culture comes from how security leaders show up."
tags: ["security culture", "security program", "leadership"]
draft: false
---

I've seen organizations with beautifully written security policies — hundreds of pages, mapped to NIST controls, approved by the board — that couldn't stop a phishing email from becoming a breach. And I've seen scrappy teams with minimal documentation that instinctively make secure choices because their engineering culture rewards it.

The difference isn't the policy. It's the culture.

## Why Policy Alone Fails

Security policies tell people what they *should* do. Culture determines what they *actually* do when nobody's watching and when the deadline is tomorrow.

Most security policies are written for auditors, not for the people who need to follow them. They're long, legalistic, and disconnected from daily work. Engineers read them once during onboarding — if they read them at all — and never open them again.

The policy says "all code must undergo security review before deployment." What happens in practice? The security review queue is a bottleneck, the security team takes a week to respond, and engineers learn to route around it. Not because they don't care about security, but because the process wasn't designed with their workflow in mind.

## What Security Culture Actually Looks Like

Organizations with strong security culture share a few traits:

**Security people earn technical credibility.** Engineers follow security guidance from people they respect technically. If your security team can't read code, can't explain *why* a finding matters at the implementation level, and can't propose realistic fixes — your guidance will be ignored, politely or otherwise.

This is the single biggest factor I've seen in 27 years. When I walked into engineering meetings at IonQ and could discuss their systems at the code level, the dynamic changed completely. Security stopped being "the team that says no" and became "the team that helps us ship safely."

**Security is a collaboration, not a mandate.** The agile values I brought from software development transformed how I run security programs. Favor working together over following contracts. Favor conversations over tickets. Favor enabling the right behavior over blocking the wrong behavior.

**Risk is communicated in business terms.** "This is a critical vulnerability" means nothing to a product manager. "This vulnerability lets an attacker read any customer's data, and we have 10,000 customers with PHI" gets a response. Security leaders who can translate between technical risk and business impact build trust with both engineering and executive teams.

**Engineers own security in their domain.** The best security programs don't have a central team gatekeeping every decision. They have security engineers embedded in product teams, security champions in every engineering group, and tooling that gives developers immediate feedback in their own workflow.

## How to Build It

If you're a CISO or security leader trying to shift culture, here's what I've found works:

**Start by being useful.** Before you write a single policy, go help an engineering team fix a real security problem. Write a patch. Review their architecture. Show up as a contributor, not an auditor. Everything else builds on this foundation.

**Make the secure path the easy path.** If doing the secure thing requires three extra steps and an approval process, people will skip it. Invest in tooling, automation, and process design that makes security the path of least resistance.

**Share context, not just directives.** When you issue a security requirement, explain the threat model behind it. Engineers who understand *why* will make better judgment calls in situations your policy didn't anticipate.

**Celebrate security wins publicly.** When an engineer reports a vulnerability, catches a misconfiguration, or builds a security feature — recognize it. Culture is shaped by what gets rewarded.

**Accept imperfection.** A security program that's 80% effective and embraced by the organization will outperform a theoretically perfect program that everyone resents and circumvents.

## The Builder's Advantage

I'm biased, but I believe the best security leaders are builders. Not because management skills don't matter — they absolutely do — but because the ability to prototype solutions, write code alongside your teams, and demonstrate technical depth changes the power dynamic fundamentally.

When your security team can show up to an architecture review and contribute meaningfully to the design — not just critique it — you earn a seat at the table that no title or policy can give you.

Security culture starts with security leaders who lead by doing, not just by governing.

[Let's talk](/contact/) about building a security culture that actually works at your organization.
