# Finding candidates

Research notes. **Nothing described here produces a publishable entry.** These
are ways to find names worth investigating; the investigation is manual and the
standard is in [POLICY.md](../POLICY.md).

## Wikidata

The most structured starting point. People with `occupation: computer
programmer` (`Q5482740`) and a recorded date of death (`P570`):

```sparql
SELECT ?person ?personLabel ?death ?github WHERE {
  ?person wdt:P106 wd:Q5482740 ; wdt:P570 ?death .
  OPTIONAL { ?person wdt:P2037 ?github }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY DESC(?death)
LIMIT 300
```

Run against `https://query.wikidata.org/sparql` with
`Accept: application/sparql-results+json`. Keep queries lean — the public
endpoint times out at 60 seconds and several `OPTIONAL` blocks is enough to
exceed it.

Related occupation IDs worth querying separately rather than in one union:
`Q82594` (computer scientist), `Q1622272` (university teacher),
`Q11513337` (software engineer).

### What the data actually looks like

As of the first survey: roughly 300 results for `programmer` alone, running at
15–20 recorded deaths per year since 2005. Only about **10 of 300** had a GitHub
handle recorded — so GitHub is a weak signal and cannot be the organising axis
of this project.

Data quality varies a lot. Some records have no English label at all, only a Q
number. Some have a death date and nothing else.

### The important caveat

**Wikidata is user-editable and is not evidence.** Records get vandalised,
mistaken, and confused between people with similar names. A death date in
Wikidata is a *lead*: follow the item's references to the underlying source and
cite that source, not the wiki.

Treat a Wikidata date as unconfirmed until two independent primary sources say
the same thing. If the item has no references, it is worth nothing here.

## Other places to look

- **Project announcements.** Mailing list posts, `IN MEMORIAM` commits, a
  pinned issue on a repository. Often the earliest and most reliable notice for
  someone not famous enough for an obituary.
- **Hacker News and lobste.rs archives.** Threads titled "X has passed away"
  usually surface the primary source in the first few comments. The thread is
  not the source; the link inside it is.
- **Employer and university pages.** Institutions publish notices that stay
  online for years.
- **Existing memorial lists.** Useful as an index of names. Never citable —
  including by other people citing *us*.

## What we deliberately do not do

- No scanning for inactive accounts, dormant repositories, or unanswered
  issues. This would be the obvious thing to automate and it is precisely the
  thing that must never be automated.
- No inferring death from a profile changing, a bio being edited, or an account
  being deleted.
- No contacting families to ask whether someone has died.

## Working with a candidate list

Keep it out of `people/`. A candidate is a name and a lead, and it stays that
way until someone has done the work. If you keep a working list, keep it in a
scratch file outside the repository — a half-checked list of names sitting in
git history is exactly the kind of thing that gets mistaken for a conclusion.
