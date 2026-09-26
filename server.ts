import 'dotenv/config';
import express, { Request, Response } from 'express';
import multer from 'multer';
import cors from 'cors';
import { Readable } from 'stream';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
app.use(cors());
app.use(express.json());

// Configure Multer to forward incoming multimedia buffer blocks cleanly through streams
const upload = multer({ storage: multer.memoryStorage() });

// Central configuration variable pointing to the public URL: https://github.dev
export const PUBLIC_CONFIG_URL = 'https://github.dev';

// =========================================================================
// 1. PRODUCTION SCHEMAS & IN-MEMORY ATLAS/DRIVE ENGINE
// =========================================================================

export interface CreatorRecord {
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
    views_growth: string;
    earnings_growth: string;
    milestone_trend: number[];
  };
  createdAt: string;
}

export interface CommentRecord {
  id: string;
  username: string;
  text: string;
  timestamp: string;
  likes: number;
}

export interface VideoRecord {
  _id: string;
  creator_id: string;
  caption: string;
  video_drive_id: string;
  sound_title: string;
  likes_count: number;
  comments_count: number;
  is_liked?: boolean;
  visual_theme: 'ui_stack' | 'scroll_physics' | 'figma_proto' | 'custom_upload';
  duration: string;
  views_label: string;
  hashtags: string[];
  createdAt: string;
}

export interface DraftRecord {
  id: string;
  filename: string;
  edited_label: string;
  duration: string;
  caption: string;
  visual_theme: 'ui_stack' | 'scroll_physics' | 'figma_proto';
  size_mb: string;
}

// Store uploaded binary video buffers in memory keyed by video_drive_id
const driveBinaryPool = new Map<string, { buffer: Buffer; mimeType: string; filename: string }>();
const userDriveFolders = new Map<string, string>([
  ['@alex_rivers_dev', 'drv_fld_alex_99281a'],
  ['@creative_mind', 'drv_fld_creative_44102b'],
  ['@flutter_master', 'drv_fld_flutter_77319c'],
  ['@pixel_artist', 'drv_fld_pixel_11840d'],
]);

const creatorsStore: CreatorRecord[] = [
  {
    _id: 'cr_alex_01',
    username: '@alex_rivers_dev',
    display_name: 'Alex Rivers',
    drive_folder_id: 'drv_fld_alex_99281a',
    followers: '38.4k',
    following: '184',
    likes: '145.2k',
    is_following: true,
    bio: 'Design Systems Architect · Flutter & Custom Shader Pipelines',
    analytics: {
      profile_views: '34.2k',
      net_earnings: '$1,240',
      views_growth: '+14%',
      earnings_growth: '+9%',
      milestone_trend: [18.2, 24.6, 21.8, 29.4, 34.8, 33.1, 38.4],
    },
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    _id: 'cr_creative_02',
    username: '@creative_mind',
    display_name: 'Creative Mind Studio',
    drive_folder_id: 'drv_fld_creative_44102b',
    followers: '64.1k',
    following: '210',
    likes: '312.8k',
    is_following: true,
    bio: 'Building complete scalable UI system component stacks.',
    analytics: {
      profile_views: '58.9k',
      net_earnings: '$2,890',
      views_growth: '+22%',
      earnings_growth: '+16%',
      milestone_trend: [32.0, 39.5, 44.1, 48.0, 52.3, 59.8, 64.1],
    },
    createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
  },
  {
    _id: 'cr_flutter_03',
    username: '@flutter_master',
    display_name: 'Elena Vance',
    drive_folder_id: 'drv_fld_flutter_77319c',
    followers: '29.7k',
    following: '142',
    likes: '98.4k',
    is_following: false,
    bio: 'Impeller 60fps scroll physics, custom render objects & gRPC streams.',
    analytics: {
      profile_views: '21.4k',
      net_earnings: '$940',
      views_growth: '+11%',
      earnings_growth: '+7%',
      milestone_trend: [12.1, 15.4, 17.9, 21.0, 24.5, 27.2, 29.7],
    },
    createdAt: new Date(Date.now() - 86400000 * 18).toISOString(),
  },
  {
    _id: 'cr_pixel_04',
    username: '@pixel_artist',
    display_name: 'Marcus Chen',
    drive_folder_id: 'drv_fld_pixel_11840d',
    followers: '19.2k',
    following: '95',
    likes: '74.1k',
    is_following: true,
    bio: 'Figma vector blueprint layers & dark mode token architecture.',
    analytics: {
      profile_views: '16.8k',
      net_earnings: '$680',
      views_growth: '+18%',
      earnings_growth: '+12%',
      milestone_trend: [8.4, 10.2, 11.8, 14.3, 16.1, 17.9, 19.2],
    },
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
  },
];

