const avatarAlex = '/src/assets/images/creator_avatar_alex_1790420981846.jpg';
const coverUiStack = '/src/assets/images/video_cover_ui_stack_1790421003293.jpg';
const coverScrollPhysics = '/src/assets/images/video_cover_scroll_physics_1790421015252.jpg';
const coverFigmaProto = '/src/assets/images/video_cover_figma_proto_1790421028586.jpg';

/**
 * Central configuration variable pointing to the public cloud URL: https://github.dev
 * Used across all generated text models, video grid lists, profile aggregations, and feed viewports.
 */
export const CENTRAL_PUBLIC_URL = 'https://github.dev';

let activeServerUrl: string = CENTRAL_PUBLIC_URL;
let connectionMode: 'container_mirror' | 'external_live' = 'container_mirror';

export function getActiveServerUrl(): string {
  return activeServerUrl;
}

export function setActiveServerUrl(url: string): void {
  activeServerUrl = url.trim().replace(/\/+$/, '') || CENTRAL_PUBLIC_URL;
}

export function getConnectionMode(): 'container_mirror' | 'external_live' {
  return connectionMode;
}

export function setConnectionMode(mode: 'container_mirror' | 'external_live'): void {
  connectionMode = mode;
}

export const API_ENDPOINTS = {
  get BASE_URL() {
    return activeServerUrl;
  },
  get FEED() {
    return `${activeServerUrl}/api/feed`;
  },
  get UPLOAD() {
    return `${activeServerUrl}/api/upload`;
  },
  PROFILE: (username: string) => `${activeServerUrl}/api/profile/${username}`,
  MEDIA_STREAM: (fileId: string) => `${activeServerUrl}/api/media/stream/${fileId}`,
};

export const VISUAL_ASSETS = {
  avatarAlex,
  coverUiStack,
  coverScrollPhysics,
  coverFigmaProto,
};

export function getCoverForTheme(theme?: string): string {
  switch (theme) {
    case 'scroll_physics':
      return VISUAL_ASSETS.coverScrollPhysics;
    case 'figma_proto':
      return VISUAL_ASSETS.coverFigmaProto;
    case 'ui_stack':
    default:
      return VISUAL_ASSETS.coverUiStack;
  }
}
