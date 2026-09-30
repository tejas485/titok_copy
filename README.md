# 📱 TikTok-Style Short-Video Streaming Platform

A high-performance, low-latency, short-video streaming and upload platform built using **Flutter** and **Node.js**. This platform completely bypasses traditional rest-based HTTP constraints by utilizing an end-to-end **gRPC over HTTP/2** architecture, enabling smooth vertical video scrolling, real-time download progress tracking, and client-streaming binary media uploads.

---

## 🚀 Key Features

* **Infinite Video Loop Feed:** Vertical swipe mechanics (similar to TikTok) backed by a smart modulo calculation engine that loops a collection of videos seamlessly without index bounds or crashing.
* **Dynamic Connection Hub (No Hardcoding):** A real-time connection box in the mobile UI that allows developers to paste temporary secure tunnel URLs (like Pinggy, ngrok, or Cloudflare) to bridge the mobile device directly to a remote development workspace over the air.
* **Progress-Aware Streaming:** Displays real-time download status indicators (e.g., `Streaming Video Chunk: 45%`) calculated on the fly as individual binary fragments arrive.
* **Client-Streaming Media Uploads:** Allows users to pick/record videos on their mobile device and stream them up to the backend in synchronized binary blocks, instantly refreshing the server’s media catalog.
* **Sleek Portfolio Grids:** Dynamically maps creator profiles—including a special master portfolio folder—into an efficient 3-column media preview explorer matching standard modern entertainment layouts.

---

## 🛠️ Technical Specifications & Architecture

The ecosystem relies on structural serialization contracts defined via **Protocol Buffers (Protobuf)**, executing RPC (Remote Procedure Call) operations over a persistent multiplexed HTTP/2 transport link.

### 🌐 Network & Infrastructure Topography
```text
+-----------------------------+               +-------------------------------+

|     Mobile Client App       |               | Public Internet TCP Tunnel    |
|   (Physical / Emulator)     |==[ HTTP/2 ]==>| (e.g., Pinggy/ngrok Port 443) |
| Secure/Insecure Channels    |               | Passes raw binary data clean  |
+-----------------------------+               +-------------------------------+
                                                              ||
                                                              \/
                                              +-------------------------------+

                                              |    Backend Node gRPC Engine   |
                                              |     Listening on Port 3005    |
                                              |   Compiles directly to disk   |
                                              +-------------------------------+
```

### 📊 Data Exchange Workflows

#### 🔑 1. Short-Lived Token Authentication Loop
* On initial app launch, the client triggers the `GetAuthToken` unary RPC method.
* The server verifies the client identity and responds with a signed **JSON Web Token (JWT)** with a strict **1-hour lifespan (3600 seconds)**.
* **Automatic Cache Refresh Interceptor:** The mobile infrastructure monitors all outbound pipelines. If any request catches a gRPC Status `16 (UNAUTHENTICATED)` exception due to token expiration, an interceptor automatically clears cache memory, requests a fresh token in the background, and seamlessly retries the interrupted video flow.

#### 📺 2. Continuous Video Feed (Server-to-Client Streaming)
* When a user advances positions on the swiping feed, the mobile app invokes `StreamFeedVideo`, passing the active token and the current virtual position integer (`video_index`).
* The backend intercepts the integer and processes an internal folder modulo calculation against the storage tree (`/videos`). This automatically maps any index beyond the current file count (e.g., index `10`) smoothly back to `v1.mp4`.
* The server opens a read stream from the local hard drive using a specialized operational **64KB frame chunk buffer allocation size** (`highWaterMark: 65536`) to protect system memory under load.
* As chunks are pushed down the wire, the mobile application receives them inside an asynchronous stream handler, continuously updating UI progress loops (`current_byte / total_bytes`) before assembling the final file buffer into native media players (`VideoPlayerController`).

#### 🗂️ 3. Profile Catalog Synchronization
* When loading user grids, the app dispatches `GetProfileData` with a targeted folder pointer (`profile_id: "profile_10_all"`).
* The server dynamically rescans the directory structure tree on the fly to capture any newly uploaded files and passes back a structural array payload container holding current filename keys and user metadata.

#### 📤 4. Mobile-to-Server Uploads (Client-to-Server Streaming)
* To push a video up to the system, the mobile app opens a client-streaming pipeline using the `UploadMediaFile` endpoint contract.
* The app reads the file from local phone storage and slices the raw data array into successive **64KB binary chunks** inside memory.
* The app iterates through the chunks and writes them sequentially onto the open gRPC stream channel along with metadata headers (active token and destination filename).
* The backend catches the sequential packets and passes them directly to a live filesystem write pipe (`fs.createWriteStream`). Once the client closes the stream, the file assembly completes, updates the global profile directories, and becomes instantly streamable across the app ecosystem.

---

## 🗂️ Protocol Buffer Interface Definition (`media.proto`)

```protobuf
syntax = "proto3";

package media;

service MediaService {
  rpc GetAuthToken (AuthRequest) returns (AuthResponse);
  rpc StreamFeedVideo (FeedRequest) returns (stream VideoChunk);
  rpc GetProfileData (ProfileRequest) returns (ProfileResponse);
  rpc UploadMediaFile (stream UploadRequest) returns (UploadResponse);
}

message AuthRequest {
  string client_id = 1;
}

message AuthResponse {
  bool success = 1;
  string token = 2;
  int32 expires_in_seconds = 3;
}

message FeedRequest {
  string token = 1;
  int32 video_index = 2; 
}

message VideoChunk {
  bytes chunk_data = 1;   
  int64 current_byte = 2;
  int64 total_bytes = 3;
}

message ProfileRequest {
  string token = 1;
  string profile_id = 2;  
}

message ProfileResponse {
  bool success = 1;
  string profile_id = 2;
  string username = 3;
  string display_name = 4;
  string avatar_url = 5;
  repeated string video_list = 6; 
}

message UploadRequest {
  string token = 1;
  string filename = 2;
  bytes chunk_data = 3;
}

message UploadResponse {
  bool success = 1;
  string message = 2;
  string file_id = 3;
}
```

---

## 🏁 Quickstart Guide for Sandbox Environments

### 🚀 Running the Server
1. Ensure a local directory named `/videos` exists in your project root containing your initial test media assets (`v1.mp4`, `v2.mp4`, etc.).
2. Kill any conflicting active network locks and spin up the Node engine:
   ```bash
   fuser -k 3005/tcp && node grpc-server.js
   ```

### 🌐 Establishing the Network Tunnel
Open a separate split terminal window panel instance and spin up a raw TCP tunnel to preserve binary HTTP/2 frames intact across the public internet:
```bash
ssh -p 443 -R 0:localhost:3005 tcp@a.pinggy.io
```
Copy the generated connection string (e.g., `jtkdm-something.run.pinggy-free.link:38173`), paste it directly into your live mobile runtime input textbox field, and click **Connect**.
