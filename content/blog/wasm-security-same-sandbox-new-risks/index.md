---
title: "WebAssembly Security: Same Sandbox, New Risks"
date: 2026-07-13
summary: "I built 30 security probes in Rust/WASM to test what WebAssembly can actually do in a browser. The sandbox is the same one JavaScript lives in — but the binary format creates real analysis gaps that defenders should understand."
tags: ["WebAssembly", "browser security", "application security", "security research"]
draft: false
---

I was curious about WebAssembly. Not the performance benchmarks or the "run C++ in the browser" pitch — I wanted to understand what it means for security. What can a WASM module actually access? Where are the boundaries? Are they the same ones JavaScript runs into, or does the "sandbox" that everyone talks about actually buy you something extra?

So I built a tool to find out. [Explore WASM](/explore-wasm/) is a set of 30 security probes written in Rust, compiled to WebAssembly, organized into escalation tiers from "no interaction needed" to "persistent access." Each probe tests a specific browser security boundary from inside a WASM module.

The short version: **WebAssembly is controlled by the same boundaries as JavaScript.** The browser sandbox constrains WASM's raw instruction set — linear memory, structured control flow, no direct syscalls — but through the JavaScript bridge, WASM has access to every Web API that JavaScript does. If JS can do it silently, WASM can do it silently.

But that's not the whole story.

## What the Sandbox Actually Means

WASM's "sandbox" is real, but it's narrower than most people assume. It means WASM can't escape its linear memory to read arbitrary process memory. It means there are no raw system calls. Control flow is structured — no arbitrary jumps, no ROP chains.

What it doesn't mean: WASM can't touch the DOM, can't read cookies, can't make network requests, can't fingerprint your browser. It absolutely can do all of those things. The JavaScript bridge (`wasm-bindgen` in Rust) gives WASM full access to the same Web APIs any script on the page can use.

In practice, my probes demonstrated that WASM can:

- **Read all non-HttpOnly cookies, localStorage, the entire DOM, and URL parameters** — including tokens in query strings. No permission needed.
- **Fingerprint browsers** using canvas rendering, audio processing, and navigator properties — each producing a high-entropy device identifier. No permission needed.
- **Leak local IP addresses** via WebRTC ICE candidates, potentially de-anonymizing VPN users. No permission needed.
- **Harvest autofill data** by injecting invisible form fields with autocomplete hints. The browser helpfully fills in names, emails, phone numbers, even credit card data. No permission needed.
- **Read password field values** — `.type='password'` hides the display, not the `.value`. Any same-origin script can read it.
- **Open WebSocket connections** for bidirectional command-and-control channels. No permission needed.

The defenses that hold are the same ones that protect against JavaScript: `HttpOnly` cookies, CORS enforcement, permission prompts for hardware APIs (camera, microphone, geolocation), and Content Security Policy.

## Where WASM Changes the Game: Obfuscation

The boundary story is straightforward — same sandbox as JS. But the analysis story is different, and this is where it gets interesting for defenders.

JavaScript is inspectable. You can read it in DevTools, search for suspicious strings, run static analysis tools against it. Obfuscated JavaScript is harder to read, but it's still text — you can grep for `document.cookie`, `XMLHttpRequest`, or `eval`.

WASM is a binary format. The same malicious logic compiled to WASM is fundamentally harder to analyze:

**XOR-encoded payloads.** My `hidden_payload` probe stores a command string XOR'd with a key. In JavaScript, a static scanner might flag the decode routine. In WASM, the string exists only as bytes in linear memory — invisible to signature-based scanning of the `.wasm` binary.

**Dynamic dispatch tables.** The `dynamic_dispatch` probe builds a simulated C2 command table at runtime. It exists only in linear memory while the module runs — there's no function name to grep for, no string literal to match.

**Memory steganography.** The `memory_stego` probe hides data in the least-significant bits of computation results. In WASM's linear memory model, this is trivial and invisible to standard monitoring.

**Debugger detection.** The `timing_check` probe uses performance timing to detect whether a debugger is attached. WASM's execution model makes this timing side-channel work differently than in JS, and standard DevTools breakpoints are harder to set in WASM code.

None of these techniques are impossible in JavaScript. But WASM makes them meaningfully easier to deploy and harder to detect. For defenders relying on static analysis or string matching in client-side code, a malicious WASM module is a real blind spot.

## Compute Abuse at Near-Native Speed

One finding worth highlighting: WASM's performance makes certain attacks more viable than in JavaScript. My `hash_benchmark` probe runs FNV-1a hashing at near-native speed — the kind of throughput that makes browser-based crypto-mining actually worth an attacker's time. The `busy_loop` probe demonstrates that a WASM module can lock the main thread for 500ms, and the `memory_pressure` probe silently allocates 64MB in linear memory that doesn't show up in JavaScript heap profilers.

These aren't theoretical — browser-based crypto-mining campaigns have used WASM in the wild for exactly this reason.

## What Defenders Should Do

If you're responsible for web application security and you encounter WASM in your attack surface:

1. **Don't assume the sandbox gives you extra protection.** WASM has access to the same APIs as JavaScript. Apply the same controls: `HttpOnly` cookies, CSP, SRI, and `Permissions-Policy` headers.

2. **Treat WASM binaries as opaque code.** Your JavaScript static analysis tools won't catch threats in `.wasm` files. If you're doing client-side code review, you need WASM-aware tooling or access to the source.

3. **Monitor for compute abuse.** WASM crypto-mining is real. Watch for sustained high CPU usage from browser tabs, and consider CSP directives that restrict `wasm-eval`.

4. **Use Permissions-Policy headers aggressively.** You can disable APIs at the HTTP level — camera, microphone, geolocation, USB, Bluetooth — so that no client-side code, JS or WASM, can access them. This is the strongest preventive control you have.

5. **Audit service workers.** WASM-powered service workers can provide persistence that survives page navigation and browser restarts. Know what's registered in your origin.

## Try It Yourself

The full tool is available at [github.com/kondasecurity/explore-wasm](https://github.com/kondasecurity/explore-wasm), and you can [run it in your browser](/explore-wasm/) right now. It's educational — the probes are designed to demonstrate boundaries, not exploit them. Safe defaults are in place: the clipboard hijack restores your original content, the busy loop caps at 500ms, and the WebSocket probe connects to localhost.

WASM is a powerful technology and it's showing up in more production applications every year. Understanding its actual security model — not the marketing version — is worth the time.

[Get in touch](/contact/) if you're seeing WASM in your environment and want to think through the implications.
