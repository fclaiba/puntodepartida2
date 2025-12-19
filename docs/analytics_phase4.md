# Analytics Panel – Phase 4 Update

This round of work extends the admin analytics experience with audience segmentation, engagement depth and sharing metrics pulled in real time from Convex. Share this summary (and the proposed capture list) with product or stakeholders during validation sessions.

## What’s New

- **Registered vs guest split** (last 30 days). Data comes from `reading_sessions.readerType`. We render the absolute counts and the percentage mix, plus a banner when the sample is too small (&lt;10 sessions).
- **Reading time KPIs** sourced from `reading_sessions.durationSeconds` and `progressPercent`:
  - Average, median and P90 reading time.
  - Completion rate (sessions with ≥80 % progress or ≥4 min).
  - Sample-size notice when fewer than 5 sessions report duration.
- **Share rate & top channels** using `share_events`:
  - Share rate = shares ÷ sessions (in %).
  - Total shares and sessions evaluated.
  - Top five channels with relative contribution.
  - Estimate flag when there are &lt;10 sessions or &lt;3 share events.
- **Daily views filter** so reviewers can swap between 7-day and 30-day trends without reloading data.
- **Admin dashboard highlights**: quick cards now surface the new reading-time and share KPIs, plus a unique-readers tile in the secondary stats row.

## Empty / Estimated States

- Audience section shows an empty state when no sessions exist; otherwise, a dashed-warning chip appears when the slice is <10 sessions.
- Reading time panel displays guidance when no sessions track duration; the warning chip appears when the sample is <5.
- Share card shows an empty message with integration tips when there are zero share events; the caution message appears for low sample.
- The legacy “views estimated” banner remains if no article views were recorded yet.

## Validation & Capture Checklist

Use this list when preparing artifacts for stakeholders:

1. **Overview stats row** (screenshot) – include the trend badge on “Vistas del Mes” and the total article count card.
2. **Audience distribution card** – capture both the stacked bar and the unique-readers badge; if possible, show one run with the “datos estimados” banner active.
3. **Reading time card** – capture the average/median/p90 grid plus completion rate text. Note the warning pill when the sample is low.
4. **Share metrics card** – show the share rate chip and at least one channel breakdown (or the empty-state message if no shares).
5. **Daily views module** – grab two screenshots, one per range selector (7 d vs 30 d) to confirm behaviour.
6. **Admin dashboard** – capture the updated secondary stats row and the new reading/share gradient tiles.

> Tip: for clean captures, switch the page to light mode, toggle the range selector, and use the browser’s “device pixel ratio 2” option to keep text crisp.

## Notes for QA

- All aggregates use the last 30 days, matching `HISTORY_DAYS` in `convex/analytics.ts`. Update that constant if business requirements change.
- Share rate and reading time deliberately return `null` when the denominator is zero; the UI maps that to “Sin datos”.
- When injecting sample data manually, prefer the Convex dashboard or the `tracking` hooks (`useEngagementTracker`) so sessions and shares stay consistent.


