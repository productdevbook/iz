# Verification Policy

This document is the core of the project. Everything else is implementation detail.

`iz` records people who have died. Getting that wrong is not a bug — it is a
harm done to a living person and to a grieving family. The policy below is
deliberately strict, and it is not negotiable for the sake of growing the list
faster.

## The one rule

**No entry is published without at least two independent primary sources
confirming the death, reviewed by a human.**

Nothing is automated into publication. Tools may *suggest*; only a maintainer
merges.

## What counts as a primary source

A primary source is one where the information originates from someone with
direct knowledge:

| Source | Example |
| --- | --- |
| Family statement | A post by a spouse, child, sibling, or parent |
| Official death notice | Funeral home listing, newspaper obituary, government record |
| Employer or institution | Company blog post, university announcement |
| Project announcement | Maintainer's post to a mailing list, a GitHub issue, an `IN MEMORIAM` commit |
| Established news outlet | An obituary with a named reporter, not an aggregator |

Two sources are **independent** when neither is repeating the other. A news
article that cites a family blog post is *not* independent of that blog post —
together they count as one.

## What does NOT count as evidence

- **Inactivity.** No commits for months or years means nothing. People change
  jobs, burn out, move to private repositories, get sick, have children, go to
  prison, or simply lose interest. Inactivity is not death and must never be
  treated as a signal.
- A GitHub profile with `RIP` in the bio, absent other confirmation.
- A single social media post from someone who is not family, an employer, or a
  project maintainer.
- Wikipedia, Wikidata, or any wiki, on its own. These are useful for *finding*
  candidates and for locating their underlying citations, but the citation is
  the source — not the wiki page.
- Another memorial list, including this one.
- An AI-generated summary of any kind.

## Automated discovery

Tooling in `scripts/` may query public datasets to build a queue of candidates.
This queue is a research aid. Candidates carry no status and are never rendered
on the site. A candidate becomes an entry only when a human has located the
primary sources and opened a pull request.

## Review process

1. Someone opens a pull request adding a file under `people/`.
2. CI validates the schema and confirms at least two sources are present. CI
   cannot judge whether the sources are *good* — that is the reviewer's job.
3. A maintainer opens every source link and confirms:
   - each one loads and says what the entry claims it says
   - the sources are independent of each other
   - at least two are primary
   - the person's identity matches (not a name collision)
4. Only then is it merged.

When in doubt, the entry stays out. An empty slot costs nothing. A wrong entry
costs a family something we cannot give back.

## Removal

**Any request from a family member to remove an entry is honoured, immediately
and without argument.** No justification is required, no appeal is made, no
public explanation is posted. Open an issue using the removal request template
or email the address in `README.md`, and it is done.

The same applies to requests to correct details, remove a photograph, or reduce
an entry to a name and dates only.

This policy is not a courtesy we may withdraw. It is a condition of the project
existing at all.

## Photographs

A photograph is included only when it is confirmed to be freely licensed or
explicitly permitted by the family or copyright holder. The permission is
recorded in the entry. When in doubt, no photograph — an entry without an image
is perfectly fine.

## Tone

Entries state what the person built and what it meant. They do not speculate
about their death, their health, or their private life.

**Cause of death is not recorded.** Not when it is public, not when it is in
every obituary, not when the person is famous for it. This is a record of what
people made, and how someone died is not what they made. A family reading an
entry should find their person described by their work.

The date of death is recorded because the entry cannot exist without it. That
is the only detail about the death that belongs here.

This extends to circumstances around a death — a legal case, an illness, a
conflict, a hard last year. Where such a thing is genuinely inseparable from
the person's public work, describe the work; do not narrate the ending.
