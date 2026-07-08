---
title: "The Quantum Threat Is Not Theoretical"
date: 2026-07-07
summary: "Most quantum security conversations stop at 'someday.' After five years inside a quantum computing company, I can tell you exactly what's vulnerable, when, and what to do about it."
tags: ["quantum security", "PQC", "cryptography"]
draft: false
---

Most conversations about quantum computing and security follow a predictable arc: someone mentions Shor's algorithm, everyone agrees RSA will eventually break, and the room collectively shrugs because "real quantum computers are decades away."

That framing is dangerously wrong. Not because large-scale fault-tolerant quantum computers are imminent — they aren't — but because the threat model doesn't require them to be.

## Harvest Now, Decrypt Later

Nation-state actors are already collecting encrypted traffic at scale. The bet is simple: capture today's ciphertext, store it cheaply, and decrypt it when quantum hardware catches up. If your data has a shelf life longer than 10–15 years — and most sensitive enterprise, government, and financial data does — you have a quantum security problem *right now*.

This isn't speculation. Intelligence agencies have publicly acknowledged the strategy. The question isn't whether it's happening; it's whether your organization's data is worth storing.

## What Actually Breaks

After five years at IonQ working alongside quantum physicists and building security assessment toolkits, I can be more specific than most about what's at risk:

**RSA and ECDSA keys are the primary targets.** Shor's algorithm factors large integers and computes discrete logarithms efficiently on a quantum computer. Every RSA key, every ECDSA signature, every DH key exchange in your infrastructure is theoretically vulnerable. That includes your TLS certificates, SSH keys, code signing certificates, and blockchain wallets.

**AES is bruised, not broken.** Grover's algorithm provides a quadratic speedup for brute-force search, which effectively halves your symmetric key strength. AES-256 becomes AES-128 equivalent. That's still strong — but AES-128 becomes AES-64 equivalent, which is not.

**The timeline varies by algorithm and key size.** A 2048-bit RSA key requires roughly 4,000 logical qubits to break. We're currently at dozens of reliable logical qubits, not thousands. But the trajectory is non-linear, and "15 years away" is within the threat window for harvest-now attacks.

## What to Do About It

NIST finalized its post-quantum cryptography standards in 2024 — ML-KEM (Kyber) for key encapsulation, ML-DSA (Dilithium) and SLH-DSA (SPHINCS+) for digital signatures. The standards exist. The migration path is defined. What most organizations lack is:

1. **A cryptographic inventory.** You can't migrate what you can't find. Most enterprises have no idea where all their cryptographic dependencies live — embedded in libraries, baked into protocols, hardcoded in legacy systems.

2. **Prioritization based on actual risk.** Not everything needs to migrate at once. The priority should be driven by data sensitivity, retention period, and exposure to harvest attacks — not by what's easiest to change.

3. **Migration without disruption.** PQC algorithms have different performance characteristics (larger key sizes, different handshake behaviors). Migration requires testing, not just configuration changes.

## The Credibility Gap

The Big Four consulting firms will sell you a quantum risk assessment. So will a dozen startups. The difference is that most of them are working from NIST publications and analyst reports. They can tell you *that* quantum computers will break RSA. They can't tell you *how* — because they've never built or operated one.

I spent five years inside a quantum computing company. I've built toolkits that dissect TLS handshakes, extract RSA moduli, and model Shor's attack at the circuit level. I've worked with the physicists building the hardware. That context matters when you're trying to separate genuine risk from marketing fear.

If your organization is starting to think about quantum security, I'd rather you think about it clearly than urgently. The sky isn't falling today — but the window to prepare is shorter than most people assume.

[Get in touch](/contact/) if you want to talk through what quantum risk looks like for your specific infrastructure.