const videosStore: VideoRecord[] = [
  {
    _id: 'vid_feed_001',
    creator_id: 'cr_creative_02',
    caption: 'Building a complete scalable UI system component stack. #flutterdev #uidesign #figma',
    video_drive_id: 'gd_stream_ui_stack_01',
    sound_title: 'Original Audio track - @creative_mind',
    likes_count: 24500,
    comments_count: 4284,
    is_liked: true,
    visual_theme: 'ui_stack',
    duration: '0:24',
    views_label: '4.5M views',
    hashtags: ['#flutterdev', '#uidesign', '#figma'],
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    _id: 'vid_feed_002',
    creator_id: 'cr_alex_01',
    caption: 'Custom Flutter PageView.builder physics with zero-latency gRPC binary stream prefetching. #flutterdev #uidesign',
    video_drive_id: 'gd_stream_scroll_physics_02',
    sound_title: 'Original Audio track - @alex_rivers_dev',
    likes_count: 18920,
    comments_count: 1120,
    is_liked: false,
    visual_theme: 'scroll_physics',
    duration: '0:30',
    views_label: '2.8M views',
    hashtags: ['#flutterdev', '#uidesign'],
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    _id: 'vid_feed_003',
    creator_id: 'cr_alex_01',
    caption: 'Mapping multi-channel Express Multer byte streams straight to Google Drive folder partitions. #figma #flutterdev',
    video_drive_id: 'gd_stream_figma_proto_03',
    sound_title: 'Synthwave Coding Session - @alex_rivers_dev',
    likes_count: 14310,
    comments_count: 842,
    is_liked: true,
    visual_theme: 'figma_proto',
    duration: '0:18',
    views_label: '980k views',
    hashtags: ['#figma', '#flutterdev'],
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    _id: 'vid_feed_004',
    creator_id: 'cr_flutter_03',
    caption: 'Responsive dark mode token architecture across all 12 production viewports. #uidesign #figma',
    video_drive_id: 'gd_stream_ui_stack_04',
    sound_title: 'Original Audio track - @flutter_master',
    likes_count: 9840,
    comments_count: 615,
    is_liked: false,
    visual_theme: 'ui_stack',
    duration: '0:22',
    views_label: '620k views',
    hashtags: ['#uidesign', '#figma'],
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    _id: 'vid_feed_005',
    creator_id: 'cr_alex_01',
    caption: 'Real-time spline chart interpolation for creator analytics milestone tracking. #flutterdev #uidesign',
    video_drive_id: 'gd_stream_scroll_physics_05',
    sound_title: 'Deep Focus Telemetry - @alex_rivers_dev',
    likes_count: 11200,
    comments_count: 530,
    is_liked: false,
    visual_theme: 'scroll_physics',
    duration: '0:15',
    views_label: '510k views',
    hashtags: ['#flutterdev', '#uidesign'],
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    _id: 'vid_feed_006',
    creator_id: 'cr_alex_01',
    caption: 'Zero-copy video chunk streaming from Google Drive API v3 to Flutter VideoPlayerController. #figma #flutterdev',
    video_drive_id: 'gd_stream_figma_proto_06',
    sound_title: 'Original Audio track - @alex_rivers_dev',
    likes_count: 15800,
    comments_count: 910,
    is_liked: true,
    visual_theme: 'figma_proto',
    duration: '0:28',
    views_label: '1.2M views',
    hashtags: ['#figma', '#flutterdev'],
    createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
  },
  {
    _id: 'vid_feed_007',
    creator_id: 'cr_alex_01',
    caption: 'OAuth 2.0 session gate and bottom sheet modal transitions at 120Hz. #uidesign',
    video_drive_id: 'gd_stream_ui_stack_07',
    sound_title: 'Original Audio track - @alex_rivers_dev',
    likes_count: 8420,
    comments_count: 319,
    is_liked: false,
    visual_theme: 'ui_stack',
    duration: '0:19',
    views_label: '430k views',
    hashtags: ['#uidesign'],
    createdAt: new Date(Date.now() - 3600000 * 42).toISOString(),
  },
  {
    _id: 'vid_feed_008',
    creator_id: 'cr_alex_01',
    caption: 'Offline SQLite draft matrix synchronization with cloud storage buckets. #flutterdev',
    video_drive_id: 'gd_stream_scroll_physics_08',
    sound_title: 'Original Audio track - @alex_rivers_dev',
    likes_count: 12650,
    comments_count: 488,
    is_liked: true,
    visual_theme: 'scroll_physics',
    duration: '0:21',
    views_label: '790k views',
    hashtags: ['#flutterdev'],
    createdAt: new Date(Date.now() - 3600000 * 54).toISOString(),
  },
];

