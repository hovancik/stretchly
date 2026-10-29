// Prints whether any process is using a camera or a microphone, e.g.
// {"camera":false,"microphone":true,"microphoneApps":["us.zoom.xos"]}
// Only device and process state is read, so no camera or microphone
// permission is needed.

import CoreAudio
import CoreMediaIO
import Foundation

let systemObject = AudioObjectID(kAudioObjectSystemObject)

func cameraInUse() -> Bool {
    let system = CMIOObjectID(kCMIOObjectSystemObject)
    var address = CMIOObjectPropertyAddress(
        mSelector: CMIOObjectPropertySelector(kCMIOHardwarePropertyDevices),
        mScope: CMIOObjectPropertyScope(kCMIOObjectPropertyScopeGlobal),
        mElement: CMIOObjectPropertyElement(kCMIOObjectPropertyElementMain)
    )
    var size: UInt32 = 0
    guard CMIOObjectGetPropertyDataSize(system, &address, 0, nil, &size) == kCMIOHardwareNoError, size > 0 else {
        return false
    }
    var devices = [CMIODeviceID](repeating: 0, count: Int(size) / MemoryLayout<CMIODeviceID>.size)
    var used: UInt32 = 0
    guard CMIOObjectGetPropertyData(system, &address, 0, nil, size, &used, &devices) == kCMIOHardwareNoError else {
        return false
    }
    return devices.prefix(Int(used) / MemoryLayout<CMIODeviceID>.size).contains { device in
        var runningAddress = CMIOObjectPropertyAddress(
            mSelector: CMIOObjectPropertySelector(kCMIODevicePropertyDeviceIsRunningSomewhere),
            mScope: CMIOObjectPropertyScope(kCMIOObjectPropertyScopeWildcard),
            mElement: CMIOObjectPropertyElement(kCMIOObjectPropertyElementMain)
        )
        var running: UInt32 = 0
        var runningUsed: UInt32 = 0
        let status = CMIOObjectGetPropertyData(device, &runningAddress, 0, nil,
                                               UInt32(MemoryLayout<UInt32>.size), &runningUsed, &running)
        return status == kCMIOHardwareNoError && running != 0
    }
}

func audioAddress(_ selector: AudioObjectPropertySelector,
                  _ scope: AudioObjectPropertyScope = kAudioObjectPropertyScopeGlobal) -> AudioObjectPropertyAddress {
    AudioObjectPropertyAddress(mSelector: selector, mScope: scope, mElement: kAudioObjectPropertyElementMain)
}

func audioObjects(_ object: AudioObjectID, _ selector: AudioObjectPropertySelector,
                  _ scope: AudioObjectPropertyScope = kAudioObjectPropertyScopeGlobal) -> [AudioObjectID] {
    var address = audioAddress(selector, scope)
    var size: UInt32 = 0
    guard AudioObjectGetPropertyDataSize(object, &address, 0, nil, &size) == noErr, size > 0 else {
        return []
    }
    var objects = [AudioObjectID](repeating: 0, count: Int(size) / MemoryLayout<AudioObjectID>.size)
    guard AudioObjectGetPropertyData(object, &address, 0, nil, &size, &objects) == noErr else {
        return []
    }
    return Array(objects.prefix(Int(size) / MemoryLayout<AudioObjectID>.size))
}

func audioFlag(_ object: AudioObjectID, _ selector: AudioObjectPropertySelector) -> Bool {
    var address = audioAddress(selector)
    var value: UInt32 = 0
    var size = UInt32(MemoryLayout<UInt32>.size)
    return AudioObjectGetPropertyData(object, &address, 0, nil, &size, &value) == noErr && value != 0
}

func processName(_ process: AudioObjectID) -> String {
    var address = audioAddress(kAudioProcessPropertyBundleID)
    var bundleID: Unmanaged<CFString>?
    var size = UInt32(MemoryLayout<Unmanaged<CFString>?>.size)
    if AudioObjectGetPropertyData(process, &address, 0, nil, &size, &bundleID) == noErr, let bundleID {
        let name = bundleID.takeRetainedValue() as String
        if !name.isEmpty {
            return name
        }
    }
    var pidAddress = audioAddress(kAudioProcessPropertyPID)
    var pid: pid_t = 0
    size = UInt32(MemoryLayout<pid_t>.size)
    _ = AudioObjectGetPropertyData(process, &pidAddress, 0, nil, &size, &pid)
    return "pid \(pid)"
}

// macOS 14+ reports audio input per process. Unlike device state, this is not
// fooled by audio playing through a headset that also has a microphone.
func microphoneApps() -> [String]? {
    var address = audioAddress(kAudioHardwarePropertyProcessObjectList)
    guard AudioObjectHasProperty(systemObject, &address) else {
        return nil
    }
    return audioObjects(systemObject, kAudioHardwarePropertyProcessObjectList)
        .filter { audioFlag($0, kAudioProcessPropertyIsRunningInput) }
        .map(processName)
}

func inputDeviceInUse() -> Bool {
    audioObjects(systemObject, kAudioHardwarePropertyDevices).contains { device in
        !audioObjects(device, kAudioDevicePropertyStreams, kAudioObjectPropertyScopeInput).isEmpty &&
            audioFlag(device, kAudioDevicePropertyDeviceIsRunningSomewhere)
    }
}

let apps = microphoneApps()
let state: [String: Any] = [
    "camera": cameraInUse(),
    "microphone": apps.map { !$0.isEmpty } ?? inputDeviceInUse(),
    "microphoneApps": apps ?? []
]

do {
    var output = try JSONSerialization.data(withJSONObject: state, options: [.sortedKeys])
    output.append(0x0A)
    FileHandle.standardOutput.write(output)
} catch {
    FileHandle.standardError.write(Data("call-detector: \(error)\n".utf8))
    exit(1)
}
