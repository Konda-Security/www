---
title: "WebAssembly Security: Same Sandbox, New Risks"
date: 2026-07-13
summary: "I built 30 security probes in Rust/WASM to test what WebAssembly can actually do in a browser. The sandbox is the same one JavaScript lives in — but the binary format creates real analysis gaps. And with WASI taking WASM beyond the browser into containers, edge, and serverless, the security surface is expanding fast."
tags: ["WebAssembly", "browser security", "application security", "security research", "WASI", "cloud native"]
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

## Beyond the Browser: WASM Is Going Everywhere

Everything above is about WASM in the browser. But despite having "Web" in the name, [WebAssembly is not a web-only technology](https://learn-wasm.dev/tutorial/introduction/what-webassembly-is-not). This is arguably the more important story for security teams to track right now.

The [WebAssembly System Interface (WASI)](https://wasi.dev/) gives WASM modules a standardized way to interact with the host operating system — file access, environment variables, clocks, random number generation — without the browser layer. Combined with standalone runtimes like [wasmtime](https://wasmtime.dev/) (Bytecode Alliance), [wasmer](https://wasmer.io/), and [wasmedge](https://wasmedge.org/) (a CNCF project), WASM is becoming a deployment target for servers, edge nodes, IoT devices, and container infrastructure.

The pitch is compelling. Mete Atamel's [wasm-basics](https://github.com/meteatamel/wasm-basics) project does a good job of cataloging the concrete advantages over traditional containers:

- **Faster startup.** WASM modules start in microseconds, not seconds. No cold-start problem.
- **Smaller footprint.** A "Hello World" Rust app compiled to WASM is a fraction of the size of an equivalent OCI container image.
- **Deny-by-default security.** Containers run in an allow-by-default model — a process can do anything the container's capabilities permit. WASM modules execute in a deny-by-default sandbox and must be explicitly granted access to each resource. This is a fundamentally different security posture.
- **True portability.** A container built for `linux/amd64` won't run on `linux/arm64` without a multi-arch build. A WASM module compiles to `wasm32/wasi` once and runs on any runtime on any architecture.

### Where It's Showing Up in Production

This isn't hypothetical. Major infrastructure projects are integrating WASM as a first-class execution target:

**Docker** added native WASM support in Desktop 4.15 via the [runwasi](https://github.com/containerd/runwasi) shim. You can run a WASM workload alongside traditional Linux containers in the same `docker compose` stack, using `wasmtime`, `wasmedge`, or [Spin](https://www.fermyon.com/spin) as the runtime. The Dockerfile and build tooling are familiar — but what runs is a sandboxed WASM module, not a full Linux userland.

**Fermyon Spin** is a framework for event-driven microservices compiled to WASM. You write an HTTP handler in Rust, Go, Python, or C#, compile it to a WASM component, and deploy it to [Fermyon Cloud](https://www.fermyon.com/cloud) as a serverless function. The execution model uses WAGI (WebAssembly Gateway Interface) to route HTTP requests to WASM binaries — each request gets its own sandboxed instance.

**Azure AKS** is previewing WASM node pools via `runwasi`, letting you run WASM workloads in Kubernetes alongside traditional container pods.

**Cloudflare Workers** runs untrusted tenant code in V8 isolates with WASM support — each request handler is sandboxed, starts in milliseconds, and gets strict memory limits.

**Envoy Proxy** uses WASM for [custom filter extensions](https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/wasm_filter), letting service mesh operators inject processing logic at the proxy layer without recompiling Envoy itself.

**Shopify Functions** runs merchant-authored business logic in a WASM sandbox — custom discount rules, shipping calculations, and checkout validations execute as WASM modules with strict resource limits and no network access.

### The Security Implications Are Different Here

In the browser, WASM's security story is simple: same sandbox as JavaScript, but harder to analyze. On the server side, the story gets more nuanced.

**The deny-by-default model is genuinely useful.** When you run a WASM module in `wasmtime`, it can't touch the filesystem, network, or environment unless you explicitly pass in capabilities. Compare that to a Docker container where you're *restricting* what it can do from a default of "everything." For multi-tenant platforms — serverless, edge functions, plugin systems — this is a meaningful security improvement. WASM gives you workload isolation that's lighter than a VM and more restrictive than a container.

**But WASI is still evolving, and the gaps matter.** Networking and sockets aren't fully standardized in WASI yet. Runtimes like `wasmedge` and `wasmtime` have implemented their own POSIX socket extensions, and [WASIX](https://wasix.org/) adds threading and networking on top of WASI but only runs on `wasmer`. When the standard doesn't cover something, each runtime fills the gap differently — and those differences are where security assumptions break down.

**Supply chain risk applies here too.** A WASM module is an opaque binary, just like in the browser. If you're pulling WASM modules from a registry and running them in your infrastructure — as a Spin component, a Docker WASM workload, or an Envoy filter — you're trusting compiled code you can't easily inspect. The deny-by-default sandbox helps contain the blast radius, but it doesn't tell you what the module is *doing* within its granted capabilities.

**The "language support" story is messy.** The [learn-wasm.dev tutorial](https://learn-wasm.dev/tutorial/introduction/what-webassembly-is-not) notes that WASM now supports Rust, C/C++, Go, .NET, Python, Kotlin, and others. That's great for adoption, but each language's WASM toolchain has different maturity levels, different security properties, and different ways of handling the WASI boundary. A Go WASM binary and a Rust WASM binary may behave differently given the same WASI capabilities — and you won't know without testing.

## What Defenders Should Do

Whether you're dealing with WASM in the browser or on the server, the principles are similar: understand the sandbox boundaries, don't trust opaque binaries, and monitor what runs.

### In the Browser

1. **Don't assume the sandbox gives you extra protection.** WASM has access to the same APIs as JavaScript. Apply the same controls: `HttpOnly` cookies, CSP, SRI, and `Permissions-Policy` headers.

2. **Treat WASM binaries as opaque code.** Your JavaScript static analysis tools won't catch threats in `.wasm` files. If you're doing client-side code review, you need WASM-aware tooling or access to the source.

3. **Monitor for compute abuse.** WASM crypto-mining is real. Watch for sustained high CPU usage from browser tabs, and consider CSP directives that restrict `wasm-eval`.

4. **Use Permissions-Policy headers aggressively.** You can disable APIs at the HTTP level — camera, microphone, geolocation, USB, Bluetooth — so that no client-side code, JS or WASM, can access them. This is the strongest preventive control you have.

5. **Audit service workers.** WASM-powered service workers can provide persistence that survives page navigation and browser restarts. Know what's registered in your origin.

### On the Server / Edge / Container

6. **Inventory your WASM workloads.** If your team is using Docker with WASM support, deploying Spin components, or running Envoy with WASM filters, know where those modules come from and what capabilities they've been granted.

7. **Audit WASI capability grants.** The deny-by-default model only works if you're deliberate about what you allow. Review the `--dir`, `--env`, and networking flags passed to your WASM runtime. Over-granting capabilities defeats the sandbox.

8. **Pin your WASM dependencies.** A WASM module pulled from a registry is no different from a container image or npm package — it's a supply chain input. Pin versions, verify checksums, and track provenance.

9. **Test across runtimes if you're multi-target.** WASI isn't fully standardized yet. A module that behaves safely on `wasmtime` may behave differently on `wasmer` or `wasmedge`, especially around networking and filesystem access. Don't assume portable means identical.

10. **Watch for capability escalation in plugin systems.** If you're running third-party WASM as plugins (like Shopify Functions or Envoy filters), the plugin's granted capabilities define your blast radius. Review them as carefully as you'd review IAM policies.

## Try It Yourself

The full tool is available at [github.com/kondasecurity/explore-wasm](https://github.com/kondasecurity/explore-wasm), and you can [run it in your browser](/explore-wasm/) right now. It's educational — the probes are designed to demonstrate boundaries, not exploit them. Safe defaults are in place: the clipboard hijack restores your original content, the busy loop caps at 500ms, and the WebSocket probe connects to localhost.

WASM is a powerful technology and its footprint is expanding — from browser tabs to Docker containers to edge nodes to serverless functions. In the browser, the security model is straightforward (same sandbox as JS, harder to analyze). On the server side, the deny-by-default sandbox is genuinely better than containers for isolation, but the ecosystem is young and the standards are still catching up. Understanding the actual security model in both contexts — not the marketing version — is worth the time.

For a hands-on look at the server-side story, Mete Atamel's [wasm-basics](https://github.com/meteatamel/wasm-basics) repo has working samples in Rust, Go, .NET, and Python across multiple runtimes. The [learn-wasm.dev](https://learn-wasm.dev/tutorial/introduction/what-webassembly-is-not) tutorial is a good starting point for clearing up misconceptions about what WASM can and can't do.

[Get in touch](/contact/) if you're seeing WASM in your environment — browser or server side — and want to think through the implications.
