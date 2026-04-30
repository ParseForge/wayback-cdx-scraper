import { Actor, log } from 'apify';
import c from 'chalk';

interface Input {
    maxItems?: number;
    url?: string;
    matchType?: 'exact' | 'prefix' | 'host' | 'domain';
    fromDate?: string;
    toDate?: string;
    statusCode?: string;
    mimeType?: string;
    collapse?: string;
    uniqueOnly?: boolean;
}

interface CdxRecord {
    urlkey: string;
    timestamp: string;
    original: string;
    mimetype: string | null;
    statusCode: number | null;
    digest: string | null;
    length: number | null;
    snapshotUrl: string;
    timestampIso: string | null;
    scrapedAt: string;
}

const STARTUP = [
    '🛰️  Querying the Wayback Machine archive…',
    '📜 Pulling historical snapshots from the Internet Archive…',
    '🕰️  Time-travelling through Wayback CDX records…',
];
const DONE = [
    '🎉 Snapshot list ready. Time-machine output complete.',
    '✅ Wayback records exported. Internet history archived.',
    '🚀 Snapshots delivered. Browse the past offline.',
];
const pick = (arr: string[]): string => arr[Math.floor(Math.random() * arr.length)] ?? arr[0]!;

function timestampToIso(ts: string): string | null {
    if (!/^\d{14}$/.test(ts)) return null;
    const y = ts.slice(0, 4);
    const m = ts.slice(4, 6);
    const d = ts.slice(6, 8);
    const h = ts.slice(8, 10);
    const mi = ts.slice(10, 12);
    const s = ts.slice(12, 14);
    return `${y}-${m}-${d}T${h}:${mi}:${s}.000Z`;
}

function parseRow(line: string): CdxRecord | null {
    const parts = line.trim().split(/\s+/);
    if (parts.length < 7) return null;
    const [urlkey, timestamp, original, mimetype, statusStr, digest, lengthStr] = parts;
    const status = statusStr ? parseInt(statusStr, 10) : null;
    const length = lengthStr ? parseInt(lengthStr, 10) : null;
    return {
        urlkey: urlkey ?? '',
        timestamp: timestamp ?? '',
        original: original ?? '',
        mimetype: mimetype === '-' ? null : (mimetype ?? null),
        statusCode: status != null && !isNaN(status) ? status : null,
        digest: digest === '-' ? null : (digest ?? null),
        length: length != null && !isNaN(length) ? length : null,
        snapshotUrl: timestamp && original ? `https://web.archive.org/web/${timestamp}/${original}` : '',
        timestampIso: timestamp ? timestampToIso(timestamp) : null,
        scrapedAt: new Date().toISOString(),
    };
}

await Actor.init();

const input = (await Actor.getInput<Input>()) ?? {};
const userIsPaying = Boolean(Actor.getEnv()?.userIsPaying);
const isPayPerEvent = Actor.getChargingManager().getPricingInfo().isPayPerEvent;

let effectiveMaxItems = input.maxItems ?? 10;
if (!userIsPaying) {
    if (!effectiveMaxItems || effectiveMaxItems > 10) {
        effectiveMaxItems = 10;
        log.warning([
            '',
            `${c.dim('        *  .  ✦        .    *       .')}`,
            `${c.dim('  .        *')}    🛰️  ${c.dim('.        *   .    ✦')}`,
            `${c.dim('     ✦  .        .       *        .')}`,
            '',
            `${c.yellow("  You're on a free plan — limited to 10 items.")}`,
            `${c.cyan('  Upgrade to a paid plan for up to 1,000,000 items.')}`,
            '',
            `  ✦ ${c.green.underline('https://console.apify.com/sign-up?fpr=vmoqkp')}`,
            '',
        ].join('\n'));
    }
}

const targetUrl = (input.url ?? 'apify.com').trim();
const matchType = input.matchType ?? 'domain';

console.log(c.cyan('\n🛰️  Arguments:'));
console.log(c.green(`   🟩 url : ${targetUrl}`));
console.log(c.green(`   🟩 matchType : ${matchType}`));
if (input.fromDate) console.log(c.green(`   🟩 fromDate : ${input.fromDate}`));
if (input.toDate) console.log(c.green(`   🟩 toDate : ${input.toDate}`));
if (input.statusCode) console.log(c.green(`   🟩 statusCode : ${input.statusCode}`));
if (input.mimeType) console.log(c.green(`   🟩 mimeType : ${input.mimeType}`));
if (input.collapse) console.log(c.green(`   🟩 collapse : ${input.collapse}`));
console.log(c.green(`   🟩 maxItems : ${effectiveMaxItems}`));
console.log('');
console.log(c.magenta(`📬 ${pick(STARTUP)}\n`));

const params = new URLSearchParams();
params.set('url', targetUrl);
params.set('matchType', matchType);
if (input.fromDate) params.set('from', input.fromDate);
if (input.toDate) params.set('to', input.toDate);
if (input.statusCode) params.set('filter', `statuscode:${input.statusCode}`);
if (input.mimeType) params.set('filter', `mimetype:${input.mimeType}`);
if (input.collapse) params.set('collapse', input.collapse);
if (input.uniqueOnly) params.set('collapse', 'urlkey');
params.set('limit', String(effectiveMaxItems));

const apiUrl = `https://web.archive.org/cdx/search/cdx?${params.toString()}`;
log.info(`📡 Fetching CDX index for "${targetUrl}" (${matchType})…`);

let pushed = 0;
try {
    const response = await fetch(apiUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36',
            'Accept': 'text/plain',
        },
    });
    if (!response.ok) {
        log.error(`❌ CDX returned HTTP ${response.status}`);
        await Actor.pushData([{ error: `CDX returned HTTP ${response.status}`, url: apiUrl }]);
        await Actor.exit();
    }
    const text = await response.text();
    const lines = text.split('\n').filter(Boolean);
    log.info(`📊 ${lines.length} snapshot rows received`);

    for (const line of lines) {
        if (pushed >= effectiveMaxItems) break;
        const rec = parseRow(line);
        if (!rec) continue;
        if (isPayPerEvent) await Actor.pushData([rec], 'result-item');
        else await Actor.pushData([rec]);
        pushed += 1;
    }

    if (pushed === 0) {
        await Actor.pushData([{ error: 'No snapshots returned for the given URL/filters.', url: apiUrl }]);
    }
    log.info(c.green(`✅ Pushed ${pushed} snapshots`));
} catch (err: any) {
    log.error(`❌ ${err?.message ?? err}`);
    await Actor.pushData([{ error: err?.message ?? String(err) }]);
}

console.log(c.magenta(`\n${pick(DONE)}`));
await Actor.exit();
