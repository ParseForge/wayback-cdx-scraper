![ParseForge Banner](https://github.com/ParseForge/apify-assets/blob/ad35ccc13ddd068b9d6cba33f323962e39aed5b2/banner.jpg?raw=true)

# 🕰️ Wayback Machine CDX Scraper

> 🚀 **Export every archived URL the Internet Archive holds for any domain or URL prefix.** Filter by date range, status, MIME, and uniqueness. No API key, no registration.

> 🕒 **Last updated:** 2026-05-01 · **📊 10 fields** per record · **🕰️ archives back to 1996** · **🌐 billions of snapshots** · **🔓 free public CDX index**

The **Wayback Machine CDX Scraper** queries the public Internet Archive CDX index for a domain or URL prefix and returns every snapshot the Wayback Machine has on file. Each record includes the URL key, raw timestamp, ISO timestamp, original URL, MIME type, HTTP status, content digest, byte length, and a direct snapshot link you can open in any browser.

The Wayback Machine has been running since 1996 and now holds more than 800 billion web pages. It is the canonical historical record of the public web, used by lawyers for evidence, by SEO teams for content recovery, and by journalists for accountability work. This Actor handles CDX query syntax, pagination, and filters server-side so you skip writing the parser yourself.

| 🎯 Target Audience | 💡 Primary Use Cases |
|---|---|
| SEO teams, web archivists, OSINT researchers, journalists, security analysts, legal teams | Lost-content recovery, redirect audits, brand history, competitor evolution, link reclamation, evidence collection |

---

## 📋 What the Wayback Machine CDX Scraper does

Five filtering workflows in a single run:

- 🌐 **Full domain export.** Submit a domain or URL prefix and pull every snapshot the archive holds.
- 📐 **Match-type control.** `exact` for one URL, `prefix` for a path tree, `host` for one hostname, `domain` for the host plus subdomains.
- 📅 **Date range.** `from` and `to` timestamps in YYYYMMDD format restrict to a specific window.
- 🌐 **MIME and status filter.** Restrict to `text/html` or `200`-only snapshots when auditing a redirect map.
- 🔁 **Unique URLs.** `uniqueOnly` collapses by URL key so you get one row per distinct URL instead of one per capture.

Each row reports the CDX URL key, original URL, raw timestamp, ISO timestamp, MIME type, HTTP status, content digest, byte length, and a direct snapshot link in `web.archive.org/web/{ts}/{url}` form.

> 💡 **Why it matters:** the CDX index is the cheapest historical web record available. When a competitor pivots, when a regulator demands evidence of a marketing claim, or when an SEO team needs to recover a deleted blog, the Wayback Machine is usually the only public source. Building your own pipeline against the CDX endpoint means handling pagination tokens and timestamp formats; this Actor handles all of that.

---

## 🎬 Full Demo

_🚧 Coming soon: a 3-minute walkthrough showing how to go from sign-up to a downloaded dataset._

---

## ⚙️ Input

<table>
<thead>
<tr><th>Input</th><th>Type</th><th>Default</th><th>Behavior</th></tr>
</thead>
<tbody>
<tr><td><code>maxItems</code></td><td>integer</td><td><code>10</code></td><td>Snapshots to return. Free plan caps at 10, paid plan at 1,000,000.</td></tr>
<tr><td><code>urlOrDomain</code></td><td>string</td><td><code>"apify.com"</code></td><td>Domain or URL prefix to look up.</td></tr>
<tr><td><code>matchType</code></td><td>string</td><td><code>"domain"</code></td><td><code>exact</code>, <code>prefix</code>, <code>host</code>, or <code>domain</code>.</td></tr>
<tr><td><code>fromDate</code></td><td>string</td><td>empty</td><td>Earliest timestamp. Examples: <code>2020</code>, <code>202001</code>, <code>20200115</code>.</td></tr>
<tr><td><code>toDate</code></td><td>string</td><td>empty</td><td>Latest timestamp.</td></tr>
<tr><td><code>statusCode</code></td><td>string</td><td>empty</td><td>HTTP status filter, e.g. <code>200</code>.</td></tr>
<tr><td><code>mimeType</code></td><td>string</td><td>empty</td><td>MIME type filter, e.g. <code>text/html</code>.</td></tr>
<tr><td><code>collapse</code></td><td>string</td><td>empty</td><td>CDX collapse field, e.g. <code>urlkey</code>.</td></tr>
<tr><td><code>uniqueOnly</code></td><td>boolean</td><td><code>false</code></td><td>Shortcut for <code>collapse=urlkey</code>.</td></tr>
</tbody>
</table>

**Example: every HTML snapshot of apify.com homepage.**

```json
{
    "maxItems": 100,
    "urlOrDomain": "apify.com",
    "matchType": "exact",
    "mimeType": "text/html",
    "statusCode": "200"
}
```

**Example: every unique URL ever captured under a competitor blog.**

```json
{
    "maxItems": 1000,
    "urlOrDomain": "example.com/blog",
    "matchType": "prefix",
    "uniqueOnly": true,
    "fromDate": "2020"
}
```

> ⚠️ **Good to Know:** very broad queries on busy domains can return millions of rows. Always set `maxItems` and ideally a date window. The CDX endpoint accepts multi-million-row responses but they take minutes to download.

---

## 📊 Output

Each snapshot record contains **10 fields**. Download as CSV, Excel, JSON, or XML.

### 🧾 Schema

| Field | Type | Example |
|---|---|---|
| 🔑 `urlkey` | string | `"com,apify)/"` |
| ⏱️ `timestamp` | string | `"20070531101538"` |
| 🔗 `original` | string | `"http://www.apify.com:80/"` |
| 📄 `mimetype` | string \| null | `"text/html"` |
| ✅ `statusCode` | integer \| null | `200` |
| 🔐 `digest` | string \| null | `"EE6FCHP3MKBC3EV5D5Q4WQJNZNVUTNU6"` |
| 📦 `length` | integer \| null | `1013` |
| 🌐 `snapshotUrl` | string | `"https://web.archive.org/web/20070531101538/..."` |
| 📅 `timestampIso` | ISO 8601 \| null | `"2007-05-31T10:15:38.000Z"` |
| 🕒 `scrapedAt` | ISO 8601 | `"2026-05-01T00:47:14.231Z"` |

### 📦 Sample records

<details>
<summary><strong>🕰️ First-ever snapshot of apify.com from May 2007</strong></summary>

```json
{
    "urlkey": "com,apify)/",
    "timestamp": "20070531101538",
    "original": "http://www.apify.com:80/",
    "mimetype": "text/html",
    "statusCode": 200,
    "digest": "EE6FCHP3MKBC3EV5D5Q4WQJNZNVUTNU6",
    "length": 1013,
    "snapshotUrl": "https://web.archive.org/web/20070531101538/http://www.apify.com:80/",
    "timestampIso": "2007-05-31T10:15:38.000Z",
    "scrapedAt": "2026-05-01T00:47:14.231Z"
}
```

</details>

<details>
<summary><strong>🔁 Redirect snapshot returning HTTP 301</strong></summary>

```json
{
    "urlkey": "com,apify)/legacy-pricing",
    "timestamp": "20210914082041",
    "original": "https://apify.com/legacy-pricing",
    "mimetype": "text/html",
    "statusCode": 301,
    "digest": "RQXMCT3ULKLP3NVCWS6VLOTLSDJTPIXR",
    "length": 422,
    "snapshotUrl": "https://web.archive.org/web/20210914082041/https://apify.com/legacy-pricing",
    "timestampIso": "2021-09-14T08:20:41.000Z",
    "scrapedAt": "2026-05-01T00:47:14.890Z"
}
```

</details>

<details>
<summary><strong>📦 Asset snapshot of a CSS file</strong></summary>

```json
{
    "urlkey": "com,apify)/static/css/main.css",
    "timestamp": "20240412091134",
    "original": "https://apify.com/static/css/main.css",
    "mimetype": "text/css",
    "statusCode": 200,
    "digest": "PLHQR4N7ABCD1234XYZ5LPTH6789ABCDE",
    "length": 24588,
    "snapshotUrl": "https://web.archive.org/web/20240412091134/https://apify.com/static/css/main.css",
    "timestampIso": "2024-04-12T09:11:34.000Z",
    "scrapedAt": "2026-05-01T00:47:15.402Z"
}
```

</details>

---

## ✨ Why choose this Actor

| | Capability |
|---|---|
| 🆓 | **Free public source.** Reads the Internet Archive CDX endpoint, no auth needed. |
| 🕰️ | **Decades of history.** Archive starts 1996, with continuous coverage of major sites. |
| 📐 | **Match-type control.** Exact URL, prefix tree, host, or full domain in a single input. |
| 📅 | **Flexible date windows.** Year, month, day precision via `fromDate` and `toDate`. |
| 🔁 | **Unique-URL collapse.** One row per URL key when you only need a content map. |
| 🌐 | **Direct snapshot links.** Each row carries a ready-to-open Wayback URL. |
| 🛡️ | **Pagination handled.** CDX returns paged responses; the Actor walks them all. |

> 📊 The Internet Archive reports more than 800 billion web pages indexed across the Wayback Machine.

---

## 📈 How it compares to alternatives

| Approach | Cost | Coverage | Refresh | Filters | Setup |
|---|---|---|---|---|---|
| Manual CDX queries | Free | Full | Live | Manual | Engineer hours |
| Paid web archive APIs | $$$ subscription | Partial | Daily | Built-in | Account setup |
| Static archive dumps | Free | Snapshot only | Stale | None | Self-host parser |
| **⭐ Wayback Machine CDX Scraper** *(this Actor)* | Pay-per-event | Full | Live | Match type, dates, status, MIME | None |

Same CDX endpoint the Internet Archive itself exposes, wrapped in a clean filter UI.

---

## 🚀 How to use

1. 🆓 **Create a free Apify account.** [Sign up here](https://console.apify.com/sign-up?fpr=vmoqkp) and get $5 in free credit.
2. 🔍 **Open the Actor.** Search for "Wayback Machine CDX" in the Apify Store.
3. ⚙️ **Set your inputs.** Pick the URL or domain, match type, and any filters.
4. ▶️ **Click Start.** A 100-snapshot run typically completes in 10 to 40 seconds.
5. 📥 **Download.** Export as CSV, Excel, JSON, or XML.

> ⏱️ Total time from sign-up to first dataset: under five minutes.

---

## 💼 Business use cases

<table>
<tr>
<td width="50%">

### 📈 SEO & content recovery
- Recover deleted blog posts and product pages
- Audit historical redirect chains for migration QA
- Reclaim broken backlinks pointing to dead URLs
- Pull old metadata for content rebuild projects

</td>
<td width="50%">

### 🛡️ Brand & competitive
- Trace how a competitor's positioning evolved
- Document past marketing claims for legal review
- Detect domain ownership changes via WHOIS plus archive
- Monitor design and copy iterations across years

</td>
</tr>
<tr>
<td width="50%">

### ⚖️ Legal & compliance
- Collect evidence-grade snapshots of past pages
- Preserve disputed content before it disappears
- Track regulatory disclosure timelines on public sites
- Verify warranty or pricing terms at a specific date

</td>
<td width="50%">

### 📰 Journalism & OSINT
- Investigate deleted statements from public figures
- Pull historical versions of government pages
- Track edits to disputed Wikipedia-adjacent sources
- Cite stable timestamped URLs in reporting

</td>
</tr>
</table>

---

## 🌟 Beyond business use cases

Data like this powers more than commercial workflows. The same structured records support research, education, civic projects, and personal initiatives.

<table>
<tr>
<td width="50%">

### 🎓 Research and academia
- Empirical datasets for papers, thesis work, and coursework
- Longitudinal studies tracking changes across snapshots
- Reproducible research with cited, versioned data pulls
- Classroom exercises on data analysis and ethical scraping

</td>
<td width="50%">

### 🎨 Personal and creative
- Side projects, portfolio demos, and indie app launches
- Data visualizations, dashboards, and infographics
- Content research for bloggers, YouTubers, and podcasters
- Hobbyist collections and personal trackers

</td>
</tr>
<tr>
<td width="50%">

### 🤝 Non-profit and civic
- Transparency reporting and accountability projects
- Advocacy campaigns backed by public-interest data
- Community-run databases for local issues
- Investigative journalism on public records

</td>
<td width="50%">

### 🧪 Experimentation
- Prototype AI and machine-learning pipelines with real data
- Validate product-market hypotheses before engineering spend
- Train small domain-specific models on niche corpora
- Test dashboard concepts with live input

</td>
</tr>
</table>

---

## 🔌 Automating Wayback Machine CDX Scraper

Run this Actor on a schedule, from your codebase, or inside another tool:

- **Node.js** SDK: see [Apify JavaScript client](https://docs.apify.com/api/client/js/) for programmatic runs.
- **Python** SDK: see [Apify Python client](https://docs.apify.com/api/client/python/) for the same flow in Python.
- **HTTP API**: see [Apify API docs](https://docs.apify.com/api/v2) for raw REST integration.

Schedule daily, weekly, or monthly runs from the Apify Console. Pipe results into Google Sheets, S3, BigQuery, or your own webhook with the built-in [integrations](https://docs.apify.com/platform/integrations).

---

## ❓ Frequently Asked Questions

<details>
<summary><strong>📅 How far back does the data go?</strong></summary>

The Internet Archive started crawling in 1996. Many large sites have continuous coverage from then on; smaller sites were added later as the archive expanded.

</details>

<details>
<summary><strong>🔍 What is the difference between match types?</strong></summary>

`exact` matches one URL only. `prefix` matches a URL plus everything beneath it. `host` matches one hostname. `domain` matches the host plus all subdomains.

</details>

<details>
<summary><strong>🔁 What does uniqueOnly do?</strong></summary>

It collapses results by URL key, so you get one row per distinct URL instead of one row per capture. Useful when building a content map of a domain.

</details>

<details>
<summary><strong>🌐 Can I get the actual page content?</strong></summary>

Each row includes a `snapshotUrl` you can open in a browser to view the captured page. Pulling the rendered HTML in bulk is a separate workflow.

</details>

<details>
<summary><strong>📦 How many snapshots can I pull at once?</strong></summary>

Free plan caps at 10. Paid plans go up to 1,000,000. Very broad queries on busy sites can return millions of rows; always set a date window for those.

</details>

<details>
<summary><strong>🔠 How do I format the URL?</strong></summary>

Pass the bare domain (`apify.com`) or a URL prefix (`example.com/blog`). The CDX endpoint normalizes and splits the URL into a key automatically.

</details>

<details>
<summary><strong>📅 What date format does the API expect?</strong></summary>

YYYYMMDD or any prefix of it. `2020` matches everything in 2020. `202001` matches January 2020. `20200115` matches a specific day.

</details>

<details>
<summary><strong>💼 Can I use this for commercial work?</strong></summary>

Yes. The CDX index is part of the Internet Archive's public API surface. Always cite the Internet Archive when republishing snapshots.

</details>

<details>
<summary><strong>💳 Do I need a paid Apify plan?</strong></summary>

The free plan returns up to 10 snapshots per run. Paid plans return up to 1,000,000.

</details>

<details>
<summary><strong>⚠️ What if a run returns no rows?</strong></summary>

Most often the URL has not been crawled or is filtered out by status/MIME. Try with no status filter and a wider date window. [Open a contact form](https://tally.so/r/BzdKgA) and include the run URL if the issue persists.

</details>

<details>
<summary><strong>🔁 How fresh is the data?</strong></summary>

Live. Each run hits the Internet Archive CDX endpoint at run time.

</details>

<details>
<summary><strong>⚖️ Is this legal?</strong></summary>

Yes. The Internet Archive publishes the CDX index for exactly this kind of programmatic access. The Actor respects the published rate limits.

</details>

---

## 🔌 Integrate with any app

- [**Make**](https://apify.com/integrations/make) - drop run results into 1,800+ apps.
- [**Zapier**](https://apify.com/integrations/zapier) - trigger automations off completed runs.
- [**Slack**](https://apify.com/integrations/slack) - post run summaries to a channel.
- [**Google Sheets**](https://apify.com/integrations/google-sheets) - sync each run into a spreadsheet.
- [**Webhooks**](https://docs.apify.com/platform/integrations/webhooks) - notify your own services on run finish.
- [**Airbyte**](https://apify.com/integrations/airbyte) - load runs into Snowflake, BigQuery, or Postgres.

---

## 🔗 Recommended Actors

- [**🌐 Common Crawl Index Scraper**](https://apify.com/parseforge/common-crawl-index-scraper) - second-largest public web archive, complementary coverage.
- [**🅱️ Bing Search Scraper**](https://apify.com/parseforge/bing-search-scraper) - find current rank for the URLs you recover.
- [**🦆 DuckDuckGo Search Scraper**](https://apify.com/parseforge/duckduckgo-search-scraper) - alternative SERP signal alongside Wayback history.
- [**📚 Wikipedia Pageviews Scraper**](https://apify.com/parseforge/wikipedia-pageviews-scraper) - cross-reference brand mentions over time.
- [**🐙 GitHub Trending Repos Scraper**](https://apify.com/parseforge/github-trending-scraper) - track adjacent developer-attention shifts.

> 💡 **Pro Tip:** browse the complete [ParseForge collection](https://apify.com/parseforge) for more pre-built scrapers and data tools.

---

**🆘 Need Help?** [**Open our contact form**](https://tally.so/r/BzdKgA) and we'll route the question to the right person.

---

> Internet Archive and Wayback Machine are trademarks of Internet Archive, a 501(c)(3) non-profit. This Actor is not affiliated with or endorsed by Internet Archive. It uses only the public CDX index endpoint and respects all published rate limits.
