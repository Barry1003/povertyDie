# Poverty Die — immersive 3D design

This implementation applies selective 3D rather than turning the financial dashboard into a game.

## Where it appears

| Location | 3D treatment | Why |
| --- | --- | --- |
| Google sign-in | Gold coin stacks, shared-member orbit and emerald core | Introduces the collective-wealth identity |
| Group overview hero | Small background sculpture behind the textual group totals | Adds warmth without replacing values or graphs |
| Onboarding | Large scene with orbit motif | Communicates membership and shared ownership |
| Contribution claim submitted | A short, decorative sparkles variant | Acknowledges claim submission **only** — not payment verification or investment returns |
| Member list and account avatar | Deterministic CSS 3D-style characters | Distinct identity without an individual WebGL canvas for every row |

## Architecture

- `src/components/3d/wealth-scene.tsx`: the actual WebGL geometry built with React Three Fiber v9, Drei v10 and Three.js.
- `src/components/3d/immersive-wealth.tsx`: dynamically imports the heavy canvas **client-side only**, activates it only while visible, checks for WebGL, data saver, small screen size, and reduced-motion preference, and provides a static fallback.
- `src/components/identity/character-avatar.tsx`: deterministic avatar appearance from member name (demo) or user-specific seed (real Neon-authenticated viewer).
- `src/styles/immersive.css`: responsive layout, decorative fallbacks, accessible interactions and avatar styling.
- `src/app/layout.tsx`: imports the immersive style file.
- `src/App.tsx`: integration in overview, onboarding and payment-claim confirmation.
- `src/app/sign-in/page.tsx`: integration with existing Neon Auth sign-in.

No external GLB models, image hosting keys, rendering API keys, or third-party asset licenses are needed. All geometry and colors are programmatically created.

## Performance and accessibility

- All 3D scenes are decorations with `aria-hidden`. Data, progress and actions remain ordinary HTML.
- 3D uses lower-power WebGL with capped pixel ratio `dpr={[1, 1.5]}`.
- Scenes are unmounted outside of the viewport; most screens have no WebGL canvas at all.
- Static fallbacks render when WebGL is unavailable, `prefers-reduced-motion` is enabled, the viewport is 480px or smaller, or Save-Data mode is on.
- A render error boundary avoids a decorative scene bringing down the interface.
- Small 3D-inspired avatars use CSS instead of dozens of WebGL contexts.
- Motion is subtle; no audio, automatic camera travel or flashing effects.
- The existing accounting charts and tables remain 2D and do not use shaders.

## Review checklist

1. `npm install`, `npm run typecheck` and `npm run build`.
2. Desktop: log in through Neon Auth and confirm sculpture appears within the sign-in hero and group overview.
3. Under 480px: confirm the light fallback, login button and member navigation remain usable.
4. Enable browser/emulator “Reduce motion” and confirm static illustration only.
5. Test with WebGL disabled / low-power browser: pages should still load and function.
6. Navigate off the overview and back: ensure canvas unmounts and reappears.
7. Open Settings → Onboarding; verify orbit scene and text example don't collide.
8. Advance simulated contribution claim to completion; check the message still says pending independent verification.
9. Test keyboard navigation: decorative 3D should never intercept buttons or focus.
10. Verify no fake or sample financial figure is represented as real data.

### Limitations

The current investment values and group records are sample data from the original Figma prototype. The design does **not** implement Neon-backed contributions, group profit calculation, custody, investment approvals, or an audited ledger. Do not use the prototype to transact funds.

A future “customize my character” screen can store avatar appearance options in `profiles`. Right now avatars are generated from stable seeds and aren't user-editable.
