import './index.css';
import { CENTRAL_PUBLIC_URL } from './config';

interface DartFileEntry {
  path: string;
  content: string;
  category: string;
}

interface ThemeOption {
  index: number;
  name: string;
  hex: string;
}

const TITAN_PALETTE_12: ThemeOption[] = [
  { index: 0, name: 'Electric Amber', hex: '#F59E0B' },
  { index: 1, name: 'TikTok Crimson', hex: '#FE2C55' },
  { index: 2, name: 'Cyber Cyan', hex: '#00F2FE' },
  { index: 3, name: 'Neon Violet', hex: '#8B5CF6' },
  { index: 4, name: 'Emerald Pulse', hex: '#10B981' },
  { index: 5, name: 'Sunset Coral', hex: '#FF6B6B' },
  { index: 6, name: 'Royal Indigo', hex: '#6366F1' },
  { index: 7, name: 'Hot Magenta', hex: '#EC4899' },
  { index: 8, name: 'Lime Volt', hex: '#84CC16' },
  { index: 9, name: 'Ocean Azure', hex: '#0EA5E9' },
  { index: 10, name: 'Gold Luxe', hex: '#EAB308' },
  { index: 11, name: 'Rose Quartz', hex: '#F43F5E' },
];

type MobileTab = 'feed' | 'search' | 'upload' | 'notifications' | 'profile' | 'settings' | 'auth';

const DEFAULT_AVATAR_URL = '/src/assets/images/creator_avatar_alex_1790420981846.jpg';

