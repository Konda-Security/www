---
title: "Claude Code Plugins"
summary: "Install Konda Security's Claude Code plugins, starting with Third Party Risk Management: vendor triage, reviews, SOC 2 evidence reviews, re-reviews, and an approved-services tracker."
ShowToc: false
ShowReadingTime: false
---

These are tools I use in client work, packaged as [Claude Code](https://code.claude.com/docs) plugins so you can run them in your own sessions. They install from the Konda Security plugin marketplace.

## Add the marketplace

In a Claude Code session:

```text
/plugin marketplace add https://kondasecurity.com/claude/marketplace.json
```

Then browse the plugins with `/plugin`, or install one by name as shown below. From your shell, the same commands are `claude plugin marketplace add ...` and `claude plugin install ...`.

---

## Third Party Risk Management (`tprm`)

A toolkit for running a vendor risk program, from the first request to the annual re-review. It works on a **workspace**, one folder per client that holds the approved-services list, the review records, and vendor-provided evidence.

**Install**

```text
/plugin install tprm@konda-security
```

Or add the marketplace and install in one step (Claude Code 2.1.275 or later):

```text
/plugin install tprm --marketplace https://kondasecurity.com/claude/marketplace.json
```

**Get started**

From the client's repository or folder, set up the workspace once:

```text
/tprm:tprm-setup
```

It adopts an existing vendor review folder if there is one, and writes a `tprm.json` with the client's choices: entity tags, extra tracker columns, review cadence, and how to make PDFs.

**Skills**

| Skill | What it does |
|-------|--------------|
| `vendor-quick-check` | Triages a request from the intake answers and a few web checks. Fast-tracks low-risk tools; routes the rest to a full review |
| `vendor-review` | Full assessment with parallel research agents across ten weighted risk dimensions, with cited evidence and a PDF |
| `vendor-evidence-review` | Reviews a vendor's SOC 2 report, bridge letter, ISO certificate, or pen test letter: scope, opinion, exceptions, carve-outs, and the controls you must operate. No web access |
| `vendor-rereview` | Re-reviews a vendor by checking what changed since the last review, and whether its conditions were met |
| `vendor-tracker` | Keeps the approved-services list: records decisions, lists what's due, checks and migrates the list |
| `vendor-github-sync` | Installs a vendor request issue form, pulls requests into the tracker, and posts decisions back to the issues |
| `tprm-docs` | Drafts the vendor management policy, review process, and request form, or checks existing ones against how the program actually runs |

**A typical request**

```text
/tprm:vendor-quick-check Acme Notes 42
/tprm:vendor-review https://acme.example 42
/tprm:vendor-tracker record reviews/acme-2026-10-22.md
/tprm:vendor-github-sync push
```

Skills are listed with the `tprm:` prefix. The short form, such as `/vendor-review`, works unless another installed command uses the same name. Anything that writes to files, git, or GitHub is shown to you first and runs only after you confirm.

**What a full review assesses:** security posture, privacy practices, compliance, breach history, AI risk, export control risk, financial health, reputational risk, leadership stability, and transparency.

**Requirements:** Claude Code with WebFetch, WebSearch, and subagents available. The [GitHub CLI](https://cli.github.com) for the GitHub sync. [pandoc](https://pandoc.org) is optional, for the built-in PDF output.

**Upgrading from 1.0:** reviews now go into a workspace, so run `/tprm:tprm-setup` once in each client folder before your next review.

**Source and documentation:** [github.com/Konda-Security/vendor-review-plugin](https://github.com/Konda-Security/vendor-review-plugin), MIT licensed

---

## Updates

Installed plugins update when a new version is released. To pick one up, run `/plugin marketplace update konda-security` in a session. To receive releases automatically, open `/plugin`, go to **Marketplaces**, select `konda-security`, and choose **Enable auto-update**.

## Limitations

Reviews work from publicly available information and the documents a vendor provides. Each record is a point-in-time, AI-assisted starting point for due diligence that a person should review before a decision is made; it doesn't replace reading the vendor's contract terms. If you want help building or running a vendor risk program, [get in touch](/contact/).
