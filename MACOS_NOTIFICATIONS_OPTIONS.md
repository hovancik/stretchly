# macOS notifications: options after Electron 42 (UNNotification)

Investigation summary for [#1851](https://github.com/hovancik/stretchly/issues/1851)
(Break Notification stopped showing on macOS Sequoia 15.7, Stretchly 1.22.1).

## Background

Starting with Electron 42, macOS notifications use Apple's `UNNotification` API
([electron/electron#47817](https://github.com/electron/electron/pull/47817)).
Unlike the deprecated `NSUserNotification` API it replaced, **UNNotification
requires the app bundle to be code-signed**. Electron documents that unsigned
apps emit a `failed` event on main-process `Notification` objects and do not
display notifications
([Electron docs](https://www.electronjs.org/docs/latest/api/notification),
[release notes v42.0.0](https://releases.electronjs.org/release/v42.0.0)).

Stretchly's release workflow has no signing identity configured, and
`build.mac` does not set one. With no suitable certificate in the runner's
keychain, electron-builder skips app-bundle signing. This is inferred from the
configuration; the released DMG's signatures have not been inspected here.
Stretchly 1.22.1 resolves Electron 43.4.0 in `package-lock.json`; issue reports
identify the regression in the 1.22.x releases, but the exact app release where
it began has not been isolated. In
[#1851](https://github.com/hovancik/stretchly/issues/1851), a later reporter
says removing quarantine did not help and notifications returned after
reinstalling 1.21.0. This supports a regression associated with the newer
release, but does not by itself prove code signing is the only cause.

The issue reporter also says Stretchly no longer appears under
**System Settings > Notifications**. That may be related to authorization, but this
observation does not establish the cause. Stretchly logs each attempt
(`Stretchly: showing ... notification`),
but currently handles no notification failure event. The renderer Web
Notifications API does define an `error` event; Stretchly does not register an
`onerror` handler, and whether Electron emits it for this specific macOS failure
needs testing. Electron's main-process `Notification` class documents a
`failed` event.

Current state of the relevant code:

- Notifications are created from the renderer web API in
  `app/process-renderer.js` (`new Notification(...)`), triggered by
  `showNotification()` in `app/main.js`. It does not register `Notification.onerror`.
- Release builds run on GitHub Actions `macos-latest` with electron-builder
  (`^26.15.7` in `package.json`, resolved to 26.15.7 in `package-lock.json`)
  and no `CSC_*` signing variables. The build config has no `mac.identity`;
  with no certificate or identity, electron-builder
  skips app-bundle signing. The implicit ad-hoc fallback introduced for
  arm/universal builds by
  [#9007](https://github.com/electron-userland/electron-builder/pull/9007)
  was removed in v26.15.0 by
  [#9822](https://github.com/electron-userland/electron-builder/pull/9822).
  Setting `mac.identity: "-"` explicitly opts into ad-hoc signing. The
  notification behavior of Stretchly's resulting release artifacts has not yet
  been tested on a Mac.
- The Homebrew tap (`hovancik/homebrew-stretchly`) redistributes the release
  DMG as-is; its cask and tap README only *document* the manual `xattr`
  quarantine fix.

Note: switching from the renderer Web Notification to Electron's main-process
`Notification` class does **not** avoid the signing requirement; both use
macOS notifications. The main-process class does expose the documented `failed`
event. The renderer API's `error` event exists, but its behavior for this Electron
failure needs verification (see Option 3).

---

## Option 1 - Ad-hoc sign app bundles in release DMGs (stretchly repo)

Test whether explicitly applying an ad-hoc signature (`codesign --sign -`)
through electron-builder makes notifications work in Stretchly's release
artifacts, for both architectures. Electron-builder documents `identity: "-"`
as ad-hoc signing, and Electron documents that macOS notifications require a
signed app. It has not yet been verified that this combination is sufficient
for Stretchly's packaged app or triggers the expected authorization flow on
supported macOS versions. Ad-hoc signing does not require an Apple Developer
certificate:
[electron-builder v26 docs](https://www.electron.build/v26/docs/features/code-signing/code-signing-mac/),
[#9007](https://github.com/electron-userland/electron-builder/pull/9007).

### Changes needed

1. `package.json` > `build.mac` (keep the existing `extendInfo` block with
   `LSBackgroundOnly`/`LSUIElement` - omitted below for brevity):

```json
"mac": {
  "category": "public.app-category.healthcare-fitness",
  "identity": "-",
  "hardenedRuntime": true,
  "entitlements": "build/entitlements.mac.plist",
  "entitlementsInherit": "build/entitlements.mac.inherit.plist",
  "target": [ ... unchanged ... ]
}
```

2. If supplying custom entitlement files, start both files from
  electron-builder 26.15.7's `templates/entitlements.mac.plist`, shown below.
  Its `MacTargetHelper.getOptionsForFile()` selects this same default for the
  app and nested helpers. Although `@electron/osx-sign` has separate defaults
  for helper types, electron-builder overrides them. Custom files replace the
  builder's defaults, so verify both the app and nested helper signatures and
  recheck this behavior when upgrading the builder. Add resource-specific
  entitlements only if Stretchly needs those capabilities; for example,
  [#9529](https://github.com/electron-userland/electron-builder/issues/9529)
  discusses camera and microphone access.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>com.apple.security.cs.allow-jit</key><true/>
  <key>com.apple.security.cs.allow-unsigned-executable-memory</key><true/>
  <key>com.apple.security.cs.disable-library-validation</key><true/>
</dict>
</plist>
```

3. Optional CI guard in `.github/workflows/test-build.yml` after the build step:

```yaml
- name: Verify ad-hoc signatures for both architectures
  if: runner.os == 'macOS'
  shell: bash
  run: |
    for app_bundle in "dist/mac/Stretchly.app" "dist/mac-arm64/Stretchly.app"; do
      codesign --verify --deep --strict --verbose=2 "$app_bundle"
      signature=$(codesign -dv --verbose=2 "$app_bundle" 2>&1)
      printf '%s\n' "$signature" | grep -q 'flags=.*adhoc'
    done
```

This verifies each app and its nested signatures, then checks each app's ad-hoc
flag even when `runtime` is also present. It fails if either expected app is
missing or fails a check. These paths match the current x64/arm64 targets and
default output configuration. This does not prove that the app launches or
notifications work; test both packaged builds on macOS.

### Trade-offs

- No Apple Developer certificate is needed. Whether this fixes notifications
  for either DMG architecture must be verified on a real Mac.
- Ad-hoc signing is not notarization and does not remove Gatekeeper's
  unidentified-developer warning for quarantined downloads. It may avoid the
  separate "damaged" error reported for some Apple Silicon installs; test the
  actual release artifact and install path.
- Rebuilt bundles may have a different cdhash. Whether macOS repeats a
  notification authorization prompt after an update depends on its identity
  handling and must be tested; the current evidence does not establish a
  per-version prompt.
- A self-signed certificate is another experiment, not a verified improvement:
  do not assume it will stabilize notification authorization or remove
  Gatekeeper prompts.
- Apple discourages `codesign --deep`. If testing it, verify the complete app
  and nested signatures rather than assuming it is an adequate release-signing
  procedure. This caution concerns signing; `--deep` is appropriate for
  recursive signature verification:
  [Apple signing guidance](https://developer.apple.com/library/archive/technotes/tn2206/_index.html).
- Needs one round of testing with a community tester on Sequoia, on both an
  Intel and an Apple Silicon Mac if possible
  (`test-build.yml` artifacts + `codesign -dvv` output).

### Expected install experience (test on macOS)

Homebrew tap:

```sh
brew install --cask hovancik/stretchly/stretchly
```

1. Launch Stretchly and record whether Gatekeeper requires **Open Anyway**.
  Ad-hoc signing is not notarization; the result may differ by install path.
2. Trigger a pre-break notification and record whether it appears, whether
  macOS asks for authorization, and whether authorization persists after an
  upgrade. None of these outcomes has yet been verified for Stretchly.

Manual DMG download:

1. Download the DMG from Releases and drag Stretchly to Applications.
2. Record Gatekeeper behavior and whether **Open Anyway** is required.
3. Test the notification and authorization behavior as above. Repeat on Intel
  and Apple Silicon if testers are available.

---

## Option 2 - Test signing through the Homebrew tap (homebrew-stretchly repo)

Keep release DMGs unchanged and test whether the cask can apply quarantine
removal and ad-hoc signing to the installed app. This would affect Homebrew
installs only; its behavior and suitability for the tap need verification.

### Current cask state (checked against latest tap, v1.22.1)

```ruby
app "Stretchly.app"
uninstall quit: "net.hovancik.stretchly"
zap trash: [...]
caveats <<~EOS
  Stretchly is not signed with an Apple Developer certificate.
  macOS Gatekeeper may block it from opening. To allow it, run:
    xattr -dr com.apple.quarantine /Applications/Stretchly.app
  or right-click the app and choose "Open".
EOS
```

### Changes needed

1. Develop and validate the signing procedure on a disposable installation
  before adding an install hook to `Casks/stretchly.rb`. Inspect the app's and
  helpers' existing entitlements, including native modules, and use a
  procedure that signs nested code before the enclosing app.
  Preserve required entitlements and supply missing ones using Option 1's
  builder defaults as the baseline. A bare `codesign --force --deep --sign -`
  command does not explicitly preserve or supply entitlements and is not
  equivalent to Option 1's signing procedure. Simply preserving existing
  entitlements also does not supply any that are missing. Verify signatures
  and launch the re-signed app on both architectures before testing notifications.
  Only then add a hook using the validated procedure, testing quarantine
  removal and optional LaunchServices registration separately.

2. After the hook is validated, rewrite the `caveats` and tap's `README.md` to
  describe the observed install experience. Remove manual `xattr` instructions
  only if the hook handles quarantine successfully. Do not promise a
  notification authorization prompt, delivery, or a particular re-prompt
  frequency until verified.

3. Extend `.github/workflows/ci.yml` to assert the outcome after install:

```yaml
- name: Verify ad-hoc signature
  shell: bash
  run: |
    codesign --verify --deep --strict --verbose=2 "/Applications/Stretchly.app"
    signature=$(codesign -dv --verbose=2 "/Applications/Stretchly.app" 2>&1)
    printf '%s\n' "$signature" | grep -q 'flags=.*adhoc'
```

These checks verify signature validity and ad-hoc metadata, not launch behavior
or notification delivery. Confirm the tap's install-test workflow and app path
before adding this step, and arrange coverage for both architectures.
Homebrew's [Cask Cookbook](https://docs.brew.sh/Cask-Cookbook#stanza-flight_steps)
requires structured `postflight_steps` in official taps and retains legacy
Ruby `postflight` blocks temporarily for third-party taps. Check which
operations the current API supports and run the cask audit before adopting a
hook. Also test whether LaunchServices registration is necessary for an
installed cask; Electron's test-runner setup does not establish that it is
required for Stretchly.

If a user has already manually re-signed the app, an install/upgrade hook may
replace that signature. Test the effect on notification authorization before
claiming that an upgrade will or will not trigger a new prompt.

### Trade-offs

- Could address the issue for `brew install --cask hovancik/stretchly/stretchly`
  users if the signing and LaunchServices steps are sufficient; this needs a
  Mac test before rollout.
- Only helps tap users, not people downloading DMGs from Releases.
- Re-signing after upgrades may affect notification authorization. The effect
  has not been verified.

### Expected install experience (test on macOS)

Homebrew tap:

```sh
brew install --cask hovancik/stretchly/stretchly
```

1. Verify whether the install hook strips quarantine, signs the app with the
  required entitlements, and whether LaunchServices registration is needed.
  Record Gatekeeper behavior and confirm that the app launches.
2. Trigger a notification and record whether it appears, whether authorization
  is requested, and whether it persists after `brew upgrade`.

Manual DMG download:

This tap-only option does not change direct DMG installs. A Mac tester can
first inspect the unmodified release, then test an ad-hoc-signed copy using the
validated signing procedure on a disposable install. Inspect the app and helper
entitlements before and after signing, verify their signatures, and confirm
that the app launches. Record notification and Gatekeeper behavior after each
step:

```sh
codesign -dv --verbose=2 /Applications/Stretchly.app
codesign --verify --deep --strict --verbose=2 /Applications/Stretchly.app
```

As a separate optional comparison, register the app with LaunchServices and
test again rather than assuming registration is required:

```sh
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f /Applications/Stretchly.app
```

These are diagnostic experiments, not a verified user workaround. Signature
verification alone does not establish that the entitlements are sufficient
for launch or that notifications work.

---

## Option 3 - Add an in-app fallback for break reminders (stretchly repo)

Avoid relying exclusively on native banners for break reminders, and add a
fallback when notification failure is detected. Other notifications, such as
new-version notices, need a separate decision because they also use the
renderer Notification API.

### Changes needed

1. Move break-notification creation to the main process
   (`electron.Notification`) in `app/main.js`, replacing the renderer-side
   notification path used for break reminders. Decide separately whether to
   migrate new-version notifications.
2. Listen for failure and log it (today it fails silently):

```js
notification.on('failed', (_, error) => {
  log.error(`Stretchly: notification failed: ${error}`)
})
```

3. When failure is reported (or signing is known to be absent), show a small
  frameless always-on-top fallback window ("Long break in 30 seconds") for
  about 7 seconds, mirroring the current auto-close timeout. Sound behavior
  stays unchanged. Verify this on macOS, including whether the failure event
  fires in the affected build.

The [`failed` event](https://www.electronjs.org/docs/latest/api/notification#event-failed-macos-windows)
reports errors while creating or showing the native notification. It does not
guarantee detection of every suppressed banner. Test denied authorization,
disabled banners, and Focus/DND separately; do not infer permission status or
visible delivery solely from the absence of a failure event. Native banners
remain the normal path when creation succeeds.

### Trade-offs

- Avoids relying exclusively on native banners when a failure is detected; makes
  those failures debuggable. The fallback path still needs macOS verification.
- Not a system banner: won't appear in Notification Center history and won't
  respect Focus/DND settings (break scheduling still checks DND itself).
- Requires changes to notification handling and a new fallback window.

### Expected install experience

Homebrew tap:

```sh
brew install --cask hovancik/stretchly/stretchly
```

1. Gatekeeper behavior remains dependent on the install path and quarantine
   handling; test whether **Open Anyway** is still needed.
2. Trigger a detectable native notification failure and verify that the in-app
   reminder appears without requiring native notification authorization.
   Separately test denied authorization and suppressed banners to establish
   which cases trigger fallback. New-version notifications would still use
   the current native path unless handled separately.

Manual DMG download:

1. Download DMG from Releases, open it, drag Stretchly to Applications.
2. Existing README workaround for first launch (Open Anyway or `xattr`).
3. Verify that the fallback reminder appears when a native notification error
  is detected or signing is known to be absent. Test signed and unsigned builds,
  denied authorization, and suppressed banners separately; fallback coverage
  for these cases has not been established.

---

## Comparison

| | Option 1 (ad-hoc CI) | Option 2 (tap postflight) | Option 3 (in-app fallback) |
|---|---|---|---|
| Repo | stretchly | homebrew-stretchly | stretchly |
| Native break banners | To verify | To verify | Retained; fallback on detected failure or known absence of signing |
| Fixes DMG users | To verify | No | To verify |
| User friction | Gatekeeper behavior to verify | Gatekeeper behavior to verify | Gatekeeper behavior to verify; in-app break reminder |
| Maintainer effort | Low (config + entitlements) | To assess (signing procedure + cask hook) | Medium (notification handling + window code) |

## Not recommended

- Pinning Electron < 42 to keep NSUserNotification: deprecated by Apple since
  macOS 10.14, removed in Electron 42, and blocks security updates.

## Developer ID signing and notarization

Developer ID signing and notarization are the usual Apple-supported way to
avoid Gatekeeper warnings for distributed apps. They require an Apple Developer
certificate and are a separate distribution option from the certificate-free
experiments above. Removing quarantine can bypass some friction but requires
a separate user or installer action.

## Suggested validation sequence

1. Ask a Mac tester to try an ad-hoc test-build artifact on both architectures
   if available; record `codesign` output for the app and helpers, entitlements,
   launch behavior, Gatekeeper behavior, authorization, and notification delivery.
2. If needed, validate the signing procedure and required entitlements for an
   installed release before adding the Homebrew hook. Test whether
   LaunchServices registration changes the result independently.
3. If native notification failure can be detected reliably, evaluate the
   in-app fallback for both Homebrew and direct-DMG installs, including denied
   authorization and suppressed-banner cases.

The test results should determine which option to pursue. If Option 1 is
verified and shipped, the Homebrew signing step may be redundant; confirm before
keeping both. Direct-DMG users would need a release-level fix or the fallback
from Option 3.