const commentsStore = new Map<string, CommentRecord[]>([
  [
    'vid_feed_001',
    [
      {
        id: 'cmt_1',
        username: 'pixel_artist',
        text: 'This layout imports perfectly inside Figma! 🚀',
        timestamp: '2m ago',
        likes: 142,
      },
      {
        id: 'cmt_2',
        username: 'flutter_master',
        text: 'Smooth components transitions vectors.',
        timestamp: '14m ago',
        likes: 89,
      },
      {
        id: 'cmt_3',
        username: 'dev_builder',
        text: 'Love the dark mode aesthetic structure tokens.',
        timestamp: '1h ago',
        likes: 64,
      },
    ],
  ],
]);

const draftsStore: DraftRecord[] = [
  {
    id: 'drf_01',
    filename: 'render_comp_042.mp4',
    edited_label: 'Edited: Just now',
    duration: '0:15 duration',
    caption: 'Testing real-time shader composition on mobile viewport #flutterdev #uidesign',
    visual_theme: 'ui_stack',
    size_mb: '14.2 MB',
  },
  {
    id: 'drf_02',
    filename: 'ui_motion_v2_final.mp4',
    edited_label: 'Edited: 2 hours ago',
    duration: '0:30 duration',
    caption: 'Spring physics curve benchmark on PageView.builder #flutterdev',
    visual_theme: 'scroll_physics',
    size_mb: '28.6 MB',
  },
  {
    id: 'drf_03',
    filename: 'audio_sync_test.mp4',
    edited_label: 'Edited: 3 days ago',
    duration: '0:08 duration',
    caption: 'Low-latency audio waveform sync with Multer stream chunks #figma',
    visual_theme: 'figma_proto',
    size_mb: '7.4 MB',
  },
  {
    id: 'drf_04',
    filename: 'grpc_protobuf_bench.mp4',
    edited_label: 'Edited: 4 days ago',
    duration: '0:22 duration',
    caption: 'HTTP/2 bidirectional channel throughput comparison #flutterdev',
    visual_theme: 'figma_proto',
    size_mb: '19.1 MB',
  },
  {
    id: 'drf_05',
    filename: 'dark_tokens_v4.mp4',
    edited_label: 'Edited: 5 days ago',
    duration: '0:18 duration',
    caption: 'Contrast ratio calibration for OLED overlays #uidesign',
    visual_theme: 'ui_stack',
    size_mb: '15.8 MB',
  },
  {
    id: 'drf_06',
    filename: 'drive_pipe_demo.mp4',
    edited_label: 'Edited: 1 week ago',
    duration: '0:25 duration',
    caption: 'Automated Google Drive folder partitioning per creator handle #flutterdev',
    visual_theme: 'scroll_physics',
    size_mb: '22.0 MB',
  },
];

