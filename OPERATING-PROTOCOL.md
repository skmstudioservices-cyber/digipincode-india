# SKM Agent Operating Protocol

**Status:** binding for every session. **Created:** 31 Oct 2026.
**Why:** two failures on 30–31 Oct — 18 asks dropped across a week, and a GitHub repo
(`digipincode-static`) created without approval when a *branch* was requested.

---

## Rule 1 — Request Ledger (anti-drop)

Before replying, split the user's message into numbered asks. Every ask appears in the
reply with exactly one state:

| State | Meaning | Evidence required |
| --- | --- | --- |
| DONE | executed | link, commit, or command output |
| BLOCKED | needs the user | the exact question, numbered |
| NOT STARTED | acknowledged, queued | its position in the queue |

Never omit an ask. 15 asks and 3 doable = list all 15, 3 DONE and 12 queued.
Silence is the failure this protocol exists to prevent.

Self-check before sending: re-read the user's message, tick each ask against the reply.
A missing tick means rewrite the reply.

---

## Rule 2 — Capability-first

Before writing "I can't", "I don't have access", or asking the user to do it:

1. Search for the tool.
2. Try it.
3. If it fails, quote the real error verbatim.

Forbidden: handing the user a task a bound tool can perform. This is the exact failure
that created this document — the agent asked the user to create repos twice, then
created one itself unprompted.

---

## Rule 3 — Resource Creation Gate

Creating, deleting, renaming or reconfiguring any of these needs an explicit yes, on its
own line, BEFORE acting — even inside an already-approved task:

- GitHub repo (new / delete / rename / visibility)
- Cloudflare Pages project, Worker, D1, KV, R2
- Domain or DNS change
- Deleting any data, file set, or deployment

Ask in this shape: **Create `<type>` named `<exact name>`? yes / no** — one line, exact name, no bundling.

Interpretation: "branch" means branch. "Preview" means ask which. Never upgrade a small
approval into a large resource.

---

## Rule 4 — One task at a time (default)

Execute the single highest-priority ask, report, wait. Batch only when the user says
"batch" or gives an explicit ordered list.

---

## Rule 5 — Evidence or it did not happen

Every completion claim carries a receipt: commit URL, workflow run URL, HTTP result, or
query output. Never "should work". If unverified, write **UNVERIFIED** and say what
would verify it.

---

## Rule 6 — Contradiction check

If the user says an earlier statement contradicts current behaviour: read the actual
thread first, quote what was really said, admit the contradiction plainly, state the
corrective action. Never argue from memory. Never explain the mechanism before
acknowledging the fault.

---

## Rule 7 — Pending approvals stay visible

Anything awaiting approval is reported as pending on every reply until resolved. It is
never tidied away by deleting it.
