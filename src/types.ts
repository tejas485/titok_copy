export type ScreenId =
  | 1 // 1) HOME DASHBOARD
  | 2 // 2) VIDEO FEED
  | 3 // 3) MEDIA UPLOAD
  | 4 // 4) COMMENT PAGE
  | 5 // 5) SHARE OPTIONS
  | 6 // 6) FOLLOW POPUP
  | 7 // 7) USER PROFILE
  | 8 // 8) AUTHENTICATION
  | 9 // 9) SIGN UP VIEW
  | 10 // 10) GLOBAL SEARCH
  | 11 // 11) ANALYTICS HUB
  | 12; // 12) VIDEO DRAFTS

export interface CreatorModel {
  _id: string;
  username: string;
  display_name: string;
  drive_folder_id: string;
  followers: string;
  following: string;
  likes: string;
  is_following?: boolean;
  bio?: string;
  analytics: {
    profile_views: string;
    net_earnings: string;
    views_growth?: string;
    earnings_growth?: string;
    milestone_trend?: number[];
  };
}

export interface FeedVideoModel {
  video_id: string;
  caption: string;
  likes: number;
  comments: number;
  is_liked?: boolean;
  sound: string;
  creator: CreatorModel;
  stream_url: string;
  local_stream_url?: string;
  visual_theme?: 'ui_stack' | 'scroll_physics' | 'figma_proto' | 'custom_upload';
  duration?: string;
  views_label?: string;
  hashtags?: string[];
  video_drive_id?: string;
  has_binary_stream?: boolean;
}

export interface ProfileResponseModel {
  success: boolean;
  config_host?: string;
  profile: CreatorModel;
  uploaded_videos: FeedVideoModel[];
}

export interface CommentItemModel {
  id: string;
  username: string;
  text: string;
  timestamp: string;
  likes: number;
}

export interface DraftItemModel {
  id: string;
  filename: string;
  edited_label: string;
  duration: string;
  caption: string;
  visual_theme: 'ui_stack' | 'scroll_physics' | 'figma_proto';
  size_mb: string;
}

export interface NetworkLogEntry {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'STREAM';
  configuredUrl: string;
  resolvedPath: string;
  status: number;
  latencyMs: number;
  timestamp: string;
  summary: string;
}

export const SCREEN_METADATA: {
  id: ScreenId;
  numberLabel: string;
  title: string;
  tabGroup: string;
  endpointUsed: string;
  description: string;
}[] = [
  {
    id: 1,
    numberLabel: '1) HOME DASHBOARD',
    title: 'Home Dashboard',
    tabGroup: 'Tab 1: Feeds',
    endpointUsed: 'GET https://github.dev/feed',
    description: 'Welcome view with Trending Now banner and 2x2 Recommended Feed matrix.',
  },
  {
    id: 2,
    numberLabel: '2) VIDEO FEED',
    title: 'Video Feed',
    tabGroup: 'Tab 1: Feeds',
    endpointUsed: 'GET https://github.dev/feed -> item.stream_url',
    description: 'Fullscreen vertical PageView.builder player mapped directly to stream_url.',
  },
  {
    id: 3,
    numberLabel: '3) MEDIA UPLOAD',
    title: 'Media Upload',
    tabGroup: 'Tab 3: Creation',
    endpointUsed: 'POST https://github.dev/upload',
    description: 'Camera capture & Multer multipart byte stream publisher to Google Drive folder.',
  },
  {
    id: 4,
    numberLabel: '4) COMMENT PAGE',
    title: 'Comment Page',
    tabGroup: 'Tab 1: Feeds (Overlay)',
    endpointUsed: 'GET/POST https://github.dev/api/videos/:id/comments',
    description: 'Real-time live comments sheet overlay with interactive comment posting.',
  },
  {
    id: 5,
    numberLabel: '5) SHARE OPTIONS',
    title: 'Share Options',
    tabGroup: 'Tab 1: Feeds (Overlay)',
    endpointUsed: 'Share Payload -> stream_url',
    description: 'Social distribution sheet (Copy Link, WhatsApp, Instagram, Messages, Save Video).',
  },
  {
    id: 6,
    numberLabel: '6) FOLLOW POPUP',
    title: 'Follow Popup',
    tabGroup: 'Tab 1: Feeds (Modal)',
    endpointUsed: 'POST https://github.dev/api/profile/:username/follow',
    description: 'Confirmation dialog to unfollow @creator_handle from primary Following feed.',
  },
  {
    id: 7,
    numberLabel: '7) USER PROFILE',
    title: 'User Profile',
    tabGroup: 'Tab 4: Portfolio',
    endpointUsed: 'GET https://github.dev/profile/:username',
    description: 'Creator profile metrics & 3x2 video grid dynamically fetched via /profile/:username.',
  },
  {
    id: 8,
    numberLabel: '8) AUTHENTICATION',
    title: 'Authentication',
    tabGroup: 'Auth Gate',
    endpointUsed: 'OAuth API Gateway Split',
    description: 'Authentication gate supporting Phone/Email/Username, Google OAuth, and Apple ID.',
  },
  {
    id: 9,
    numberLabel: '9) SIGN UP VIEW',
    title: 'Sign Up View',
    tabGroup: 'Registration Engine',
    endpointUsed: 'POST https://github.dev/api/auth/register',
    description: 'Account creation engine capturing Birthday, Email Address, and Secure Password.',
  },
  {
    id: 10,
    numberLabel: '10) GLOBAL SEARCH',
    title: 'Global Search',
    tabGroup: 'Tab 2: Search',
    endpointUsed: 'GET https://github.dev/feed?q=:tag',
    description: 'Interactive search & discovery hub with Recent Searches and Trending Topics.',
  },
  {
    id: 11,
    numberLabel: '11) ANALYTICS HUB',
    title: 'Analytics Hub',
    tabGroup: 'Tab 4: Portfolio',
    endpointUsed: 'GET https://github.dev/profile/:username',
    description: 'Creator Analytics dashboard with Profile Views, Net Earnings, and Spline Trend.',
  },
  {
    id: 12,
    numberLabel: '12) VIDEO DRAFTS',
    title: 'Video Drafts',
    tabGroup: 'Tab 4: Portfolio',
    endpointUsed: 'GET/POST https://github.dev/api/drafts',
    description: 'Offline local drafts matrix pending publication to cloud storage buckets.',
  },
];
