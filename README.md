# Deliverd Screen

**A pre-send check for every prompt.** Find and redact personal data, secrets
and your own confidential terms before text goes to an AI model.

- **Local.** No account, no key, no network call. The text never leaves your
  process.
- **Reversible.** Values become placeholders such as `[EMAIL_1]`, and
  `restore()` puts them back in the model's answer.
- **Everywhere you send text.** TypeScript, Python and Rust libraries, a CLI,
  a local MCP server, Vercel AI SDK middleware, a GitHub Action and a
  pre-commit hook, all running the same detectors against one shared set of
  test cases.
- **MIT.**

**Try it in your browser:** [deliverd.dev/screen](https://deliverd.dev/screen)
(it runs in the page and sends nothing).

```bash
npm install @deliverd/screen      # TypeScript
pip install deliverd-screen       # Python
cargo add deliverd-screen         # Rust
```

```ts
import { screen } from "@deliverd/screen";

const checked = await screen("Reply to mary.byrne@example.ie about IBAN IE29AIBK93115212345678");
checked.verdict; // "redact"
checked.text;    // "Reply to [EMAIL_1] about IBAN [IBAN_1]"

const answer = await model.generate(checked.text);
checked.restore(answer); // the real values, back in the answer
```

## What it finds

Email addresses, phone numbers, IBANs, payment card numbers (Luhn-checked),
UK National Insurance numbers, Irish PPS numbers (check character), US Social
Security numbers, IP addresses (v4 and v6), dates of birth, API keys and
tokens (AWS, GitHub, Slack, Stripe, Anthropic, OpenAI, Google, JWTs and more),
private keys, passwords in connection strings and `.env` files, words that
mark special-category data such as health or religion, and your own terms.

**Names need a model.** Patterns can't find people's names. Plug in a Hugging
Face token classifier, Presidio, or any model that returns spans; the package
READMEs show how.

## The four answers

| Verdict | What to do |
|---|---|
| `allow` | Send the text as it is. |
| `redact` | Send the text with placeholders in place of what the model may not receive. |
| `ask` | A person has to decide (special-category data, by default). |
| `deny` | Send nothing. Secrets are refused by default. |

## In CI: the GitHub Action

```yaml
- uses: actions/checkout@v4
- uses: deliverd-dev/deliverd-screen@v0
  with:
    paths: prompts/**/*.txt evals/*.jsonl
    terms: .screen-terms.txt   # optional: your own words, one per line
```

The job fails when anything is found. It prints the kinds and the counts,
never the values.

## Before a commit: pre-commit

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/deliverd-dev/deliverd-screen
    rev: v0.2.0
    hooks:
      - id: deliverd-screen
        files: ^(prompts|evals|fixtures)/
```

Point it at the files that end up in prompts. On a whole repository it will
rightly find every email address in your docs.

## For an agent: MCP and the skill

```bash
claude mcp add deliverd-screen -- npx -y @deliverd/screen mcp
```

One tool, `screen_text`, for Claude Code, Cursor, Codex or any MCP client. It
returns the verdict and the redacted text, never the values it replaced. The
`screen` skill in [deliverd-skills](https://github.com/deliverd-dev/deliverd-skills)
teaches an agent when to use it:

```bash
npx skills add deliverd-dev/deliverd-skills --skill screen
```

## Command line

```bash
cat prompt.txt | npx @deliverd/screen --redact   # the redacted text
npx @deliverd/screen --json notes.txt            # kinds and offsets, never values
npx @deliverd/screen --fail evals/*.jsonl        # exit 1 if anything is found
npx @deliverd/screen --terms clients.txt doc.md  # your own words, one per line
```

## Where the source is

The libraries are built and published, with provenance, from
[deliverd-dev/deliverd-sdk](https://github.com/deliverd-dev/deliverd-sdk):

| Package | Source | Registry |
|---|---|---|
| TypeScript, CLI, MCP, AI SDK middleware | [`packages/screen`](https://github.com/deliverd-dev/deliverd-sdk/tree/main/packages/screen) | [npm](https://www.npmjs.com/package/@deliverd/screen) |
| Python | [`packages/screen-python`](https://github.com/deliverd-dev/deliverd-sdk/tree/main/packages/screen-python) | [PyPI](https://pypi.org/project/deliverd-screen/) |
| Rust | [`packages/screen-rust`](https://github.com/deliverd-dev/deliverd-sdk/tree/main/packages/screen-rust) | [crates.io](https://crates.io/crates/deliverd-screen) |
| Shared test cases | [`packages/conformance/screening.json`](https://github.com/deliverd-dev/deliverd-sdk/blob/main/packages/conformance/screening.json) | |

This repository holds the GitHub Action, the pre-commit hook and this page.
Issues and ideas for any of them are welcome here.

## A net, not a certificate

Structured identifiers are found well. Names are found only as well as the
model you plug in. Redacted text about a person is still personal data under
GDPR. Use this to send fewer identifiers, never as proof that a prompt was
clean.

## When a person has to decide

A library can only tell you to stop. [Deliverd](https://deliverd.dev/screen)'s
Data Gate makes the call: the same detectors run on your machine and send only
the counts, the verdict comes from your organisation's policy and AI register,
an `ask` goes to the right person, and every check is recorded.

## Licence

MIT.