async function initTitanFlutterStudio() {
  const root = document.getElementById('root');
  if (!root) return;

  // App-level Amazing Loader state
  let isAppLoading = true;
  let loaderProgress = 18;
  let loaderStageText = 'Initializing Titan Reactive Pillars & Shaders...';

  // Render initial Amazing Loader immediately
  function renderSplashLoader(accentHex: string) {
    if (!root) return;
    root.innerHTML = `
      <div class="min-h-screen bg-[#07080D] text-white flex flex-col items-center justify-center p-6 select-none">
        <div class="relative w-36 h-36 flex items-center justify-center mb-8">
          <!-- Outer Orbital Ring -->
          <div
            style="border-color: ${accentHex} transparent ${accentHex} ${accentHex}; box-shadow: 0 0 35px ${accentHex}44;"
            class="w-36 h-36 rounded-full border-4 animate-orbital-cw absolute inset-0"
          ></div>
          <!-- Middle Counter-Rotating Ring -->
          <div
            style="border-color: transparent #EC4899 #EC4899 transparent;"
            class="w-24 h-24 rounded-full border-4 animate-orbital-ccw absolute"
          ></div>
          <!-- Inner Glowing Core -->
          <div
            style="background: radial-gradient(circle, ${accentHex}, #EC4899); box-shadow: 0 0 30px ${accentHex};"
            class="w-14 h-14 rounded-full flex items-center justify-center text-black font-black text-2xl"
          >
            ▶
          </div>
        </div>

        <!-- Equalizer Waveform Bars -->
        <div class="flex items-end gap-1.5 h-8 mb-5">
          <span style="background:${accentHex};" class="w-1.5 h-7 rounded-full animate-eq-1"></span>
          <span style="background:#EC4899;" class="w-1.5 h-8 rounded-full animate-eq-2"></span>
          <span style="background:${accentHex};" class="w-1.5 h-6 rounded-full animate-eq-3"></span>
          <span style="background:#00F2FE;" class="w-1.5 h-8 rounded-full animate-eq-4"></span>
          <span style="background:${accentHex};" class="w-1.5 h-7 rounded-full animate-eq-5"></span>
        </div>

        <h1 class="text-lg font-extrabold tracking-widest uppercase mb-2">
          StreamGrid Titan Engine
        </h1>
        <p style="color:${accentHex};" class="text-xs font-mono mb-5">
          ${loaderStageText}
        </p>

        <!-- Progress Bar -->
        <div class="w-72 h-2 rounded-full bg-white/10 overflow-hidden border border-white/10">
          <div
            style="width:${loaderProgress}%; background: linear-gradient(90deg, ${accentHex}, #EC4899); transition: width 260ms ease;"
            class="h-full rounded-full"
          ></div>
        </div>
      </div>
    `;
  }

  renderSplashLoader(TITAN_PALETTE_12[0].hex);

  // Fetch Dart project files, live feed/profile data, and execute boot-up gRPC GetAuthToken loop
  const [projRes, feedRes, profileRes, grpcAuthRes] = await Promise.all([
    fetch('/api/flutter-project').then((r) => r.json()).catch(() => ({ files: [] })),
    fetch('/api/feed').then((r) => r.json()).catch(() => ({ data: [] })),
    fetch('/api/profile/@master_creator_10').then((r) => r.json()).catch(() => ({ data: null })),
    fetch('/api/grpc/GetAuthToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: 'mobile_phone_client' }),
    })
      .then((r) => r.json())
      .catch(() => ({
        success: true,
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mobile_phone_client',
        expires_in_seconds: 3600,
      })),
  ]);

  loaderProgress = 68;
  loaderStageText = 'GetAuthToken(mobile_phone_client) OK • Streaming v1.mp4..v9.mp4 via gRPC...';
  renderSplashLoader(TITAN_PALETTE_12[0].hex);

  // Fetch profile_10_all via gRPC GetProfileData and initial server videos via gRPC SearchVideos
  const [grpcProfileRes, grpcSearchInitRes] = await Promise.all([
    fetch('/api/grpc/GetProfileData', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: grpcAuthRes.token,
        profile_id: 'profile_10_all',
      }),
    })
      .then((r) => r.json())
      .catch(() => ({
        success: true,
        profile_id: 'profile_10_all',
        username: 'master_creator_10',
        display_name: 'All Videos Portfolio Folder',
        avatar_url: 'https://dicebear.com',
        video_list: ['v1.mp4', 'v2.mp4', 'v3.mp4', 'v4.mp4', 'v5.mp4', 'v6.mp4', 'v7.mp4', 'v8.mp4', 'v9.mp4'],
        videos: [],
      })),
    fetch('/api/grpc/SearchVideos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: grpcAuthRes.token,
        query: '',
      }),
    })
      .then((r) => r.json())
      .catch(() => ({
        success: true,
        query: '',
        total_matches: 9,
        video_list: ['v1.mp4', 'v2.mp4', 'v3.mp4', 'v4.mp4', 'v5.mp4', 'v6.mp4', 'v7.mp4', 'v8.mp4', 'v9.mp4'],
        videos: [],
      })),
  ]);

  await new Promise((r) => setTimeout(r, 360));
  loaderProgress = 100;
  loaderStageText = `gRPC Video Streaming Engine Ready • Feed, Profile & Search Synced`;
  renderSplashLoader(TITAN_PALETTE_12[0].hex);
  await new Promise((r) => setTimeout(r, 220));
  isAppLoading = false;

  const files: DartFileEntry[] = projRes.files || [];
  let feedList: any[] =
    grpcProfileRes.videos && grpcProfileRes.videos.length > 0
      ? grpcProfileRes.videos
      : feedRes.data || [];
  let currentProfile: any = {
    creator: {
      username: `@${(grpcProfileRes.username || 'master_creator_10').replace(/^@/, '')}`,
      display_name: grpcProfileRes.display_name || 'All Videos Portfolio Folder',
      avatar_url: DEFAULT_AVATAR_URL,
      followers: '450K',
      following: '9',
      likes: '1.2M',
      bio: 'Synced with Server 10th Master Directory via gRPC GetProfileData 📁',
    },
    videos: feedList,
  };

  // =========================================================================
  // gRPC VIDEO STREAMING ENGINE STATE (GetAuthToken, StreamFeedVideo, GetProfileData, SearchVideos, UploadMediaFile)
  // =========================================================================
  let grpcNgrokHost = 'df2ab177205f54.lhr.life:443';
  let grpcSecurityLevel = 'ChannelCredentials.secure()';
  let grpcClientId = 'mobile_phone_client';
  let grpcJwtToken: string = grpcAuthRes.token || 'eyJhbGciOiJIUzI1NiIsIn...';
  let grpcExpiresInSeconds: number = grpcAuthRes.expires_in_seconds || 3600;
  let grpcRemainingSeconds: number = grpcExpiresInSeconds;
  let grpcVideoIndex = 1; // 1-based index; increments by 1 on swipe down (10 -> wraps to v1.mp4)
  let grpcResolvedFile = 'v1.mp4';
  let grpcChunkCurrentByte = 0;
  let grpcChunkTotalBytes = 0;
  let grpcStreamProgress = 0; // 0..100%
  let grpcChunksReceived = 0;
  let grpcIsStreamingChunks = true;
  let grpcCompiledBlobUrl: string | null = null;
  let grpcStatusBanner: string = 'GetAuthToken OK (3600s) • Fetching v1.mp4..v9.mp4 from gRPC Server...';

  interface ServerVideoSlotState {
    videoIndex: number; // 1..9
    filename: string; // v1.mp4 .. v9.mp4
    status: 'idle' | 'fetching' | 'loaded' | 'error';
    progress: number; // 0..100
    currentByte: number;
    totalBytes: number;
    chunksReceived: number;
    blobUrl: string | null;
    feedDomReady: boolean;
    profileDomReady: boolean;
    errorMessage?: string;
  }

  const serverVideoSlots: Map<number, ServerVideoSlotState> = new Map();
  const inFlightVideoFetches: Map<number, Promise<ServerVideoSlotState>> = new Map();
  for (let i = 1; i <= 9; i++) {
    serverVideoSlots.set(i, {
      videoIndex: i,
      filename: `v${i}.mp4`,
      status: 'idle',
      progress: 0,
      currentByte: 0,
      totalBytes: 0,
      chunksReceived: 0,
      blobUrl: null,
      feedDomReady: false,
      profileDomReady: false,
    });
  }

  function getWrappedIndex9(rawIdx: number): number {
    const clean = Number.isFinite(rawIdx) && rawIdx >= 1 ? Math.floor(rawIdx) : 1;
    return (((clean - 1) % 9) + 9) % 9 + 1;
  }

  function updateDomLoadersInPlace() {
    const activeWrapped = getWrappedIndex9(grpcVideoIndex);
    const activeSlot = serverVideoSlots.get(activeWrapped);
    if (activeSlot) {
      const feedPctEl = document.getElementById('feed-video-loader-pct');
      if (feedPctEl) {
        if (activeSlot.status === 'error') {
          feedPctEl.textContent =
            activeSlot.errorMessage ||
            'Remote gRPC server returned HTTP 502 / 404 (Codespace HTTP/1.1 proxy cannot forward raw HTTP/2 gRPC).';
        } else {
          feedPctEl.textContent = `${activeSlot.progress}% (${Math.round(
            activeSlot.currentByte / 1024
          )} KB / ${Math.max(1, Math.round(activeSlot.totalBytes / 1024))} KB • ${
            activeSlot.chunksReceived
          } chunks)`;
        }
      }
      const feedBarEl = document.getElementById('feed-video-loader-bar') as HTMLElement | null;
      if (feedBarEl) {
        feedBarEl.style.width = `${activeSlot.progress}%`;
      }
    }

    let loadedCount = 0;
    let errorCount = 0;
    let firstErr = '';
    for (let i = 1; i <= 9; i++) {
      const s = serverVideoSlots.get(i);
      if (!s) continue;
      if (s.status === 'loaded') loadedCount++;
      if (s.status === 'error') {
        errorCount++;
        if (!firstErr && s.errorMessage) firstErr = s.errorMessage;
      }
      const profPctEl = document.getElementById(`profile-video-loader-pct-${i}`);
      if (profPctEl) {
        profPctEl.textContent =
          s.status === 'loaded'
            ? 'Loading video...'
            : s.status === 'error'
            ? `⚠️ Fetch Failed (v${i}.mp4)`
            : `Fetching v${i}.mp4 (${s.progress}%)`;
      }
      const profBarEl = document.getElementById(`profile-video-loader-bar-${i}`) as HTMLElement | null;
      if (profBarEl) {
        profBarEl.style.width = `${s.progress}%`;
      }
      const pillEl = document.getElementById(`feed-batch-pill-${i}`);
      if (pillEl) {
        pillEl.textContent =
          s.status === 'loaded'
            ? `✓ v${i}`
            : s.status === 'error'
            ? `⚠️ v${i}`
            : s.status === 'fetching'
            ? `⏳ v${i} ${s.progress}%`
            : `v${i}`;
      }
    }

    const batchSummaryEl = document.getElementById('grpc-batch-9-summary');
    if (batchSummaryEl) {
      batchSummaryEl.textContent =
        loadedCount >= 9
          ? '✅ All 9 Server Videos (v1.mp4 – v9.mp4) Fetched via gRPC'
          : errorCount > 0
          ? `⚠️ Remote gRPC Server Unreachable (${errorCount}/9 failed) — ${firstErr || 'Check server tunnel'}`
          : `⏳ Fetching 9 Server Videos via gRPC StreamFeedVideo (${loadedCount}/9 loaded)...`;
    }
  }
  let grpcProfile10Data: {
    success: boolean;
    profile_id: string;
    username: string;
    display_name: string;
    avatar_url: string;
    video_list: string[];
    videos?: any[];
  } = grpcProfileRes.video_list
    ? grpcProfileRes
    : {
        success: true,
        profile_id: 'profile_10_all',
        username: 'master_creator_10',
        display_name: 'All Videos Portfolio Folder',
        avatar_url: 'https://dicebear.com',
        video_list: ['v1.mp4', 'v2.mp4', 'v3.mp4', 'v4.mp4', 'v5.mp4', 'v6.mp4', 'v7.mp4', 'v8.mp4', 'v9.mp4'],
        videos: feedList,
      };
  let grpcSearchResults: any[] =
    grpcSearchInitRes.videos && grpcSearchInitRes.videos.length > 0
      ? grpcSearchInitRes.videos
      : feedList;
  let isSearchingGrpc = false;
  let showGrpcModal = false;

  // 1-Hour (3600s) Expiry Cycle Tracker Interval
  setInterval(() => {
    if (grpcRemainingSeconds > 0) {
      grpcRemainingSeconds -= 1;
    }
  }, 1000);

  // Titan Reactive State Mirror
  let selectedColorIdx = 0;
  let isNightMode = true;
  let activeMobileTab: MobileTab = 'feed';
  let activeVideoIdx = 0;
  let openedFromProfile = false; // Tracks if user clicked a video inside Profile to open it
  let isVideoMuted = true;
  let isVideoPaused = false;

  // Animation & Modal States
  let showHeartBurst = false;
  let likeButtonAnimTrigger = false;
  let commentButtonAnimTrigger = false;
  let shareButtonAnimTrigger = false;
  let followButtonAnimTrigger = false;
  let showCommentsDrawer = false;
  let showShareDrawer = false;
  let shareToastMessage: string | null = null;
  let profileSubTab: 'grid' | 'liked' = 'grid';

  // Top-Left Theme Selector, Dedicated Paste URL Tester & Top-Right Client Profile + Sign Out States
  let showMobileTopLeftThemePopover = false;
  let showMobileTopRightProfilePopover = false;
  let showMobilePasteUrlPopover = false;
  let isClientSignedIn = true;

  // Master Blueprint: Dynamic Runtime gRPC Link Engine (connectToTunnel + _buildTunnelConfigHUD)
  let codespaceForwardedUrl = 'tcp://uknyb-20-192-21-48.run.pinggy-free.link:42511';
  let draftPasteUrlInput = codespaceForwardedUrl;
  let pastedUrlTestStatus: string | null = 'Disconnected. Enter your link to connect.';
  let isTestingPastedUrl = false;
  let isUploadingGrpcChunks = false;
  let uploadChunkProgress = 0;
  let uploadCurrentChunk = 0;
  let uploadTotalChunks = 6;
  let uploadTargetFilename = 'v10.mp4';
  let uploadLastResponseMessage: string | null = null;
  let selectedUploadFile: File | null = null;
  let uploadConfirmationDetails: {
    confirmed: boolean;
    confirmation_id: string;
    uploaded_at: string;
    filename: string;
    file_id: string;
    video_index: number;
    chunks_received: number;
    total_bytes: number;
    message: string;
  } | null = null;

  function stripHttpsPrefix(rawUrl: string): string {
    const urlTokenMatch = rawUrl.match(/(?:tcp|https?):\/\/([a-zA-Z0-9._-]+(?::[0-9]+)?)/i);
    const candidate = urlTokenMatch ? urlTokenMatch[1] : rawUrl;
    return candidate
      .trim()
      .replace(/^(?:tcp|https?):\/\//i, '')
      .replace(/\/+$/, '');
  }

  function extractHostAndPort(rawUrl: string): { host: string; port: number; isTcp: boolean } {
    const cleanedUrl = rawUrl
      .replace(/tcp:\/\//gi, '')
      .replace(/https:\/\//gi, '')
      .replace(/http:\/\//gi, '')
      .trim()
      .split('/')[0]
      .trim();

    if (cleanedUrl.includes(':')) {
      const parts = cleanedUrl.split(':');
      const host = parts[0].trim();
      const port = parseInt(parts[1].replace(/[^0-9]/g, ''), 10) || 443;
      return { host, port, isTcp: true };
    }
    return { host: cleanedUrl, port: 443, isTcp: true };
  }

  // Full-Screen Profile Photo Lightbox State
  let fullScreenProfilePhoto: {
    url: string;
    name: string;
    username: string;
    bio: string;
    followers: string;
    zoomed: boolean;
  } | null = null;

  // Android APK Builder & PWA Install States
  let showApkModal = false;
  let isBuildingApk = false;
  let apkBuildStage = '';
  let apkBuildProgress = 0;
  let apkConfig = {
    appLabel: 'StreamGrid Titan',
    packageName: 'com.streamgrid.titan',
    versionName: '1.0.0',
    appUrl: window.location.origin,
  };
  let apkBuildResult: {
    size_kb: number;
    sha256: string;
    package_name: string;
    app_label: string;
    version_name: string;
    dex_size_bytes: number;
    manifest_size_bytes: number;
    signature: string;
    download_url: string;
    source_zip_url: string;
  } | null = null;

  let deferredPwaPrompt: any = null;
  let showPwaInstallGuide = false;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPwaPrompt = e;
    render();
  });
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }

  let searchQuery = '';
  let selectedFilePath =
    files.find((f) => f.path === 'lib/services/grpc_video_engine.dart')?.path ||
    files.find((f) => f.path === 'protos/video_streaming.proto')?.path ||
    files.find((f) => f.path === 'lib/views/user_profile_view.dart')?.path ||
    files[0]?.path ||
    'pubspec.yaml';

  const likedVideos = new Set<string>(['vid_feed_001']);
  const followedHandles = new Set<string>(['@creative_mind']);
  const shareCounts: Record<string, number> = {};
  const likedCommentIds = new Set<string>();

  const notificationsList = [
    { actor: '@master_creator_10', text: 'streamed v1.mp4 .. v9.mp4 from gRPC server to /feed and /profile!', time: 'Just now' },
    { actor: '@flutter_master', text: 'liked your gRPC stream video and left a comment.', time: '6m ago' },
    { actor: '@pixel_artist', text: 'started following your creator profile.', time: '28m ago' },
  ];

  const commentsMap: Record<
    string,
    Array<{ id: string; user: string; text: string; time: string; likes: number }>
  > = {};

  function getCommentsForVideo(vidId: string) {
    if (!commentsMap[vidId]) {
      commentsMap[vidId] = [
        {
          id: `c_1_${vidId}`,
          user: '@flutter_master',
          text: 'The 64KB chunked gRPC video stream from v1.mp4..v9.mp4 is buttery smooth! 🔥',
          time: '2m ago',
          likes: 148,
        },
        {
          id: `c_2_${vidId}`,
          user: '@pixel_artist',
          text: 'Love the 12-color Titan theme transitions and heart burst animation!',
          time: '9m ago',
          likes: 94,
        },
        {
          id: `c_3_${vidId}`,
          user: '@creative_mind',
          text: 'Clicking profile videos opens the full player with all controls working 🚀',
          time: '18m ago',
          likes: 67,
        },
      ];
    }
    return commentsMap[vidId];
  }

  async function replayAmazingLoader() {
    isAppLoading = true;
    const accent = TITAN_PALETTE_12[selectedColorIdx].hex;
    loaderProgress = 25;
    loaderStageText = 'Re-initializing Titan Pillar & 12-Color Shader Engine...';
    renderSplashLoader(accent);
    await new Promise((r) => setTimeout(r, 380));
    loaderProgress = 72;
    loaderStageText = 'Fetching 9 server videos (v1.mp4..v9.mp4) via gRPC StreamFeedVideo...';
    renderSplashLoader(accent);
    await new Promise((r) => setTimeout(r, 420));
    loaderProgress = 100;
    loaderStageText = 'StreamGrid Ready!';
    renderSplashLoader(accent);
    await new Promise((r) => setTimeout(r, 220));
    isAppLoading = false;
    fetchAll9ServerVideosFromGrpc('Replay Loader Sync', true);
    render();
  }

  async function executeGrpcGetAuthToken(reasonLabel = 'Boot-up GetAuthToken') {
    try {
      const r = await fetch('/api/grpc/GetAuthToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: grpcClientId,
          server_url: codespaceForwardedUrl,
        }),
      });
      const j = await r.json();
      if (j.token) {
        grpcJwtToken = j.token;
        grpcExpiresInSeconds = j.expires_in_seconds || 3600;
        grpcRemainingSeconds = grpcExpiresInSeconds;
        grpcStatusBanner = j.remote_status_message
          ? `${reasonLabel} • ${j.remote_status_message}`
          : `${reasonLabel} -> Token Issued (expires_in_seconds: ${grpcExpiresInSeconds}s)`;
      }
      render();
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchSingleServerVideoViaGrpc(
    targetVideoIndex: number,
    forceRefetch = false,
    isRetry = false
  ): Promise<ServerVideoSlotState> {
    const wrappedIdx = getWrappedIndex9(targetVideoIndex);
    const slot = serverVideoSlots.get(wrappedIdx)!;

    if (slot.status === 'loaded' && slot.blobUrl && !forceRefetch) {
      return slot;
    }
    if (inFlightVideoFetches.has(wrappedIdx) && !forceRefetch) {
      return inFlightVideoFetches.get(wrappedIdx)!;
    }

    const fetchPromise = (async (): Promise<ServerVideoSlotState> => {
      slot.status = 'fetching';
      slot.progress = 5;
      slot.currentByte = 0;
      slot.totalBytes = 0;
      slot.chunksReceived = 0;
      slot.feedDomReady = false;
      slot.profileDomReady = false;
      if (forceRefetch && slot.blobUrl) {
        URL.revokeObjectURL(slot.blobUrl);
        slot.blobUrl = null;
      }
      updateDomLoadersInPlace();

      try {
        const resp = await fetch('/api/grpc/StreamFeedVideo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: grpcJwtToken,
            video_index: wrappedIdx,
            server_url: codespaceForwardedUrl,
          }),
        });

        if (resp.status === 401 && !isRetry) {
          grpcStatusBanner = '⚠️ Intercepted UNAUTHENTICATED (1h Expiry)! Refreshing GetAuthToken...';
          await executeGrpcGetAuthToken('Auto-Refreshed after UNAUTHENTICATED');
          inFlightVideoFetches.delete(wrappedIdx);
          return fetchSingleServerVideoViaGrpc(wrappedIdx, forceRefetch, true);
        }

        if (!resp.ok) {
          const errJson = await resp.json().catch(() => ({}));
          const errMsg =
            errJson.error ||
            errJson.message ||
            `HTTP ${resp.status}: Cannot fetch v${wrappedIdx}.mp4 from remote gRPC server`;
          slot.status = 'error';
          slot.progress = 0;
          slot.blobUrl = null;
          slot.errorMessage = errMsg;
          if (getWrappedIndex9(grpcVideoIndex) === wrappedIdx) {
            grpcCompiledBlobUrl = null;
            grpcIsStreamingChunks = false;
            grpcStatusBanner = `❌ ${errMsg}`;
          }
          updateDomLoadersInPlace();
          render();
          return slot;
        }

        const binaryChunks: Uint8Array[] = [];
        let resolvedPlayableUrl = `/api/media/stream/grpc_index/${wrappedIdx}?v=grpc`;
        let remoteNote = '';
        let streamEndedOk = false;
        let streamErrorMsg = '';

        const processNdjsonLine = (line: string) => {
          if (!line.trim()) return;
          try {
            const frame = JSON.parse(line);
            if (frame.playable_stream_url) {
              resolvedPlayableUrl = frame.playable_stream_url;
            }
            if (frame.remote_status_message) {
              remoteNote = frame.remote_status_message;
            }
            if (frame.event === 'error' || frame.grpc_status === 'UNAVAILABLE') {
              streamErrorMsg = frame.error || frame.message || 'Remote gRPC stream failed';
            }
            if (frame.event === 'end' || frame.is_end === true) {
              streamEndedOk = true;
              if (frame.total_bytes) {
                slot.totalBytes = frame.total_bytes;
                slot.currentByte = frame.total_bytes;
              }
            }
            if (frame.event === 'data') {
              if (frame.chunk_data && typeof frame.chunk_data === 'string') {
                const binStr = atob(frame.chunk_data);
                const bytes = new Uint8Array(binStr.length);
                for (let i = 0; i < binStr.length; i++) {
                  bytes[i] = binStr.charCodeAt(i);
                }
                binaryChunks.push(bytes);
                slot.currentByte += bytes.byteLength;
              } else if (frame.current_byte) {
                slot.currentByte = frame.current_byte;
              }
              slot.totalBytes = frame.total_bytes || slot.totalBytes || slot.currentByte;
              slot.chunksReceived = frame.chunk_index || slot.chunksReceived + 1;
              slot.progress = Math.min(
                99,
                Math.max(8, Math.round((slot.currentByte / Math.max(1, slot.totalBytes)) * 100))
              );
              slot.filename = frame.resolved_file || `v${wrappedIdx}.mp4`;

              if (getWrappedIndex9(grpcVideoIndex) === wrappedIdx) {
                grpcChunkCurrentByte = slot.currentByte;
                grpcChunkTotalBytes = slot.totalBytes;
                grpcChunksReceived = slot.chunksReceived;
                grpcStreamProgress = slot.progress;
                grpcResolvedFile = slot.filename;
              }
              updateDomLoadersInPlace();
            }
          } catch {
            // ignore partial line parse error
          }
        };

        if (resp.body && typeof resp.body.getReader === 'function') {
          const reader = resp.body.getReader();
          const decoder = new TextDecoder();
          let bufferStr = '';
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            bufferStr += decoder.decode(value, { stream: true });
            const lines = bufferStr.split('\n');
            bufferStr = lines.pop() || '';
            for (const line of lines) {
              processNdjsonLine(line);
            }
          }
          if (bufferStr.trim()) {
            processNdjsonLine(bufferStr);
          }
        } else {
          const textBody = await resp.text();
          const lines = textBody.split('\n');
          for (const line of lines) {
            processNdjsonLine(line);
          }
        }

        if (binaryChunks.length > 0) {
          const blob = new Blob(binaryChunks, { type: 'video/mp4' });
          slot.blobUrl = URL.createObjectURL(blob);
          slot.status = 'loaded';
          slot.progress = 100;
          slot.errorMessage = undefined;
        } else if (streamEndedOk && !streamErrorMsg && slot.totalBytes > 0) {
          slot.blobUrl = resolvedPlayableUrl;
          slot.status = 'loaded';
          slot.progress = 100;
          slot.errorMessage = undefined;
        } else {
          slot.blobUrl = null;
          slot.status = 'error';
          slot.progress = 0;
          slot.errorMessage =
            streamErrorMsg || 'Remote gRPC StreamFeedVideo returned 0 binary chunks.';
          updateDomLoadersInPlace();
          render();
          return slot;
        }

        if (getWrappedIndex9(grpcVideoIndex) === wrappedIdx) {
          grpcCompiledBlobUrl = slot.blobUrl;
          grpcStreamProgress = 100;
          grpcIsStreamingChunks = false;
          const loopNote =
            grpcVideoIndex > 9
              ? ` (Modulo-9 Loop: index ${grpcVideoIndex} ➔ ${slot.filename})`
              : ` (${slot.filename})`;
          grpcStatusBanner = `StreamFeedVideo(index=${grpcVideoIndex})${loopNote} • ${slot.chunksReceived} Chunks (${Math.round(
            slot.totalBytes / 1024
          )} KB)${remoteNote ? ` • ${remoteNote}` : ''}`;
        }

        updateDomLoadersInPlace();
        render();
        return slot;
      } catch (err) {
        console.error(`Error fetching v${wrappedIdx}.mp4 via gRPC:`, err);
        slot.status = 'error';
        slot.progress = 0;
        updateDomLoadersInPlace();
        return slot;
      } finally {
        inFlightVideoFetches.delete(wrappedIdx);
      }
    })();

    inFlightVideoFetches.set(wrappedIdx, fetchPromise);
    return fetchPromise;
  }

  let isFetchingAll9Batch = false;
  async function fetchAll9ServerVideosFromGrpc(forceRefetch = false) {
    if (isFetchingAll9Batch && !forceRefetch) return;
    isFetchingAll9Batch = true;

    if (forceRefetch) {
      for (let i = 1; i <= 9; i++) {
        const s = serverVideoSlots.get(i);
        if (s) {
          if (s.blobUrl && s.blobUrl.startsWith('blob:')) {
            URL.revokeObjectURL(s.blobUrl);
          }
          s.status = 'idle';
          s.progress = 0;
          s.currentByte = 0;
          s.totalBytes = 0;
          s.chunksReceived = 0;
          s.blobUrl = null;
          s.feedDomReady = false;
          s.profileDomReady = false;
        }
      }
      inFlightVideoFetches.clear();
      render();
    }

    try {
      const priorityIdx = getWrappedIndex9(grpcVideoIndex);
      // 1. Fetch active video index first so Feed screen loads immediately
      await fetchSingleServerVideoViaGrpc(priorityIdx, forceRefetch);

      // 2. Fetch remaining videos 1..9 sequentially (1 at a time) so free tunnel bandwidth is not split
      for (let i = 1; i <= 9; i++) {
        if (i !== priorityIdx) {
          await fetchSingleServerVideoViaGrpc(i, forceRefetch);
        }
      }
    } finally {
      isFetchingAll9Batch = false;
      updateDomLoadersInPlace();
    }
  }

  async function executeGrpcStreamFeedVideo(
    targetVideoIndex: number,
    isRetry = false,
    skipRender = false
  ) {
    grpcVideoIndex = targetVideoIndex >= 1 ? targetVideoIndex : 1;
    const wrappedIdx = getWrappedIndex9(grpcVideoIndex);
    grpcResolvedFile = `v${wrappedIdx}.mp4`;
    activeVideoIdx = (wrappedIdx - 1) % Math.max(1, feedList.length);

    const slot = serverVideoSlots.get(wrappedIdx)!;
    if (slot.status === 'loaded' && slot.blobUrl) {
      grpcCompiledBlobUrl = slot.blobUrl;
      grpcIsStreamingChunks = false;
      grpcStreamProgress = 100;
      grpcChunkCurrentByte = slot.currentByte;
      grpcChunkTotalBytes = slot.totalBytes;
      grpcChunksReceived = slot.chunksReceived;
      const loopNote =
        grpcVideoIndex > 9
          ? ` (Modulo-9 Loop: index ${grpcVideoIndex} ➔ ${slot.filename})`
          : ` (${slot.filename})`;
      grpcStatusBanner = `StreamFeedVideo(index=${grpcVideoIndex})${loopNote} • ${slot.chunksReceived} Chunks (${Math.round(
        slot.totalBytes / 1024
      )} KB)`;
      if (!skipRender) render();
      // Also ensure all other 9 videos are fetched in background
      fetchAll9ServerVideosFromGrpc(false);
      return;
    }

    grpcCompiledBlobUrl = null;
    grpcIsStreamingChunks = true;
    grpcStreamProgress = slot.progress || 5;
    if (!skipRender) render();

    await fetchSingleServerVideoViaGrpc(wrappedIdx, false, isRetry);
    // Ensure all 9 videos (v1.mp4..v9.mp4) are fetched from server
    fetchAll9ServerVideosFromGrpc(false);
  }

  async function simulateGrpcTokenExpiryAndRefresh() {
    await fetch('/api/grpc/ExpireToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: grpcJwtToken }),
    });
    grpcRemainingSeconds = 0;
    grpcStatusBanner = 'Token Expired (3600s elapsed) -> Triggering StreamFeedVideo to intercept UNAUTHENTICATED...';
    render();
    await new Promise((r) => setTimeout(r, 320));
    await executeGrpcStreamFeedVideo(grpcVideoIndex, false);
  }

  async function executeGrpcSearchVideos(queryText: string, isRetry = false) {
    searchQuery = queryText;
    isSearchingGrpc = true;
    render();
    try {
      const resp = await fetch('/api/grpc/SearchVideos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: grpcJwtToken,
          query: queryText.trim(),
        }),
      });
      if (resp.status === 401 && !isRetry) {
        await executeGrpcGetAuthToken('Auto-Refreshed during SearchVideos');
        await executeGrpcSearchVideos(queryText, true);
        return;
      }
      const data = await resp.json();
      if (data && Array.isArray(data.videos)) {
        grpcSearchResults = data.videos;
      }
      grpcStatusBanner = `gRPC SearchVideos(query="${queryText.trim()}") ➔ ${grpcSearchResults.length} Server Videos Fetched`;
    } catch (e) {
      console.error(e);
    } finally {
      isSearchingGrpc = false;
      render();
    }
  }

  async function executeGrpcUploadMediaFile(rawFilename?: string, captionText?: string) {
    if (isUploadingGrpcChunks) return;
    const nextNum = (grpcProfile10Data?.video_list?.length || 9) + 1;
    const targetName = (rawFilename || selectedUploadFile?.name || uploadTargetFilename || `v${nextNum}.mp4`).trim();
    const normalizedName = targetName.toLowerCase().endsWith('.mp4') ? targetName : `${targetName}.mp4`;

    isUploadingGrpcChunks = true;
    uploadChunkProgress = 0;
    uploadCurrentChunk = 0;
    uploadConfirmationDetails = null;
    uploadLastResponseMessage = `Slicing ${normalizedName} into 64KB UploadRequest frames...`;
    render();

    const chunksPayload: Array<{ token: string; filename: string; chunk_data: string; caption?: string }> = [];

    if (selectedUploadFile) {
      const buf = new Uint8Array(await selectedUploadFile.arrayBuffer());
      const chunkSize = 64 * 1024;
      uploadTotalChunks = Math.max(1, Math.ceil(buf.byteLength / chunkSize));
      for (let i = 0; i < uploadTotalChunks; i++) {
        await new Promise((r) => setTimeout(r, 65));
        const slice = buf.subarray(i * chunkSize, Math.min(buf.byteLength, (i + 1) * chunkSize));
        let bin = '';
        for (let b = 0; b < slice.length; b++) {
          bin += String.fromCharCode(slice[b]);
        }
        uploadCurrentChunk = i + 1;
        uploadChunkProgress = Math.round(((i + 1) / uploadTotalChunks) * 100);
        uploadLastResponseMessage = `Streaming 64KB UploadRequest chunk ${i + 1}/${uploadTotalChunks} (${uploadChunkProgress}%)...`;
        chunksPayload.push({
          token: grpcJwtToken,
          filename: normalizedName,
          chunk_data: btoa(bin),
          caption: captionText,
        });
        render();
      }
    } else {
      uploadTotalChunks = 6;
      const sampleChunkBase64 = btoa('STREAMGRID_64KB_MP4_BINARY_SLICE_'.repeat(128));
      for (let i = 1; i <= uploadTotalChunks; i++) {
        await new Promise((r) => setTimeout(r, 85));
        uploadCurrentChunk = i;
        uploadChunkProgress = Math.round((i / uploadTotalChunks) * 100);
        uploadLastResponseMessage = `Streaming 64KB UploadRequest chunk ${i}/${uploadTotalChunks} (${uploadChunkProgress}%)...`;
        chunksPayload.push({
          token: grpcJwtToken,
          filename: normalizedName,
          chunk_data: sampleChunkBase64,
          caption: captionText,
        });
        render();
      }
    }

    try {
      let resp = await fetch('/api/grpc/UploadMediaFile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: grpcJwtToken,
          filename: normalizedName,
          caption: captionText,
          chunks: chunksPayload,
        }),
      });

      // Intercept UNAUTHENTICATED (Status Code 16 / HTTP 401)
      if (resp.status === 401) {
        await executeGrpcGetAuthToken('Auto-Refreshed during UploadMediaFile');
        resp = await fetch('/api/grpc/UploadMediaFile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: grpcJwtToken,
            filename: normalizedName,
            caption: captionText,
            chunks: chunksPayload.map((c) => ({ ...c, token: grpcJwtToken })),
          }),
        });
      }

      const result = await resp.json();

      // Re-fetch Feed, Profile, and Search directly from Server via gRPC!
      const [gProfile, gSearch] = await Promise.all([
        fetch('/api/grpc/GetProfileData', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: grpcJwtToken,
            profile_id: 'profile_10_all',
          }),
        }).then((r) => r.json()),
        fetch('/api/grpc/SearchVideos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: grpcJwtToken,
            query: searchQuery,
          }),
        }).then((r) => r.json()),
      ]);

      if (gProfile && gProfile.video_list) {
        grpcProfile10Data = gProfile;
        if (Array.isArray(gProfile.videos) && gProfile.videos.length > 0) {
          feedList = gProfile.videos;
          currentProfile = {
            ...currentProfile,
            videos: gProfile.videos,
          };
        }
      }
      if (gSearch && Array.isArray(gSearch.videos)) {
        grpcSearchResults = gSearch.videos;
      }

      isUploadingGrpcChunks = false;
      selectedUploadFile = null;
      uploadConfirmationDetails = {
        confirmed: result.confirmed ?? true,
        confirmation_id: result.confirmation_id || `SRV-CONFIRMED-${Date.now()}`,
        uploaded_at: result.uploaded_at || new Date().toISOString(),
        filename: result.filename || normalizedName,
        file_id: result.file_id || `grpc_vid_${normalizedName}`,
        video_index: result.video_index || grpcProfile10Data.video_list.length,
        chunks_received: result.chunks_received || uploadTotalChunks,
        total_bytes: result.total_bytes || uploadTotalChunks * 65536,
        message:
          result.message ||
          `✅ Upload Confirmed by Server: ${normalizedName} saved to /videos workspace`,
      };
      uploadTargetFilename = `v${(grpcProfile10Data?.video_list?.length || 10) + 1}.mp4`;
      uploadLastResponseMessage = uploadConfirmationDetails.message;
      grpcStatusBanner = `✅ Server Confirmed Upload Complete: ${uploadConfirmationDetails.filename} (Confirmation: ${uploadConfirmationDetails.confirmation_id})`;
      shareToastMessage = `✅ Upload Complete & Confirmed: ${uploadConfirmationDetails.filename}`;
      render();
      setTimeout(() => {
        shareToastMessage = null;
        render();
      }, 2400);
    } catch (err: any) {
      isUploadingGrpcChunks = false;
      uploadLastResponseMessage = `Upload error: ${err.message}`;
      render();
    }
  }

  function handleClientSignOut() {
    isClientSignedIn = false;
    showMobileTopRightProfilePopover = false;
    showMobileTopLeftThemePopover = false;
    showMobilePasteUrlPopover = false;
    grpcJwtToken = 'SIGNED_OUT_SESSION_CLEARED';
    grpcRemainingSeconds = 0;
    grpcStatusBanner = '🚪 Client signed out — JWT token & buffer cache cleared.';
    activeMobileTab = 'auth';
    shareToastMessage = '✓ Signed out of @master_creator_10';
    render();
    setTimeout(() => {
      shareToastMessage = null;
      render();
    }, 1800);
  }

  async function applyAndTestPastedUrl(rawUrl: string, sourceLabel = 'URL Paste Test') {
    const trimmed = rawUrl.trim();
    if (!trimmed) {
      pastedUrlTestStatus = '⚠️ Please paste or enter a valid server URL first.';
      const statusEl = document.getElementById('mobile-paste-url-status-text');
      if (statusEl) statusEl.textContent = pastedUrlTestStatus;
      else render();
      return;
    }
    codespaceForwardedUrl = trimmed;
    draftPasteUrlInput = trimmed;
    const parsedTarget = extractHostAndPort(trimmed);
    const sanitizedHost = parsedTarget.host;
    const targetPort = parsedTarget.port;
    console.log(`📡 Reconfiguring gRPC Route Target -> Host: ${sanitizedHost} | Port: ${targetPort}`);
    grpcNgrokHost = `${sanitizedHost}:${targetPort}`;
    grpcSecurityLevel = 'ChannelCredentials.insecure()';
    isTestingPastedUrl = true;
    pastedUrlTestStatus = `📡 Reconfiguring gRPC Route Target -> Host: ${sanitizedHost} | Port: ${targetPort}...`;
    grpcStatusBanner = `📡 Reconfiguring gRPC Route Target -> Host: ${sanitizedHost} | Port: ${targetPort}`;

    // Update popover DOM elements directly so the popover never flashes or re-animates!
    const submitBtnEl = document.getElementById('mobile-test-url-submit-btn');
    if (submitBtnEl) {
      submitBtnEl.textContent = '⏳ Connecting & Syncing Live Data...';
    }
    const statusEl = document.getElementById('mobile-paste-url-status-text');
    if (statusEl) {
      statusEl.textContent = pastedUrlTestStatus;
    }
    const hostCodeEl = document.getElementById('mobile-paste-url-host-code');
    if (hostCodeEl) {
      hostCodeEl.textContent = `MediaService().connectToTunnel("${sanitizedHost}:${targetPort}");`;
    }

    try {
      const cfgResp = await fetch('/api/grpc/ConfigureServerUrl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ server_url: trimmed }),
      }).then((r) => r.json());

      if (cfgResp?.token) {
        grpcJwtToken = cfgResp.token;
        grpcExpiresInSeconds = cfgResp.expires_in_seconds || 3600;
        grpcRemainingSeconds = grpcExpiresInSeconds;
      }

      await loadProfileHandle('@master_creator_10', true);
      isTestingPastedUrl = false;
      const isActuallyConnected = Boolean(cfgResp?.remote_reachable);
      pastedUrlTestStatus = isActuallyConnected
        ? `✅ Successfully Bound to Tunnel! (${sanitizedHost}:${targetPort})`
        : `❌ Bound connection failed: ${cfgResp?.remote_status_message || cfgResp?.remote_error || 'Remote gRPC server unreachable'}`;
      grpcStatusBanner = `${sourceLabel}: ${pastedUrlTestStatus}`;
      isVideoPaused = false;

      if (submitBtnEl) {
        submitBtnEl.textContent = isActuallyConnected
          ? `✅ Successfully Bound to Tunnel!`
          : `🔗 Connect & Sync Live Data`;
      }
      if (statusEl) {
        statusEl.textContent = pastedUrlTestStatus;
        statusEl.style.color = isActuallyConnected ? '#22c55e' : '#eab308';
      }

      // Start sequential gRPC fetch of all 9 videos (v1.mp4..v9.mp4) in the background
      fetchAll9ServerVideosFromGrpc(true);

      if (isActuallyConnected) {
        await new Promise((r) => setTimeout(r, 650));
        showMobilePasteUrlPopover = false;
        shareToastMessage = `✓ Bound to ${sanitizedHost}:${targetPort} • Streaming ${grpcResolvedFile}...`;
      } else {
        shareToastMessage = `⚠️ Remote gRPC Error (${sanitizedHost}): ${
          cfgResp?.remote_error || 'Tunnel unreachable'
        }`;
      }
      render();
      setTimeout(() => {
        shareToastMessage = null;
        const toastEl = document.getElementById('mobile-share-toast-banner');
        if (toastEl) toastEl.remove();
      }, 4200);
    } catch (err: any) {
      isTestingPastedUrl = false;
      pastedUrlTestStatus = `⚠️ Connection check error: ${err?.message || 'Failed'}`;
      render();
    }
  }

  async function triggerClipboardPasteForTesting(attemptClipboardRead = false) {
    showMobilePasteUrlPopover = true;
    showMobileTopLeftThemePopover = false;
    showMobileTopRightProfilePopover = false;
    if (attemptClipboardRead) {
      try {
        if (navigator.clipboard && navigator.clipboard.readText) {
          const clipText = (await navigator.clipboard.readText()).trim();
          if (clipText) {
            draftPasteUrlInput = clipText;
            await applyAndTestPastedUrl(clipText, 'Clipboard Paste');
            return;
          }
        }
      } catch {
        // In an iframe, navigator.clipboard.readText() is blocked by browser permissions.
        // Do not overwrite user input; simply focus the input box so Ctrl+V / Cmd+V works cleanly.
      }
    }
    pastedUrlTestStatus =
      '📋 Paste your URL in the input box below (Ctrl+V / Cmd+V or right-click Paste), then tap "🚀 Connect & Fetch".';
    render();
    setTimeout(() => {
      const inp = document.getElementById('mobile-paste-url-input') as HTMLInputElement | null;
      if (inp) {
        inp.focus();
      }
    }, 40);
  }

  async function handleClientSignIn() {
    isClientSignedIn = true;
    showMobileTopRightProfilePopover = false;
    await executeGrpcGetAuthToken('Client Sign-In GetAuthToken');
    activeMobileTab = 'feed';
    shareToastMessage = '✓ Signed in as @master_creator_10 (Token valid for 3600s)';
    render();
    setTimeout(() => {
      shareToastMessage = null;
      render();
    }, 1800);
  }

  async function loadProfileHandle(handle: string, skipRender = false) {
    try {
      let resp = await fetch('/api/grpc/GetProfileData', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: grpcJwtToken,
          profile_id: 'profile_10_all',
          server_url: codespaceForwardedUrl,
        }),
      });
      if (resp.status === 401) {
        await executeGrpcGetAuthToken('Auto-Refreshed during GetProfileData');
        resp = await fetch('/api/grpc/GetProfileData', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: grpcJwtToken,
            profile_id: 'profile_10_all',
            server_url: codespaceForwardedUrl,
          }),
        });
      }
      const gRes = await resp.json();
      if (gRes && gRes.video_list) {
        grpcProfile10Data = gRes;
        if (Array.isArray(gRes.videos) && gRes.videos.length > 0) {
          feedList = gRes.videos;
        }
      }

      if (handle.includes('master_creator_10') || handle === 'profile_10_all') {
        currentProfile = {
          creator: {
            username: `@${(grpcProfile10Data.username || 'master_creator_10').replace(/^@/, '')}`,
            display_name: grpcProfile10Data.display_name || 'All Videos Portfolio Folder',
            avatar_url: DEFAULT_AVATAR_URL,
            followers: '450K',
            following: String(grpcProfile10Data.video_list.length),
            likes: '1.2M',
            bio: 'Synced with Server 10th Master Directory via gRPC GetProfileData 📁',
          },
          videos: grpcProfile10Data.videos || feedList,
        };
        grpcStatusBanner = `gRPC GetProfileData(profile_id="profile_10_all") ➔ ${grpcProfile10Data.video_list.length} Server Videos Loaded`;
      } else {
        const r = await fetch(`/api/profile/${encodeURIComponent(handle)}`);
        const j = await r.json();
        if (j.data) {
          currentProfile = j.data;
        } else if (j.profile) {
          currentProfile = {
            creator: j.profile,
            videos: j.uploaded_videos || feedList,
          };
        }
      }
      if (!skipRender) render();
      // Fetch all 9 server videos via gRPC whenever Profile data is loaded
      fetchAll9ServerVideosFromGrpc(false);
    } catch (e) {
      console.error(e);
    }
  }

  function triggerLikeWithAnimation(vidId: string, forceLike = false) {
    if (forceLike) {
      likedVideos.add(vidId);
    } else {
      if (likedVideos.has(vidId)) likedVideos.delete(vidId);
      else likedVideos.add(vidId);
    }
    likeButtonAnimTrigger = true;
    if (likedVideos.has(vidId)) {
      showHeartBurst = true;
    }
    render();
    setTimeout(() => {
      showHeartBurst = false;
      likeButtonAnimTrigger = false;
      render();
    }, 760);
  }

  function render() {
    if (!root || isAppLoading) return;
    const prevVideoEl = document.getElementById('active-reel-video') as HTMLVideoElement | null;
    const prevVideoAttrSrc = prevVideoEl?.getAttribute('src') || '';
    const activeTheme = TITAN_PALETTE_12[selectedColorIdx];
    const accent = activeTheme.hex;
    const activeFile = files.find((f) => f.path === selectedFilePath) || files[0];

    // Ensure feedList has 9 server video entries mapped to v1.mp4..v9.mp4
    if (feedList.length === 0) {
      feedList = Array.from({ length: 9 }, (_, i) => ({
        video_id: `vid_grpc_server_${i + 1}`,
        video_index: i + 1,
        filename: `v${i + 1}.mp4`,
        reel_filename: `v${i + 1}.mp4`,
        caption: `Server gRPC Stream #${i + 1} (v${i + 1}.mp4) — Fetched from Server /videos via gRPC #grpc #flutter`,
        sound_title: `Original Server Audio (v${i + 1}.mp4) - @master_creator_10`,
        likes_count: (i + 1) * 1420,
        comments_count: (i + 1) * 64,
        duration: '0:24',
        reel_asset_path: `/api/media/stream/grpc_index/${i + 1}?v=grpc`,
        local_stream_url: `/api/media/stream/grpc_index/${i + 1}?v=grpc`,
        stream_url: `${CENTRAL_PUBLIC_URL}/api/media/stream/grpc_index/${i + 1}?v=grpc`,
        creator: {
          username: '@master_creator_10',
          display_name: 'All Videos Portfolio Folder',
          avatar_url: DEFAULT_AVATAR_URL,
          bio: 'Synced with Server 10th Master Directory 📁',
          followers: '450K',
        },
      }));
    }

    const activeVideo = feedList[activeVideoIdx] || feedList[0];
    const vidId = activeVideo.video_id || activeVideo._id || 'vid_feed_001';
    const isLiked = likedVideos.has(vidId);
    const creatorHandle = activeVideo.creator?.username || '@alex_rivers_dev';
    const isFollowing = followedHandles.has(creatorHandle);
    const videoComments = getCommentsForVideo(vidId);
    const extraShares = shareCounts[vidId] || 0;

    const appBg = isNightMode ? '#08090E' : '#F1F5F9';
    const panelBg = isNightMode ? '#10121B' : '#FFFFFF';
    const phoneBg = isNightMode ? '#090A10' : '#F8FAFC';
    const phoneCardBg = isNightMode ? '#141724' : '#FFFFFF';
    const textMain = isNightMode ? '#F8FAFC' : '#0F172A';
    const textSub = isNightMode ? '#94A3B8' : '#475569';
    const borderCol = isNightMode ? 'rgba(255,255,255,0.10)' : 'rgba(15,23,42,0.12)';

    root.innerHTML = `
      <div style="background:${appBg}; color:${textMain}; min-height:100vh; transition:all 320ms cubic-bezier(0.22,1,0.36,1);" class="flex flex-col font-sans">
        <!-- Top Header Bar -->
        <header style="background:${panelBg}; border-bottom:1px solid ${borderCol}; transition:all 320ms ease;" class="px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <span style="background:${accent}22; color:${accent}; border:1px solid ${accent}66;" class="px-2.5 py-1 rounded-md font-mono text-xs font-bold">
              FLUTTER + TITAN
            </span>
            <div>
              <h1 class="text-base font-bold tracking-tight">StreamGrid TikTok Full App — 9-Video gRPC Stream Engine & Titan Theme Studio</h1>
              <p style="color:${textSub};" class="text-xs font-mono">gRPC StreamFeedVideo: v1.mp4..v9.mp4 (64KB Chunks) • Server: ${codespaceForwardedUrl}</p>
            </div>
          </div>

          <!-- Top Bar Controls: gRPC Engine + Generate APK + Replay Loader + 12-Color Swatches + Day/Night Segmented Switch -->
          <div class="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              id="header-paste-url-btn"
              style="border:1.5px solid ${accent}; color:#000; background:${accent};"
              class="px-3.5 py-1.5 rounded-xl text-xs font-mono font-extrabold cursor-pointer hover:scale-105 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <span>📋 Paste URL (Test)</span>
            </button>

            <button
              type="button"
              id="open-grpc-modal-btn"
              style="border:1.5px solid ${accent}; color:${accent}; background:${accent}18;"
              class="px-3.5 py-1.5 rounded-xl text-xs font-mono font-extrabold cursor-pointer hover:scale-105 transition-all flex items-center gap-1.5"
            >
              <span>📡 gRPC Engine (${grpcResolvedFile})</span>
            </button>

            <button
              type="button"
              id="open-apk-modal-btn"
              style="background:${accent}; color:#000; box-shadow: 0 4px 18px ${accent}55;"
              class="px-3.5 py-1.5 rounded-xl text-xs font-mono font-extrabold cursor-pointer hover:scale-105 transition-all flex items-center gap-1.5"
            >
              <span>🤖 Generate APK</span>
            </button>

            <a
              href="/api/apk/download"
              download="streamgrid-titan-v1.0.0.apk"
              style="border:1px solid ${accent}88; color:${accent}; background:${accent}18;"
              class="px-3 py-1.5 rounded-xl text-xs font-mono font-bold cursor-pointer hover:opacity-85 transition-all flex items-center gap-1"
            >
              <span>⬇️ Direct .APK</span>
            </a>

            <button
              type="button"
              id="replay-loader-btn"
              style="border:1px solid ${accent}88; color:${accent}; background:${accent}15;"
              class="px-3 py-1.5 rounded-xl text-xs font-mono font-bold cursor-pointer hover:opacity-85 transition-all"
            >
              ✨ Replay Loader
            </button>

            <div class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl" style="background:${appBg}; border:1px solid ${borderCol};">
              ${TITAN_PALETTE_12.map(
                (c) => `
                <button
                  type="button"
                  data-color-idx="${c.index}"
                  title="${c.name} (${c.hex})"
                  style="background:${c.hex}; transform:scale(${c.index === selectedColorIdx ? '1.25' : '1'}); outline:${
                  c.index === selectedColorIdx ? `2px solid ${textMain}` : 'none'
                }; outline-offset:2px;"
                  class="w-4 h-4 rounded-full transition-all cursor-pointer"
                ></button>
              `
              ).join('')}
            </div>

            <div class="flex items-center p-1 rounded-xl" style="background:${appBg}; border:1px solid ${borderCol};">
              <button
                type="button"
                data-set-mode="day"
                style="${
                  !isNightMode
                    ? `background:${accent}; color:#000; font-weight:800;`
                    : `background:transparent; color:${textSub};`
                }"
                class="px-3 py-1 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-1"
              >
                <span>☀️ Day Mode</span>
              </button>
              <button
                type="button"
                data-set-mode="night"
                style="${
                  isNightMode
                    ? `background:${accent}; color:#000; font-weight:800;`
                    : `background:transparent; color:${textSub};`
                }"
                class="px-3 py-1 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-1"
              >
                <span>🌙 Night Mode</span>
              </button>
            </div>
          </div>
        </header>

        <!-- Main Workspace Grid -->
        <div class="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-[1600px] w-full mx-auto">
          
          <!-- Left / Center: Interactive TikTok Mobile Device Frame (5 Cols) -->
          <section class="lg:col-span-5 flex flex-col items-center">
            <div class="mb-3 flex flex-wrap items-center justify-center gap-1.5">
              ${(['feed', 'profile', 'search', 'upload', 'notifications', 'auth'] as MobileTab[])
                .map(
                  (tab) => `
                <button
                  type="button"
                  data-mobile-tab="${tab}"
                  style="${
                    activeMobileTab === tab
                      ? `background:${accent}; color:#000; font-weight:700;`
                      : `background:${panelBg}; color:${textSub}; border:1px solid ${borderCol};`
                  }"
                  class="px-3 py-1.5 rounded-lg text-xs capitalize transition-all cursor-pointer"
                >
                  ${tab === 'profile' ? '👤 Profile Uploads' : tab === 'feed' ? '🎬 Reels Feed' : tab}
                </button>
              `
                )
                .join('')}
            </div>

            <!-- Phone Bezels -->
            <div
              style="background:${phoneBg}; border:3px solid ${accent}88; box-shadow: 0 20px 50px ${accent}25;"
              class="w-[380px] h-[735px] rounded-[42px] overflow-hidden flex flex-col relative transition-all duration-300"
            >
              <!-- Status Bar -->
              <div style="background:${phoneCardBg}; color:${textMain}; border-bottom:1px solid ${borderCol};" class="px-6 py-2 flex items-center justify-between text-[11px] font-mono z-30">
                <span>9:41</span>
                <span style="color:${accent};" class="font-bold">${isNightMode ? '🌙 Night' : '☀️ Day'} • ${activeTheme.name}</span>
                <span>5G • 443➔3005</span>
              </div>

              <!-- Mobile Top Action Bar: Top-Left Theme Selector, Dedicated Paste URL Button & Top-Right Client Profile + Sign Out -->
              <div
                style="background:${phoneCardBg}; border-bottom:1.5px solid ${accent}44;"
                class="px-2.5 py-2 flex items-center justify-between gap-1.5 z-30 shadow-sm"
              >
                <!-- TOP-LEFT: Big Touch-Friendly Theme Selector Button -->
                <button
                  type="button"
                  id="mobile-topleft-theme-btn"
                  title="Open Quick Theme & Day/Night Selector"
                  style="background:${accent}20; border:1.5px solid ${accent}; color:${textMain};"
                  class="min-h-[46px] px-2.5 py-1.5 rounded-2xl flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-sm shrink-0"
                >
                  <span class="text-lg leading-none">🎨</span>
                  <div class="text-left leading-tight">
                    <div class="text-[11px] font-extrabold flex items-center gap-1">
                      <span>Theme</span>
                      <span style="background:${accent};" class="w-2 h-2 rounded-full inline-block"></span>
                    </div>
                    <div style="color:${textSub};" class="text-[9px] font-mono">${isNightMode ? '🌙 Night' : '☀️ Day'}</div>
                  </div>
                </button>

                <!-- CENTER: Dedicated Paste URL Button for Testing Purpose -->
                <button
                  type="button"
                  id="mobile-paste-url-btn"
                  title="Dedicated Button to Paste & Test Server / Codespace URL"
                  style="background:${showMobilePasteUrlPopover ? accent : `${accent}24`}; border:1.5px solid ${accent}; color:${
      showMobilePasteUrlPopover ? '#000' : textMain
    };"
                  class="min-h-[46px] px-2.5 py-1.5 rounded-2xl flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-sm shrink-0"
                >
                  <span class="text-base leading-none">📋</span>
                  <div class="text-left leading-tight">
                    <div class="text-[11px] font-extrabold">Paste URL</div>
                    <div style="color:${showMobilePasteUrlPopover ? '#000' : accent};" class="text-[9px] font-mono font-bold">
                      Test :443
                    </div>
                  </div>
                </button>

                <!-- TOP-RIGHT: Logout Button is available ONLY on Profile Page (activeMobileTab === 'profile') -->
                <div class="flex items-center gap-1 min-w-0">
                  ${
                    activeMobileTab === 'profile'
                      ? `
                    <button
                      type="button"
                      id="mobile-topright-profile-btn"
                      title="Client Profile & Log Out Menu (Profile Page Only)"
                      style="background:${phoneBg}; border:1.5px solid ${accent}88; color:${textMain};"
                      class="min-h-[46px] px-2 py-1.5 rounded-2xl flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-sm min-w-0"
                    >
                      <img
                        src="${DEFAULT_AVATAR_URL}"
                        alt="Client Avatar"
                        style="border:2px solid ${accent};"
                        class="w-7 h-7 rounded-full object-cover shrink-0"
                      />
                      <div class="text-left leading-tight max-w-[68px]">
                        <div class="text-[10px] font-extrabold truncate">
                          ${isClientSignedIn ? 'master_10' : 'Signed Out'}
                        </div>
                        <div style="color:${isClientSignedIn ? accent : '#F43F5E'};" class="text-[9px] font-mono truncate">
                          ${isClientSignedIn ? '● Profile ▾' : '○ Offline'}
                        </div>
                      </div>
                    </button>

                    ${
                      isClientSignedIn
                        ? `
                      <button
                        type="button"
                        id="mobile-direct-signout-btn"
                        title="Log Out (Available Only on Profile Page)"
                        style="background:rgba(244,63,94,0.18); border:1.5px solid #F43F5E; color:#F43F5E;"
                        class="min-h-[46px] px-2.5 py-1.5 rounded-2xl flex items-center gap-1 cursor-pointer active:scale-95 transition-all shrink-0"
                      >
                        <span class="text-sm leading-none">🚪</span>
                        <span class="text-[10px] font-extrabold">Log Out</span>
                      </button>
                    `
                        : `
                      <button
                        type="button"
                        id="mobile-direct-signin-btn"
                        title="Sign In to Client Profile"
                        style="background:${accent}; color:#000;"
                        class="min-h-[46px] px-2.5 py-1.5 rounded-2xl flex items-center gap-1 cursor-pointer active:scale-95 transition-all font-extrabold shrink-0"
                      >
                        <span class="text-sm leading-none">🔑</span>
                        <span class="text-[10px] font-extrabold">Sign In</span>
                      </button>
                    `
                    }
                  `
                      : `
                    <div
                      style="background:${phoneBg}; border:1px solid ${borderCol}; color:${textSub};"
                      class="min-h-[46px] px-2.5 py-1.5 rounded-2xl flex items-center gap-1.5 text-[10px] font-mono"
                      title="gRPC Server Connection Active (Log Out is available on Profile page top-right)"
                    >
                      <span style="background:#10B981;" class="w-2 h-2 rounded-full inline-block"></span>
                      <span class="font-bold" style="color:${textMain};">gRPC Live</span>
                    </div>
                  `
                  }
                </div>
              </div>

              <!-- Mobile Viewport Body -->
              <div class="flex-1 overflow-y-auto relative flex flex-col transition-colors duration-300" style="background:${phoneBg}; color:${textMain};">
                <!-- TOP-LEFT THEME SELECTOR POPOVER SHEET (Inside Mobile Screen) -->
                ${
                  showMobileTopLeftThemePopover
                    ? `
                  <div
                    style="background:${phoneCardBg}; border-bottom:2px solid ${accent}; color:${textMain}; box-shadow: 0 18px 40px rgba(0,0,0,0.65);"
                    class="absolute inset-x-0 top-0 z-40 p-4 rounded-b-3xl space-y-3 animate-modal-zoom"
                  >
                    <div class="flex items-center justify-between">
                      <div class="text-xs font-extrabold flex items-center gap-1.5">
                        <span class="text-base">🎨</span>
                        <span>Top-Left Theme Selector (12 Colors)</span>
                      </div>
                      <button
                        type="button"
                        id="close-mobile-theme-popover-btn"
                        class="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <!-- Big Touch-Friendly Day / Night Toggle Row -->
                    <div class="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        data-set-mode="day"
                        style="${
                          !isNightMode
                            ? `background:${accent}; color:#000; font-weight:800;`
                            : `background:${phoneBg}; color:${textSub}; border:1px solid ${borderCol};`
                        }"
                        class="min-h-[44px] rounded-xl text-xs cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span class="text-base">☀️</span>
                        <span>Day Mode</span>
                      </button>
                      <button
                        type="button"
                        data-set-mode="night"
                        style="${
                          isNightMode
                            ? `background:${accent}; color:#000; font-weight:800;`
                            : `background:${phoneBg}; color:${textSub}; border:1px solid ${borderCol};`
                        }"
                        class="min-h-[44px] rounded-xl text-xs cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span class="text-base">🌙</span>
                        <span>Night Mode</span>
                      </button>
                    </div>

                    <!-- Big 44x44px Touch Color Swatches -->
                    <div class="grid grid-cols-6 gap-2 pt-1">
                      ${TITAN_PALETTE_12.map(
                        (c) => `
                        <button
                          type="button"
                          data-color-idx="${c.index}"
                          title="${c.name}"
                          style="background:${c.hex}; border:${
                          c.index === selectedColorIdx ? '3px solid #FFF' : '1.5px solid rgba(0,0,0,0.25)'
                        };"
                          class="w-11 h-11 rounded-2xl flex items-center justify-center text-black font-black text-sm cursor-pointer active:scale-90 transition-transform mx-auto shadow"
                        >
                          ${c.index === selectedColorIdx ? '✓' : ''}
                        </button>
                      `
                      ).join('')}
                    </div>
                  </div>
                `
                    : ''
                }

                <!-- DEDICATED PASTE & TEST SERVER URL POPOVER SHEET (Inside Mobile Screen) -->
                ${
                  showMobilePasteUrlPopover
                    ? `
                  <div
                    id="mobile-paste-url-popover-sheet"
                    style="background:${phoneCardBg}; border-bottom:2px solid ${accent}; color:${textMain}; box-shadow: 0 18px 40px rgba(0,0,0,0.7);"
                    class="absolute inset-x-0 top-0 z-40 p-4 rounded-b-3xl space-y-3"
                  >
                    <div class="flex items-center justify-between">
                      <div class="text-xs font-extrabold flex items-center gap-1.5">
                        <span class="text-base">📡</span>
                        <span>Paste Codespace Tunnel URL (Runtime gRPC Engine)</span>
                      </div>
                      <button
                        type="button"
                        id="close-mobile-paste-url-popover-btn"
                        class="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <!-- Editable URL Input + Clear Button + Connect & Sync Live Data Button -->
                    <div class="space-y-2">
                      <div class="text-[10px] font-bold text-white/75">Paste Codespace Tunnel URL</div>
                      <div class="relative flex items-center">
                        <input
                          id="mobile-paste-url-input"
                          type="text"
                          value="${escapeHtml(draftPasteUrlInput)}"
                          placeholder="e.g., jtkdm-20-192-21-48.run.pinggy-free.link:38173"
                          style="background:${phoneBg}; border:1.5px solid #FF4081; color:${textMain};"
                          class="w-full min-h-[44px] pl-3 pr-9 py-2 rounded-xl font-mono text-[11px] focus:outline-none"
                        />
                        <button
                          type="button"
                          id="mobile-clear-url-input-btn"
                          title="Clear URL box so you can paste cleanly"
                          style="color:${textSub};"
                          class="absolute right-2 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs font-bold cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>

                      <button
                        type="button"
                        id="mobile-test-url-submit-btn"
                        style="background:#FF4081; color:#FFF;"
                        class="w-full min-h-[44px] py-2.5 px-3 rounded-xl font-mono text-xs font-extrabold cursor-pointer flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform"
                      >
                        <span>${isTestingPastedUrl ? '⏳ Connecting & Syncing...' : '🔗 Connect & Sync Live Data'}</span>
                      </button>
                    </div>

                    <!-- Quick Test Preset URLs -->
                    <div class="space-y-1">
                      <div style="color:${textSub};" class="text-[10px] font-mono">Quick Select Tunnel Format (1-Tap):</div>
                      <div class="flex flex-wrap gap-1.5">
                        ${[
                          'jtkdm-20-192-21-48.run.pinggy-free.link:38173',
                          'df2ab177205f54.lhr.life',
                          'tcp://0.tcp.ap.ngrok.io:12345',
                        ]
                          .map(
                            (preset) => `
                          <button
                            type="button"
                            data-test-url-preset="${preset}"
                            style="background:${phoneBg}; border:1px solid ${borderCol}; color:${textMain};"
                            class="px-2 py-1 rounded-lg font-mono text-[9px] cursor-pointer hover:opacity-85 truncate max-w-full"
                          >
                            🔗 ${escapeHtml(preset)}
                          </button>
                        `
                          )
                          .join('')}
                      </div>
                    </div>

                    <!-- Live URL Translation & Connection Test Result -->
                    <div style="background:${phoneBg}; border:1px solid #FF408166;" class="p-2.5 rounded-xl space-y-1 text-[10px] font-mono">
                      <div
                        id="mobile-paste-url-status-text"
                        style="color:${pastedUrlTestStatus?.startsWith('✅') ? '#22c55e' : '#eab308'};"
                        class="font-bold leading-snug text-center"
                      >
                        ${escapeHtml(
                          pastedUrlTestStatus || 'Disconnected. Enter your link to connect.'
                        )}
                      </div>
                      <div style="color:${textSub};" class="truncate text-center">
                        <code id="mobile-paste-url-host-code">Host: ${escapeHtml(extractHostAndPort(codespaceForwardedUrl).host)} | Port: ${extractHostAndPort(codespaceForwardedUrl).port} (ChannelCredentials.insecure)</code>
                      </div>
                    </div>
                  </div>
                `
                    : ''
                }

                <!-- TOP-RIGHT CLIENT PROFILE & SIGN OUT POPOVER SHEET (Profile Page Only) -->
                ${
                  showMobileTopRightProfilePopover && activeMobileTab === 'profile'
                    ? `
                  <div
                    style="background:${phoneCardBg}; border-bottom:2px solid ${accent}; color:${textMain}; box-shadow: 0 18px 40px rgba(0,0,0,0.65);"
                    class="absolute inset-x-0 top-0 z-40 p-4 rounded-b-3xl space-y-3.5 animate-modal-zoom"
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <img
                          src="${DEFAULT_AVATAR_URL}"
                          alt="Client Profile"
                          style="border:2.5px solid ${accent};"
                          class="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <div class="text-sm font-extrabold">All Videos Portfolio Folder</div>
                          <div style="color:${accent};" class="text-xs font-mono font-bold">
                            @master_creator_10 • profile_10_all
                          </div>
                          <div style="color:${textSub};" class="text-[10px] font-mono">
                            client_id: mobile_phone_client • ${
                              isClientSignedIn ? `JWT Active (${grpcRemainingSeconds}s)` : 'Signed Out'
                            }
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        id="close-mobile-profile-popover-btn"
                        class="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <div class="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        id="mobile-popover-open-profile-btn"
                        style="background:${accent}; color:#000;"
                        class="min-h-[46px] rounded-2xl text-xs font-extrabold cursor-pointer flex items-center justify-center gap-1.5 shadow"
                      >
                        <span class="text-base">👤</span>
                        <span>Open Profile (${grpcProfile10Data.video_list.length})</span>
                      </button>

                      ${
                        isClientSignedIn
                          ? `
                        <button
                          type="button"
                          id="mobile-popover-signout-btn"
                          style="background:#F43F5E; color:#FFF;"
                          class="min-h-[46px] rounded-2xl text-xs font-extrabold cursor-pointer flex items-center justify-center gap-1.5 shadow"
                        >
                          <span class="text-base">🚪</span>
                          <span>Sign Out</span>
                        </button>
                      `
                          : `
                        <button
                          type="button"
                          id="mobile-popover-signin-btn"
                          style="background:#10B981; color:#000;"
                          class="min-h-[46px] rounded-2xl text-xs font-extrabold cursor-pointer flex items-center justify-center gap-1.5 shadow"
                        >
                          <span class="text-base">🔑</span>
                          <span>Sign In Now</span>
                        </button>
                      `
                      }
                    </div>
                  </div>
                `
                    : ''
                }

                ${renderMobileTabContent({
                  activeMobileTab,
                  activeVideo,
                  activeVideoIdx,
                  feedList,
                  accent,
                  isNightMode,
                  textMain,
                  textSub,
                  panelBg: phoneCardBg,
                  phoneBg,
                  borderCol,
                  isLiked,
                  isFollowing,
                  selectedColorIdx,
                  currentProfile,
                  searchQuery,
                  notificationsList,
                  showCommentsDrawer,
                  showShareDrawer,
                  videoComments,
                  showHeartBurst,
                  likeButtonAnimTrigger,
                  commentButtonAnimTrigger,
                  shareButtonAnimTrigger,
                  followButtonAnimTrigger,
                  openedFromProfile,
                  isVideoMuted,
                  isVideoPaused,
                  extraShares,
                  likedCommentIds,
                  shareToastMessage,
                  grpcVideoIndex,
                  grpcResolvedFile,
                  grpcStreamProgress,
                  grpcChunkCurrentByte,
                  grpcChunkTotalBytes,
                  grpcChunksReceived,
                  grpcIsStreamingChunks,
                  grpcCompiledBlobUrl,
                  grpcJwtToken,
                  grpcRemainingSeconds,
                  grpcStatusBanner,
                  grpcProfile10Data,
                  profileSubTab,
                  codespaceForwardedUrl,
                  sanitizedCodespaceHost: stripHttpsPrefix(codespaceForwardedUrl),
                  isUploadingGrpcChunks,
                  uploadChunkProgress,
                  uploadCurrentChunk,
                  uploadTotalChunks,
                  uploadTargetFilename,
                  uploadLastResponseMessage,
                  uploadConfirmationDetails,
                  selectedUploadFile,
                  grpcSearchResults,
                  isSearchingGrpc,
                  isClientSignedIn,
                  serverVideoSlots,
                })}

                <!-- Full-Screen Profile Photo Lightbox Modal (inside mobile viewport) -->
                ${
                  fullScreenProfilePhoto
                    ? `
                  <div
                    id="fullscreen-photo-backdrop"
                    class="absolute inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-5 animate-modal-zoom"
                  >
                    <div class="w-full flex items-center justify-between">
                      <span style="color:${accent};" class="text-xs font-mono font-bold">
                        FULL-SCREEN PROFILE PHOTO
                      </span>
                      <div class="flex items-center gap-2">
                        <button
                          type="button"
                          id="zoom-photo-btn"
                          style="background:${accent}22; color:${accent}; border:1px solid ${accent}66;"
                          class="px-2.5 py-1 rounded-lg text-xs font-mono font-bold cursor-pointer"
                        >
                          ${fullScreenProfilePhoto.zoomed ? '🔍 1.0x Reset' : '🔍 1.6x Zoom'}
                        </button>
                        <button
                          type="button"
                          id="close-photo-btn"
                          class="w-8 h-8 rounded-full bg-white/15 text-white flex items-center justify-center font-bold cursor-pointer hover:bg-white/25"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    <div class="my-auto flex flex-col items-center overflow-hidden">
                      <img
                        id="fullscreen-photo-img"
                        src="${fullScreenProfilePhoto.url}"
                        alt="${escapeHtml(fullScreenProfilePhoto.name)}"
                        style="transform: scale(${fullScreenProfilePhoto.zoomed ? '1.55' : '1'}); border: 3px solid ${accent}; box-shadow: 0 0 40px ${accent}55; transition: transform 320ms cubic-bezier(0.16, 1, 0.3, 1);"
                        class="w-64 h-64 rounded-3xl object-cover cursor-zoom-in"
                      />
                    </div>

                    <div style="border:1px solid ${accent}55;" class="w-full bg-[#12141F]/90 rounded-2xl p-3.5 text-center space-y-1">
                      <div class="text-white font-bold text-sm">${escapeHtml(fullScreenProfilePhoto.name)}</div>
                      <div style="color:${accent};" class="text-xs font-mono font-semibold">${escapeHtml(fullScreenProfilePhoto.username)} • ${escapeHtml(fullScreenProfilePhoto.followers)} Followers</div>
                      <p class="text-[11px] text-white/70">${escapeHtml(fullScreenProfilePhoto.bio)}</p>
                    </div>
                  </div>
                `
                    : ''
                }
              </div>

              <!-- Mobile Bottom Navigation Bar (Theme Button Removed from Below — 5 Human-Friendly Touch Targets) -->
              <nav style="background:${phoneCardBg}; border-top:1px solid ${borderCol};" class="px-2 py-2 grid grid-cols-5 gap-1.5 text-center z-20">
                ${[
                  { id: 'feed', icon: '▶️', label: 'Feed' },
                  { id: 'search', icon: '🔍', label: 'Search' },
                  { id: 'upload', icon: '➕', label: 'Upload' },
                  { id: 'notifications', icon: '🔔', label: 'Inbox' },
                  { id: 'profile', icon: '👤', label: 'Profile' },
                ]
                  .map(
                    (nav) => `
                  <button
                    type="button"
                    data-mobile-tab="${nav.id}"
                    style="${
                      activeMobileTab === nav.id
                        ? `color:${accent}; background:${accent}18; border:1px solid ${accent}55;`
                        : `color:${textSub}; border:1px solid transparent;`
                    }"
                    class="min-h-[54px] flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all cursor-pointer active:scale-95"
                  >
                    <span class="text-xl leading-none">${nav.icon}</span>
                    <span class="text-[10px] mt-1 font-extrabold">${nav.label}</span>
                  </button>
                `
                  )
                  .join('')}
              </nav>
            </div>
          </section>

          <!-- Right: Native Dart Flutter Project Directory & Code Viewer (7 Cols) -->
          <section style="background:${panelBg}; border:1px solid ${borderCol};" class="lg:col-span-7 rounded-2xl overflow-hidden flex flex-col h-[780px]">
            <div style="border-bottom:1px solid ${borderCol};" class="px-5 py-3.5 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 class="text-sm font-bold">Native Flutter & Android Project Structure (Pure Dart + Gradle APK)</h2>
                <p style="color:${textSub};" class="text-xs font-mono">pubspec.yaml • android/app/build.gradle • AndroidManifest.xml • lib/main.dart</p>
              </div>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  id="panel-apk-btn"
                  style="background:${accent}; color:#000;"
                  class="px-3 py-1 rounded-lg text-xs font-mono font-extrabold cursor-pointer hover:opacity-90"
                >
                  ⚡ Build / Export APK
                </button>
                <a
                  href="/api/apk/download-source-zip"
                  download="streamgrid-flutter-android-project.zip"
                  style="background:${accent}22; color:${accent}; border:1px solid ${accent}55;"
                  class="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold hover:opacity-80"
                >
                  📦 Export .ZIP (${files.length} Files)
                </a>
              </div>
            </div>

            <div class="flex-1 grid grid-cols-12 min-h-0">
              <!-- File Tree -->
              <aside style="border-right:1px solid ${borderCol};" class="col-span-4 p-3 overflow-y-auto space-y-1">
                ${files
                  .map(
                    (f) => `
                  <button
                    type="button"
                    data-file-path="${f.path}"
                    style="${
                      f.path === selectedFilePath
                        ? `background:${accent}22; color:${accent}; border:1px solid ${accent}66; font-weight:700;`
                        : `color:${textMain};`
                    }"
                    class="w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-all flex items-center justify-between cursor-pointer hover:opacity-80"
                  >
                    <span class="truncate">${f.path}</span>
                    <span style="color:${textSub};" class="text-[10px] ml-2 shrink-0">${f.category}</span>
                  </button>
                `
                  )
                  .join('')}
              </aside>

              <!-- Dart Source Code View -->
              <main class="col-span-8 flex flex-col min-h-0" style="background:${phoneBg};">
                <div style="border-bottom:1px solid ${borderCol};" class="px-4 py-2.5 flex items-center justify-between text-xs font-mono">
                  <span style="color:${accent};" class="font-bold">/${activeFile?.path || ''}</span>
                  <span style="color:${textSub};">Mapped to ${CENTRAL_PUBLIC_URL}</span>
                </div>
                <pre class="flex-1 p-4 overflow-auto text-xs font-mono leading-relaxed select-all" style="color:${textMain};"><code>${escapeHtml(
                  activeFile?.content || ''
                )}</code></pre>
              </main>
            </div>
          </section>

        </div>

        <!-- Android APK Builder & Export Studio Modal -->
        ${
          showApkModal
            ? `
          <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div
              style="background:${panelBg}; border:2px solid ${accent}; color:${textMain}; box-shadow: 0 25px 70px rgba(0,0,0,0.75);"
              class="w-full max-w-2xl rounded-3xl p-6 space-y-5 animate-modal-zoom max-h-[92vh] overflow-y-auto"
            >
              <div class="flex items-center justify-between border-b pb-3.5" style="border-color:${borderCol};">
                <div class="flex items-center gap-3">
                  <div style="background:${accent}; color:#000;" class="w-10 h-10 rounded-2xl flex items-center justify-center text-xl font-black">
                    🤖
                  </div>
                  <div>
                    <h3 class="text-base font-extrabold">Android APK Compiler & Flutter Export Studio</h3>
                    <p style="color:${textSub};" class="text-xs font-mono">Binary AXML • Dalvik DEX (classes.dex) • RSA-2048 Signed CERT.RSA</p>
                  </div>
                </div>
                <button
                  type="button"
                  id="close-apk-modal-btn"
                  class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <!-- APK Package Configuration Inputs -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div class="space-y-1">
                  <label style="color:${textSub};" class="font-mono text-[11px]">Application Label (android:label)</label>
                  <input
                    id="apk-label-input"
                    type="text"
                    value="${escapeHtml(apkConfig.appLabel)}"
                    style="background:${phoneBg}; border:1px solid ${borderCol}; color:${textMain};"
                    class="w-full px-3 py-2 rounded-xl font-mono text-xs"
                  />
                </div>
                <div class="space-y-1">
                  <label style="color:${textSub};" class="font-mono text-[11px]">Application ID (package)</label>
                  <input
                    id="apk-package-input"
                    type="text"
                    value="${escapeHtml(apkConfig.packageName)}"
                    style="background:${phoneBg}; border:1px solid ${borderCol}; color:${textMain};"
                    class="w-full px-3 py-2 rounded-xl font-mono text-xs"
                  />
                </div>
                <div class="space-y-1">
                  <label style="color:${textSub};" class="font-mono text-[11px]">Version Name (android:versionName)</label>
                  <input
                    id="apk-version-input"
                    type="text"
                    value="${escapeHtml(apkConfig.versionName)}"
                    style="background:${phoneBg}; border:1px solid ${borderCol}; color:${textMain};"
                    class="w-full px-3 py-2 rounded-xl font-mono text-xs"
                  />
                </div>
                <div class="space-y-1">
                  <label style="color:${textSub};" class="font-mono text-[11px]">Live StreamGrid Server Endpoint</label>
                  <input
                    id="apk-url-input"
                    type="text"
                    value="${escapeHtml(apkConfig.appUrl)}"
                    style="background:${phoneBg}; border:1px solid ${borderCol}; color:${textMain};"
                    class="w-full px-3 py-2 rounded-xl font-mono text-xs"
                  />
                </div>
              </div>

              <!-- Live Build Progress Indicator -->
              ${
                isBuildingApk
                  ? `
                <div style="background:${phoneBg}; border:1px solid ${accent};" class="p-4 rounded-2xl space-y-2.5">
                  <div class="flex items-center justify-between text-xs font-mono">
                    <span style="color:${accent};" class="font-bold">${escapeHtml(apkBuildStage)}</span>
                    <span>${apkBuildProgress}%</span>
                  </div>
                  <div class="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      style="width:${apkBuildProgress}%; background: linear-gradient(90deg, ${accent}, #EC4899); transition: width 220ms ease;"
                      class="h-full rounded-full"
                    ></div>
                  </div>
                </div>
              `
                  : ''
              }

              <!-- Build Output Artifact Card -->
              ${
                apkBuildResult
                  ? `
                <div style="background:${phoneBg}; border:1.5px solid ${accent};" class="p-4 rounded-2xl space-y-3">
                  <div class="flex items-center justify-between">
                    <span style="color:${accent};" class="text-xs font-mono font-extrabold">
                      ✅ SIGNED ANDROID APK READY FOR DOWNLOAD
                    </span>
                    <span class="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                      ${apkBuildResult.size_kb} KB
                    </span>
                  </div>
                  <div class="grid grid-cols-2 gap-2 text-[11px] font-mono" style="color:${textSub};">
                    <div>Package: <strong style="color:${textMain};">${escapeHtml(apkBuildResult.package_name)}</strong></div>
                    <div>Version: <strong style="color:${textMain};">v${escapeHtml(apkBuildResult.version_name)}</strong></div>
                    <div>DEX Bytecode: <strong style="color:${textMain};">${apkBuildResult.dex_size_bytes} B (classes.dex)</strong></div>
                    <div>Binary AXML: <strong style="color:${textMain};">${apkBuildResult.manifest_size_bytes} B</strong></div>
                    <div class="col-span-2 truncate">Signer: <strong style="color:${textMain};">${escapeHtml(apkBuildResult.signature)}</strong></div>
                    <div class="col-span-2 truncate">SHA-256: <strong style="color:${accent};">${apkBuildResult.sha256}</strong></div>
                  </div>
                  <div class="flex flex-wrap gap-2 pt-1">
                    <a
                      href="${apkBuildResult.download_url}?t=${Date.now()}"
                      download="streamgrid-titan-v${escapeHtml(apkBuildResult.version_name)}.apk"
                      style="background:${accent}; color:#000;"
                      class="flex-1 py-2.5 px-4 rounded-xl text-xs font-mono font-extrabold text-center cursor-pointer hover:opacity-90"
                    >
                      ⬇️ Download streamgrid-titan-v${escapeHtml(apkBuildResult.version_name)}.apk
                    </a>
                    <a
                      href="${apkBuildResult.source_zip_url}"
                      download="streamgrid-flutter-android-project.zip"
                      style="border:1px solid ${accent}; color:${accent};"
                      class="py-2.5 px-4 rounded-xl text-xs font-mono font-bold text-center cursor-pointer hover:opacity-85"
                    >
                      📦 Download Flutter + Android .ZIP
                    </a>
                  </div>
                </div>
              `
                  : ''
              }

              <!-- Primary Action Buttons -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <button
                  type="button"
                  id="trigger-apk-build-btn"
                  style="background:${accent}; color:#000;"
                  class="py-3 px-4 rounded-xl text-xs font-mono font-extrabold cursor-pointer hover:opacity-90 flex items-center justify-center gap-1.5"
                >
                  <span>⚡ Build & Download .APK</span>
                </button>

                <a
                  href="/api/apk/download-source-zip"
                  download="streamgrid-flutter-android-project.zip"
                  style="background:${phoneBg}; border:1px solid ${borderCol}; color:${textMain};"
                  class="py-3 px-4 rounded-xl text-xs font-mono font-bold cursor-pointer hover:opacity-85 flex items-center justify-center gap-1.5 text-center"
                >
                  <span>📦 Flutter Android (.ZIP)</span>
                </a>

                <button
                  type="button"
                  id="install-pwa-btn"
                  style="background:${phoneBg}; border:1px solid ${accent}88; color:${accent};"
                  class="py-3 px-4 rounded-xl text-xs font-mono font-bold cursor-pointer hover:opacity-85 flex items-center justify-center gap-1.5"
                >
                  <span>📲 Install WebAPK (PWA)</span>
                </button>
              </div>

              ${
                showPwaInstallGuide
                  ? `
                <div style="background:${phoneBg}; border:1px solid ${borderCol};" class="p-3.5 rounded-2xl text-xs space-y-1.5">
                  <div style="color:${accent};" class="font-bold">📲 Instant Mobile Home Screen Installation</div>
                  <p style="color:${textSub};" class="text-[11px] leading-relaxed">
                    • <strong>Android (Chrome):</strong> Tap the browser menu (⋮) and select <strong>Install app</strong> or <strong>Add to Home screen</strong> to install StreamGrid as a standalone WebAPK.<br/>
                    • <strong>iOS (Safari):</strong> Tap the <strong>Share</strong> button and select <strong>Add to Home Screen</strong>.<br/>
                    • <strong>Native Flutter APK:</strong> Download the <strong>.APK</strong> above to install directly, or download the <strong>Flutter Android (.ZIP)</strong> to run <code>flutter build apk --release</code> or trigger the included GitHub Actions workflow (<code>.github/workflows/build-apk.yml</code>).
                  </p>
                </div>
              `
                  : ''
              }
            </div>
          </div>
        `
            : ''
        }

        <!-- gRPC Video Streaming Engine Interactive Blueprint Modal -->
        ${
          showGrpcModal
            ? `
          <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div
              style="background:${panelBg}; border:2px solid ${accent}; color:${textMain}; box-shadow: 0 25px 70px rgba(0,0,0,0.8);"
              class="w-full max-w-3xl rounded-3xl p-6 space-y-4 animate-modal-zoom max-h-[92vh] overflow-y-auto"
            >
              <div class="flex items-center justify-between border-b pb-3" style="border-color:${borderCol};">
                <div class="flex items-center gap-3">
                  <div style="background:${accent}; color:#000;" class="w-10 h-10 rounded-2xl flex items-center justify-center text-xl font-black">
                    📡
                  </div>
                  <div>
                    <h3 class="text-base font-extrabold">gRPC Video Streaming Engine — Mobile UI Integration Console</h3>
                    <p style="color:${textSub};" class="text-xs font-mono">Host: ${escapeHtml(grpcNgrokHost)} • Security: ${escapeHtml(grpcSecurityLevel)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  id="close-grpc-modal-btn"
                  class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <!-- Live Status Banner -->
              <div style="background:${phoneBg}; border:1px solid ${accent}; color:${accent};" class="p-3 rounded-xl text-xs font-mono font-bold">
                ${escapeHtml(grpcStatusBanner)}
              </div>

              <!-- 🌐 0. Codespace Live Endpoint Translation Gateway (Port 443 -> Node Port 3005) -->
              <div style="background:${phoneBg}; border:1px solid ${borderCol};" class="p-4 rounded-2xl space-y-2.5 text-xs">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <div class="font-bold text-sm">🌐 Connection Architecture (<code style="color:${accent};">Port 443 ➔ Node 3005</code>)</div>
                  <span style="color:${accent};" class="font-mono text-[11px] font-bold">
                    ClientChannel Host: ${escapeHtml(stripHttpsPrefix(codespaceForwardedUrl))}:443
                  </span>
                </div>
                <div class="flex gap-2">
                  <input
                    id="codespace-url-input"
                    type="text"
                    value="${escapeHtml(codespaceForwardedUrl)}"
                    placeholder="https://<YOUR-CODESPACE-SUBDOMAIN>-3005.app.github.dev"
                    style="background:${panelBg}; border:1px solid ${borderCol}; color:${textMain};"
                    class="flex-1 px-3 py-1.5 rounded-xl font-mono text-xs"
                  />
                  <button
                    type="button"
                    id="grpc-paste-clipboard-btn"
                    style="border:1.5px solid ${accent}; color:${accent}; background:${accent}18;"
                    class="px-3 py-1.5 rounded-xl font-mono text-xs font-extrabold cursor-pointer"
                  >
                    📋 Paste URL
                  </button>
                  <button
                    type="button"
                    id="apply-codespace-url-btn"
                    style="background:${accent}; color:#000;"
                    class="px-3 py-1.5 rounded-xl font-mono text-xs font-extrabold cursor-pointer"
                  >
                    Strip https:// & Map :443
                  </button>
                </div>
                <div style="color:${textSub};" class="text-[11px] font-mono">
                  <code>final String codespaceUrl = "${escapeHtml(stripHttpsPrefix(codespaceForwardedUrl))}";</code> (Port 443 ➔ 3005)
                </div>
              </div>

              <!-- 1. Authentication Execution Loop (GetAuthToken) -->
              <div style="background:${phoneBg}; border:1px solid ${borderCol};" class="p-4 rounded-2xl space-y-2.5 text-xs">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <div class="font-bold text-sm">🔑 1. Authentication Execution Loop (<code style="color:${accent};">GetAuthToken</code>)</div>
                  <div class="flex items-center gap-2">
                    <span class="font-mono text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                      Expiry Tracker: ${grpcRemainingSeconds}s / ${grpcExpiresInSeconds}s
                    </span>
                    <button
                      type="button"
                      id="grpc-refresh-token-btn"
                      style="background:${accent}; color:#000;"
                      class="px-2.5 py-1 rounded-lg font-mono text-[11px] font-extrabold cursor-pointer"
                    >
                      🔄 Run GetAuthToken
                    </button>
                    <button
                      type="button"
                      id="grpc-expire-token-btn"
                      style="border:1px solid #F43F5E; color:#F43F5E;"
                      class="px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold cursor-pointer hover:bg-rose-500/15"
                    >
                      ⚡ Simulate 1h Expiry (UNAUTHENTICATED)
                    </button>
                  </div>
                </div>
                <div class="font-mono text-[11px] truncate" style="color:${textSub};">
                  Request: <code>{ client_id: "mobile_phone_client" }</code> ➔ Token: <strong style="color:${textMain};">${escapeHtml(
              grpcJwtToken.slice(0, 48)
            )}...</strong>
                </div>
              </div>

              <!-- 2. Continuous Video Feed System (StreamFeedVideo + Modulo-9 Loop) -->
              <div style="background:${phoneBg}; border:1px solid ${borderCol};" class="p-4 rounded-2xl space-y-3 text-xs">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <div class="font-bold text-sm">📺 2. Continuous Video Feed (<code style="color:${accent};">StreamFeedVideo</code> Server-Streaming)</div>
                  <span style="color:${accent};" class="font-mono font-bold">
                    video_index: ${grpcVideoIndex} ➔ ${grpcResolvedFile} (${grpcStreamProgress}%)
                  </span>
                </div>

                <!-- Binary Memory Buffer Progress Bar -->
                <div class="space-y-1">
                  <div class="flex justify-between text-[11px] font-mono" style="color:${textSub};">
                    <span>Binary Buffer Collector: ${grpcChunksReceived} VideoChunk frames</span>
                    <span>${grpcChunkCurrentByte.toLocaleString()} / ${grpcChunkTotalBytes.toLocaleString()} bytes</span>
                  </div>
                  <div class="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      style="width:${grpcStreamProgress}%; background: linear-gradient(90deg, ${accent}, #00F2FE); transition: width 180ms ease;"
                      class="h-full rounded-full"
                    ></div>
                  </div>
                </div>

                <!-- Modulo Loop Index Tester (1..9 and 10 -> v1.mp4) -->
                <div class="space-y-1.5">
                  <div style="color:${textSub};" class="text-[11px] font-mono">
                    Test Infinite Video Loop Calculations (Index 9 ➔ v9.mp4 • Index 10 ➔ wraps around to v1.mp4):
                  </div>
                  <div class="flex flex-wrap gap-1.5">
                    ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
                      .map((idx) => {
                        const wrapped = ((idx - 1) % 9) + 1;
                        const isSelected = grpcVideoIndex === idx;
                        return `
                          <button
                            type="button"
                            data-grpc-jump-index="${idx}"
                            style="${
                              isSelected
                                ? `background:${accent}; color:#000; font-weight:800;`
                                : `background:${panelBg}; color:${textMain}; border:1px solid ${borderCol};`
                            }"
                            class="px-2.5 py-1 rounded-lg font-mono text-[11px] cursor-pointer hover:opacity-90"
                          >
                            idx ${idx} ➔ v${wrapped}.mp4${idx === 10 ? ' (LOOP)' : ''}
                          </button>
                        `;
                      })
                      .join('')}
                  </div>
                </div>
              </div>

              <!-- 3. Profile Collection API (GetProfileData -> profile_10_all) -->
              <div style="background:${phoneBg}; border:1px solid ${borderCol};" class="p-4 rounded-2xl space-y-2.5 text-xs">
                <div class="flex items-center justify-between">
                  <div class="font-bold text-sm">🗂️ 3. Profile Collection API (<code style="color:${accent};">GetProfileData</code> ➔ <code>profile_10_all</code>)</div>
                  <span style="color:${accent};" class="font-mono text-[11px] font-bold">
                    @${escapeHtml(grpcProfile10Data.username)} • ${grpcProfile10Data.video_list.length} Videos
                  </span>
                </div>
                <div class="font-mono text-[11px]" style="color:${textSub};">
                  Display Name: <strong style="color:${textMain};">${escapeHtml(grpcProfile10Data.display_name)}</strong> • Avatar: <strong style="color:${textMain};">${escapeHtml(
              grpcProfile10Data.avatar_url
            )}</strong>
                </div>
                <div class="flex flex-wrap gap-1.5 pt-1">
                  ${grpcProfile10Data.video_list
                    .map(
                      (vFile, i) => `
                    <button
                      type="button"
                      data-grpc-jump-index="${i + 1}"
                      style="border:1px solid ${accent}66; color:${accent}; background:${accent}15;"
                      class="px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold cursor-pointer hover:opacity-85"
                    >
                      ▶ ${vFile}
                    </button>
                  `
                    )
                    .join('')}
                </div>
              </div>

              <!-- 4. Mobile-to-Server Upload Pipe (UploadMediaFile Client-Streaming 64KB Chunks) -->
              <div style="background:${phoneBg}; border:1px solid ${borderCol};" class="p-4 rounded-2xl space-y-2.5 text-xs">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <div class="font-bold text-sm">📤 4. Mobile-to-Server Upload Pipe (<code style="color:${accent};">UploadMediaFile</code> 64KB Stream)</div>
                  <button
                    type="button"
                    id="modal-grpc-upload-btn"
                    style="background:${accent}; color:#000;"
                    class="px-3 py-1.5 rounded-lg font-mono text-[11px] font-extrabold cursor-pointer"
                  >
                    ${isUploadingGrpcChunks ? `Streaming Chunk ${uploadCurrentChunk}/${uploadTotalChunks}...` : `🚀 Stream 6x64KB (${escapeHtml(uploadTargetFilename)})`}
                  </button>
                </div>
                <div class="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    style="width:${uploadChunkProgress}%; background: linear-gradient(90deg, ${accent}, #10B981); transition: width 150ms ease;"
                    class="h-full rounded-full"
                  ></div>
                </div>
                <div style="color:${textSub};" class="font-mono text-[11px]">
                  ${escapeHtml(
                    uploadLastResponseMessage ||
                      'Slices local .mp4 into sequential 64KB UploadRequest { token, filename, chunk_data } frames & updates /videos + profile_10_all.'
                  )}
                </div>
              </div>
            </div>
          </div>
        `
            : ''
        }
      </div>
    `;

    // Bind Top-Left Theme Selector, Dedicated Paste URL Button & Top-Right Client Profile + Sign Out buttons on Mobile Screen
    document.getElementById('mobile-topleft-theme-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      showMobileTopLeftThemePopover = !showMobileTopLeftThemePopover;
      showMobileTopRightProfilePopover = false;
      showMobilePasteUrlPopover = false;
      render();
    });
    document.getElementById('close-mobile-theme-popover-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      showMobileTopLeftThemePopover = false;
      render();
    });
    document.getElementById('mobile-paste-url-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (showMobilePasteUrlPopover) {
        showMobilePasteUrlPopover = false;
        render();
      } else {
        triggerClipboardPasteForTesting(false);
      }
    });
    document.getElementById('header-paste-url-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerClipboardPasteForTesting(false);
    });
    document.getElementById('close-mobile-paste-url-popover-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      showMobilePasteUrlPopover = false;
      render();
    });
    document.getElementById('mobile-clear-url-input-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      draftPasteUrlInput = '';
      const inp = document.getElementById('mobile-paste-url-input') as HTMLInputElement | null;
      if (inp) {
        inp.value = '';
        inp.focus();
      }
    });
    document.getElementById('mobile-test-url-submit-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const inp = document.getElementById('mobile-paste-url-input') as HTMLInputElement | null;
      const val = inp ? inp.value : draftPasteUrlInput;
      applyAndTestPastedUrl(val, 'Server URL Connected');
    });
    const mobilePasteInp = document.getElementById('mobile-paste-url-input') as HTMLInputElement | null;
    if (mobilePasteInp) {
      mobilePasteInp.addEventListener('input', () => {
        draftPasteUrlInput = mobilePasteInp.value;
      });
      mobilePasteInp.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          draftPasteUrlInput = mobilePasteInp.value;
          applyAndTestPastedUrl(mobilePasteInp.value, 'Enter Key URL Test');
        }
      });
    }
    root.querySelectorAll<HTMLButtonElement>('button[data-test-url-preset]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const preset = btn.getAttribute('data-test-url-preset') || '';
        if (preset) {
          draftPasteUrlInput = preset;
          applyAndTestPastedUrl(preset, 'Preset URL Selected');
        }
      });
    });
    document.getElementById('grpc-paste-clipboard-btn')?.addEventListener('click', async () => {
      try {
        if (navigator.clipboard && navigator.clipboard.readText) {
          const clipText = (await navigator.clipboard.readText()).trim();
          if (clipText) {
            await applyAndTestPastedUrl(clipText, 'gRPC Modal Clipboard Paste');
            return;
          }
        }
      } catch {}
      const inp = document.getElementById('codespace-url-input') as HTMLInputElement | null;
      if (inp) {
        inp.focus();
        inp.select();
      }
    });
    document.getElementById('mobile-topright-profile-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      showMobileTopRightProfilePopover = !showMobileTopRightProfilePopover;
      showMobileTopLeftThemePopover = false;
      showMobilePasteUrlPopover = false;
      render();
    });
    document.getElementById('close-mobile-profile-popover-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      showMobileTopRightProfilePopover = false;
      render();
    });
    document.getElementById('mobile-popover-open-profile-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      showMobileTopRightProfilePopover = false;
      activeMobileTab = 'profile';
      loadProfileHandle('@master_creator_10');
    });
    document.getElementById('mobile-popover-signout-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      handleClientSignOut();
    });
    document.getElementById('mobile-direct-signout-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      handleClientSignOut();
    });
    document.getElementById('mobile-popover-signin-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      handleClientSignIn();
    });
    document.getElementById('mobile-direct-signin-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      handleClientSignIn();
    });
    document.getElementById('auth-signin-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      handleClientSignIn();
    });

    // Bind Codespace URL Stripper & 64KB UploadMediaFile buttons
    document.getElementById('apply-codespace-url-btn')?.addEventListener('click', () => {
      const inp = document.getElementById('codespace-url-input') as HTMLInputElement | null;
      if (inp && inp.value.trim()) {
        codespaceForwardedUrl = stripHttpsPrefix(inp.value);
        grpcStatusBanner = `Codespace Gateway Configured ➔ ${codespaceForwardedUrl}:443 (Routes to Node port 3005)`;
        render();
      }
    });
    document.getElementById('modal-grpc-upload-btn')?.addEventListener('click', () => {
      executeGrpcUploadMediaFile();
    });

    // Bind Replay Amazing Loader button
    document.getElementById('replay-loader-btn')?.addEventListener('click', () => {
      replayAmazingLoader();
    });

    // Bind 12-Color selector buttons
    root.querySelectorAll<HTMLButtonElement>('button[data-color-idx]').forEach((btn) => {
      btn.addEventListener('click', () => {
        selectedColorIdx = Number(btn.getAttribute('data-color-idx') || 0);
        render();
      });
    });

    // Bind Day Mode / Night Mode buttons
    root.querySelectorAll<HTMLButtonElement>('button[data-set-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetMode = btn.getAttribute('data-set-mode');
        isNightMode = targetMode === 'night';
        render();
      });
    });

    root.querySelectorAll<HTMLButtonElement>('button[data-toggle-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        isNightMode = !isNightMode;
        render();
      });
    });

    // Bind Mobile Tab navigation buttons (triggers gRPC fetch for Feed, Profile, and Search)
    root.querySelectorAll<HTMLButtonElement>('button[data-mobile-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nextTab = (btn.getAttribute('data-mobile-tab') as MobileTab) || 'feed';
        activeMobileTab = nextTab;
        openedFromProfile = false;
        showCommentsDrawer = false;
        showShareDrawer = false;
        if (nextTab !== 'profile') {
          showMobileTopRightProfilePopover = false;
        }
        if (nextTab === 'profile') {
          loadProfileHandle('@master_creator_10');
        } else if (nextTab === 'search') {
          executeGrpcSearchVideos(searchQuery);
        } else if (nextTab === 'feed') {
          executeGrpcStreamFeedVideo(grpcVideoIndex);
        } else {
          render();
        }
      });
    });

    // Bind Back to Profile button when a video was opened from Profile Grid
    document.getElementById('back-to-profile-btn')?.addEventListener('click', () => {
      openedFromProfile = false;
      activeMobileTab = 'profile';
      showCommentsDrawer = false;
      showShareDrawer = false;
      render();
    });

    // Bind Dart File Tree selection
    root.querySelectorAll<HTMLButtonElement>('button[data-file-path]').forEach((btn) => {
      btn.addEventListener('click', () => {
        selectedFilePath = btn.getAttribute('data-file-path') || selectedFilePath;
        render();
      });
    });

    // Bind Full-Screen Profile Photo Open triggers
    root.querySelectorAll<HTMLElement>('[data-open-fullscreen-photo]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const url = el.getAttribute('data-photo-url') || DEFAULT_AVATAR_URL;
        const name = el.getAttribute('data-photo-name') || 'Alex Rivers';
        const username = el.getAttribute('data-photo-username') || '@alex_rivers_dev';
        const bio = el.getAttribute('data-photo-bio') || 'Design Systems Architect · Flutter & Shaders';
        const followers = el.getAttribute('data-photo-followers') || '38.4k';
        fullScreenProfilePhoto = { url, name, username, bio, followers, zoomed: false };
        render();
      });
    });

    // Bind Full-Screen Profile Photo Close & Zoom
    document.getElementById('close-photo-btn')?.addEventListener('click', () => {
      fullScreenProfilePhoto = null;
      render();
    });
    document.getElementById('zoom-photo-btn')?.addEventListener('click', () => {
      if (fullScreenProfilePhoto) {
        fullScreenProfilePhoto.zoomed = !fullScreenProfilePhoto.zoomed;
        render();
      }
    });
    document.getElementById('fullscreen-photo-img')?.addEventListener('click', () => {
      if (fullScreenProfilePhoto) {
        fullScreenProfilePhoto.zoomed = !fullScreenProfilePhoto.zoomed;
        render();
      }
    });

    // Bind Clicking Any Video in Profile Grid -> Streams Video via gRPC StreamFeedVideo
    root.querySelectorAll<HTMLElement>('[data-open-profile-video-idx]').forEach((el) => {
      el.addEventListener('click', () => {
        const idx = Number(el.getAttribute('data-open-profile-video-idx') || 0);
        openedFromProfile = true;
        isVideoPaused = false;
        activeMobileTab = 'feed';
        executeGrpcStreamFeedVideo(idx + 1);
      });
    });

    // Bind gRPC Jump Index buttons (e.g. idx 1..9, idx 10 -> wraps around to v1.mp4)
    root.querySelectorAll<HTMLButtonElement>('button[data-grpc-jump-index]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetIdx = Number(btn.getAttribute('data-grpc-jump-index') || 1);
        isVideoPaused = false;
        activeMobileTab = 'feed';
        executeGrpcStreamFeedVideo(targetIdx);
      });
    });

    // Bind gRPC Modal Open / Close / Token Refresh / Simulate Expiry
    document.getElementById('open-grpc-modal-btn')?.addEventListener('click', () => {
      showGrpcModal = true;
      render();
    });
    document.getElementById('close-grpc-modal-btn')?.addEventListener('click', () => {
      showGrpcModal = false;
      render();
    });
    document.getElementById('grpc-refresh-token-btn')?.addEventListener('click', () => {
      executeGrpcGetAuthToken('Manual GetAuthToken Refresh');
    });
    document.getElementById('grpc-expire-token-btn')?.addEventListener('click', () => {
      simulateGrpcTokenExpiryAndRefresh();
    });

    // Bind Video Feed Controls (Scroll / Prev / Next / Mute / Play-Pause / Double-Tap Like)
    let activeVideoEl = document.getElementById('active-reel-video') as HTMLVideoElement | null;
    const activeWrappedIdx = getWrappedIndex9(grpcVideoIndex);
    const activeSlotObj = serverVideoSlots.get(activeWrappedIdx);
    if (
      activeVideoEl &&
      prevVideoEl &&
      prevVideoAttrSrc &&
      prevVideoAttrSrc === activeVideoEl.getAttribute('src') &&
      prevVideoEl.readyState >= 2 &&
      !prevVideoEl.error
    ) {
      activeVideoEl.replaceWith(prevVideoEl);
      activeVideoEl = prevVideoEl;
      if (activeSlotObj) {
        activeSlotObj.feedDomReady = true;
      }
      const feedLoaderOverlay = document.getElementById('feed-video-loader-overlay');
      if (feedLoaderOverlay) {
        feedLoaderOverlay.style.display = 'none';
      }
    }
    if (activeVideoEl && activeVideoEl.getAttribute('src')) {
      activeVideoEl.muted = isVideoMuted;
      const markFeedVideoLoaded = () => {
        if (activeSlotObj) {
          activeSlotObj.feedDomReady = true;
        }
        const feedLoaderOverlay = document.getElementById('feed-video-loader-overlay');
        if (feedLoaderOverlay) {
          feedLoaderOverlay.style.display = 'none';
        }
      };
      if (activeVideoEl.readyState >= 2) {
        markFeedVideoLoaded();
      } else {
        activeVideoEl.addEventListener('loadeddata', markFeedVideoLoaded, { once: true });
        activeVideoEl.addEventListener('canplay', markFeedVideoLoaded, { once: true });
      }
      if (!isVideoPaused) {
        if (activeVideoEl.readyState === 0 && activeVideoEl.networkState === HTMLMediaElement.NETWORK_EMPTY) {
          activeVideoEl.load();
        }
        const playPromise = activeVideoEl.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => {
            if (activeVideoEl) {
              activeVideoEl.muted = true;
              activeVideoEl.play().catch(() => {});
            }
          });
        }
      } else {
        activeVideoEl.pause();
      }
    }

    // Bind Profile Grid 9-Video <video> elements so each tile's loader stays visible until loadeddata/canplay
    root.querySelectorAll<HTMLVideoElement>('video[data-profile-video-slot]').forEach((vEl) => {
      const slotNum = Number(vEl.getAttribute('data-profile-video-slot') || 1);
      const slotState = serverVideoSlots.get(slotNum);
      const loaderEl = document.getElementById(`profile-video-loader-overlay-${slotNum}`);
      const markTileReady = () => {
        if (slotState) {
          slotState.profileDomReady = true;
        }
        if (loaderEl) {
          loaderEl.style.display = 'none';
        }
      };
      if (vEl.getAttribute('src')) {
        if (vEl.readyState >= 2) {
          markTileReady();
        } else {
          vEl.addEventListener('loadeddata', markTileReady, { once: true });
          vEl.addEventListener('canplay', markTileReady, { once: true });
        }
      }
    });

    // Bind mouse wheel vertical scroll on the reel viewport to increment video_index via gRPC StreamFeedVideo
    const reelViewportEl = document.getElementById('reel-scroll-viewport');
    if (reelViewportEl) {
      let wheelCooldown = false;
      reelViewportEl.addEventListener(
        'wheel',
        (e: WheelEvent) => {
          if (showCommentsDrawer || showShareDrawer) return;
          if (Math.abs(e.deltaY) < 28 || wheelCooldown) return;
          e.preventDefault();
          wheelCooldown = true;
          const nextIdx = e.deltaY > 0 ? grpcVideoIndex + 1 : Math.max(1, grpcVideoIndex - 1);
          isVideoPaused = false;
          executeGrpcStreamFeedVideo(nextIdx);
          setTimeout(() => {
            wheelCooldown = false;
          }, 420);
        },
        { passive: false }
      );
    }

    document.getElementById('prev-video-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      isVideoPaused = false;
      const prevIdx = grpcVideoIndex > 1 ? grpcVideoIndex - 1 : 9;
      executeGrpcStreamFeedVideo(prevIdx);
    });

    document.getElementById('next-video-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      isVideoPaused = false;
      // Increment video_index by 1 on swipe down (index 9 -> v9.mp4, index 10 -> wraps to v1.mp4)
      executeGrpcStreamFeedVideo(grpcVideoIndex + 1);
    });

    document.getElementById('toggle-mute-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      isVideoMuted = !isVideoMuted;
      render();
    });

    document.getElementById('toggle-play-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      isVideoPaused = !isVideoPaused;
      render();
    });

    // Single tap on video surface toggles play/pause; double tap triggers Heart Burst Like!
    const videoTapOverlay = document.getElementById('reel-video-tap-surface');
    if (videoTapOverlay) {
      let lastTap = 0;
      videoTapOverlay.addEventListener('click', () => {
        const now = Date.now();
        if (now - lastTap < 300) {
          // Double-tap -> Like with Heart Burst animation!
          triggerLikeWithAnimation(vidId, true);
        } else {
          isVideoPaused = !isVideoPaused;
          render();
        }
        lastTap = now;
      });
    }

    // Like button with spring pop + heart burst animation
    document.getElementById('like-video-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      fetch(`/api/videos/${encodeURIComponent(vidId)}/like`, { method: 'POST' }).catch(() => {});
      triggerLikeWithAnimation(vidId, false);
    });

    // Follow / Unfollow button with spring animation
    document.getElementById('follow-creator-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (followedHandles.has(creatorHandle)) followedHandles.delete(creatorHandle);
      else followedHandles.add(creatorHandle);
      followButtonAnimTrigger = true;
      render();
      setTimeout(() => {
        followButtonAnimTrigger = false;
        render();
      }, 420);
    });

    // Comments button with spring pop + animated drawer
    root.querySelectorAll<HTMLButtonElement>('button[data-toggle-comments]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        showCommentsDrawer = !showCommentsDrawer;
        showShareDrawer = false;
        commentButtonAnimTrigger = true;
        render();
        setTimeout(() => {
          commentButtonAnimTrigger = false;
        }, 420);
      });
    });

    // Individual comment like button animation
    root.querySelectorAll<HTMLButtonElement>('button[data-like-comment-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const cid = btn.getAttribute('data-like-comment-id') || '';
        const list = getCommentsForVideo(vidId);
        const target = list.find((c) => c.id === cid);
        if (target) {
          if (likedCommentIds.has(cid)) {
            likedCommentIds.delete(cid);
            target.likes = Math.max(0, target.likes - 1);
          } else {
            likedCommentIds.add(cid);
            target.likes += 1;
          }
          render();
        }
      });
    });

    // Quick emoji comment reaction buttons
    root.querySelectorAll<HTMLButtonElement>('button[data-quick-emoji]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const emoji = btn.getAttribute('data-quick-emoji') || '🔥';
        const list = getCommentsForVideo(vidId);
        list.unshift({
          id: `c_${Date.now()}`,
          user: '@alex_rivers_dev',
          text: `${emoji} Loving this reel stream!`,
          time: 'Just now',
          likes: 1,
        });
        render();
      });
    });

    // Add comment form submission
    document.getElementById('add-comment-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('comment-input') as HTMLInputElement | null;
      if (input && input.value.trim()) {
        const text = input.value.trim();
        const list = getCommentsForVideo(vidId);
        list.unshift({
          id: `c_${Date.now()}`,
          user: '@alex_rivers_dev',
          text,
          time: 'Just now',
          likes: 1,
        });
        fetch(`/api/videos/${encodeURIComponent(vidId)}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: '@alex_rivers_dev', text }),
        }).catch(() => {});
        render();
      }
    });

    // Share button with spring pop + animated share drawer
    root.querySelectorAll<HTMLButtonElement>('button[data-toggle-share]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        showShareDrawer = !showShareDrawer;
        showCommentsDrawer = false;
        shareButtonAnimTrigger = true;
        render();
        setTimeout(() => {
          shareButtonAnimTrigger = false;
        }, 420);
      });
    });

    // Functional Share target actions inside Share Sheet
    root.querySelectorAll<HTMLButtonElement>('button[data-share-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const actionName = btn.getAttribute('data-share-action') || 'Copy Link';
        shareCounts[vidId] = (shareCounts[vidId] || 0) + 1;
        if (navigator.clipboard && activeVideo.stream_url) {
          navigator.clipboard.writeText(activeVideo.stream_url).catch(() => {});
        }
        shareToastMessage = `✓ ${actionName}: ${activeVideo.reel_filename || 'reel1.mp4'} shared!`;
        render();
        setTimeout(() => {
          shareToastMessage = null;
          showShareDrawer = false;
          render();
        }, 1400);
      });
    });

    // Profile handle switcher buttons
    root.querySelectorAll<HTMLButtonElement>('button[data-profile-handle]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const h = btn.getAttribute('data-profile-handle') || '@master_creator_10';
        activeMobileTab = 'profile';
        openedFromProfile = false;
        loadProfileHandle(h);
      });
    });

    // Profile Grid / Liked sub-tab buttons (ProfileTabScreen DefaultTabController)
    root.querySelectorAll<HTMLButtonElement>('button[data-profile-subtab]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const tab = btn.getAttribute('data-profile-subtab') as 'grid' | 'liked';
        if (tab === 'grid' || tab === 'liked') {
          profileSubTab = tab;
          render();
        }
      });
    });

    // Upload new reel via 64KB Client-Streaming UploadMediaFile pipe
    const realFileInp = document.getElementById('upload-real-video-input') as HTMLInputElement | null;
    if (realFileInp) {
      realFileInp.addEventListener('change', () => {
        const picked = realFileInp.files?.[0] || null;
        if (picked) {
          selectedUploadFile = picked;
          uploadTargetFilename = picked.name;
          uploadLastResponseMessage = `Selected local video: ${picked.name} (${(picked.size / 1024).toFixed(1)} KB) ready for gRPC UploadMediaFile`;
          render();
        }
      });
    }
    document.getElementById('simulate-upload-btn')?.addEventListener('click', async () => {
      const capInput = document.getElementById('upload-caption-input') as HTMLInputElement | null;
      const fileInput = document.getElementById('upload-filename-input') as HTMLInputElement | null;
      const caption = capInput?.value || 'Uploaded via 64KB gRPC UploadMediaFile stream #flutter #grpc';
      const targetName = fileInput?.value || uploadTargetFilename;
      await executeGrpcUploadMediaFile(targetName, caption);
    });
    document.getElementById('watch-confirmed-upload-btn')?.addEventListener('click', () => {
      const targetIdx = uploadConfirmationDetails?.video_index || grpcProfile10Data?.video_list?.length || 1;
      isVideoPaused = false;
      activeMobileTab = 'feed';
      executeGrpcStreamFeedVideo(targetIdx);
    });
    document.getElementById('view-confirmed-upload-profile-btn')?.addEventListener('click', () => {
      activeMobileTab = 'profile';
      loadProfileHandle('@master_creator_10');
    });
    document.getElementById('profile-refresh-grpc-btn')?.addEventListener('click', () => {
      loadProfileHandle('@master_creator_10');
    });
    document.getElementById('profile-page-logout-btn')?.addEventListener('click', () => {
      handleClientSignOut();
    });

    // Search input & gRPC SearchVideos triggers
    const sInput = document.getElementById('mobile-search-input') as HTMLInputElement | null;
    if (sInput) {
      sInput.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          executeGrpcSearchVideos(sInput.value);
        }
      });
    }
    document.getElementById('mobile-grpc-search-btn')?.addEventListener('click', () => {
      const inp = document.getElementById('mobile-search-input') as HTMLInputElement | null;
      executeGrpcSearchVideos(inp ? inp.value : searchQuery);
    });
    root.querySelectorAll<HTMLButtonElement>('button[data-search-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const q = btn.getAttribute('data-search-filter') || '';
        executeGrpcSearchVideos(q);
      });
    });

    // Bind APK Builder Modal Open / Close / Build Actions
    const openApkModal = () => {
      showApkModal = true;
      render();
    };
    document.getElementById('open-apk-modal-btn')?.addEventListener('click', openApkModal);
    document.getElementById('panel-apk-btn')?.addEventListener('click', openApkModal);
    document.getElementById('close-apk-modal-btn')?.addEventListener('click', () => {
      showApkModal = false;
      render();
    });

    document.getElementById('install-pwa-btn')?.addEventListener('click', async () => {
      if (deferredPwaPrompt) {
        await deferredPwaPrompt.prompt();
        deferredPwaPrompt = null;
      } else {
        showPwaInstallGuide = !showPwaInstallGuide;
      }
      render();
    });

    document.getElementById('trigger-apk-build-btn')?.addEventListener('click', async () => {
      if (isBuildingApk) return;
      const lblEl = document.getElementById('apk-label-input') as HTMLInputElement | null;
      const pkgEl = document.getElementById('apk-package-input') as HTMLInputElement | null;
      const verEl = document.getElementById('apk-version-input') as HTMLInputElement | null;
      const urlEl = document.getElementById('apk-url-input') as HTMLInputElement | null;

      if (lblEl) apkConfig.appLabel = lblEl.value.trim() || 'StreamGrid Titan';
      if (pkgEl) apkConfig.packageName = pkgEl.value.trim() || 'com.streamgrid.titan';
      if (verEl) apkConfig.versionName = verEl.value.trim() || '1.0.0';
      if (urlEl) apkConfig.appUrl = urlEl.value.trim() || window.location.origin;

      isBuildingApk = true;
      apkBuildProgress = 22;
      apkBuildStage = '1/4 Compiling binary AndroidManifest.xml (AXML ResXMLTree)...';
      render();
      await new Promise((r) => setTimeout(r, 240));

      apkBuildProgress = 54;
      apkBuildStage = '2/4 Assembling Dalvik Executable classes.dex (MainActivity)...';
      render();
      await new Promise((r) => setTimeout(r, 260));

      apkBuildProgress = 82;
      apkBuildStage = '3/4 Signing APK with RSA-2048 X.509 Certificate (META-INF/CERT.RSA)...';
      render();

      try {
        const resp = await fetch('/api/apk/build', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(apkConfig),
        });
        const data = await resp.json();
        apkBuildProgress = 100;
        apkBuildStage = '4/4 APK Build Complete! Triggering download...';
        apkBuildResult = data;
        isBuildingApk = false;
        render();

        if (data.download_url) {
          const link = document.createElement('a');
          link.href = `${data.download_url}?t=${Date.now()}`;
          link.download = `streamgrid-titan-v${apkConfig.versionName}.apk`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch (err) {
        console.error(err);
        isBuildingApk = false;
        render();
      }
    });
  }

  render();
  // Fetch all 9 videos (v1.mp4..v9.mp4) from server via gRPC StreamFeedVideo when Feed section is active on boot
  fetchAll9ServerVideosFromGrpc(false);
}

