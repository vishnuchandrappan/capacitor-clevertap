# @caplugins/capacitor-clevertap

Capacitor plugin for the CleverTap SDK on Android and iOS. It covers events, charged events, user profiles, push tokens and push taps, and geofencing. It doesn't wrap the whole SDK (no App Inbox or in-app message callbacks yet).

Forked from [`capacitor-clevertap`](https://github.com/daviozolin/capacitor-clevertap) by Davi Ozolin. This fork updates the CleverTap SDKs and fixes several bugs; see the [changelog](CHANGELOG.md). The same fixes are proposed upstream in [daviozolin/capacitor-clevertap#1](https://github.com/daviozolin/capacitor-clevertap/pull/1).

## Install

```bash
npm install @caplugins/capacitor-clevertap
npx cap sync
```

## Requirements

| | Minimum |
| --- | --- |
| Capacitor | 7.x or 8.x |
| iOS deployment target | 14.0 |
| iOS package manager | CocoaPods or Swift Package Manager |
| Android `minSdk` | 23 |
| Android `compileSdk` / `targetSdk` | 35 (your app's values win) |

Native SDK versions:

| Platform | SDK | Version |
| --- | --- | --- |
| Android | `com.clevertap.android:clevertap-android-sdk` | 8.4.1 |
| Android | `com.clevertap.android:clevertap-geofence-sdk` | 1.4.0 |
| iOS | `CleverTap-iOS-SDK` / `clevertap-ios-sdk` (SPM) | 7.8.2 or later 7.x |
| iOS | `CleverTap-Geofence-SDK` / `clevertap-geofence-ios` (SPM) | 1.0.7 or later 1.x |

The Android versions are defaults. If your app's `android/variables.gradle` defines any of these, your values win, so you can move to a newer CleverTap release without waiting for this plugin:

```groovy
ext {
    clevertapAndroidSdkVersion = '8.4.1'
    clevertapGeofenceSdkVersion = '1.4.0'
    firebaseMessagingVersion = '24.1.0'
}
```

## Configuration

Start with CleverTap's [Android](https://developer.clevertap.com/docs/android-quickstart-guide) and [iOS](https://developer.clevertap.com/docs/ios-quickstart-guide) quickstarts. The steps below are the parts that matter in a Capacitor app.

### Android

**1. Credentials.** Add your account ID and token inside `<application>` in `android/app/src/main/AndroidManifest.xml`:

```xml
<meta-data android:name="CLEVERTAP_ACCOUNT_ID" android:value="YOUR_ACCOUNT_ID" />
<meta-data android:name="CLEVERTAP_TOKEN" android:value="YOUR_ACCOUNT_TOKEN" />
<!-- Only if your account isn't in the default region, e.g. in1, us1, sg1 -->
<meta-data android:name="CLEVERTAP_REGION" android:value="YOUR_REGION" />
```

Without them, the plugin's methods reject with `CleverTap is not initialized`.

**2. Lifecycle callback.** Register CleverTap's activity lifecycle callback in an `Application` subclass, before `super.onCreate()`. CleverTap needs it for App Launched events, sessions, in-app messages, and tracking taps on pushes that launch the app.

```java
public class MainApplication extends Application {
    @Override
    public void onCreate() {
        ActivityLifecycleCallback.register(this);
        super.onCreate();
    }
}
```

Point `<application android:name=".MainApplication">` at it in `AndroidManifest.xml`.

**3. Push notifications.** The plugin registers CleverTap's `FcmMessageListenerService`, which receives FCM messages and renders CleverTap pushes. That's enough if CleverTap is the only thing in your app that uses FCM.

If you also use `@capacitor/push-notifications`, note that Android delivers `com.google.firebase.MESSAGING_EVENT` to only one service. Remove both services and route messages through one of your own:

```xml
<!-- In <application>; needs xmlns:tools="http://schemas.android.com/tools" on <manifest> -->
<service android:name="com.capacitorjs.plugins.pushnotifications.MessagingService" tools:node="remove" />
<service android:name="com.clevertap.android.sdk.pushnotification.fcm.FcmMessageListenerService" tools:node="remove" />
<service android:name=".AppMessagingService" android:exported="false">
    <intent-filter>
        <action android:name="com.google.firebase.MESSAGING_EVENT" />
    </intent-filter>
</service>
```

```java
public class AppMessagingService extends FirebaseMessagingService {
    @Override
    public void onNewToken(@NonNull String token) {
        super.onNewToken(token);
        PushNotificationsPlugin.onNewToken(token);
        CleverTapAPI clevertap = CleverTapAPI.getDefaultInstance(getApplicationContext());
        if (clevertap != null) {
            clevertap.pushFcmRegistrationId(token, true);
        }
    }

    @Override
    public void onMessageReceived(@NonNull RemoteMessage message) {
        // CleverTap pushes carry the "wzrk_pn" key.
        if (message.getData().containsKey("wzrk_pn")) {
            new CTFcmMessageHandler().createNotification(getApplicationContext(), message);
        } else {
            PushNotificationsPlugin.sendRemoteMessage(message);
        }
    }
}
```

`onNewToken` only runs when the token changes, so also pass the current token to CleverTap on launch: call [`setPushTokenAs()`](#setpushtokenas) with the value from `@capacitor/push-notifications`' `registration` event.

**4. Background location.** The Geofence SDK adds `ACCESS_BACKGROUND_LOCATION` to your merged manifest. Google Play treats it as a sensitive permission that needs a declaration. If you don't use geofencing, remove it:

```xml
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" tools:node="remove" />
```

### iOS

**1. Credentials.** Add to `ios/App/App/Info.plist`:

```xml
<key>CleverTapAccountID</key>
<string>YOUR_ACCOUNT_ID</string>
<key>CleverTapToken</key>
<string>YOUR_ACCOUNT_TOKEN</string>
<!-- Only if your account isn't in the default region -->
<key>CleverTapRegion</key>
<string>YOUR_REGION</string>
```

**2. Push notifications.** CleverTap needs the APNs device token. `@capacitor/push-notifications`' `registration` event gives you that token on iOS, so pass it to [`setPushTokenAs()`](#setpushtokenas).

If your `AppDelegate` replaces the token with Firebase's FCM token (common when you use Firebase Messaging), that event no longer carries the APNs token. Forward it to CleverTap natively instead:

```swift
func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    CleverTap.sharedInstance()?.setPushToken(deviceToken)
    // ...your existing Firebase / Capacitor handling
}
```

The plugin doesn't emit `onPushClicked` on iOS. Handle taps with `@capacitor/push-notifications`' `pushNotificationActionPerformed` event. To have CleverTap count the click, pass the notification's data to `CleverTap.sharedInstance()?.recordNotificationClickedEvent(withData:)` natively.

If you use `@capacitor/push-notifications`, don't call `CleverTap.autoIntegrate()`. It also hooks into notification handling, which that plugin already owns.

**3. Rich push (optional).** Images, GIFs and video in notifications need a Notification Service Extension. Add `CTNotificationService` to that extension's target in your `Podfile` and follow CleverTap's [rich push guide](https://developer.clevertap.com/docs/ios-rich-push-notifications).

**4. Geofencing (optional).** Follow CleverTap's [iOS geofence guide](https://developer.clevertap.com/docs/geofence-ios). Start monitoring natively in `AppDelegate`, then call [`initGeofence()`](#initgeofence) from JS to receive events:

```swift
CleverTapGeofence.monitor.start(didFinishLaunchingWithOptions: launchOptions)
```

[`requestPermissions()`](#requestpermissions) needs `NSLocationWhenInUseUsageDescription` in `Info.plist`, plus `NSLocationAlwaysAndWhenInUseUsageDescription` to ask for "Always".

## Usage

```typescript
import { CleverTapAnalytics, DEBUG_LEVEL } from '@caplugins/capacitor-clevertap';

// At startup. Add listeners early: taps that launched the app are delivered to the first one.
await CleverTapAnalytics.setDebugLevel({ level: DEBUG_LEVEL.INFO });
await CleverTapAnalytics.addListener('onPushClicked', (push) => {
  // Android only. Custom key-value pairs are top-level properties of `push`.
});

// When the user logs in.
await CleverTapAnalytics.onUserLogin({
  profileProperties: {
    Identity: 'user-123',
    Email: 'jane@example.com',
    // Dates are sent as "$D_" + epoch seconds.
    DOB: `$D_${Math.floor(new Date('1990-01-01').getTime() / 1000)}`,
  },
});

// Events.
await CleverTapAnalytics.recordEvent({ event: 'Product Viewed', properties: { sku: 'sku-1', price: 9.99 } });
await CleverTapAnalytics.recordChargedEvent({
  details: { Amount: 300, 'Charged ID': 'order-123' },
  items: [{ Name: 'Book 1', Quantity: 1 }],
});
```

Every method returns a promise that rejects when its arguments are missing or malformed.

## Platform differences

| | Android | iOS |
| --- | --- | --- |
| `onPushClicked` event | Yes | No (use `@capacitor/push-notifications`) |
| `initGeofence()` | Initializes the SDK and starts monitoring | Subscribes listeners; start monitoring natively |
| `triggerLocation()` | Yes | No |
| `geofenceInitializedListener` event | Yes | No |
| `locationUpdateListener` event | Each location update, `{ lat, lng }` | When the geofence list updates, SDK payload |
| Debug levels | `OFF`, `INFO`, `DEBUG`, `VERBOSE` | `DEBUG` and `VERBOSE` are the same |
| Calls when CleverTap isn't configured | Reject | Resolve without doing anything |

## Migrating from `capacitor-clevertap`

1. Swap the package and sync. The iOS pod is now `CapluginsCapacitorClevertap` and the Android project `caplugins-capacitor-clevertap`; `npx cap sync` updates both.

   ```bash
   npm uninstall capacitor-clevertap
   npm install @caplugins/capacitor-clevertap
   npx cap sync
   ```

2. Change imports from `'capacitor-clevertap'` to `'@caplugins/capacitor-clevertap'`. The plugin is still `CleverTapAnalytics`, and existing calls keep working.
3. Remove any local patches of `capacitor-clevertap`.
4. Behaviour changes to check:
   - Android no longer forces `VERBOSE` logging. Call [`setDebugLevel()`](#setdebuglevel) if you relied on it.
   - Android [`setPushTokenAs()`](#setpushtokenas) now registers the token (it used to do nothing).
   - [`triggerLocation()`](#triggerlocation) rejects when it can't run instead of resolving.
   - On Android, `onPushClicked`'s `image` is now the picture URL.

## API

<docgen-index>

* [`profileGetID()`](#profilegetid)
* [`recordEvent(...)`](#recordevent)
* [`recordChargedEvent(...)`](#recordchargedevent)
* [`profileIncrementValue(...)`](#profileincrementvalue)
* [`profilePush(...)`](#profilepush)
* [`setLocation(...)`](#setlocation)
* [`setPushTokenAs(...)`](#setpushtokenas)
* [`onUserLogin(...)`](#onuserlogin)
* [`stopGeofence()`](#stopgeofence)
* [`initGeofence()`](#initgeofence)
* [`triggerLocation()`](#triggerlocation)
* [`setDebugLevel(...)`](#setdebuglevel)
* [`addListener('geofenceInitializedListener', ...)`](#addlistenergeofenceinitializedlistener-)
* [`addListener('locationUpdateListener', ...)`](#addlistenerlocationupdatelistener-)
* [`addListener('onPushClicked', ...)`](#addlisteneronpushclicked-)
* [`addListener('geofenceEnteredListener', ...)`](#addlistenergeofenceenteredlistener-)
* [`addListener('geofenceExitedListener', ...)`](#addlistenergeofenceexitedlistener-)
* [`checkPermissions()`](#checkpermissions)
* [`requestPermissions(...)`](#requestpermissions)
* [Interfaces](#interfaces)
* [Type Aliases](#type-aliases)
* [Enums](#enums)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### profileGetID()

```typescript
profileGetID() => Promise<ProfileGetIDResult>
```

Returns the CleverTap ID of the current device.

Android rejects when CleverTap isn't configured. iOS resolves with `"ERROR"`
as the id instead.

**Returns:** <code>Promise&lt;<a href="#profilegetidresult">ProfileGetIDResult</a>&gt;</code>

--------------------


### recordEvent(...)

```typescript
recordEvent(props: RecordEventOptions) => Promise<void>
```

Records a custom event.

| Param       | Type                                                              |
| ----------- | ----------------------------------------------------------------- |
| **`props`** | <code><a href="#recordeventoptions">RecordEventOptions</a></code> |

--------------------


### recordChargedEvent(...)

```typescript
recordChargedEvent(props: RecordChargedEventOptions) => Promise<void>
```

Records CleverTap's "Charged" (purchase) event.

| Param       | Type                                                                            |
| ----------- | ------------------------------------------------------------------------------- |
| **`props`** | <code><a href="#recordchargedeventoptions">RecordChargedEventOptions</a></code> |

--------------------


### profileIncrementValue(...)

```typescript
profileIncrementValue(props: ProfileIncrementValueOptions) => Promise<void>
```

Increments a numeric property on the current user profile.

| Param       | Type                                                                                  |
| ----------- | ------------------------------------------------------------------------------------- |
| **`props`** | <code><a href="#profileincrementvalueoptions">ProfileIncrementValueOptions</a></code> |

--------------------


### profilePush(...)

```typescript
profilePush(props: ProfilePropertiesOptions) => Promise<void>
```

Adds or updates properties on the current user profile.

| Param       | Type                                                                          |
| ----------- | ----------------------------------------------------------------------------- |
| **`props`** | <code><a href="#profilepropertiesoptions">ProfilePropertiesOptions</a></code> |

--------------------


### setLocation(...)

```typescript
setLocation(props: SetLocationOptions) => Promise<void>
```

Sets the user's location, used for location-based segmentation.

| Param       | Type                                                              |
| ----------- | ----------------------------------------------------------------- |
| **`props`** | <code><a href="#setlocationoptions">SetLocationOptions</a></code> |

--------------------


### setPushTokenAs(...)

```typescript
setPushTokenAs(props: SetPushTokenOptions) => Promise<void>
```

Registers the device's push token with CleverTap.

Android: pass the FCM registration token, e.g. from `@capacitor/push-notifications`'
`registration` event. This only registers the token. If another
FirebaseMessagingService (e.g. `@capacitor/push-notifications`') receives
`MESSAGING_EVENT` instead of CleverTap's, CleverTap pushes reach that service,
and it has to hand them to CleverTap natively (`CTFcmMessageHandler`) for them
to be shown.

iOS: pass the APNs device token as a hex string. `@capacitor/push-notifications`'
`registration` event provides that by default, but not if your `AppDelegate`
replaces it with Firebase's FCM token. In that case forward the raw token
natively instead: `CleverTap.sharedInstance()?.setPushToken(deviceToken)`.

| Param       | Type                                                                |
| ----------- | ------------------------------------------------------------------- |
| **`props`** | <code><a href="#setpushtokenoptions">SetPushTokenOptions</a></code> |

--------------------


### onUserLogin(...)

```typescript
onUserLogin(props: ProfilePropertiesOptions) => Promise<void>
```

Identifies the user on login.

If an identifier (`Identity` or `Email`) belongs to a different user than
the current profile, CleverTap switches to (or creates) that user's
profile, so call this rather than `profilePush()` when a user logs in.

| Param       | Type                                                                          |
| ----------- | ----------------------------------------------------------------------------- |
| **`props`** | <code><a href="#profilepropertiesoptions">ProfilePropertiesOptions</a></code> |

--------------------


### stopGeofence()

```typescript
stopGeofence() => Promise<void>
```

Stops geofence monitoring.

--------------------


### initGeofence()

```typescript
initGeofence() => Promise<void>
```

Android: initializes the CleverTap Geofence SDK and starts monitoring.
Location permission must already be granted.

iOS: only subscribes the geofence listeners. Monitoring itself is started
natively with `CleverTapGeofence.monitor.start(didFinishLaunchingWithOptions:)`.

--------------------


### triggerLocation()

```typescript
triggerLocation() => Promise<void>
```

Fetches the current location and sends it to CleverTap to refresh the
monitored geofences. Rejects if `initGeofence()` hasn't been called or the
`location` permission isn't granted.

Android only: the iOS Geofence SDK has no equivalent.

--------------------


### setDebugLevel(...)

```typescript
setDebugLevel(props: SetDebugLevelOptions) => Promise<void>
```

Sets the CleverTap SDK log level. Until this is called, the SDK's default applies.

iOS has a single debug level, so `DEBUG` and `VERBOSE` behave the same there.

| Param       | Type                                                                  |
| ----------- | --------------------------------------------------------------------- |
| **`props`** | <code><a href="#setdebugleveloptions">SetDebugLevelOptions</a></code> |

--------------------


### addListener('geofenceInitializedListener', ...)

```typescript
addListener(eventName: 'geofenceInitializedListener', listenerFunc: (event: GeofenceInitializedEvent) => void) => Promise<PluginListenerHandle>
```

Fired when the Geofence SDK has finished initializing after `initGeofence()`.

Android only.

| Param              | Type                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code>'geofenceInitializedListener'</code>                                                        |
| **`listenerFunc`** | <code>(event: <a href="#geofenceinitializedevent">GeofenceInitializedEvent</a>) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener('locationUpdateListener', ...)

```typescript
addListener(eventName: 'locationUpdateListener', listenerFunc: (event: LocationUpdateEvent) => void) => Promise<PluginListenerHandle>
```

Android: fired on each location update with `{ lat, lng }`.

iOS: fired when the list of monitored geofences is updated, with the
Geofence SDK's notification payload instead of `{ lat, lng }`.

| Param              | Type                                                                                    |
| ------------------ | --------------------------------------------------------------------------------------- |
| **`eventName`**    | <code>'locationUpdateListener'</code>                                                   |
| **`listenerFunc`** | <code>(event: <a href="#locationupdateevent">LocationUpdateEvent</a>) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener('onPushClicked', ...)

```typescript
addListener(eventName: 'onPushClicked', listenerFunc: (data: CleverTapPushNotificationPayload) => void) => Promise<PluginListenerHandle>
```

Fired when a CleverTap push notification is tapped. Taps that launch the
app are delivered once the first listener is added.

Android only. On iOS, handle taps with `@capacitor/push-notifications`'
`pushNotificationActionPerformed` event.

| Param              | Type                                                                                                             |
| ------------------ | ---------------------------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code>'onPushClicked'</code>                                                                                     |
| **`listenerFunc`** | <code>(data: <a href="#clevertappushnotificationpayload">CleverTapPushNotificationPayload</a>) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener('geofenceEnteredListener', ...)

```typescript
addListener(eventName: 'geofenceEnteredListener', listenerFunc: (event: GeofenceStatusChange) => void) => Promise<PluginListenerHandle>
```

Fired when the device enters a monitored geofence.

| Param              | Type                                                                                      |
| ------------------ | ----------------------------------------------------------------------------------------- |
| **`eventName`**    | <code>'geofenceEnteredListener'</code>                                                    |
| **`listenerFunc`** | <code>(event: <a href="#geofencestatuschange">GeofenceStatusChange</a>) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener('geofenceExitedListener', ...)

```typescript
addListener(eventName: 'geofenceExitedListener', listenerFunc: (event: GeofenceStatusChange) => void) => Promise<PluginListenerHandle>
```

Fired when the device exits a monitored geofence.

| Param              | Type                                                                                      |
| ------------------ | ----------------------------------------------------------------------------------------- |
| **`eventName`**    | <code>'geofenceExitedListener'</code>                                                     |
| **`listenerFunc`** | <code>(event: <a href="#geofencestatuschange">GeofenceStatusChange</a>) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### checkPermissions()

```typescript
checkPermissions() => Promise<PermissionStatus>
```

Returns the location permission state used by geofencing.

Android 9 and below have no separate background location permission, so
`backgroundUpdate` never reports `granted` there.

**Returns:** <code>Promise&lt;<a href="#permissionstatus">PermissionStatus</a>&gt;</code>

--------------------


### requestPermissions(...)

```typescript
requestPermissions(options?: CleverTapPluginPermissions | undefined) => Promise<PermissionStatus>
```

Requests location permission for geofencing.

Android: on Android 11+ the system ignores a request that asks for
background location together with foreground location, so request
`location` first and `backgroundUpdate` in a second call.

iOS: ignores `permissions`. It requests "Always" authorization when
Info.plist has `NSLocationAlwaysAndWhenInUseUsageDescription`, "When In Use"
otherwise, and rejects if `NSLocationWhenInUseUsageDescription` is missing.

| Param         | Type                                                                              |
| ------------- | --------------------------------------------------------------------------------- |
| **`options`** | <code><a href="#clevertappluginpermissions">CleverTapPluginPermissions</a></code> |

**Returns:** <code>Promise&lt;<a href="#permissionstatus">PermissionStatus</a>&gt;</code>

--------------------


### Interfaces


#### ProfileGetIDResult

| Prop     | Type                | Description                         |
| -------- | ------------------- | ----------------------------------- |
| **`id`** | <code>string</code> | CleverTap ID of the current device. |


#### RecordEventOptions

| Prop             | Type                | Description                                                                                                                                                                                                                                                               |
| ---------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`event`**      | <code>string</code> | Event name.                                                                                                                                                                                                                                                               |
| **`properties`** | <code>any</code>    | Event properties. Required: pass `{}` when there are none. Values can be strings, numbers or booleans. Send dates as `"$D_" + epoch seconds` strings (e.g. `"$D_1700000000"`): a JS `Date` reaches native code as an ISO string, which CleverTap doesn't treat as a date. |


#### RecordChargedEventOptions

| Prop          | Type               | Description                                                                                      |
| ------------- | ------------------ | ------------------------------------------------------------------------------------------------ |
| **`details`** | <code>any</code>   | Transaction details, e.g. `{ Amount: 300, 'Payment Mode': 'Card', 'Charged ID': 'order-123' }`.  |
| **`items`**   | <code>any[]</code> | Purchased items, one object per item, e.g. `{ Category: 'books', Name: 'Book 1', Quantity: 1 }`. |


#### ProfileIncrementValueOptions

| Prop        | Type                | Description                                     |
| ----------- | ------------------- | ----------------------------------------------- |
| **`key`**   | <code>string</code> | Profile property name.                          |
| **`value`** | <code>number</code> | Amount to add. Integers and decimals both work. |


#### ProfilePropertiesOptions

| Prop                    | Type             | Description                                                                                                                                                                                                                                     |
| ----------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`profileProperties`** | <code>any</code> | Profile properties. CleverTap reserves some keys (`Identity`, `Name`, `Email`, `Phone`, `Gender`, `DOB`, …); anything else is stored as a custom property. Send dates such as `DOB` as `"$D_" + epoch seconds` strings (e.g. `"$D_631152000"`). |


#### SetLocationOptions

| Prop      | Type                | Description           |
| --------- | ------------------- | --------------------- |
| **`lat`** | <code>number</code> | Latitude in degrees.  |
| **`lng`** | <code>number</code> | Longitude in degrees. |


#### SetPushTokenOptions

| Prop        | Type                | Description                                           |
| ----------- | ------------------- | ----------------------------------------------------- |
| **`token`** | <code>string</code> | FCM token on Android, APNs device token (hex) on iOS. |


#### SetDebugLevelOptions

| Prop        | Type                                                | Description |
| ----------- | --------------------------------------------------- | ----------- |
| **`level`** | <code><a href="#debug_level">DEBUG_LEVEL</a></code> | Log level.  |


#### PluginListenerHandle

| Prop         | Type                                      |
| ------------ | ----------------------------------------- |
| **`remove`** | <code>() =&gt; Promise&lt;void&gt;</code> |


#### GeofenceInitializedEvent

| Prop         | Type                | Description             |
| ------------ | ------------------- | ----------------------- |
| **`status`** | <code>string</code> | Always `"INITIALIZED"`. |


#### LocationUpdateEvent

| Prop      | Type                | Description           |
| --------- | ------------------- | --------------------- |
| **`lat`** | <code>number</code> | Latitude in degrees.  |
| **`lng`** | <code>number</code> | Longitude in degrees. |


#### CleverTapPushNotificationPayload

A tapped CleverTap push. Every key of the push payload is also included as a
top-level property, including custom key-value pairs and CleverTap's `wzrk_*` keys.

| Prop        | Type                | Description                                                     |
| ----------- | ------------------- | --------------------------------------------------------------- |
| **`title`** | <code>string</code> | Notification title.                                             |
| **`body`**  | <code>string</code> | Notification body.                                              |
| **`data`**  | <code>any</code>    | Not populated: custom key-value pairs are top-level properties. |
| **`image`** | <code>string</code> | Big-picture image URL, if the notification has one.             |


#### GeofenceStatusChange

The geofence that was entered or exited.

| Prop                | Type                | Description                                                |
| ------------------- | ------------------- | ---------------------------------------------------------- |
| **`id`**            | <code>number</code> | Geofence ID.                                               |
| **`gcId`**          | <code>number</code> | ID of the geofence's cluster.                              |
| **`gcName`**        | <code>string</code> | Name of the geofence's cluster.                            |
| **`lat`**           | <code>number</code> | Latitude of the geofence's centre.                         |
| **`lng`**           | <code>number</code> | Longitude of the geofence's centre.                        |
| **`r`**             | <code>number</code> | Geofence radius in metres.                                 |
| **`triggered_lat`** | <code>number</code> | Latitude where the transition was detected. Android only.  |
| **`triggered_lng`** | <code>number</code> | Longitude where the transition was detected. Android only. |


#### PermissionStatus

| Prop                   | Type                                                        | Description                     |
| ---------------------- | ----------------------------------------------------------- | ------------------------------- |
| **`location`**         | <code><a href="#permissionstate">PermissionState</a></code> | Foreground location.            |
| **`backgroundUpdate`** | <code><a href="#permissionstate">PermissionState</a></code> | Background ("Always") location. |


#### CleverTapPluginPermissions

| Prop              | Type                                   | Description                                                     |
| ----------------- | -------------------------------------- | --------------------------------------------------------------- |
| **`permissions`** | <code>CleverTapPermissionType[]</code> | Permissions to request (Android only). Defaults to all of them. |


### Type Aliases


#### PermissionState

<code>'prompt' | 'prompt-with-rationale' | 'granted' | 'denied'</code>


#### CleverTapPermissionType

`location`: foreground location. `backgroundUpdate`: background ("Always") location.

<code>'location' | 'backgroundUpdate'</code>


### Enums


#### DEBUG_LEVEL

| Members       | Value           | Description                                                |
| ------------- | --------------- | ---------------------------------------------------------- |
| **`OFF`**     | <code>-1</code> | No logging.                                                |
| **`INFO`**    | <code>0</code>  | Errors and important information only (the SDK's default). |
| **`DEBUG`**   | <code>2</code>  | Debug logging. On iOS the same as `VERBOSE`.               |
| **`VERBOSE`** | <code>3</code>  | Everything, including event and profile payloads.          |

</docgen-api>

## License

MIT. See [LICENSE](LICENSE). Based on [`capacitor-clevertap`](https://github.com/daviozolin/capacitor-clevertap) by Davi Ozolin.
