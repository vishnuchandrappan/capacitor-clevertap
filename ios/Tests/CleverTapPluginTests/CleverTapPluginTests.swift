import XCTest
@testable import CleverTapPlugin

class CleverTapPluginTests: XCTestCase {
    func testRegistersTheJavaScriptAPI() {
        let plugin = CleverTapPlugin()
        XCTAssertEqual(plugin.jsName, "CleverTapAnalytics")

        // Every method in src/definitions.ts except triggerLocation, which is Android-only.
        let expected: Set<String> = [
            "profileGetID", "recordEvent", "recordChargedEvent", "profileIncrementValue", "profilePush",
            "setLocation", "setPushTokenAs", "onUserLogin", "stopGeofence", "initGeofence", "setDebugLevel",
            "checkPermissions", "requestPermissions"
        ]
        let registered = Set(plugin.pluginMethods.map { $0.name })
        XCTAssertEqual(registered, expected)
    }
}
