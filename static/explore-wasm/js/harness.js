import init, { probe_list, run_probe, run_probe_async, is_async_probe } from '../pkg/explore_wasm.js';

const outputEl = document.getElementById('output');
const statusEl = document.getElementById('wasm-status');

function appendOutput(text) {
    const entry = document.createElement('div');
    entry.className = 'output-entry';

    let html = text
        .replace(/Status: BOUNDARY CROSSED/g, '<span class="status-crossed">Status: BOUNDARY CROSSED</span>')
        .replace(/Status: BOUNDARY MAPPED/g, '<span class="status-crossed">Status: BOUNDARY MAPPED</span>')
        .replace(/Status: BOUNDARY PROBED/g, '<span class="status-probed">Status: BOUNDARY PROBED</span>')
        .replace(/Status: BLOCKED[^<]*/g, '<span class="status-blocked">$&</span>')
        .replace(/Status: EVASION DEMONSTRATED/g, '<span class="status-evasion">Status: EVASION DEMONSTRATED</span>')
        .replace(/Status: ABUSE DEMONSTRATED/g, '<span class="status-abuse">Status: ABUSE DEMONSTRATED</span>');

    html = html.replace(/^\[([^\]]+)\]/gm, '<span class="header">[$1]</span>');

    entry.innerHTML = html;
    outputEl.appendChild(entry);
    outputEl.scrollTop = outputEl.scrollHeight;
}

async function runProbe(name, btn) {
    if (btn) {
        btn.classList.add('running');
    }
    try {
        let result;
        if (is_async_probe(name)) {
            result = await run_probe_async(name);
        } else {
            result = run_probe(name);
        }
        appendOutput(result);
    } catch (e) {
        appendOutput(`[${name}]\nStatus: ERROR\n${e}`);
    }
    if (btn) {
        btn.classList.remove('running');
        btn.classList.add('done');
    }
}

async function main() {
    try {
        await init();
        const probeCount = probe_list().split('\n').length;
        statusEl.textContent = `WASM module loaded — ${probeCount} probes available`;
        statusEl.className = 'status-ready';
    } catch (e) {
        statusEl.textContent = `Failed to load WASM: ${e}`;
        statusEl.className = 'status-error';
        return;
    }

    document.querySelectorAll('.probe-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            runProbe(btn.dataset.probe, btn);
        });
    });

    document.getElementById('run-all').addEventListener('click', async () => {
        outputEl.innerHTML = '';
        document.querySelectorAll('.probe-btn').forEach(btn => {
            btn.classList.remove('done');
        });
        appendOutput('=== Running all probes ===\n');
        const probes = probe_list().split('\n');
        for (const probe of probes) {
            const btn = document.querySelector(`[data-probe="${probe}"]`);
            await runProbe(probe, btn);
            appendOutput('\n' + '─'.repeat(60) + '\n');
        }
        appendOutput('=== All probes complete ===');
    });

    document.getElementById('run-tier').addEventListener('click', async () => {
        const tier = document.getElementById('tier-select').value;
        outputEl.innerHTML = '';
        document.querySelectorAll('.probe-btn').forEach(btn => {
            btn.classList.remove('done');
        });
        const probes = probe_list().split('\n').filter(p => {
            if (tier === 'all') return true;
            return p.startsWith(tier + '::');
        });
        appendOutput(`=== Running ${tier} probes (${probes.length}) ===\n`);
        for (const probe of probes) {
            const btn = document.querySelector(`[data-probe="${probe}"]`);
            await runProbe(probe, btn);
            appendOutput('\n' + '─'.repeat(60) + '\n');
        }
        appendOutput(`=== ${tier} probes complete ===`);
    });

    document.getElementById('clear').addEventListener('click', () => {
        outputEl.innerHTML = '';
        document.querySelectorAll('.probe-btn').forEach(btn => {
            btn.classList.remove('done');
        });
    });
}

main();
