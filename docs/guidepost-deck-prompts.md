# Guidepost: Embedding the Pitch Deck in the React App

A sequential prompt series for Claude Code. Goal: convert the existing
GuidePost React app into a hybrid that serves both the prototype AND a
9-slide pitch deck, with the live prototype embedded inside the demo slide.

## How to use

- **Run prompts in order.** Each builds on the previous step.
- **Don't combine prompts.** Pause after each one, verify the result, then
  move on. Combined prompts cause drift on multi-step ports.
- **Commit between prompts.** Each prompt is a checkpoint. If something
  goes sideways, roll back rather than fix forward.
- **Have `guidepost-pitch-deck.html` ready to attach** when you reach
  Prompt 3 — it's the visual spec for the port.
- **Stack assumptions** (confirmed via Prompt 1):
  - React 19 + Vite, plain CSS, no router
  - Existing view-switcher pattern in `App.tsx` with `'landing' | 'chat'`
  - .NET backend on `/api` via Vite proxy

---

## Prompt 1 — Reconnaissance ✅ (already done)

```
I'm going to convert this React app into a hybrid: it should serve as both
the existing prototype AND a presentation deck, with the prototype embedded
inside one of the slides.

Before writing any code, I want you to:

1. Tell me the routing setup: what router (if any), what routes exist, and
   where the main entry point is (App.tsx, main.tsx, etc).
2. Tell me the styling approach: Tailwind, CSS modules, plain CSS, styled
   components, etc. List the key fonts, colours, and design tokens currently
   in use.
3. Tell me the build tool (Vite, CRA, Next, etc) and how dev/build are run.
4. List the top-level dependencies in package.json relevant to UI rendering
   (React version, router, styling, animation libs, etc).

Don't propose changes yet. Just report.
```

---

## Prompt 2 — Set up the deck view

Adds a third view alongside `landing` and `chat`. No router added — the
app's existing pattern is small enough that adding React Router would be
over-engineering.

```
I want to add a presentation deck to this React app. The deck is a separate
view that lives alongside the existing landing/chat views.

Use the existing view-switching pattern in App.tsx — do NOT add a router
library. Extend the View type to include 'deck':

  type View = 'landing' | 'chat' | 'deck';

Please:

1. Create `src/deck/` folder. Inside it:
   - `Deck.tsx`: container that manages slide state and keyboard, click,
     and swipe navigation across slides.
   - `slides/` subfolder with one file per slide: `Slide01Hook.tsx`,
     `Slide02Problem.tsx`, etc. — empty placeholder files for now.
   - `DeckChrome.tsx`: the bottom nav pill with prev/next + counter, and
     the lime progress bar across the top.
   - `Deck.css`: deck-only styles. Use plain CSS to match the rest of
     the codebase (no Tailwind, no CSS modules). Scope every selector
     under a top-level `.deck-root` class so styles can't leak into the
     landing or chat views.
2. Wire it into App.tsx: when `view === 'deck'`, render <Deck />.
   Otherwise render the existing landing/chat as today.
3. Add a hidden keyboard shortcut: pressing 'D' anywhere in the app
   should set view to 'deck'. Pressing Escape from the deck should set
   view back to 'landing'. Don't add visible buttons for this — it's a
   presenter shortcut, not a user feature.
4. Render a single placeholder slide ("Hello deck") so I can verify the
   deck view works end-to-end before we build the real slides.

Don't migrate any deck content yet — that's the next prompt.
```

**Verify before moving on:** press `D` from the landing screen. Deck
placeholder shows. Press `Esc`, back to landing. Refresh page, landing
still works normally.

---

## Prompt 3 — Port the deck content

**Attach `guidepost-pitch-deck.html` to this prompt.** It's the visual
spec — Claude Code should treat it as the source of truth and not
"improve" anything.

```
Attached is `guidepost-pitch-deck.html` — the standalone HTML version of
the deck I want to port. Convert it into the React `Deck` component we
scaffolded.

Rules:

1. Each slide is its own component in `src/deck/slides/`. Match the slide
   ordering in the HTML file (Hook → Problem → Solution → Coverage →
   Demo → Moat → Business Model → Flywheel → Title).
2. Preserve ALL visual treatments exactly: photo backgrounds with their
   gradient overlays, font sizing in vmin, lime accent (#DCFF54), Fraunces
   + Geist + JetBrains Mono fonts, slide chrome (corner labels, brand
   marks).
3. Use plain CSS only — no Tailwind, no CSS-in-JS. Add styles to
   `Deck.css`. Every selector must be scoped under `.deck-root` so it
   can't affect the existing landing/chat views.
4. The Google Fonts import is already in App.css — reuse the loaded
   fonts, don't re-import.
5. The GuidePost SVG logo: extract it into `src/deck/Logo.tsx` as a
   reusable React component. Use it everywhere the HTML uses
   `<use href="#gp-logo"/>`.
6. The flywheel diagram on the Flywheel slide is a hand-tuned SVG with
   five quadratic bezier arcs. Port it verbatim — do NOT regenerate
   the geometry.
7. Slide 5 (Demo) should be a placeholder for now — render a centered
   div that says "Demo embed goes here". We'll wire in the prototype
   in the next step.
8. Photo background: import the image as a Vite asset
   (`import bgImage from './assets/bg.jpg'`), don't reference filesystem
   paths or base64-encode it inline.
9. Keyboard nav (arrow keys, Home, End, Space), click-edge nav, and
   touch swipe should all work as in the HTML version.
10. Important: keyboard event handlers should only activate when
    view === 'deck', so they don't interfere with the landing/chat
    views. Use a useEffect with cleanup.

Build it slide-by-slide. After each slide, pause and let me check it
looks right before moving to the next.
```

