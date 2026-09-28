import type { PluginListenerHandle, PermissionState } from '@capacitor/core';

import type { DEBUG_LEVEL } from '.';

export interface CleverTapPlugin {
  /**
   * Returns the CleverTap ID of the current device.
   *
   * Android rejects when CleverTap isn't configured. iOS resolves with `"ERROR"`
   * as the id instead.
   */
  profileGetID(): Promise<ProfileGetIDResult>;

  /**
   * Records a custom event.
   */
  recordEvent(props: RecordEventOptions): Promise<void>;

  /**
   * Records CleverTap's "Charged" (purchase) event.
   */
  recordChargedEvent(props: RecordChargedEventOptions): Promise<void>;

  /**
   * Increments a numeric property on the current user profile.
   */
  profileIncrementValue(props: ProfileIncrementValueOptions): Promise<void>;

  /**
   * Adds or updates properties on the current user profile.
   */
  profilePush(props: ProfilePropertiesOptions): Promise<void>;

  /**
   * Sets the user's location, used for location-based segmentation.
   */
  setLocation(props: SetLocationOptions): Promise<void>;

  /**
   * Registers the device's push token with CleverTap.
   *
   * Android: pass the FCM registration token, e.g. from `@capacitor/push-notifications`'
   * `registration` event. This only registers the token. If another
   * FirebaseMessagingService (e.g. `@capacitor/push-notifications`') receives
   * `MESSAGING_EVENT` instead of CleverTap's, CleverTap pushes reach that service,
   * and it has to hand them to CleverTap natively (`CTFcmMessageHandler`) for them
   * to be shown.
   *
   * iOS: pass the APNs device token as a hex string. `@capacitor/push-notifications`'
   * `registration` event provides that by default, but not if your `AppDelegate`
   * replaces it with Firebase's FCM token. In that case forward the raw token
   * natively instead: `CleverTap.sharedInstance()?.setPushToken(deviceToken)`.
   */
  setPushTokenAs(props: SetPushTokenOptions): Promise<void>;

  /**
   * Identifies the user on login.
   *
   * If an identifier (`Identity` or `Email`) belongs to a different user than
   * the current profile, CleverTap switches to (or creates) that user's
   * profile, so call this rather than `profilePush()` when a user logs in.
   */
  onUserLogin(props: ProfilePropertiesOptions): Promise<void>;

  /**
   * Stops geofence monitoring.
   */
  stopGeofence(): Promise<void>;

  /**
   * Android: initializes the CleverTap Geofence SDK and starts monitoring.
   * Location permission must already be granted.
   *
   * iOS: only subscribes the geofence listeners. Monitoring itself is started
   * natively with `CleverTapGeofence.monitor.start(didFinishLaunchingWithOptions:)`.
   */
  initGeofence(): Promise<void>;

  /**
   * Fetches the current location and sends it to CleverTap to refresh the
   * monitored geofences. Rejects if `initGeofence()` hasn't been called or the
   * `location` permission isn't granted.
   *
   * Android only: the iOS Geofence SDK has no equivalent.
   */
  triggerLocation(): Promise<void>;

  /**
   * Sets the CleverTap SDK log level. Until this is called, the SDK's default applies.
   *
   * iOS has a single debug level, so `DEBUG` and `VERBOSE` behave the same there.
   */
  setDebugLevel(props: SetDebugLevelOptions): Promise<void>;

  /**
   * Fired when the Geofence SDK has finished initializing after `initGeofence()`.
   *
   * Android only.
   */
  addListener(
    eventName: 'geofenceInitializedListener',
    listenerFunc: (event: GeofenceInitializedEvent) => void,
  ): Promise<PluginListenerHandle>;

  /**
   * Android: fired on each location update with `{ lat, lng }`.
   *
   * iOS: fired when the list of monitored geofences is updated, with the
   * Geofence SDK's notification payload instead of `{ lat, lng }`.
   */
  addListener(
    eventName: 'locationUpdateListener',
    listenerFunc: (event: LocationUpdateEvent) => void,
  ): Promise<PluginListenerHandle>;

  /**
   * Fired when a CleverTap push notification is tapped. Taps that launch the
   * app are delivered once the first listener is added.
   *
   * Android only. On iOS, handle taps with `@capacitor/push-notifications`'
   * `pushNotificationActionPerformed` event.
   */
  addListener(
    eventName: 'onPushClicked',
    listenerFunc: (data: CleverTapPushNotificationPayload) => void,
  ): Promise<PluginListenerHandle>;

  /**
   * Fired when the device enters a monitored geofence.
   */
  addListener(
    eventName: 'geofenceEnteredListener',
    listenerFunc: (event: GeofenceStatusChange) => void,
  ): Promise<PluginListenerHandle>;

