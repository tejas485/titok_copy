# 📱 TikTok-Style Short-Video Flutter Client

A high-performance Flutter mobile application layout implementing a vertically swipeable entertainment feed and a creator profile grid system. This repository contains the complete frontend architecture designed to communicate seamlessly with a detached, remote backend service over an **end-to-end gRPC layer**.

---

## 🚀 Key Features

* **Infinite Video Loop Feed:** Vertical swipe mechanics backed by an asynchronous modulo loop compilation engine that plays an endless scroll of videos without index crashes.
* **Dynamic Connection Box (No Hardcoding):** A real-time connection input field in the mobile UI that accepts live TCP tunnel endpoints (like Pinggy, ngrok, or localhost.run) to bind the app to a remote workspace over the air.
* **Progress-Aware Streaming:** Displays dynamic loading loops (e.g., `Streaming Video Chunk: 62%`) calculated on the fly as binary fragments arrive.
* **Client-Streaming Media Uploads:** Reads local device video assets, segments them into precise **64KB chunks**, and streams them across a single HTTP/2 connection wire to save new videos live onto the server.

---

## 🛠️ Cross-Repo Technical Architecture

```text
+------------------------------+                 +-------------------------------+

|    Mobile Flutter Client     |                 | Public Internet TCP Tunnel    |
| (Physical Phone / Emulator)  |===[ HTTP/2 ]===>| (e.g., Pinggy/ngrok Port 443) |
| Insecure Multiplexed Channel |                 | Bypasses web proxy downgrades |
+------------------------------+                 +-------------------------------+
                                                                 ||
                                                                 \/
                                                 +-------------------------------+

                                                 | Remote Backend Repository     |
                                                 | (Running in separate runtime) |
                                                 +-------------------------------+
```

### 📊 External Data Exchange Operations

#### 🔑 1. Short-Lived Token Authentication Loop
* On initial app launch, the application calls the `GetAuthToken` method to fetch a signed **JWT token** valid for **1 hour (3600 seconds)**.
* **Error Interception:** If any remote procedure call catches a gRPC Status `16 (UNAUTHENTICATED)` exception due to token timeout, an internal interceptor background process clears cache memory, requests a fresh token, and automatically retries the broken video flow.

#### 📺 2. Continuous Video Feed System
* As the user scrolls, the app requests the virtual position target (`video_index`). 
* Inbound binary `bytes` fragments are caught inside an asynchronous stream handler, tracked via a progress indicator (`current_byte / total_bytes`), and assembled directly into a temporary file on the device filesystem storage layout for seamless playback initialization.

#### 📤 3. Mobile-to-Server Upload Pipeline
* Slices a selected video asset file into low-latency **64KB binary chunks** inside memory.
* Packs individual `UploadRequest` messages with the authentication token and target filename properties, streaming the frames continuously down the channel wire until an end block signal is emitted.

---

## 🛠️ Protocol Buffer Client Interface (`media.proto`)

Ensure this compilation file contract matches the detached server structure:

```protobuf
syntax = "proto3";

package media;

service MediaService {
  rpc GetAuthToken (AuthRequest) returns (AuthResponse);
  rpc StreamFeedVideo (FeedRequest) returns (stream VideoChunk);
  rpc GetProfileData (ProfileRequest) returns (ProfileResponse);
  rpc UploadMediaFile (stream UploadRequest) returns (UploadResponse);
}

message AuthRequest { string client_id = 1; }
message AuthResponse { bool success = 1; string token = 2; int32 expires_in_seconds = 3; }
message FeedRequest { string token = 1; int32 video_index = 2; }
message VideoChunk { bytes chunk_data = 1; int64 current_byte = 2; int64 total_bytes = 3; }
message ProfileRequest { string token = 1; string profile_id = 2; }
message ProfileResponse {
  bool success = 1; string profile_id = 2; string username = 3;
  string display_name = 4; string avatar_url = 5; repeated string video_list = 6;
}
message UploadRequest { string token = 1; string filename = 2; bytes chunk_data = 3; }
message UploadResponse { bool success = 1; string message = 2; string file_id = 3; }
```
