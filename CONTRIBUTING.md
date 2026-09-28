# Contributing

## Setup

```bash
npm install
```

To build the native code you also need:

- **Android:** JDK 21 and the Android SDK. Android Studio's bundled JDK works:
  `export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"`.
- **iOS:** Xcode.
- **Linting Swift (optional):** SwiftLint, `brew install swiftlint`.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run build` | Compiles `src/` to `dist/` and regenerates the API section of `README.md` from the JSDoc in `src/definitions.ts`. |
| `npm run verify` | Builds the web, Android and iOS code. Run it before opening a PR. Also available per platform: `verify:web`, `verify:android`, `verify:ios`. |
| `npm run lint` / `npm run fmt` | Checks / fixes formatting with ESLint, Prettier (TypeScript and Java) and SwiftLint. |

iOS tests run on a simulator:

```bash
xcodebuild test -scheme CapluginsCapacitorClevertap -destination 'platform=iOS Simulator,name=iPhone 16'
```

## Making changes

- **Docs:** edit the JSDoc in `src/definitions.ts`, then run `npm run build`. Don't edit the API section of `README.md` by hand; it's between the `docgen` markers and gets overwritten.
- **Adding a method:** add it to `src/definitions.ts`, to `CleverTapAnalyticsPlugin.java` as a `@PluginMethod`, and to `CleverTapPlugin.swift` (both the method and the `pluginMethods` list). Also add it to the expected set in `ios/Tests/CleverTapPluginTests/CleverTapPluginTests.swift`. A method missing from one platform rejects with "not implemented" at runtime, which is how `setDebugLevel` broke on Android.
- **Android plugin methods must not throw.** Capacitor rethrows exceptions from `@PluginMethod`s on its plugin thread, which crashes the app. Validate arguments and `call.reject(...)` instead.
- **Updating the CleverTap SDKs:**
  - Android: the defaults in the `ext` block of `android/build.gradle`.
  - iOS: the dependency requirements in `CapluginsCapacitorClevertap.podspec` and `Package.swift`.
  - Docs: the versions table in `README.md` and `CHANGELOG.md`.

  Check CleverTap's changelogs for breaking changes first: [Android](https://github.com/CleverTap/clevertap-android-sdk/blob/master/docs/CTCORECHANGELOG.md), [iOS](https://github.com/CleverTap/clevertap-ios-sdk/blob/master/CHANGELOG.md).

## Releasing

1. Update `version` in `package.json` and add a section to `CHANGELOG.md`.
2. Run `npm run verify`.
3. Publish. `prepublishOnly` runs the build first.

   ```bash
   npm publish --access public
   ```

4. Tag the release and push the tag:

   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

## Upstream

This package is a fork of [`capacitor-clevertap`](https://github.com/daviozolin/capacitor-clevertap). Fixes that apply there too can be offered upstream; see [daviozolin/capacitor-clevertap#1](https://github.com/daviozolin/capacitor-clevertap/pull/1).