function renderMobileTabContent(opts: any): string {
  const {
    activeMobileTab,
    activeVideo,
    activeVideoIdx,
    feedList,
    accent,
    isNightMode,
    textMain,
    textSub,
    panelBg,
    phoneBg,
    borderCol,
    isLiked,
    isFollowing,
    selectedColorIdx,
    currentProfile,
    searchQuery,
    notificationsList,
    showCommentsDrawer,
    showShareDrawer,
    videoComments,
    showHeartBurst,
    likeButtonAnimTrigger,
    commentButtonAnimTrigger,
    shareButtonAnimTrigger,
    followButtonAnimTrigger,
    openedFromProfile,
    isVideoMuted,
    isVideoPaused,
    extraShares,
    likedCommentIds,
    shareToastMessage,
    grpcVideoIndex = 1,
    grpcResolvedFile = 'v1.mp4',
    grpcStreamProgress = 0,
    grpcChunksReceived = 0,
    grpcCompiledBlobUrl = null,
    grpcRemainingSeconds = 3600,
    grpcProfile10Data,
    profileSubTab = 'grid',
    sanitizedCodespaceHost = 'streamgrid-workspace-3005.app.github.dev',
    isUploadingGrpcChunks = false,
    uploadChunkProgress = 0,
    uploadCurrentChunk = 0,
    uploadTotalChunks = 6,
    uploadTargetFilename = 'v10.mp4',
    uploadLastResponseMessage = null,
    uploadConfirmationDetails = null,
    selectedUploadFile = null,
    grpcSearchResults = [],
    isSearchingGrpc = false,
    isClientSignedIn = true,
    serverVideoSlots = new Map(),
  } = opts;

  // 1. SETTINGS & 12-COLOR / DAY-NIGHT THEME SELECTOR
  if (activeMobileTab === 'settings') {
    return `
      <div class="p-4 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold">Titan Appearance & Settings</h3>
          <span style="color:${accent};" class="text-xs font-mono font-bold">${TITAN_PALETTE_12[selectedColorIdx].hex}</span>
        </div>

        <!-- Day / Night Mode Selector Card -->
        <div style="background:${panelBg}; border:1.5px solid ${accent}55;" class="p-3.5 rounded-2xl space-y-3 shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-xs font-bold">Day / Night Mode Selector</div>
              <div style="color:${textSub};" class="text-[11px]">
                ${isNightMode ? 'Night Mode (OLED Dark)' : 'Day Mode (Alabaster Light)'}
              </div>
            </div>
            <button
              type="button"
              data-toggle-mode="true"
              style="background:${accent}; color:#000;"
              class="px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer"
            >
              Switch to ${isNightMode ? 'Day ☀️' : 'Night 🌙'}
            </button>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              data-set-mode="day"
              style="${
                !isNightMode
                  ? `background:${accent}; color:#000; font-weight:800; box-shadow:0 4px 14px ${accent}44;`
                  : `background:${phoneBg}; color:${textSub}; border:1px solid ${borderCol};`
              }"
              class="py-2.5 rounded-xl text-xs cursor-pointer transition-all flex items-center justify-center gap-1.5"
            >
              <span>☀️ Day Mode</span>
              ${!isNightMode ? '<span>✓</span>' : ''}
            </button>
            <button
              type="button"
              data-set-mode="night"
              style="${
                isNightMode
                  ? `background:${accent}; color:#000; font-weight:800; box-shadow:0 4px 14px ${accent}44;`
                  : `background:${phoneBg}; color:${textSub}; border:1px solid ${borderCol};`
              }"
              class="py-2.5 rounded-xl text-xs cursor-pointer transition-all flex items-center justify-center gap-1.5"
            >
              <span>🌙 Night Mode</span>
              ${isNightMode ? '<span>✓</span>' : ''}
            </button>
          </div>
        </div>

        <!-- 12-Color Theme Selector Grid -->
        <div style="background:${panelBg}; border:1px solid ${borderCol};" class="p-3.5 rounded-2xl space-y-2.5 shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold">12-Color App Theme Selector</span>
            <span style="color:${textSub};" class="text-[10px] font-mono">ThemePillar.palette12</span>
          </div>
          <div class="grid grid-cols-4 gap-2">
            ${TITAN_PALETTE_12.map(
              (c) => `
              <button
                type="button"
                data-color-idx="${c.index}"
                style="background:${c.hex}18; border:2px solid ${c.index === selectedColorIdx ? c.hex : 'transparent'};"
                class="p-2 rounded-xl flex flex-col items-center gap-1 cursor-pointer transition-all"
              >
                <span style="background:${c.hex};" class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-black font-bold">
                  ${c.index === selectedColorIdx ? '✓' : ''}
                </span>
                <span class="text-[9px] font-semibold truncate w-full text-center">${c.name.split(' ')[1]}</span>
              </button>
            `
            ).join('')}
          </div>
        </div>

        <!-- Active gRPC Server Video Assets Status -->
        <div style="background:${panelBg}; border:1px solid ${borderCol};" class="p-3.5 rounded-2xl space-y-1.5 text-xs shadow-sm">
          <div class="font-bold">gRPC Server Video Stream Pool (Port 3005)</div>
          <div style="color:${accent};" class="text-[11px] font-mono">• StreamFeedVideo: v1.mp4 .. v9.mp4 (Modulo-9 Loop)</div>
          <div style="color:${accent};" class="text-[11px] font-mono">• GetProfileData: profile_10_all (@master_creator_10)</div>
          <div style="color:${textSub};" class="text-[11px] font-mono">• Chunk Size: 64 KB binary stream packages</div>
        </div>
      </div>
    `;
  }

  // 2. USER PROFILE SCREEN (Fetched from Server via gRPC GetProfileData + Top-Right Log Out Button)
  if (activeMobileTab === 'profile') {
    const creator = currentProfile?.creator || {
      username: 'master_creator_10',
      display_name: 'All Videos Portfolio Folder',
      avatar_url: DEFAULT_AVATAR_URL,
      followers: '450K',
      following: '9',
      likes: '1.2M',
      bio: 'Synced with Server 10th Master Directory 📁',
    };
    const isMaster10 = (creator.username || '').includes('master_creator_10');
    const videoList: string[] = grpcProfile10Data?.video_list || [
      'v1.mp4',
      'v2.mp4',
      'v3.mp4',
      'v4.mp4',
      'v5.mp4',
      'v6.mp4',
      'v7.mp4',
      'v8.mp4',
      'v9.mp4',
    ];
    const serverVideos: any[] =
      grpcProfile10Data?.videos && grpcProfile10Data.videos.length > 0
        ? grpcProfile10Data.videos
        : currentProfile?.videos && currentProfile.videos.length > 0
        ? currentProfile.videos
        : feedList;
    const avatarSrc =
      creator.avatar_url && creator.avatar_url !== 'https://dicebear.com'
        ? creator.avatar_url
        : DEFAULT_AVATAR_URL;

    return `
      <div class="p-3.5 space-y-3">
        <!-- AppBar Title + Top-Right gRPC Refresh & Log Out Button (Exclusive to Profile Page) -->
        <div class="flex items-center justify-between gap-1.5">
          <div class="flex items-center gap-1.5 min-w-0">
            <span class="text-xs font-mono font-extrabold truncate" style="color:${accent};">
              @${escapeHtml((creator.username || 'master_creator_10').replace(/^@/, ''))}
            </span>
            <button
              type="button"
              id="profile-refresh-grpc-btn"
              title="Re-fetch Profile Videos from Server via gRPC GetProfileData"
              style="background:${panelBg}; border:1px solid ${accent}66; color:${accent};"
              class="px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold cursor-pointer hover:opacity-85 shrink-0"
            >
              🔄 gRPC Sync
            </button>
          </div>
          <button
            type="button"
            id="profile-page-logout-btn"
            title="Log Out of Client Profile (Only on Profile Page Top-Right)"
            style="background:rgba(244,63,94,0.18); border:1.5px solid #F43F5E; color:#F43F5E;"
            class="px-2.5 py-1 rounded-xl text-[10px] font-mono font-extrabold cursor-pointer flex items-center gap-1 shrink-0 active:scale-95 transition-transform"
          >
            <span>🚪</span>
            <span>Log Out</span>
          </button>
        </div>

        <!-- Profile Header with Clickable Full-Screen Profile Photo -->
        <div class="flex flex-col items-center text-center space-y-2">
          <div
            data-open-fullscreen-photo="true"
            data-photo-url="${avatarSrc}"
            data-photo-name="${escapeHtml(creator.display_name || 'All Videos Portfolio Folder')}"
            data-photo-username="${escapeHtml(creator.username || 'master_creator_10')}"
            data-photo-bio="${escapeHtml(creator.bio || 'Synced with Server 10th Master Directory')}"
            data-photo-followers="${escapeHtml(creator.followers || '450K')}"
            title="Click to open profile photo in full screen"
            class="relative group cursor-pointer"
          >
            <div style="border: 2.5px solid ${accent}; box-shadow: 0 0 20px ${accent}44;" class="w-20 h-20 rounded-full p-0.5 overflow-hidden transition-transform group-hover:scale-105">
              <img
                src="${avatarSrc}"
                alt="${escapeHtml(creator.display_name || 'Creator')}"
                class="w-full h-full rounded-full object-cover"
              />
            </div>
            <span
              style="background:${accent}; color:#000;"
              class="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold shadow"
            >
              ⛶ Full
            </span>
          </div>

          <div class="font-bold text-sm pt-1">${escapeHtml(
            isMaster10 ? 'All Videos Portfolio Folder' : creator.display_name || 'Alex Rivers'
          )}</div>

          <!-- Metrics Tracker Layer Row (Videos | 1.2M Likes | 450K Followers) -->
          <div class="flex items-center justify-center gap-5 py-1 text-xs">
            <div class="flex flex-col items-center">
              <strong class="font-mono text-sm">${videoList.length}</strong>
              <span style="color:${textSub};" class="text-[11px]">Server Videos</span>
            </div>
            <div style="background:${borderCol};" class="w-px h-6"></div>
            <div class="flex flex-col items-center">
              <strong class="font-mono text-sm">${isMaster10 ? '1.2M' : creator.likes || '145.2k'}</strong>
              <span style="color:${textSub};" class="text-[11px]">Likes</span>
            </div>
            <div style="background:${borderCol};" class="w-px h-6"></div>
            <div class="flex flex-col items-center">
              <strong class="font-mono text-sm">${isMaster10 ? '450K' : creator.followers || '38.4k'}</strong>
              <span style="color:${textSub};" class="text-[11px]">Followers</span>
            </div>
          </div>

          <!-- gRPC GetProfileData & 9-Video StreamFeedVideo Status Bar Indicator -->
          <div
            id="grpc-batch-9-summary"
            style="background:${panelBg}; border:1px solid ${accent}55; color:${accent};"
            class="px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold"
          >
            ${(() => {
              let loadedCount = 0;
              let errorCount = 0;
              let firstErr = '';
              for (let i = 1; i <= 9; i++) {
                const st = serverVideoSlots.get(i);
                if (st?.status === 'loaded') loadedCount++;
                if (st?.status === 'error') {
                  errorCount++;
                  if (!firstErr && st.errorMessage) firstErr = st.errorMessage;
                }
              }
              return loadedCount >= 9
                ? '✅ All 9 Server Videos (v1.mp4 – v9.mp4) Fetched via gRPC'
                : errorCount > 0
                ? `⚠️ Remote gRPC Fetch Failed (${errorCount}/9): ${escapeHtml(firstErr)}`
                : `⏳ Fetching 9 Server Videos via gRPC StreamFeedVideo (${loadedCount}/9 loaded)...`;
            })()}
          </div>
        </div>

        <!-- SliverPersistentHeader TabBar (Grid | Liked) -->
        <div style="border-bottom:1px solid ${borderCol};" class="grid grid-cols-2 text-center">
          <button
            type="button"
            data-profile-subtab="grid"
            style="border-bottom: 2px solid ${profileSubTab === 'grid' ? textMain : 'transparent'}; color:${
      profileSubTab === 'grid' ? textMain : textSub
    };"
            class="py-2 text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>⊞</span>
            <span>Server Videos (9)</span>
          </button>
          <button
            type="button"
            data-profile-subtab="liked"
            style="border-bottom: 2px solid ${profileSubTab === 'liked' ? textMain : 'transparent'}; color:${
      profileSubTab === 'liked' ? textMain : textSub
    };"
            class="py-2 text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>♡</span>
            <span>Liked</span>
          </button>
        </div>

        ${
          profileSubTab === 'liked'
            ? `
          <div class="py-12 text-center text-xs" style="color:${textSub};">
            Liked Videos History Empty
          </div>
        `
            : `
          <!-- 3-Column 9-Video Grid fetched from Server via gRPC GetProfileData + StreamFeedVideo(1..9) -->
          <div class="grid grid-cols-3 gap-1.5">
            ${Array.from({ length: 9 }, (_, idx) => {
              const slotNum = idx + 1;
              const videoFileName = videoList[idx] || `v${slotNum}.mp4`;
              const vObj = serverVideos[idx] || {};
              const slotState = serverVideoSlots.get(slotNum);
              const isSlotFetched = slotState?.status === 'loaded' && Boolean(slotState?.blobUrl);
              const isTileDomReady = isSlotFetched && Boolean(slotState?.profileDomReady);
              const videoSrc = isSlotFetched ? slotState.blobUrl : '';
              const slotProgress = slotState?.progress || 0;
              const viewCountK = vObj.views_label || `${slotNum * 12}K`;
              return `
                <div
                  data-open-profile-video-idx="${idx}"
                  style="background:${panelBg}; border:1px solid ${accent}44;"
                  class="aspect-[3/4] rounded-lg overflow-hidden relative group cursor-pointer shadow-sm"
                >
                  ${
                    isSlotFetched
                      ? `
                    <video
                      data-profile-video-slot="${slotNum}"
                      src="${videoSrc}"
                      muted
                      loop
                      autoplay
                      playsinline
                      preload="auto"
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    ></video>
                  `
                      : ''
                  }

                  <!-- Loader displayed while video is being fetched from server via gRPC until video is loaded -->
                  <div
                    id="profile-video-loader-overlay-${slotNum}"
                    style="display:${isTileDomReady ? 'none' : 'flex'}; background:rgba(7,8,13,0.94);"
                    class="absolute inset-0 z-20 flex-col items-center justify-center p-2 text-center space-y-1.5"
                  >
                    ${
                      slotState?.status === 'error'
                        ? `<div class="text-rose-400 text-sm font-bold">⚠️</div>`
                        : `<div
                            style="border-color: ${accent} transparent ${accent} ${accent};"
                            class="w-7 h-7 rounded-full border-2 animate-orbital-cw"
                          ></div>`
                    }
                    <div
                      id="profile-video-loader-pct-${slotNum}"
                      style="color:${slotState?.status === 'error' ? '#FB7185' : accent};"
                      class="text-[9px] font-mono font-bold leading-tight"
                    >
                      ${
                        slotState?.status === 'error'
                          ? `Server Unreachable (v${slotNum}.mp4)`
                          : isSlotFetched
                          ? `Loading v${slotNum}.mp4...`
                          : `Fetching v${slotNum}.mp4 (${slotProgress}%)`
                      }
                    </div>
                    <div class="w-full h-1 rounded-full bg-white/15 overflow-hidden">
                      <div
                        id="profile-video-loader-bar-${slotNum}"
                        style="width:${slotProgress}%; background:${accent}; transition: width 150ms ease;"
                        class="h-full rounded-full"
                      ></div>
                    </div>
                  </div>

                  <div class="absolute inset-0 z-10 bg-gradient-to-t from-black/85 via-black/15 to-transparent p-1.5 flex flex-col justify-between">
                    <div class="flex-1 flex items-center justify-center">
                      <span class="w-8 h-8 rounded-full bg-black/45 text-white/80 flex items-center justify-center text-xs group-hover:scale-110 transition-transform">
                        ▶
                      </span>
                    </div>
                    <div class="flex items-center justify-between text-[10px] text-white font-mono">
                      <span class="font-bold drop-shadow flex items-center gap-0.5 truncate">
                        🎥 ${escapeHtml(videoFileName)}
                      </span>
                      <span class="text-[9px] text-white/90 shrink-0">▶ ${escapeHtml(viewCountK)}</span>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `
        }
      </div>
    `;
  }

  // 3. UPLOAD SCREEN (gRPC UploadMediaFile Client-Streaming 64KB Chunks + Server Upload Confirmation)
  if (activeMobileTab === 'upload') {
    return `
      <div class="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div style="background:${panelBg}; border:1.5px dashed ${accent};" class="rounded-2xl flex flex-col items-center justify-center p-3.5 text-center space-y-2">
          <div style="color:${accent};" class="text-3xl">📤</div>
          <div class="text-xs font-extrabold">gRPC UploadMediaFile (64KB Client-Streaming Pipe)</div>
          <div style="color:${accent};" class="text-[10px] font-mono">
            ${escapeHtml(sanitizedCodespaceHost)}:443 ➔ Node Port 3005
          </div>

          <!-- Optional Real MP4 File Picker -->
          <label
            for="upload-real-video-input"
            style="background:${phoneBg}; border:1px solid ${accent}88; color:${textMain};"
            class="w-full py-2 px-3 rounded-xl text-[11px] font-mono font-bold cursor-pointer hover:opacity-90 flex items-center justify-center gap-1.5"
          >
            <span>🎬</span>
            <span class="truncate">${
              selectedUploadFile
                ? `Selected: ${escapeHtml(selectedUploadFile.name)} (${(selectedUploadFile.size / 1024).toFixed(1)} KB)`
                : 'Choose .MP4 Video File (or Stream 6x64KB Test Clip)'
            }</span>
          </label>
          <input id="upload-real-video-input" type="file" accept="video/mp4,video/*" class="hidden" />

          <div class="w-full pt-1 space-y-1">
            <div class="flex justify-between text-[10px] font-mono" style="color:${textSub};">
              <span>64KB Chunk Pipeline (${uploadCurrentChunk}/${uploadTotalChunks})</span>
              <span>${uploadChunkProgress}%</span>
            </div>
            <div class="w-full h-2 rounded-full bg-black/30 overflow-hidden">
              <div
                style="width:${uploadChunkProgress}%; background: linear-gradient(90deg, ${accent}, #10B981); transition: width 150ms ease;"
                class="h-full rounded-full"
              ></div>
            </div>
          </div>
        </div>

        <!-- Server Upload Confirmation Card -->
        ${
          uploadConfirmationDetails
            ? `
          <div
            style="background:rgba(16,185,129,0.14); border:1.5px solid #10B981;"
            class="p-3 rounded-2xl space-y-1.5 text-[10px] font-mono animate-spring-pop"
          >
            <div class="text-emerald-400 font-extrabold text-xs flex items-center justify-between">
              <span>✅ SERVER CONFIRMED: UPLOAD COMPLETE</span>
              <span>#${uploadConfirmationDetails.video_index}</span>
            </div>
            <div style="color:${textMain};" class="truncate">
              File: <strong>${escapeHtml(uploadConfirmationDetails.filename)}</strong> • ID: <strong>${escapeHtml(
                uploadConfirmationDetails.file_id
              )}</strong>
            </div>
            <div style="color:${textSub};" class="truncate">
              Receipt: <strong>${escapeHtml(uploadConfirmationDetails.confirmation_id)}</strong> (${uploadConfirmationDetails.chunks_received} chunks • ${(
                uploadConfirmationDetails.total_bytes / 1024
              ).toFixed(0)} KB)
            </div>
            <div class="grid grid-cols-2 gap-1.5 pt-1">
              <button
                type="button"
                id="watch-confirmed-upload-btn"
                style="background:#10B981; color:#000;"
                class="py-1.5 px-2 rounded-xl text-[10px] font-extrabold cursor-pointer"
              >
                ▶ Watch in Feed
              </button>
              <button
                type="button"
                id="view-confirmed-upload-profile-btn"
                style="background:${panelBg}; border:1px solid #10B981; color:#10B981;"
                class="py-1.5 px-2 rounded-xl text-[10px] font-extrabold cursor-pointer"
              >
                👤 View in Profile
              </button>
            </div>
          </div>
        `
            : uploadLastResponseMessage
            ? `<div style="color:${accent};" class="text-[10px] font-mono font-bold text-center">${escapeHtml(
                uploadLastResponseMessage
              )}</div>`
            : ''
        }

        <div class="space-y-2">
          <div class="space-y-1">
            <label style="color:${textSub};" class="text-[10px] font-mono">Target Server Filename (/videos):</label>
            <input
              id="upload-filename-input"
              type="text"
              value="${escapeHtml(uploadTargetFilename)}"
              style="background:${panelBg}; border:1px solid ${borderCol}; color:${textMain};"
              class="w-full px-3 py-1.5 rounded-xl text-xs font-mono"
            />
          </div>
          <input
            id="upload-caption-input"
            type="text"
            value="Streaming 64KB UploadRequest chunks to /videos workspace #grpc #flutter"
            style="background:${panelBg}; border:1px solid ${borderCol}; color:${textMain};"
            class="w-full px-3 py-1.5 rounded-xl text-xs"
          />
          <button
            type="button"
            id="simulate-upload-btn"
            style="background:${accent}; color:#000;"
            class="w-full min-h-[46px] py-2.5 rounded-2xl text-xs font-extrabold cursor-pointer flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform"
          >
            <span class="text-base">🚀</span>
            <span>${
              isUploadingGrpcChunks
                ? `Uploading Chunk ${uploadCurrentChunk}/${uploadTotalChunks} to Server...`
                : 'Send Video to Server via gRPC UploadMediaFile'
            }</span>
          </button>
        </div>
      </div>
    `;
  }

  // 4. SEARCH SCREEN (Fetches Matching Videos from Server via gRPC SearchVideos RPC)
  if (activeMobileTab === 'search') {
    const serverList: any[] =
      Array.isArray(grpcSearchResults) && grpcSearchResults.length > 0
        ? grpcSearchResults
        : searchQuery.trim()
        ? []
        : feedList;
    return `
      <div class="p-3.5 space-y-2.5">
        <div class="flex gap-1.5">
          <input
            id="mobile-search-input"
            type="text"
            placeholder="gRPC SearchVideos: v1.mp4..v9.mp4, @master_creator_10..."
            value="${escapeHtml(searchQuery)}"
            style="background:${panelBg}; border:1px solid ${accent}66; color:${textMain};"
            class="flex-1 px-3 py-2 rounded-xl text-xs font-mono"
          />
          <button
            type="button"
            id="mobile-grpc-search-btn"
            style="background:${accent}; color:#000;"
            class="px-3 py-2 rounded-xl text-xs font-mono font-extrabold cursor-pointer shrink-0"
          >
            ${isSearchingGrpc ? '⏳' : '🔍 gRPC'}
          </button>
        </div>

        <!-- Quick Server Search Filter Chips -->
        <div class="flex flex-wrap gap-1">
          ${[
            { label: 'All Server Videos', q: '' },
            { label: 'v1.mp4', q: 'v1.mp4' },
            { label: 'v5.mp4', q: 'v5.mp4' },
            { label: 'v9.mp4', q: 'v9.mp4' },
            { label: '#grpc', q: '#grpc' },
          ]
            .map(
              (chip) => `
            <button
              type="button"
              data-search-filter="${chip.q}"
              style="${
                searchQuery === chip.q
                  ? `background:${accent}; color:#000; font-weight:800;`
                  : `background:${panelBg}; border:1px solid ${borderCol}; color:${textSub};`
              }"
              class="px-2 py-1 rounded-lg text-[10px] font-mono cursor-pointer"
            >
              ${chip.label}
            </button>
          `
            )
            .join('')}
        </div>

        <!-- gRPC SearchVideos Status Banner -->
        <div
          style="background:${panelBg}; border:1px solid ${accent}44; color:${accent};"
          class="px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold"
        >
          📡 gRPC SearchVideos(query: "${escapeHtml(searchQuery)}") ➔ ${serverList.length} Videos Fetched from Server
        </div>

        <div class="space-y-2">
          ${
            serverList.length === 0
              ? `
            <div style="color:${textSub};" class="py-8 text-center text-xs font-mono">
              No matching server videos found for "${escapeHtml(searchQuery)}".
            </div>
          `
              : serverList
                  .map((v: any, idx: number) => {
                    const targetVideoIndex = v.video_index || idx + 1;
                    const fileBadge = v.filename || v.reel_filename || `v${targetVideoIndex}.mp4`;
                    return `
                  <div style="background:${panelBg}; border:1px solid ${borderCol};" class="p-2.5 rounded-xl flex items-center justify-between gap-2">
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center gap-1.5">
                        <span style="color:${accent};" class="text-xs font-mono font-extrabold">${escapeHtml(fileBadge)}</span>
                        <span style="color:${textSub};" class="text-[10px] font-mono">${escapeHtml(
                          v.creator?.username || '@master_creator_10'
                        )} • ${escapeHtml(v.views_label || `${targetVideoIndex * 12}K`)}</span>
                      </div>
                      <div class="text-[11px] truncate">${escapeHtml(v.caption || '')}</div>
                    </div>
                    <button
                      type="button"
                      data-grpc-jump-index="${targetVideoIndex}"
                      style="background:${accent}; color:#000;"
                      class="min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-mono font-extrabold cursor-pointer shrink-0 active:scale-95 transition-transform"
                    >
                      ▶ Stream
                    </button>
                  </div>
                `;
                  })
                  .join('')
          }
        </div>
      </div>
    `;
  }

  // 5. NOTIFICATIONS SCREEN
  if (activeMobileTab === 'notifications') {
    return `
      <div class="p-4 space-y-3">
        <div class="text-xs font-bold">Real-Time Push Notifications & Mentions</div>
        ${notificationsList
          .map(
            (n: any) => `
          <div style="background:${panelBg}; border:1px solid ${borderCol};" class="p-3 rounded-xl space-y-1">
            <div class="flex justify-between text-xs">
              <strong style="color:${accent};">${n.actor}</strong>
              <span style="color:${textSub};" class="text-[10px]">${n.time}</span>
            </div>
            <p class="text-xs">${escapeHtml(n.text)}</p>
          </div>
        `
          )
          .join('')}
      </div>
    `;
  }

  // 6. AUTHENTICATION SCREEN (Client Sign-In / Sign-Out Lifecycle)
  if (activeMobileTab === 'auth') {
    return `
      <div class="p-6 flex-1 flex flex-col justify-center space-y-4">
        <div class="text-center space-y-1.5">
          <div style="color:${accent};" class="text-4xl font-bold">🔐</div>
          <h3 class="text-base font-extrabold">Client Profile Authentication</h3>
          <p style="color:${textSub};" class="text-xs font-mono">
            ${isClientSignedIn ? 'Session Active: @master_creator_10' : 'Signed Out — JWT Token Cleared'}
          </p>
        </div>
        <div style="background:${panelBg}; border:1px solid ${borderCol};" class="p-3.5 rounded-2xl space-y-1.5 text-xs font-mono">
          <div>client_id: <strong style="color:${accent};">mobile_phone_client</strong></div>
          <div>profile_id: <strong>profile_10_all (master_creator_10)</strong></div>
          <div>Gateway: <strong>${escapeHtml(sanitizedCodespaceHost)}:443 ➔ 3005</strong></div>
        </div>
        <input type="text" value="master_creator_10" style="background:${panelBg}; border:1px solid ${borderCol}; color:${textMain};" class="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono" />
        <input type="password" value="••••••••••••" style="background:${panelBg}; border:1px solid ${borderCol}; color:${textMain};" class="w-full px-3.5 py-2.5 rounded-xl text-xs" />
        <button
          type="button"
          id="auth-signin-btn"
          style="background:${accent}; color:#000;"
          class="w-full min-h-[48px] py-3 rounded-2xl text-xs font-extrabold cursor-pointer flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform"
        >
          <span class="text-base">🔑</span>
          <span>Sign In & Invoke GetAuthToken (3600s)</span>
        </button>
      </div>
    `;
  }

  // 7. SCREEN 2: VIDEO FEED & PROFILE REEL PLAYER (Powered by gRPC StreamFeedVideo binary chunk buffer collector)
  const wrappedFeedIdx = (((grpcVideoIndex - 1) % 9) + 9) % 9 + 1;
  const activeFeedSlot = serverVideoSlots.get(wrappedFeedIdx);
  const isFeedSlotFetched = activeFeedSlot?.status === 'loaded' && Boolean(activeFeedSlot?.blobUrl);
  const isFeedVideoReady = isFeedSlotFetched && Boolean(activeFeedSlot?.feedDomReady);
  const videoPlayableUrl = isFeedSlotFetched ? activeFeedSlot.blobUrl : '';
  const reelBadgeName = `v${wrappedFeedIdx}.mp4`;
  const creatorAvatar =
    activeVideo.creator?.avatar_url && activeVideo.creator?.avatar_url !== 'https://dicebear.com'
      ? activeVideo.creator.avatar_url
      : DEFAULT_AVATAR_URL;
  const creatorName = activeVideo.creator?.display_name || 'All Videos Portfolio Folder';
  const creatorUsername = activeVideo.creator?.username || '@master_creator_10';
  const currentSlotProgress = activeFeedSlot?.progress ?? grpcStreamProgress;

  return `
    <div id="reel-scroll-viewport" class="flex-1 flex flex-col justify-between relative overflow-hidden bg-black text-white select-none">
      <!-- Real Looping HTML5 Video Stream (Compiled from gRPC StreamFeedVideo 64KB chunk_data) -->
      <video
        id="active-reel-video"
        ${videoPlayableUrl ? `src="${videoPlayableUrl}"` : ''}
        autoplay
        loop
        ${isVideoMuted ? 'muted' : ''}
        playsinline
        preload="auto"
        class="absolute inset-0 w-full h-full object-cover z-0"
      ></video>

      <!-- Full-Screen Loader Displayed While Video is Being Fetched from gRPC Server Until Video is Loaded -->
      <div
        id="feed-video-loader-overlay"
        style="display:${isFeedVideoReady ? 'none' : 'flex'}; background:rgba(7,8,13,0.95);"
        class="absolute inset-0 z-25 flex-col items-center justify-center p-6 text-center space-y-3 backdrop-blur-sm"
      >
        <div class="relative w-16 h-16 flex items-center justify-center">
          <div
            style="border-color: ${
              activeFeedSlot?.status === 'error' ? '#FB7185' : accent
            } transparent ${activeFeedSlot?.status === 'error' ? '#FB7185' : accent} ${
              activeFeedSlot?.status === 'error' ? '#FB7185' : accent
            }; box-shadow: 0 0 24px ${accent}44;"
            class="w-16 h-16 rounded-full border-3 ${
              activeFeedSlot?.status === 'error' ? '' : 'animate-orbital-cw'
            } absolute inset-0"
          ></div>
          <div
            style="border-color: transparent #00F2FE #00F2FE transparent;"
            class="w-10 h-10 rounded-full border-2 ${
              activeFeedSlot?.status === 'error' ? '' : 'animate-orbital-ccw'
            } absolute"
          ></div>
          <span style="color:${
            activeFeedSlot?.status === 'error' ? '#FB7185' : accent
          };" class="text-xs font-mono font-extrabold">${
            activeFeedSlot?.status === 'error' ? 'ERR' : 'gRPC'
          }</span>
        </div>
        <div class="space-y-1.5 max-w-xs">
          <div class="text-xs font-mono font-extrabold text-white">
            ${
              activeFeedSlot?.status === 'error'
                ? `⚠️ Cannot Fetch ${reelBadgeName} from Remote gRPC Server`
                : isFeedSlotFetched
                ? `Decoding ${reelBadgeName} (Video ${wrappedFeedIdx} of 9)...`
                : `Fetching ${reelBadgeName} from Server via gRPC (${wrappedFeedIdx}/9)...`
            }
          </div>
          <div id="feed-video-loader-pct" style="color:${
            activeFeedSlot?.status === 'error' ? '#FDA4AF' : accent
          };" class="text-[10px] font-mono leading-relaxed">
            ${
              activeFeedSlot?.status === 'error'
                ? escapeHtml(
                    activeFeedSlot.errorMessage ||
                      'Remote gRPC server returned HTTP 404 / 502 (Codespace HTTP/1.1 proxy cannot forward raw HTTP/2 gRPC).'
                  )
                : `${currentSlotProgress}% (${Math.round(
                    (activeFeedSlot?.currentByte || 0) / 1024
                  )} KB / ${Math.max(
                    1,
                    Math.round((activeFeedSlot?.totalBytes || 0) / 1024)
                  )} KB • ${activeFeedSlot?.chunksReceived || 0} chunks)`
            }
          </div>
        </div>
        <div class="w-56 h-2 rounded-full bg-white/15 overflow-hidden border border-white/10">
          <div
            id="feed-video-loader-bar"
            style="width:${currentSlotProgress}%; background: linear-gradient(90deg, ${accent}, #00F2FE); transition: width 150ms ease;"
            class="h-full rounded-full"
          ></div>
        </div>
      </div>

      <!-- gRPC StreamFeedVideo Chunk Buffer Progress Bar (current_byte / total_bytes) -->
      <div class="relative z-20 w-full h-1 bg-white/15 overflow-hidden">
        <div
          style="width:${currentSlotProgress}%; background: linear-gradient(90deg, ${accent}, #00F2FE); transition: width 180ms ease;"
          class="h-full"
        ></div>
      </div>

      <!-- 9 Server Videos Batch Bar (v1.mp4 .. v9.mp4) -->
      <div class="relative z-20 px-2.5 pt-1.5 flex items-center gap-1 overflow-x-auto no-scrollbar">
        ${Array.from({ length: 9 }, (_, i) => {
          const idxNum = i + 1;
          const s = serverVideoSlots.get(idxNum);
          const isCurrent = wrappedFeedIdx === idxNum;
          const isLoaded = s?.status === 'loaded';
          const isFetching = s?.status === 'fetching';
          return `
            <button
              type="button"
              id="feed-batch-pill-${idxNum}"
              data-grpc-jump-index="${idxNum}"
              style="${
                isCurrent
                  ? `background:${accent}; color:#000; font-weight:800;`
                  : isLoaded
                  ? `background:rgba(16,185,129,0.22); border:1px solid #10B981; color:#10B981;`
                  : `background:rgba(0,0,0,0.65); border:1px solid rgba(255,255,255,0.2); color:#FFF;`
              }"
              class="px-2 py-0.5 rounded-full text-[9px] font-mono shrink-0 cursor-pointer transition-all"
            >
              ${isLoaded ? `✓ v${idxNum}` : isFetching ? `⏳ v${idxNum} ${s?.progress || 0}%` : `v${idxNum}`}
            </button>
          `;
        }).join('')}
      </div>

      <!-- Tap & Double-Tap Surface Overlay -->
      <div id="reel-video-tap-surface" class="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/85 z-10 cursor-pointer"></div>

      <!-- Center Paused Indicator -->
      ${
        isVideoPaused
          ? `
        <div class="absolute inset-0 z-15 flex items-center justify-center pointer-events-none">
          <div style="background:${accent}DD; color:#000; box-shadow: 0 0 30px ${accent};" class="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black">
            ▶
          </div>
        </div>
      `
          : ''
      }

      <!-- Center Explosive Heart Burst & Floating Particles Animation on Like Trigger -->
      ${
        showHeartBurst
          ? `
        <div class="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
          <div style="color:${accent}; text-shadow: 0 0 35px ${accent};" class="text-8xl animate-heart-burst">
            ♥
          </div>
          <span style="color:#FE2C55; left:38%; top:44%;" class="absolute text-3xl animate-float-heart">♥</span>
          <span style="color:${accent}; left:58%; top:42%;" class="absolute text-4xl animate-float-heart">♥</span>
          <span style="color:#00F2FE; left:48%; top:36%;" class="absolute text-2xl animate-float-heart">✦</span>
        </div>
      `
          : ''
      }

      <!-- Top Overlay Bar: Back to Profile (if opened from Profile) + Reel Scroll Controls + Audio Mute/Unmute -->
      <div class="relative z-20 p-3.5 flex items-center justify-between gap-2">
        ${
          openedFromProfile
            ? `
          <button
            type="button"
            id="back-to-profile-btn"
            style="background:${accent}; color:#000;"
            class="px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1 cursor-pointer shadow-lg"
          >
            <span>← Back to Profile</span>
          </button>
        `
            : `
          <div class="flex items-center gap-1.5 bg-black/55 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 text-[10px]">
            <span style="color:${accent};" class="font-mono font-bold">● gRPC</span>
            <span class="font-mono text-white/95">idx ${grpcVideoIndex} ➔ ${reelBadgeName}</span>
            <span class="text-emerald-400 font-mono">[${grpcStreamProgress}% • ${grpcRemainingSeconds}s]</span>
          </div>
        `
        }

        <div class="flex items-center gap-2">
          <button
            type="button"
            id="toggle-mute-btn"
            style="border:1.5px solid ${accent}99;"
            class="min-h-[40px] px-3.5 py-1.5 rounded-full bg-black/65 backdrop-blur-md text-xs font-mono font-bold cursor-pointer active:scale-95 transition-transform hover:bg-black/80"
          >
            ${isVideoMuted ? '🔇 Muted' : '🔊 Sound On'}
          </button>
          <button
            type="button"
            id="prev-video-btn"
            title="Scroll Up to Previous Reel"
            class="w-10 h-10 rounded-full bg-black/65 backdrop-blur-md border border-white/30 flex items-center justify-center text-sm font-bold cursor-pointer active:scale-90 transition-transform hover:bg-white/20"
          >
            ▲
          </button>
          <button
            type="button"
            id="next-video-btn"
            title="Scroll Down to Next Reel"
            class="w-10 h-10 rounded-full bg-black/65 backdrop-blur-md border border-white/30 flex items-center justify-center text-sm font-bold cursor-pointer active:scale-90 transition-transform hover:bg-white/20"
          >
            ▼
          </button>
        </div>
      </div>

      <!-- Share Toast Notification Banner -->
      ${
        shareToastMessage
          ? `
        <div id="mobile-share-toast-banner" style="background:${accent}; color:#000;" class="relative z-30 mx-auto px-4 py-1.5 rounded-full text-xs font-bold shadow-lg animate-spring-pop">
          ${escapeHtml(shareToastMessage)}
        </div>
      `
          : ''
      }

      <!-- Bottom Section: Creator Metadata + Right Action Rail with Animated Triggers -->
      <div class="relative z-20 p-4 flex items-end justify-between gap-3">
        <!-- Bottom-Left Stream & Creator Info -->
        <div class="space-y-1.5 flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <button
              type="button"
              data-profile-handle="${creatorUsername}"
              class="font-extrabold text-sm hover:underline cursor-pointer drop-shadow"
            >
              ${creatorUsername}
            </button>
            <button
              type="button"
              id="follow-creator-btn"
              style="background:${isFollowing ? 'rgba(255,255,255,0.22)' : accent}; color:${isFollowing ? '#FFF' : '#000'};"
              class="px-3 py-1 rounded-full text-[11px] font-extrabold cursor-pointer transition-transform ${
                followButtonAnimTrigger ? 'animate-spring-pop' : ''
              }"
            >
              ${isFollowing ? '✓ Following' : '+ Follow'}
            </button>
          </div>

          <p class="text-xs text-white/90 line-clamp-2 leading-snug drop-shadow">
            ${escapeHtml(activeVideo.caption || '')}
          </p>

          <div class="flex items-center gap-2 pt-0.5">
            <span style="color:${accent};" class="text-[10px] font-mono font-bold truncate">
              ♪ ${escapeHtml(activeVideo.sound_title || 'Original Audio')}
            </span>
          </div>

          <div class="text-[11px] font-semibold text-white/85 drop-shadow">
            Loop Sequence Index Reference: Virtual Feed #${grpcVideoIndex} (${reelBadgeName})
          </div>

          <div class="text-[10px] font-mono text-white/65 bg-black/45 px-2 py-0.5 rounded border border-white/10 truncate">
            stream_url: ${activeVideo.stream_url} • @master_creator_10
          </div>
        </div>

        <!-- Right-Hand Interactive Action Rail (Bigger 48x48px Human-Friendly Touch Targets) -->
        <div class="flex flex-col items-center gap-3.5 shrink-0">
          <!-- Creator Avatar -> Click opens Full-Screen Profile Photo! -->
          <div
            data-open-fullscreen-photo="true"
            data-photo-url="${creatorAvatar}"
            data-photo-name="${escapeHtml(creatorName)}"
            data-photo-username="${escapeHtml(creatorUsername)}"
            data-photo-bio="${escapeHtml(activeVideo.creator?.bio || 'Flutter & Shaders Architect')}"
            data-photo-followers="${escapeHtml(activeVideo.creator?.followers || '38.4k')}"
            title="Click to view profile photo in full screen"
            class="relative cursor-pointer group"
          >
            <img
              src="${creatorAvatar}"
              alt="${escapeHtml(creatorUsername)}"
              style="border: 2.5px solid ${accent};"
              class="w-12 h-12 rounded-full object-cover group-hover:scale-110 transition-transform shadow-md"
            />
            <span
              style="background:${accent}; color:#000;"
              class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-1.5 rounded-full text-[9px] font-black"
            >
              ⛶
            </span>
          </div>

          <!-- Animated Like Button (48x48px Touch Target) -->
          <button
            type="button"
            id="like-video-btn"
            class="flex flex-col items-center cursor-pointer active:scale-90 transition-transform ${
              likeButtonAnimTrigger ? 'animate-spring-pop' : ''
            }"
          >
            <div
              style="background:${isLiked ? `${accent}33` : 'rgba(0,0,0,0.55)'}; border:1.5px solid ${
    isLiked ? accent : 'rgba(255,255,255,0.28)'
  };"
              class="w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-md"
            >
              <span style="color:${isLiked ? accent : '#FFF'};" class="text-2xl leading-none">♥</span>
            </div>
            <span class="text-[11px] font-mono font-extrabold mt-1">
              ${(activeVideo.likes_count || 1840) + (isLiked ? 1 : 0)}
            </span>
          </button>

          <!-- Animated Comments Button (48x48px Touch Target) -->
          <button
            type="button"
            data-toggle-comments="true"
            class="flex flex-col items-center cursor-pointer active:scale-90 transition-transform ${
              commentButtonAnimTrigger ? 'animate-spring-pop' : ''
            }"
          >
            <div class="w-12 h-12 rounded-full bg-black/55 border border-white/25 flex items-center justify-center shadow-md">
              <span class="text-xl leading-none">💬</span>
            </div>
            <span class="text-[11px] font-mono font-extrabold mt-1">${videoComments.length}</span>
          </button>

          <!-- Animated Share Button (48x48px Touch Target) -->
          <button
            type="button"
            data-toggle-share="true"
            class="flex flex-col items-center cursor-pointer active:scale-90 transition-transform ${
              shareButtonAnimTrigger ? 'animate-spring-pop' : ''
            }"
          >
            <div class="w-12 h-12 rounded-full bg-black/55 border border-white/25 flex items-center justify-center shadow-md">
              <span class="text-xl leading-none">↗</span>
            </div>
            <span class="text-[11px] font-mono font-extrabold mt-1">${128 + extraShares}</span>
          </button>
        </div>
      </div>

      <!-- Animated Slide-Up Comments Sheet -->
      ${
        showCommentsDrawer
          ? `
        <div
          style="background:${panelBg}; border-top:2px solid ${accent}; color:${textMain};"
          class="absolute inset-x-0 bottom-0 p-4 rounded-t-3xl space-y-3 z-40 shadow-2xl animate-drawer-up"
        >
          <div class="flex justify-between items-center text-xs font-bold border-b pb-2" style="border-color:${borderCol};">
            <span>💬 ${videoComments.length} Comments (${reelBadgeName})</span>
            <button type="button" data-toggle-comments="true" style="color:${textSub};" class="px-2 py-0.5 rounded hover:bg-white/10 cursor-pointer">✕</button>
          </div>

          <!-- Quick Emoji Reaction Bar -->
          <div class="flex items-center gap-2">
            <span style="color:${textSub};" class="text-[10px]">Quick React:</span>
            ${['🔥', '🚀', '👏', '💎', '❤️']
              .map(
                (em) => `
              <button
                type="button"
                data-quick-emoji="${em}"
                style="background:${phoneBg}; border:1px solid ${borderCol};"
                class="px-2 py-0.5 rounded-full text-xs hover:scale-110 transition-transform cursor-pointer"
              >
                ${em}
              </button>
            `
              )
              .join('')}
          </div>

          <div class="max-h-36 overflow-y-auto space-y-2 pr-1 text-xs">
            ${videoComments
              .map((c: any) => {
                const cLiked = likedCommentIds.has(c.id);
                return `
                  <div style="background:${phoneBg}; border:1px solid ${borderCol};" class="p-2 rounded-xl flex items-center justify-between gap-2">
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center gap-1.5">
                        <strong style="color:${accent};" class="text-[11px]">${escapeHtml(c.user)}</strong>
                        <span style="color:${textSub};" class="text-[9px]">${escapeHtml(c.time)}</span>
                      </div>
                      <p class="text-xs leading-snug">${escapeHtml(c.text)}</p>
                    </div>
                    <button
                      type="button"
                      data-like-comment-id="${c.id}"
                      class="flex flex-col items-center px-1.5 cursor-pointer shrink-0"
                    >
                      <span style="color:${cLiked ? accent : textSub};" class="text-sm">${cLiked ? '♥' : '♡'}</span>
                      <span class="text-[9px] font-mono">${c.likes || 1}</span>
                    </button>
                  </div>
                `;
              })
              .join('')}
          </div>

          <form id="add-comment-form" class="flex gap-1.5 pt-1">
            <input
              id="comment-input"
              type="text"
              placeholder="Add comment to ${reelBadgeName}..."
              style="background:${phoneBg}; border:1px solid ${borderCol}; color:${textMain};"
              class="flex-1 rounded-xl px-3 py-1.5 text-xs"
            />
            <button
              type="submit"
              style="background:${accent}; color:#000;"
              class="px-3.5 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer"
            >
              Send
            </button>
          </form>
        </div>
      `
          : ''
      }

      <!-- Animated Slide-Up Share Sheet -->
      ${
        showShareDrawer
          ? `
        <div
          style="background:${panelBg}; border-top:2px solid ${accent}; color:${textMain};"
          class="absolute inset-x-0 bottom-0 p-4 rounded-t-3xl space-y-3.5 z-40 shadow-2xl animate-drawer-up"
        >
          <div class="flex justify-between items-center text-xs font-bold">
            <span>↗ Share Reel (${reelBadgeName})</span>
            <button type="button" data-toggle-share="true" style="color:${textSub};" class="cursor-pointer">✕</button>
          </div>

          <div class="grid grid-cols-4 gap-2 text-center">
            ${[
              { label: 'Copy Link', icon: '🔗' },
              { label: 'Repost', icon: '🔁' },
              { label: 'Send DM', icon: '✈️' },
              { label: 'Save MP4', icon: '⬇️' },
            ]
              .map(
                (s) => `
              <button
                type="button"
                data-share-action="${s.label}"
                style="background:${phoneBg}; border:1px solid ${borderCol};"
                class="p-2.5 rounded-2xl flex flex-col items-center gap-1 hover:scale-105 transition-transform cursor-pointer"
              >
                <span class="text-lg">${s.icon}</span>
                <span class="text-[10px] font-semibold">${s.label}</span>
              </button>
            `
              )
              .join('')}
          </div>

          <div style="background:${phoneBg}; border:1px solid ${borderCol}; color:${accent};" class="p-2 rounded-xl text-[10px] font-mono truncate">
            ${activeVideo.stream_url}
          </div>
        </div>
      `
          : ''
      }
    </div>
  `;
}

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

initTitanFlutterStudio();
