---
title: "Claude Code Plugins"
summary: "Install Konda Security's Claude Code plugins, starting with Third Party Risk Management for vendor security and risk assessments."
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

Skills for third party risk work. The `vendor-review` skill takes a vendor's website or name, researches the vendor across ten weighted risk dimensions, scores each from 1 to 5 with cited evidence, and writes a markdown and PDF report.

**Install**

```text
/plugin install tprm@konda-security
```

Or add the marketplace and install in one step (Claude Code 2.1.275 or later):

```text
/plugin install tprm --marketplace https://kondasecurity.com/claude/marketplace.json
```

**Run**

```text
/vendor-review <vendor-url-or-company-name>
```

The skill is listed as `/tprm:vendor-review`, with the plugin name as a prefix like every plugin skill. The short form works unless another installed command already uses the name `vendor-review`.

**What it assesses:** security posture, privacy practices, compliance, breach history, AI risk, export control risk, financial health, reputational risk, leadership stability, and transparency.

**Requirements:** Claude Code with WebFetch, WebSearch, and subagents available. [pandoc](https://pandoc.org) is optional, for PDF output.

**Source and documentation:** [github.com/Konda-Security/vendor-review-plugin](https://github.com/Konda-Security/vendor-review-plugin), MIT licensed

---

## Updates

Installed plugins update when a new version is released. To pick one up, run `/plugin marketplace update konda-security` in a session. To receive releases automatically, open `/plugin`, go to **Marketplaces**, select `konda-security`, and choose **Enable auto-update**.

## Limitations

The plugins work from publicly available information. A vendor review is a point-in-time starting point for due diligence, not a substitute for reading the vendor's audit reports and contract terms. If you want help building or running a vendor risk program, [get in touch](/contact/).
