import {
  CENTRAL_PUBLIC_URL,
  API_ENDPOINTS,
  getActiveServerUrl,
  getConnectionMode,
} from '../config';
import {
  FeedVideoModel,
  ProfileResponseModel,
  CommentItemModel,
  DraftItemModel,
  NetworkLogEntry,
  CreatorModel,
} from '../types';

type LogListener = (entry: NetworkLogEntry) => void;
const listeners: Set<LogListener> = new Set();

export function subscribeNetworkLogs(fn: LogListener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emitNetworkLog(entry: Omit<NetworkLogEntry, 'id' | 'timestamp'>) {
  const fullEntry: NetworkLogEntry = {
    ...entry,
    id: `net_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toLocaleTimeString([], {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  };
  listeners.forEach((fn) => fn(fullEntry));
}

export interface ExternalPingResult {
  success: boolean;
  reachable: boolean;
  valid_schema: boolean;
  status: number;
  latencyMs: number;
  tested_endpoint: string;
  video_count?: number;
  message: string;
  raw_preview?: string;
}

export async function pingExternalServer(targetUrl: string): Promise<ExternalPingResult> {
  const start = performance.now();
  const response = await fetch('/api/external/ping', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetUrl }),
  });
  const json = (await response.json()) as ExternalPingResult;
  emitNetworkLog({
    method: 'GET',
    configuredUrl: json.tested_endpoint || `${targetUrl}/api/feed`,
    resolvedPath: '/api/external/ping',
    status: json.status || response.status,
    latencyMs: json.latencyMs || Math.round(performance.now() - start),
    summary: json.message,
  });
  return json;
}

/**
 * Resolves a configured public URL (https://github.dev/... or custom GitHub Codespace URL)
 * against either the external live server.js or the built-in container replica.
 */
async function requestContainerEndpoint<T>(
  configuredUrl: string,
  options?: RequestInit,
  methodLabel: NetworkLogEntry['method'] = 'GET',
  summaryLabel = 'API Request'
): Promise<T> {
  const start = performance.now();
  const activeBase = getActiveServerUrl();
  const relativePath = configuredUrl.startsWith(activeBase)
    ? configuredUrl.slice(activeBase.length)
    : configuredUrl.startsWith(CENTRAL_PUBLIC_URL)
    ? configuredUrl.slice(CENTRAL_PUBLIC_URL.length)
    : configuredUrl;

  const localContainerPath = relativePath.startsWith('/api')
    ? relativePath
    : `/api${relativePath}`;

  // If user switched to External Live Server mode, route through the proxy to their live server.js
  if (getConnectionMode() === 'external_live' && !(options?.body instanceof FormData)) {
    try {
      const proxyRes = await fetch('/api/external/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetBaseUrl: activeBase,
          pathSuffix: localContainerPath,
          method: options?.method || 'GET',
          body: options?.body ? JSON.parse(options.body as string) : undefined,
        }),
      });
      const latencyMs = Math.max(4, Math.round(performance.now() - start));
      if (proxyRes.ok) {
        const json = await proxyRes.json();
        emitNetworkLog({
          method: methodLabel,
          configuredUrl: `${activeBase}${localContainerPath}`,
          resolvedPath: `REMOTE -> ${activeBase}${localContainerPath}`,
          status: proxyRes.status,
          latencyMs,
          summary: `[Live Server] ${summaryLabel}`,
        });
        return json as T;
      }
    } catch {
      // Fall back cleanly to container replica if remote endpoint doesn't implement a secondary route
    }
  }

  const response = await fetch(localContainerPath, options);
  const latencyMs = Math.max(4, Math.round(performance.now() - start));

  if (!response.ok) {
    emitNetworkLog({
      method: methodLabel,
      configuredUrl,
      resolvedPath: localContainerPath,
      status: response.status,
      latencyMs,
      summary: `Error: ${summaryLabel}`,
    });
    throw new Error(`Request failed with status ${response.status}`);
  }

  const json = await response.json();
  emitNetworkLog({
    method: methodLabel,
    configuredUrl,
    resolvedPath: localContainerPath,
    status: response.status,
    latencyMs,
    summary: summaryLabel,
  });

  return json as T;
}

/**
 * Fetches global video feed from ${activeServerUrl}/api/feed
 * Ensures Screen 2 (Video Feed) maps media items directly to the stream_url array element variable.
 */
export async function fetchVideoFeed(): Promise<FeedVideoModel[]> {
  const activeBase = getActiveServerUrl();
  const endpoint = API_ENDPOINTS.FEED;
  const payload = await requestContainerEndpoint<{
    success: boolean;
    data: FeedVideoModel[];
  }>(endpoint, undefined, 'GET', 'Fetch infinite feed array (/api/feed -> stream_url[])');

  return (payload.data || []).map((item) => ({
    ...item,
    // Directly preserve and map the stream_url array element variable returned by /api/feed
    stream_url: item.stream_url || `${activeBase}/api/media/stream/${item.video_drive_id}`,
  }));
}

/**
 * Fetches specific creator profile aggregation from ${activeServerUrl}/api/profile/:username
 * Appends username to /profile/:username to fetch matching data loops.
 */
export async function fetchUserProfile(username: string): Promise<ProfileResponseModel> {
  const activeBase = getActiveServerUrl();
  const cleanHandle = username.startsWith('@') ? username : `@${username}`;
  const configuredUrl = API_ENDPOINTS.PROFILE(cleanHandle);
  const payload = await requestContainerEndpoint<ProfileResponseModel>(
    configuredUrl,
    undefined,
    'GET',
    `Aggregate profile metrics & video loop (/api/profile/${cleanHandle})`
  );

  return {
    ...payload,
    uploaded_videos: (payload.uploaded_videos || []).map((v) => ({
      ...v,
      stream_url: v.stream_url || `${activeBase}/api/media/stream/${v.video_drive_id}`,
    })),
  };
}

/**
 * Uploads multipart video binary buffer to ${CENTRAL_PUBLIC_URL}/upload
 */
export async function uploadVideoMedia(params: {
  username: string;
  display_name?: string;
  caption: string;
  visual_theme?: string;
  file?: File | null;
}): Promise<{
  success: boolean;
  message: string;
  video_meta: FeedVideoModel;
}> {
  const configuredUrl = API_ENDPOINTS.UPLOAD; // https://github.dev/upload
  const formData = new FormData();
  formData.append('username', params.username);
  if (params.display_name) formData.append('display_name', params.display_name);
  formData.append('caption', params.caption);
  if (params.visual_theme) formData.append('visual_theme', params.visual_theme);

  if (params.file) {
    formData.append('video', params.file);
  } else {
    // Create a valid synthetic binary stream blob so multer receives a real file buffer
    const syntheticBytes = new Uint8Array([
      0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x6d, 0x70, 0x34, 0x32,
    ]);
    const blob = new Blob([syntheticBytes], { type: 'video/mp4' });
    formData.append('video', blob, `studio_stream_${Date.now()}.mp4`);
  }

  return requestContainerEndpoint(
    configuredUrl,
    {
      method: 'POST',
      body: formData,
    },
    'POST',
    `Multipart byte stream upload (/upload -> Drive folder ${params.username})`
  );
}

export async function toggleVideoLike(videoId: string): Promise<{
  success: boolean;
  video_id: string;
  likes: number;
  is_liked: boolean;
}> {
  const configuredUrl = `${CENTRAL_PUBLIC_URL}/api/videos/${videoId}/like`;
  return requestContainerEndpoint(
    configuredUrl,
    { method: 'POST' },
    'POST',
    `Toggle like state on video ${videoId}`
  );
}

export async function fetchVideoComments(videoId: string): Promise<{
  success: boolean;
  total_count: number;
  comments: CommentItemModel[];
}> {
  const configuredUrl = `${CENTRAL_PUBLIC_URL}/api/videos/${videoId}/comments`;
  return requestContainerEndpoint(
    configuredUrl,
    undefined,
    'GET',
    `Fetch live comments sheet for ${videoId}`
  );
}

export async function postVideoComment(
  videoId: string,
  username: string,
  text: string
): Promise<{
  success: boolean;
  comment: CommentItemModel;
  comments: CommentItemModel[];
  comments_count: number;
}> {
  const configuredUrl = `${CENTRAL_PUBLIC_URL}/api/videos/${videoId}/comments`;
  return requestContainerEndpoint(
    configuredUrl,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, text }),
    },
    'POST',
    `Post live comment by ${username}`
  );
}

export async function updateCreatorFollow(
  username: string,
  action: 'follow' | 'unfollow' | 'toggle'
): Promise<{
  success: boolean;
  username: string;
  is_following: boolean;
}> {
  const cleanHandle = username.startsWith('@') ? username : `@${username}`;
  const configuredUrl = `${CENTRAL_PUBLIC_URL}/api/profile/${cleanHandle}/follow`;
  return requestContainerEndpoint(
    configuredUrl,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    },
    'POST',
    `${action.toUpperCase()} creator ${cleanHandle}`
  );
}

export async function fetchDrafts(): Promise<DraftItemModel[]> {
  const configuredUrl = `${CENTRAL_PUBLIC_URL}/api/drafts`;
  const res = await requestContainerEndpoint<{
    success: boolean;
    drafts: DraftItemModel[];
  }>(configuredUrl, undefined, 'GET', 'Load local SQLite drafts matrix');
  return res.drafts || [];
}

export async function createLocalDraft(draft: {
  filename: string;
  duration: string;
  caption: string;
  visual_theme: 'ui_stack' | 'scroll_physics' | 'figma_proto';
}): Promise<DraftItemModel[]> {
  const configuredUrl = `${CENTRAL_PUBLIC_URL}/api/drafts`;
  const res = await requestContainerEndpoint<{
    success: boolean;
    drafts: DraftItemModel[];
  }>(
    configuredUrl,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    },
    'POST',
    `Save local draft (${draft.filename})`
  );
  return res.drafts || [];
}

export async function deleteLocalDraft(id: string): Promise<DraftItemModel[]> {
  const configuredUrl = `${CENTRAL_PUBLIC_URL}/api/drafts/${id}`;
  const res = await requestContainerEndpoint<{
    success: boolean;
    drafts: DraftItemModel[];
  }>(configuredUrl, { method: 'DELETE' }, 'DELETE', `Remove draft ${id}`);
  return res.drafts || [];
}

export async function registerCreatorAccount(payload: {
  birthday: string;
  email: string;
  password?: string;
  username?: string;
  display_name?: string;
}): Promise<{
  success: boolean;
  session_verified: boolean;
  user: CreatorModel;
}> {
  const configuredUrl = `${CENTRAL_PUBLIC_URL}/api/auth/register`;
  return requestContainerEndpoint(
    configuredUrl,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    'POST',
    `Register new creator account (${payload.email})`
  );
}
