<!-- A filled-in knowledge skill, as a worked example. Copy its shape, not its topic. -->
---
name: js-dates
description: Rules and known traps for dates and time zones in JavaScript, so that Claude does not repeat known mistakes. Use when writing or changing code that parses, formats, compares or adds dates.
---
Claude knows the basics of `Date`. This page lists only the traps and rules that cause real bugs.

## Pick the approach

| Task | Do this |
|---|---|
| Parse a date from an API | Parse only ISO 8601 text that ends in `Z` or an offset, for example `2026-10-18T10:00:00Z`. Do not parse other formats with `new Date(text)`. |
| Show a date to a user | Use `Intl.DateTimeFormat` with the user's locale and an explicit `timeZone`. |
| Add days or months | Use the UTC methods, for example `setUTCDate(d.getUTCDate() + 1)`. |

## Traps

- **Month numbers start at 0.** `new Date(2026, 1, 1)` is 1 February, not 1 January. Reason: the failure looks like a result that is one month off.
- **A date without a time is read as UTC.** `new Date("2026-10-18")` is midnight UTC, so users west of London see 17 October. A date with a time and no offset is read as local time. Reason: the failure looks like a day that is wrong for some users only.
- **A day is not always 24 hours.** On the days when the clocks change, a local day has 23 or 25 hours. Reason: adding `86400000` ms moves the time by one hour.

## Rules

- Store and send times as UTC ISO 8601 text. Convert to a local time zone only when you show it.
- Run tests with `TZ=UTC`, so that they give the same result on every machine.

## Gotchas

- A test passed on a laptop in London and failed in CI, because CI runs in UTC. Set the time zone in the test command, not in the test.