**Verify before moving on:** flip through every slide. Compare side-by-side
with the HTML reference. Don't accept "close enough" on the flywheel —
the curve geometry was tuned by hand and any regenerated version will
look subtly wrong.

---

## Prompt 4 — Embed the prototype in slide 5

The biggest step. Without React Router, this is actually easier — the
prototype's components render directly inside the slide.

```
On slide 5 (the Demo slide), replace the placeholder with the actual
prototype.

The prototype is the existing landing/chat experience that lives in the
non-deck views. I want it embedded inside the slide so the audience sees
the real thing running.

Implementation:

1. Refactor the existing landing+chat UI into a self-contained component
   — call it `PrototypeApp` — that owns its own internal view state
   ('landing' | 'chat'). Move the existing landing/chat logic out of
   App.tsx into `PrototypeApp.tsx`. App.tsx should now be:

     - if view === 'deck', render <Deck />
     - else, render <PrototypeApp />

   The point: PrototypeApp must work standalone, taking no props, and
   not relying on App.tsx's view state to function.

2. On slide 5, render <PrototypeApp /> inside a phone-shaped frame:
   black bezel, rounded corners (~4vmin), notch at top, sized to roughly
   78vh tall with aspect ratio 0.51. Match the styling of the mini-phone
   in the HTML deck.

3. Centre the framed phone horizontally and vertically on the slide.
   The dim photo background should still be visible behind it.

4. Critical: the prototype was designed for full-viewport rendering.
   Scope its styles so they only apply inside the phone frame. Wrap
   the embedded instance in a CSS containment context (e.g. a div with
   `contain: layout style`, `overflow: hidden`, fixed dimensions) so
   anything inside that uses `100vh`, `100vw`, fixed positioning, or
   absolute positioning stays inside the frame.

5. The /api proxy should still work — the embedded prototype will hit
   the .NET backend exactly as it does in standalone mode. Don't mock
   the API.

6. Pointer events (clicks, scrolls, typing, focus) must reach the
   embedded prototype normally. If the deck's keyboard navigation
   listeners interfere with input fields inside the prototype, scope
   the deck listeners to only fire when the active element is NOT
   inside the phone frame (check `event.target` is not a descendant
   of the embed wrapper).

Don't touch the prototype's internal logic. The refactor is purely
structural — move components around, don't change what they do.
```

**Watch for:** the prototype probably has CSS rules like
`body { ... }` or styles assuming `100vh` viewport sizing. The fix lives
in the deck's wrapper isolation (step 4), not in the prototype's components.
Push back if Claude Code wants to "fix" the prototype to make it embed-friendly.

**Verify before moving on:** click around inside the embedded phone on
slide 5. Send a test message in the chat. Make sure arrow keys navigate
the deck when focus is outside the phone, but type normal characters
when focus is inside an input.

---

## Prompt 5 — Polish and ship

```
Now that the deck and embedded prototype are working, please:

1. Add a "Press D for deck mode / Esc to exit" hint that appears briefly
   on app load if the user is on the prototype routes — pressing D should
   navigate to /deck.
2. On /deck, pressing Esc should navigate back to the prototype root.
3. Verify the deck renders correctly at common projector resolutions:
   1920x1080, 1366x768, and 2560x1440. Adjust any vmin sizing that
   breaks legibility on the smallest size.
4. Add a print stylesheet so `Cmd+P` on /deck produces one slide per
   page in landscape. Hide the chrome (nav, progress bar) when printing.
5. Double-check that running `npm run build` produces a working
   production bundle and that /deck works in it.
```

---

## Safety net: things to push back on

Claude Code will sometimes drift toward "improvements" you didn't ask for.
Specific things to watch for:

- **Regenerating the flywheel SVG geometry.** Reject. The five arcs were
  tuned by hand. Restore from `guidepost-pitch-deck.html` if it changes.
- **Adding Tailwind / CSS-in-JS.** Reject. The codebase is plain CSS.
- **Adding React Router.** Reject unless you explicitly want it.
- **"Refactoring" the prototype to make it embed better.** Reject. The
  embed isolation is the deck's job, not the prototype's.
- **Replacing photo backgrounds with gradients or solid colours** because
  it's "easier". Reject. The market scene photo is part of the brand.
- **Reducing animations or transitions** "for performance". Reject unless
  you measured a real problem.

If a step goes badly wrong, the recovery path is `git reset` + a tighter,
more constrained version of the prompt that called out specifically what
not to do.
