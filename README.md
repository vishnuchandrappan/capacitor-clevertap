# @caplugins/capacitor-clevertap

Capacitor plugin for the CleverTap SDK on Android and iOS. It covers events, charged events, user profiles, push tokens and push taps, and geofencing. It doesn't wrap the whole SDK (no App Inbox or in-app message callbacks yet).

Forked from [`capacitor-clevertap`](https://github.com/daviozolin/capacitor-clevertap) by Davi Ozolin. This fork updates the CleverTap SDKs and fixes several bugs; the same fixes are proposed upstream in [daviozolin/capacitor-clevertap#1](https://github.com/daviozolin/capacitor-clevertap/pull/1).

Follow CleverTap's [iOS](https://developer.clevertap.com/docs/ios-quickstart-guide) and [Android](https://developer.clevertap.com/docs/android-quickstart-guide) setup guides first.

## Install

Supports Capacitor 7 and 8, with CocoaPods or Swift Package Manager on iOS.

```bash
npm install @caplugins/capacitor-clevertap
npx cap sync
```

```typescript
import { CleverTapAnalytics, DEBUG_LEVEL } from '@caplugins/capacitor-clevertap';

await CleverTapAnalytics.setDebugLevel({ level: DEBUG_LEVEL.INFO });
await CleverTapAnalytics.onUserLogin({ profileProperties: { Identity: 'user-123' } });
```

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