// =========================================================================
// 2. GOOGLE DRIVE FOLDER PARTITION AUTOMATION HELPER
// =========================================================================

async function getOrCreateUserFolder(username: string): Promise<string> {
  const normalized = username.startsWith('@') ? username : `@${username}`;
  if (userDriveFolders.has(normalized)) {
    return userDriveFolders.get(normalized)!;
  }
  const newFolderId = `drv_fld_${normalized.replace('@', '')}_${Date.now().toString(36)}`;
  userDriveFolders.set(normalized, newFolderId);
  return newFolderId;
}

function normalizeUsername(raw: string): string {
  const decoded = decodeURIComponent(raw).trim();
  return decoded.startsWith('@') ? decoded : `@${decoded}`;
}

// =========================================================================
// 3. ROUTE IMPLEMENTATIONS (Supporting both /api/* and root paths)
// =========================================================================

/**
 * ROUTE: GET /api/feed & GET /feed
 * Fetches the global infinite scrolling array feed list (Screen 2)
 */
const handleGetFeed = async (req: Request, res: Response) => {
  try {
    const sortedVideos = [...videosStore].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const feedData = sortedVideos.map((v) => {
      const creator =
        creatorsStore.find((c) => c._id === v.creator_id) || creatorsStore[0];
      return {
        video_id: v._id,
        caption: v.caption,
        likes: v.likes_count,
        comments: v.comments_count,
        is_liked: Boolean(v.is_liked),
        sound: v.sound_title,
        creator,
        visual_theme: v.visual_theme,
        duration: v.duration,
        views_label: v.views_label,
        hashtags: v.hashtags,
        video_drive_id: v.video_drive_id,
        has_binary_stream: driveBinaryPool.has(v.video_drive_id),
        // Central configuration variable pointing to https://github.dev as specified
        stream_url: `${PUBLIC_CONFIG_URL}/api/media/stream/${v.video_drive_id}`,
        local_stream_url: `/api/media/stream/${v.video_drive_id}`,
      };
    });

    res.status(200).json({
      success: true,
      config_host: PUBLIC_CONFIG_URL,
      data: feedData,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

app.get('/api/feed', handleGetFeed);
app.get('/feed', handleGetFeed);

/**
 * ROUTE: POST /api/upload & POST /upload
 * Handles Multipart file byte buffer uploads from Screen 3 (Media Upload)
 */
const handlePostUpload = async (req: Request, res: Response) => {
  try {
    const rawUsername = req.body.username || '@alex_rivers_dev';
    const username = normalizeUsername(rawUsername);
    const display_name =
      req.body.display_name || username.replace('@', '').replace(/_/g, ' ');
    const caption =
      req.body.caption ||
      'New studio build stream uploaded via Express Multer pipeline #flutterdev #uidesign';
    const visual_theme = req.body.visual_theme || 'ui_stack';

    // 1. Lookup or instantly seed creator node index
    let creator = creatorsStore.find(
      (c) => c.username.toLowerCase() === username.toLowerCase()
    );
    if (!creator) {
      const folderId = await getOrCreateUserFolder(username);
      creator = {
        _id: `cr_${Date.now()}`,
        username,
        display_name,
        drive_folder_id: folderId,
        followers: '1.2k',
        following: '48',
        likes: '4.8k',
        is_following: true,
        bio: 'Creator on StreamGrid Architecture',
        analytics: {
          profile_views: '4.2k',
          net_earnings: '$190',
          views_growth: '+19%',
          earnings_growth: '+12%',
          milestone_trend: [0.2, 0.4, 0.6, 0.8, 0.9, 1.1, 1.2],
        },
        createdAt: new Date().toISOString(),
      };
      creatorsStore.push(creator);
    }

    // 2. Convert memory buffer chunks into readable node stream & store in Drive binary pool
    const fileDriveId = `gd_vid_${Date.now()}`;
    if (req.file && req.file.buffer) {
      const bufferStream = new Readable();
      bufferStream.push(req.file.buffer);
      bufferStream.push(null);

      driveBinaryPool.set(fileDriveId, {
        buffer: req.file.buffer,
        mimeType: req.file.mimetype || 'video/mp4',
        filename: req.file.originalname || `vid_${Date.now()}.mp4`,
      });
    }

    // 3. Log final transaction reference into Videos store
    const extractedTags: string[] = caption.match(/#[a-zA-Z0-9_]+/g) || [
      '#flutterdev',
      '#uidesign',
    ];
    const newVideo: VideoRecord = {
      _id: `vid_${Date.now()}`,
      creator_id: creator._id,
      caption,
      video_drive_id: fileDriveId,
      sound_title: `Original Audio track - ${creator.username}`,
      likes_count: 1,
      comments_count: 0,
      is_liked: true,
      visual_theme: req.file ? 'custom_upload' : (visual_theme as any),
      duration: '0:15',
      views_label: 'Just now',
      hashtags: extractedTags,
      createdAt: new Date().toISOString(),
    };
    videosStore.unshift(newVideo);

    res.status(200).json({
      success: true,
      message: `Video uploaded successfully to your personalized Google Drive folder under: ${username}`,
      drive_folder_id: creator.drive_folder_id,
      video_meta: {
        ...newVideo,
        creator,
        stream_url: `${PUBLIC_CONFIG_URL}/api/media/stream/${newVideo.video_drive_id}`,
        local_stream_url: `/api/media/stream/${newVideo.video_drive_id}`,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

app.post('/api/upload', upload.single('video'), handlePostUpload);
app.post('/upload', upload.single('video'), handlePostUpload);

/**
 * ROUTE: GET /api/profile/:username & GET /profile/:username
 * Aggregates specific profile details metrics maps (Screen 7)
 */
const handleGetProfile = async (req: Request, res: Response) => {
  try {
    const requestedHandle = normalizeUsername(req.params.username);
    let creator = creatorsStore.find(
      (c) => c.username.toLowerCase() === requestedHandle.toLowerCase()
    );

    if (!creator) {
      // Seed profile dynamically if user searches/clicks a new handle
      const folderId = await getOrCreateUserFolder(requestedHandle);
      creator = {
        _id: `cr_${Date.now()}`,
        username: requestedHandle,
        display_name: requestedHandle
          .replace('@', '')
          .split('_')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' '),
        drive_folder_id: folderId,
        followers: '12.4k',
        following: '112',
        likes: '48.9k',
        is_following: false,
        bio: 'Interactive UI & Flutter Media Creator',
        analytics: {
          profile_views: '14.8k',
          net_earnings: '$540',
          views_growth: '+12%',
          earnings_growth: '+8%',
          milestone_trend: [6.1, 7.4, 8.2, 9.5, 10.8, 11.6, 12.4],
        },
        createdAt: new Date().toISOString(),
      };
      creatorsStore.push(creator);
    }

    const creatorVideos = videosStore
      .filter((v) => v.creator_id === creator!._id)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    const profileFeed = creatorVideos.map((v) => ({
      video_id: v._id,
      caption: v.caption,
      likes: v.likes_count,
      comments: v.comments_count,
      sound: v.sound_title,
      visual_theme: v.visual_theme,
      duration: v.duration,
      views_label: v.views_label,
      video_drive_id: v.video_drive_id,
      has_binary_stream: driveBinaryPool.has(v.video_drive_id),
      stream_url: `${PUBLIC_CONFIG_URL}/api/media/stream/${v.video_drive_id}`,
      local_stream_url: `/api/media/stream/${v.video_drive_id}`,
    }));

    res.status(200).json({
      success: true,
      config_host: PUBLIC_CONFIG_URL,
      profile: creator,
      uploaded_videos: profileFeed,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

app.get('/api/profile/:username', handleGetProfile);
app.get('/profile/:username', handleGetProfile);

/**
 * ROUTE: GET /api/media/stream/:fileId & GET /media/stream/:fileId
 * Streams binary media byte streams sequentially to player texture boundaries
 */
const handleMediaStream = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    const storedBinary = driveBinaryPool.get(fileId);

    if (storedBinary) {
      res.setHeader('Content-Type', storedBinary.mimeType);
      res.setHeader('Content-Length', storedBinary.buffer.length.toString());
      res.setHeader('Accept-Ranges', 'bytes');
      const stream = new Readable();
      stream.push(storedBinary.buffer);
      stream.push(null);
      stream.pipe(res);
      return;
    }

    // Stream metadata descriptor if procedural stream ID is requested directly
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      stream_status: 'ACTIVE_CHUNK_PIPE',
      file_id: fileId,
      protocol: 'HTTP/2 Binary Chunk Stream',
      source: `${PUBLIC_CONFIG_URL}/api/media/stream/${fileId}`,
      codec: 'H.264 / AAC MP4 Stream Container',
    });
  } catch (err) {
    res.status(500).send('Piping video streams encountered a media chunk fault.');
  }
};

app.get('/api/media/stream/:fileId', handleMediaStream);
app.get('/media/stream/:fileId', handleMediaStream);

// =========================================================================
// 4. INTERACTIVE SOCIAL GRAPH ROUTES (Likes, Comments, Follow, Drafts, Auth)
// =========================================================================

app.post('/api/videos/:videoId/like', (req: Request, res: Response) => {
  const video = videosStore.find((v) => v._id === req.params.videoId);
  if (!video) {
    res.status(404).json({ success: false, error: 'Video not found' });
    return;
  }
  video.is_liked = !video.is_liked;
  video.likes_count += video.is_liked ? 1 : -1;
  res.json({
    success: true,
    video_id: video._id,
    likes: video.likes_count,
    is_liked: video.is_liked,
  });
});

app.get('/api/videos/:videoId/comments', (req: Request, res: Response) => {
  const videoId = req.params.videoId;
  const list = commentsStore.get(videoId) || commentsStore.get('vid_feed_001') || [];
  res.json({
    success: true,
    video_id: videoId,
    total_count: list.length + 4281,
    comments: list,
  });
});

app.post('/api/videos/:videoId/comments', (req: Request, res: Response) => {
  const videoId = req.params.videoId;
  const { username = 'alex_rivers_dev', text } = req.body;
  if (!text || !text.trim()) {
    res.status(400).json({ success: false, error: 'Comment text required' });
    return;
  }
  const existing = commentsStore.get(videoId) || [
    ...(commentsStore.get('vid_feed_001') || []),
  ];
  const newComment: CommentRecord = {
    id: `cmt_${Date.now()}`,
    username: username.replace('@', ''),
    text: text.trim(),
    timestamp: 'Just now',
    likes: 1,
  };
  const updated = [newComment, ...existing];
  commentsStore.set(videoId, updated);

  const video = videosStore.find((v) => v._id === videoId);
  if (video) {
    video.comments_count += 1;
  }

  res.json({
    success: true,
    comment: newComment,
    comments: updated,
    comments_count: video ? video.comments_count : updated.length,
  });
});

app.post('/api/profile/:username/follow', (req: Request, res: Response) => {
  const handle = normalizeUsername(req.params.username);
  const creator = creatorsStore.find(
    (c) => c.username.toLowerCase() === handle.toLowerCase()
  );
  if (!creator) {
    res.status(404).json({ success: false, error: 'Creator not found' });
    return;
  }
  const action = req.body.action; // 'follow' | 'unfollow' | 'toggle'
  if (action === 'unfollow') {
    creator.is_following = false;
  } else if (action === 'follow') {
    creator.is_following = true;
  } else {
    creator.is_following = !creator.is_following;
  }
  res.json({
    success: true,
    username: creator.username,
    is_following: creator.is_following,
  });
});

app.put('/api/profile/:username', (req: Request, res: Response) => {
  const handle = normalizeUsername(req.params.username);
  const creator = creatorsStore.find(
    (c) => c.username.toLowerCase() === handle.toLowerCase()
  );
  if (!creator) {
    res.status(404).json({ success: false, error: 'Creator not found' });
    return;
  }
  if (req.body.display_name) creator.display_name = req.body.display_name;
  if (req.body.bio !== undefined) creator.bio = req.body.bio;
  res.json({ success: true, profile: creator });
});

app.get('/api/drafts', (_req: Request, res: Response) => {
  res.json({ success: true, drafts: draftsStore });
});

app.post('/api/drafts', (req: Request, res: Response) => {
  const { filename, duration, caption, visual_theme } = req.body;
  const newDraft: DraftRecord = {
    id: `drf_${Date.now()}`,
    filename: filename || `capture_${Date.now().toString().slice(-4)}.mp4`,
    edited_label: 'Edited: Just now',
    duration: duration || '0:15 duration',
    caption: caption || 'Local studio camera draft capture #flutterdev',
    visual_theme: visual_theme || 'ui_stack',
    size_mb: '16.4 MB',
  };
  draftsStore.unshift(newDraft);
  res.json({ success: true, draft: newDraft, drafts: draftsStore });
});

app.delete('/api/drafts/:id', (req: Request, res: Response) => {
  const idx = draftsStore.findIndex((d) => d.id === req.params.id);
  if (idx !== -1) {
    draftsStore.splice(idx, 1);
  }
  res.json({ success: true, drafts: draftsStore });
});

app.post('/api/auth/register', async (req: Request, res: Response) => {
  const { email, birthday, username, display_name } = req.body;
  const rawHandle =
    username ||
    (email ? `@${email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_')}` : '@new_creator');
  const handle = normalizeUsername(rawHandle);

  let creator = creatorsStore.find(
    (c) => c.username.toLowerCase() === handle.toLowerCase()
  );
  if (!creator) {
    const folderId = await getOrCreateUserFolder(handle);
    creator = {
      _id: `cr_${Date.now()}`,
      username: handle,
      display_name:
        display_name ||
        handle
          .replace('@', '')
          .split('_')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' '),
      drive_folder_id: folderId,
      followers: '1',
      following: '14',
      likes: '0',
      is_following: true,
      bio: `Registered Creator · Birthday ${birthday || 'October / 24 / 1998'}`,
      analytics: {
        profile_views: '128',
        net_earnings: '$0',
        views_growth: '+100%',
        earnings_growth: '+0%',
        milestone_trend: [0, 0, 0, 0, 0, 0, 1],
      },
      createdAt: new Date().toISOString(),
    };
    creatorsStore.push(creator);
  }

  res.json({
    success: true,
    session_verified: true,
    user: creator,
  });
});

// =========================================================================
// 5. EXTERNAL GITHUB / CODESPACES SERVER.JS BRIDGE & DIAGNOSTICS
// =========================================================================

app.post('/api/external/ping', async (req: Request, res: Response) => {
  const { targetUrl } = req.body;
  if (!targetUrl || typeof targetUrl !== 'string') {
    res.status(400).json({ success: false, error: 'Missing targetUrl' });
    return;
  }

  const cleanBase = targetUrl.trim().replace(/\/+$/, '');
  const feedUrl = cleanBase.endsWith('/api/feed')
    ? cleanBase
    : `${cleanBase}/api/feed`;

  const start = Date.now();
  try {
    const response = await fetch(feedUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    const latencyMs = Date.now() - start;
    const contentType = response.headers.get('content-type') || '';
    const rawText = await response.text();

    let parsedJson: any = null;
    try {
      parsedJson = JSON.parse(rawText);
    } catch {
      parsedJson = null;
    }

    if (response.ok && parsedJson && Array.isArray(parsedJson.data)) {
      res.json({
        success: true,
        reachable: true,
        valid_schema: true,
        status: response.status,
        latencyMs,
        tested_endpoint: feedUrl,
        video_count: parsedJson.data.length,
        message: `Connected to live server.js! Received ${parsedJson.data.length} feed items from ${feedUrl}.`,
        sample_payload: parsedJson,
      });
      return;
    }

    // Check if GitHub Codespaces returned an HTML login page (Port is Private)
    const isHtmlAuthPage =
      contentType.includes('text/html') || rawText.trim().startsWith('<!DOCTYPE');

    res.json({
      success: true,
      reachable: true,
      valid_schema: false,
      status: response.status,
      latencyMs,
      tested_endpoint: feedUrl,
      message: isHtmlAuthPage
        ? 'Endpoint returned HTML instead of JSON. If using GitHub Codespaces, set Port 3000 Visibility to "Public" in the PORTS tab and use the forwarded URL (e.g. https://<codespace>-3000.app.github.dev).'
        : `Endpoint responded with HTTP ${response.status}, but payload did not match { success: true, data: [...] }.`,
      raw_preview: rawText.slice(0, 280),
    });
  } catch (err: any) {
    res.json({
      success: false,
      reachable: false,
      valid_schema: false,
      status: 0,
      latencyMs: Date.now() - start,
      tested_endpoint: feedUrl,
      message: `Could not reach ${feedUrl}: ${err.message}`,
    });
  }
});

app.post('/api/external/proxy', async (req: Request, res: Response) => {
  const { targetBaseUrl, pathSuffix, method = 'GET', body } = req.body;
  if (!targetBaseUrl || !pathSuffix) {
    res.status(400).json({ success: false, error: 'Missing targetBaseUrl or pathSuffix' });
    return;
  }
  const cleanBase = targetBaseUrl.trim().replace(/\/+$/, '');
  const normalizedSuffix = pathSuffix.startsWith('/') ? pathSuffix : `/${pathSuffix}`;
  const fullUrl = `${cleanBase}${normalizedSuffix}`;

  try {
    const response = await fetch(fullUrl, {
      method,
      headers: body ? { 'Content-Type': 'application/json', Accept: 'application/json' } : { Accept: 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err: any) {
    res.status(502).json({
      success: false,
      error: `External server proxy error (${fullUrl}): ${err.message}`,
    });
  }
});

// =========================================================================
// 5B. NATIVE DART FLUTTER PROJECT DIRECTORY TREE & FILE READER
// =========================================================================

function collectDartProjectFiles(): Array<{ path: string; content: string; category: string }> {
  const results: Array<{ path: string; content: string; category: string }> = [];
  const rootFiles = ['pubspec.yaml', 'analysis_options.yaml'];

  for (const rf of rootFiles) {
    const abs = path.resolve(process.cwd(), rf);
    if (fs.existsSync(abs)) {
      results.push({
        path: rf,
        content: fs.readFileSync(abs, 'utf-8'),
        category: 'config',
      });
    }
  }

  function walkDir(relDir: string) {
    const absDir = path.resolve(process.cwd(), relDir);
    if (!fs.existsSync(absDir)) return;
    const entries = fs.readdirSync(absDir, { withFileTypes: true });
    for (const entry of entries) {
      const childRel = `${relDir}/${entry.name}`;
      if (entry.isDirectory()) {
        walkDir(childRel);
      } else if (entry.name.endsWith('.dart')) {
        const category = childRel.includes('/views/')
          ? 'views'
          : childRel.includes('/models/')
          ? 'models'
          : childRel.includes('/services/')
          ? 'services'
          : childRel.includes('/config/')
          ? 'config'
          : 'entrypoint';
        results.push({
          path: childRel,
          content: fs.readFileSync(path.resolve(process.cwd(), childRel), 'utf-8'),
          category,
        });
      }
    }
  }

  walkDir('lib');
  return results;
}

app.get('/api/flutter-project', (_req: Request, res: Response) => {
  try {
    const files = collectDartProjectFiles();
    res.json({
      success: true,
      central_public_url: PUBLIC_CONFIG_URL,
      file_count: files.length,
      files,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =========================================================================
// 6. VITE DEV SERVER & STATIC SPA MOUNTING ON PORT 3000
// =========================================================================

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 TikTok Server Grid Engine running live on port ${PORT}`);
  });
}

startServer();