  /**
   * Fired when the device exits a monitored geofence.
   */
  addListener(
    eventName: 'geofenceExitedListener',
    listenerFunc: (event: GeofenceStatusChange) => void,
  ): Promise<PluginListenerHandle>;

  /**
   * Returns the location permission state used by geofencing.
   *
   * Android 9 and below have no separate background location permission, so
   * `backgroundUpdate` never reports `granted` there.
   */
  checkPermissions(): Promise<PermissionStatus>;

  /**
   * Requests location permission for geofencing.
   *
   * Android: on Android 11+ the system ignores a request that asks for
   * background location together with foreground location, so request
   * `location` first and `backgroundUpdate` in a second call.
   *
   * iOS: ignores `permissions`. It requests "Always" authorization when
   * Info.plist has `NSLocationAlwaysAndWhenInUseUsageDescription`, "When In Use"
   * otherwise, and rejects if `NSLocationWhenInUseUsageDescription` is missing.
   */
  requestPermissions(options?: CleverTapPluginPermissions): Promise<PermissionStatus>;
}

export interface ProfileGetIDResult {
  /** CleverTap ID of the current device. */
  id: string;
}

export interface RecordEventOptions {
  /** Event name. */
  event: string;
  /**
   * Event properties. Required: pass `{}` when there are none.
   *
   * Values can be strings, numbers or booleans. Send dates as `"$D_" + epoch seconds`
   * strings (e.g. `"$D_1700000000"`): a JS `Date` reaches native code as an ISO
   * string, which CleverTap doesn't treat as a date.
   */
  properties: any;
}

export interface RecordChargedEventOptions {
  /** Transaction details, e.g. `{ Amount: 300, 'Payment Mode': 'Card', 'Charged ID': 'order-123' }`. */
  details: any;
  /** Purchased items, one object per item, e.g. `{ Category: 'books', Name: 'Book 1', Quantity: 1 }`. */
  items: any[];
}

export interface ProfileIncrementValueOptions {
  /** Profile property name. */
  key: string;
  /** Amount to add. Integers and decimals both work. */
  value: number;
}

export interface ProfilePropertiesOptions {
  /**
   * Profile properties.
   *
   * CleverTap reserves some keys (`Identity`, `Name`, `Email`, `Phone`, `Gender`,
   * `DOB`, …); anything else is stored as a custom property. Send dates such as
   * `DOB` as `"$D_" + epoch seconds` strings (e.g. `"$D_631152000"`).
   */
  profileProperties: any;
}

export interface SetLocationOptions {
  /** Latitude in degrees. */
  lat: number;
  /** Longitude in degrees. */
  lng: number;
}

export interface SetPushTokenOptions {
  /** FCM token on Android, APNs device token (hex) on iOS. */
  token: string;
}

export interface SetDebugLevelOptions {
  /** Log level. */
  level: DEBUG_LEVEL;
}

export interface GeofenceInitializedEvent {
  /** Always `"INITIALIZED"`. */
  status: string;
}

export interface LocationUpdateEvent {
  /** Latitude in degrees. */
  lat: number;
  /** Longitude in degrees. */
  lng: number;
}

/**
 * `location`: foreground location. `backgroundUpdate`: background ("Always") location.
 */
export type CleverTapPermissionType = 'location' | 'backgroundUpdate';

export interface CleverTapPluginPermissions {
  /** Permissions to request (Android only). Defaults to all of them. */
  permissions?: CleverTapPermissionType[];
}

export interface PermissionStatus {
  /** Foreground location. */
  location: PermissionState;
  /** Background ("Always") location. */
  backgroundUpdate: PermissionState;
}

/**
 * The geofence that was entered or exited.
 */
export interface GeofenceStatusChange {
  /** Geofence ID. */
  id: number;
  /** ID of the geofence's cluster. */
  gcId: number;
  /** Name of the geofence's cluster. */
  gcName: string;
  /** Latitude of the geofence's centre. */
  lat: number;
  /** Longitude of the geofence's centre. */
  lng: number;
  /** Geofence radius in metres. */
  r: number;
  /** Latitude where the transition was detected. Android only. */
  triggered_lat?: number;
  /** Longitude where the transition was detected. Android only. */
  triggered_lng?: number;
}

/**
 * A tapped CleverTap push. Every key of the push payload is also included as a
 * top-level property, including custom key-value pairs and CleverTap's `wzrk_*` keys.
 */
export interface CleverTapPushNotificationPayload {
  /** Notification title. */
  title: string;
  /** Notification body. */
  body: string;
  /** Not populated: custom key-value pairs are top-level properties. */
  data: any;
  /** Big-picture image URL. Missing when the notification has no picture. */
  image?: string;
}
