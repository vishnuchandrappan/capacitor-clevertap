# Changelog

## 1.0.0

First release as `@caplugins/capacitor-clevertap`, forked from [`capacitor-clevertap`](https://github.com/daviozolin/capacitor-clevertap) 7.0.4. See [Migrating from `capacitor-clevertap`](README.md#migrating-from-capacitor-clevertap).

### Changed

- Package renamed to `@caplugins/capacitor-clevertap`. The iOS pod is now `CapluginsCapacitorClevertap` and the Android package `com.caplugins.clevertap`. The JavaScript plugin is still `CleverTapAnalytics`.
- CleverTap Android SDK 7.7.0 → 8.4.1 and Android Geofence SDK 1.3.0 → 1.4.0.
- iOS now requires CleverTap-iOS-SDK 7.8.2+, CleverTap-Geofence-SDK 1.0.7+ and CTNotificationService 0.1.7+ (within their current major versions). These were unpinned before.
- Android no longer forces `VERBOSE` logging; the SDK's default applies until you call `setDebugLevel()`.

### Added

- Swift Package Manager support: `Package.swift` now declares the CleverTap packages and accepts Capacitor 7 or 8.
- Apps can override the CleverTap Android SDK versions from `variables.gradle` (`clevertapAndroidSdkVersion`, `clevertapGeofenceSdkVersion`).
- `requestPermissions()` takes an optional `{ permissions }` and resolves with the permission status.
- Every method, option and event is documented, and the README covers setup for both platforms.

### Fixed

- Android: `setDebugLevel()` was not implemented ("not implemented on android").
- Android: `setPushTokenAs()` did nothing; it now registers the FCM token with CleverTap.
- Android: `onPushClicked` wasn't delivered for taps that launch the app, and a tap was delivered again when the app was reopened from Recents.
- Android: `onPushClicked`'s `image` held the image download status instead of the image URL.
- Android: apps without CleverTap credentials crashed on launch (Android 12+) and on every plugin call.
- Android: `profilePush()` / `onUserLogin()` crashed the app when `profileProperties` was missing.
- Android: `triggerLocation()` resolved even when it couldn't run.
- Android: geofence listeners were registered after `init()`, and the location listener twice.
- Android and iOS: `profileIncrementValue()` rounded values through a 32-bit float; Android also rejected integers outside the 32-bit range.
- Android and iOS: geofence calls leaked a `PluginCall` each time.
- iOS: `requestPermissions()` never resolved.
- iOS: calling `initGeofence()` again duplicated every geofence event.
- iOS: a geofence entry without a readable payload was reported as an exit.
