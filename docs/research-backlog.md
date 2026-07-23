# Mon or Mon Research Backlog

This document tracks product, API, legal, and architecture questions that should be resolved before the game grows beyond its current MVP.

## Status

- `Open`: research or a product decision is still required.
- `Ready`: enough information exists to implement the item.
- `Deferred`: intentionally postponed.
- `Done`: the question has been resolved and the outcome documented.

## Current decisions

- Keep the current frontend simple.
- Continue using PokeAPI and Digi-API for the MVP.
- Target a public, non-commercial, educational portfolio demo.
- Optimize the project for demonstrating engineering decisions rather than attracting or monetizing players.
- Do not assume that API access grants permission to use character names, artwork, or trademarks.
- Explore a thin backend as a deliberate full-stack learning step.
- Keep accounts, global leaderboards, monetization, and a database out of the first backend iteration.
- Automated tests are intentionally deferred for the current iteration.

## Research backlog

| ID    | Priority | Status | Topic             | Question or outcome needed                                                                                                                | Next action                                                                                                                 |
| ----- | -------- | ------ | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| R-001 | P0       | Done   | Distribution goal | The target is a public, non-commercial, educational portfolio demo. It is not intended to attract players or generate revenue.            | Keep this positioning visible in the README and deployed application.                                                       |
| R-002 | P0       | Open   | Pokémon rights    | Are the Pokémon names and images permitted for the chosen distribution model?                                                             | Review the official Pokémon guidance and obtain qualified legal advice or permission before a public or commercial release. |
| R-003 | P0       | Open   | Digimon rights    | Are the Digimon names and images permitted for the chosen distribution model?                                                             | Identify the relevant Bandai terms or permission process and do not treat Digi-API as a rights grant.                       |
| R-004 | P1       | Ready  | Backend direction | Use a thin backend to learn full-stack development and improve provider isolation, response validation, caching, and stale-data fallback. | Define one round endpoint and its cache behavior before selecting a platform or framework.                                  |
| R-005 | P1       | Open   | Creature catalog  | Should creatures be loaded from live APIs, a build-time catalog, or a backend endpoint?                                                   | Decide after R-004. Prefer a static validated catalog if live freshness is not required.                                    |
| R-006 | P1       | Open   | API resilience    | What should happen when an API response changes or an image fails to load?                                                                | Define a limited retry and automatic creature replacement policy.                                                           |
| R-007 | P1       | Open   | Game balance      | Should alternate forms, recolors, fusions, and very obscure creatures appear at the same frequency as base forms?                         | Define an initial curated pool and optional difficulty levels.                                                              |
| R-008 | P2       | Open   | Privacy           | Will the game collect analytics, accounts, IP-derived data, or persistent identifiers?                                                    | Create a privacy checklist before adding analytics or backend persistence.                                                  |
| R-009 | P2       | Open   | Operations        | What availability and monitoring are required for a public release?                                                                       | Define expected traffic and add lightweight API/schema monitoring only when needed.                                         |

## Small experience improvements

These changes do not require a backend and can be implemented independently.

| Order | Status   | Improvement                                          | Expected value | Effort          | Notes                                                                                       |
| ----- | -------- | ---------------------------------------------------- | -------------- | --------------- | ------------------------------------------------------------------------------------------- |
| 1     | Done     | Avoid repeated creatures during the current session  | High           | Small           | Keep the 50 most recently shown creature keys and retry duplicates up to five times.        |
| 2     | Open     | Preserve the best streak locally                     | Medium         | Small           | Use local storage; no account is required.                                                  |
| 3     | Done     | Format creature names for display                    | Medium         | Small           | Convert API names such as `mr-mime` into user-facing text without changing API identifiers. |
| 4     | Done     | Automatically replace a creature with a broken image | High           | Small           | Try up to two replacement creatures before showing the manual recovery state.               |
| 5     | Open     | Load each API catalog once per session               | High           | Small to medium | Reduces repeated requests and makes local de-duplication easier.                            |
| 6     | Deferred | Preload the next creature image                      | Medium         | Small           | Wait until catalog loading is decided so preloading does not waste API requests.            |

The first experience-improvement slice was completed without committing the project to a backend or a new data architecture.

## Backend decision guide

A backend is justified when at least one of these becomes a real requirement:

- Global leaderboards or shared statistics.
- User accounts and cross-device progress.
- A globally consistent daily challenge.
- Server-controlled creature pools or difficulty.
- Protection of third-party API credentials.
- Central caching, validation, or fallback across data providers.
- Moderation, anti-cheat, or administrative tools.

A backend is not required only to persist a best streak, prevent session repeats, format names, or serve a static creature catalog.

Possible directions:

1. **No backend:** static frontend plus a validated catalog generated during the build. This is the simplest current option.
2. **Thin backend:** one cached creature endpoint that hides providers and validates their responses. Use this when API control becomes the first concrete requirement.
3. **Application backend:** accounts, leaderboards, daily challenges, and administrative features. Consider this only after those product requirements exist.

The selected direction is a thin backend for learning. Its first iteration should:

- Expose one endpoint for a game round.
- Normalize PokeAPI and Digi-API into the existing creature model.
- Cache provider responses and allow a stale catalog fallback.
- Keep provider-specific details out of the frontend.
- Avoid user accounts, rankings, analytics, and persistent player data.

Do not select a backend vendor until the endpoint contract and cache behavior are documented.

## Reference material

- [PokeAPI REST documentation](https://pokeapi.co/docs/v2)
- [PokeAPI sprite license](https://github.com/PokeAPI/sprites/blob/master/LICENCE.txt)
- [Official Pokémon guidance about image and material use](https://support.pokemon.com/hc/en-us/articles/360000634094-Can-I-use-Pok%C3%A9mon-images-or-materials)
- [Digi-API documentation and ownership disclaimer](https://digi-api.com/)

## Review log

| Date       | Change                                                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 2026-07-23 | Completed recent-creature deduplication, Pokémon name formatting, and automatic replacement of broken images.                      |
| 2026-07-23 | Set the target to a public, non-commercial portfolio demo and selected a thin backend as the next architecture learning direction. |
| 2026-07-23 | Initial research backlog created. Automated tests explicitly deferred.                                                             |
