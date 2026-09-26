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

async function initTitanFlutterStudio() {
  const root = document.getElementById('root');
  if (!root) return;

  // Fetch Dart project files and live feed/profile data
  const [projRes, feedRes, profileRes] = await Promise.all([
    fetch('/api/flutter-project').then((r) => r.json()).catch(() => ({ files: [] })),
    fetch('/api/feed').then((r) => r.json()).catch(() => ({ data: [] })),
    fetch('/api/profile/@alex_rivers_dev').then((r) => r.json()).catch(() => ({ data: null })),
  ]);

  const files: DartFileEntry[] = projRes.files || [];
  let feedList: any[] = feedRes.data || [];
  let currentProfile: any = profileRes.data || {
    creator: {
      username: '@alex_rivers_dev',
      display_name: 'Alex Rivers',
      followers: '128.5k',
      following: '245',
      likes: '2.4M',
      bio: '60fps Flutter & Shader Architect • StreamGrid Studio',
    },
    videos: feedList,
  };

  // Titan Reactive State Mirror
  let selectedColorIdx = 0;
  let isNightMode = true;
  let activeMobileTab: MobileTab = 'settings'; // Open on Settings/Theme tab or allow instant switching
  let activeVideoIdx = 0;
  let showCommentsDrawer = false;
  let showShareDrawer = false;
  let searchQuery = '';
  let selectedFilePath =
    files.find((f) => f.path === 'lib/views/app_settings_view.dart')?.path ||
    files.find((f) => f.path === 'lib/services/theme_pillar.dart')?.path ||
    files[0]?.path ||
    'pubspec.yaml';

  const likedVideos = new Set<string>();
  const followedHandles = new Set<string>(['@maya_shaders']);
  const notificationsList = [
    { actor: '@maya_shaders', text: 'mentioned you: "Titan 12-color transitions feel buttery smooth!"', time: '1m ago' },
    { actor: '@kaito_motion', text: 'liked your video streamed via /feed stream_url', time: '9m ago' },
    { actor: '@elena_rust', text: 'started following your creator profile', time: '42m ago' },
  ];
  const commentsMap: Record<string, Array<{ user: string; text: string; time: string }>> = {};

  async function loadProfileHandle(handle: string) {
    try {
      const r = await fetch(`/api/profile/${encodeURIComponent(handle)}`);
      const j = await r.json();
      if (j.data) {
        currentProfile = j.data;
        render();
      }
    } catch (e) {
      console.error(e);
    }
  }

  function render() {
    if (!root) return;
    const activeTheme = TITAN_PALETTE_12[selectedColorIdx];
    const accent = activeTheme.hex;
    const activeFile = files.find((f) => f.path === selectedFilePath) || files[0];
    const activeVideo = feedList[activeVideoIdx] || {
      video_id: 'v_101',
      caption: 'Building 60fps reactive Flutter shaders with Titan Pillar state #flutter #titan #ui',
      sound_title: 'Original Audio — Alex Rivers Studio',
      likes_count: 18420,
      comments_count: 342,
      shares_count: 128,
      stream_url: `${CENTRAL_PUBLIC_URL}/api/media/stream/drv_v101`,
      creator: { username: '@alex_rivers_dev', display_name: 'Alex Rivers' },
    };

    const vidId = activeVideo.video_id || activeVideo._id || 'v_101';
    const isLiked = likedVideos.has(vidId);
    const creatorHandle = activeVideo.creator?.username || '@alex_rivers_dev';
    const isFollowing = followedHandles.has(creatorHandle);
    const videoComments = commentsMap[vidId] || [
      { user: '@maya_shaders', text: 'That 12-color Titan theme switcher is super clean!', time: '2m' },
      { user: '@kaito_motion', text: 'Zero jank on the PageView stream_url preload.', time: '8m' },
    ];

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
              <h1 class="text-base font-bold tracking-tight">StreamGrid TikTok Full App — Native Dart & Titan Theme Studio</h1>
              <p style="color:${textSub};" class="text-xs font-mono">Central Backend: ${CENTRAL_PUBLIC_URL} • 12-Color Theme & Day/Night Mode</p>
            </div>
          </div>

          <!-- Top Bar Quick Day/Night Segmented Switcher & 12-Color Swatches -->
          <div class="flex flex-wrap items-center gap-3">
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

            <!-- Explicit Day Mode / Night Mode Segmented Selector -->
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
              ${(['feed', 'search', 'upload', 'notifications', 'profile', 'settings', 'auth'] as MobileTab[])
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
                  ${tab === 'settings' ? '🎨 Theme & Settings' : tab}
                </button>
              `
                )
                .join('')}
            </div>

            <!-- Phone Bezels -->
            <div
              style="background:${phoneBg}; border:3px solid ${accent}88; box-shadow: 0 20px 50px ${accent}25;"
              class="w-[375px] h-[720px] rounded-[42px] overflow-hidden flex flex-col relative transition-all duration-300"
            >
              <!-- Status Bar -->
              <div style="background:${phoneCardBg}; color:${textMain}; border-bottom:1px solid ${borderCol};" class="px-6 py-2.5 flex items-center justify-between text-[11px] font-mono">
                <span>9:41</span>
                <span style="color:${accent};" class="font-bold">${isNightMode ? '🌙 Night' : '☀️ Day'} • ${activeTheme.name}</span>
                <span>5G</span>
              </div>

              <!-- Mobile Viewport Body -->
              <div class="flex-1 overflow-y-auto relative flex flex-col transition-colors duration-300" style="background:${phoneBg}; color:${textMain};">
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
                })}
              </div>

              <!-- Mobile Bottom Navigation Bar -->
              <nav style="background:${phoneCardBg}; border-top:1px solid ${borderCol};" class="px-3 py-2.5 grid grid-cols-6 gap-1 text-center">
                ${[
                  { id: 'feed', icon: '▶', label: 'Feed' },
                  { id: 'search', icon: '🔍', label: 'Search' },
                  { id: 'upload', icon: '＋', label: 'Upload' },
                  { id: 'notifications', icon: '🔔', label: 'Inbox' },
                  { id: 'profile', icon: '👤', label: 'Profile' },
                  { id: 'settings', icon: '🎨', label: 'Theme' },
                ]
                  .map(
                    (nav) => `
                  <button
                    type="button"
                    data-mobile-tab="${nav.id}"
                    style="color:${activeMobileTab === nav.id ? accent : textSub};"
                    class="flex flex-col items-center justify-center py-1 rounded-lg transition-all cursor-pointer"
                  >
                    <span class="text-sm leading-none">${nav.icon}</span>
                    <span class="text-[10px] mt-1 font-semibold">${nav.label}</span>
                  </button>
                `
                  )
                  .join('')}
              </nav>
            </div>
          </section>

          <!-- Right: Native Dart Flutter Project Directory & Code Viewer (7 Cols) -->
          <section style="background:${panelBg}; border:1px solid ${borderCol};" class="lg:col-span-7 rounded-2xl overflow-hidden flex flex-col h-[765px]">
            <div style="border-bottom:1px solid ${borderCol};" class="px-5 py-3.5 flex items-center justify-between">
              <div>
                <h2 class="text-sm font-bold">Native Flutter Project Structure (Pure Dart + Titan Package)</h2>
                <p style="color:${textSub};" class="text-xs font-mono">Root pubspec.yaml • lib/main.dart • lib/views/ • lib/models/ • lib/services/</p>
              </div>
              <span style="background:${accent}22; color:${accent}; border:1px solid ${accent}55;" class="px-2.5 py-1 rounded text-xs font-mono font-semibold">
                ${files.length} Files
              </span>
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
      </div>
    `;

    // Bind 12-Color selector buttons (both top bar and inside phone Settings view)
    root.querySelectorAll<HTMLButtonElement>('button[data-color-idx]').forEach((btn) => {
      btn.addEventListener('click', () => {
        selectedColorIdx = Number(btn.getAttribute('data-color-idx') || 0);
        render();
      });
    });

    // Bind ALL Day Mode / Night Mode buttons (both top bar and inside phone Settings view)
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

    // Bind Mobile Tab navigation buttons
    root.querySelectorAll<HTMLButtonElement>('button[data-mobile-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeMobileTab = (btn.getAttribute('data-mobile-tab') as MobileTab) || 'feed';
        showCommentsDrawer = false;
        showShareDrawer = false;
        render();
      });
    });

    // Bind Dart File Tree selection
    root.querySelectorAll<HTMLButtonElement>('button[data-file-path]').forEach((btn) => {
      btn.addEventListener('click', () => {
        selectedFilePath = btn.getAttribute('data-file-path') || selectedFilePath;
        render();
      });
    });

    // Feed controls
    document.getElementById('prev-video-btn')?.addEventListener('click', () => {
      if (feedList.length > 0) {
        activeVideoIdx = (activeVideoIdx - 1 + feedList.length) % feedList.length;
        render();
      }
    });
    document.getElementById('next-video-btn')?.addEventListener('click', () => {
      if (feedList.length > 0) {
        activeVideoIdx = (activeVideoIdx + 1) % feedList.length;
        render();
      }
    });
    document.getElementById('like-video-btn')?.addEventListener('click', () => {
      if (likedVideos.has(vidId)) likedVideos.delete(vidId);
      else likedVideos.add(vidId);
      render();
    });
    document.getElementById('follow-creator-btn')?.addEventListener('click', () => {
      if (followedHandles.has(creatorHandle)) followedHandles.delete(creatorHandle);
      else followedHandles.add(creatorHandle);
      render();
    });
    root.querySelectorAll<HTMLButtonElement>('button[data-toggle-comments]').forEach((btn) => {
      btn.addEventListener('click', () => {
        showCommentsDrawer = !showCommentsDrawer;
        showShareDrawer = false;
        render();
      });
    });
    root.querySelectorAll<HTMLButtonElement>('button[data-toggle-share]').forEach((btn) => {
      btn.addEventListener('click', () => {
        showShareDrawer = !showShareDrawer;
        showCommentsDrawer = false;
        render();
      });
    });
    document.getElementById('add-comment-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('comment-input') as HTMLInputElement | null;
      if (input && input.value.trim()) {
        const list = commentsMap[vidId] || [
          { user: '@maya_shaders', text: 'That 12-color Titan theme switcher is super clean!', time: '2m' },
        ];
        list.unshift({ user: '@alex_rivers_dev', text: input.value.trim(), time: 'Just now' });
        commentsMap[vidId] = list;
        render();
      }
    });

    // Profile loop buttons
    root.querySelectorAll<HTMLButtonElement>('button[data-profile-handle]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const h = btn.getAttribute('data-profile-handle') || '@alex_rivers_dev';
        activeMobileTab = 'profile';
        loadProfileHandle(h);
      });
    });

    // Upload simulation
    document.getElementById('simulate-upload-btn')?.addEventListener('click', async () => {
      const capInput = document.getElementById('upload-caption-input') as HTMLInputElement | null;
      const caption = capInput?.value || 'New 60fps Flutter video with Titan state #flutter';
      const fd = new FormData();
      fd.append('caption', caption);
      fd.append('username', '@alex_rivers_dev');
      await fetch('/api/upload', { method: 'POST', body: fd });
      const updated = await fetch('/api/feed').then((r) => r.json());
      if (updated.data) feedList = updated.data;
      activeVideoIdx = 0;
      activeMobileTab = 'feed';
      render();
    });

    // Search input
    const sInput = document.getElementById('mobile-search-input') as HTMLInputElement | null;
    if (sInput) {
      sInput.addEventListener('input', () => {
        searchQuery = sInput.value;
        render();
      });
    }
  }

  render();
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
  } = opts;

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

        <!-- Performance & Backend Info -->
        <div style="background:${panelBg}; border:1px solid ${borderCol};" class="p-3.5 rounded-2xl space-y-1.5 text-xs shadow-sm">
          <div class="font-bold">Performance & Cloud Container</div>
          <div style="color:${textSub};" class="text-[11px] font-mono">Base URL: ${CENTRAL_PUBLIC_URL}</div>
          <div style="color:${textSub};" class="text-[11px]">• 60fps Hardware Video Decoding: Active</div>
          <div style="color:${textSub};" class="text-[11px]">• Next stream_url Segment Preload: Active</div>
        </div>
      </div>
    `;
  }

  if (activeMobileTab === 'profile') {
    const creator = currentProfile?.creator || {};
    const vids = currentProfile?.videos || [];
    return `
      <div class="p-4 space-y-4">
        <div class="flex items-center justify-between">
          <span class="text-xs font-mono font-bold" style="color:${accent};">/profile/${creator.username || '@alex_rivers_dev'}</span>
          <div class="flex gap-1">
            ${['@alex_rivers_dev', '@maya_shaders', '@kaito_motion']
              .map(
                (h) => `
              <button type="button" data-profile-handle="${h}" style="border:1px solid ${borderCol}; background:${panelBg};" class="px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer hover:opacity-80">
                ${h.replace('@', '')}
              </button>
            `
              )
              .join('')}
          </div>
        </div>

        <div class="flex flex-col items-center text-center space-y-2">
          <div style="background:${accent};" class="w-16 h-16 rounded-full flex items-center justify-center text-black font-bold text-xl">
            ${(creator.display_name || 'A')[0]}
          </div>
          <div class="font-bold text-sm">${creator.display_name || 'Alex Rivers'}</div>
          <div style="color:${textSub};" class="text-xs">${creator.bio || 'Flutter & Shaders'}</div>
          <div class="flex gap-6 py-2 text-xs">
            <div><strong class="font-mono">${creator.following || '245'}</strong> <span style="color:${textSub};">Following</span></div>
            <div><strong class="font-mono">${creator.followers || '128.5k'}</strong> <span style="color:${textSub};">Followers</span></div>
            <div><strong class="font-mono">${creator.likes || '2.4M'}</strong> <span style="color:${textSub};">Likes</span></div>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-1.5">
          ${vids
            .map(
              (v: any) => `
            <div style="background:${panelBg}; border:1px solid ${borderCol};" class="aspect-[3/4] p-2 rounded-lg flex flex-col justify-between">
              <span style="color:${accent};" class="text-[10px] font-mono font-bold">▶ ${v.duration || '0:24'}</span>
              <span class="text-[10px] line-clamp-2">${v.caption || ''}</span>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;
  }

  if (activeMobileTab === 'upload') {
    return `
      <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div style="background:${panelBg}; border:1.5px dashed ${accent};" class="flex-1 rounded-2xl flex flex-col items-center justify-center p-6 text-center space-y-2">
          <div style="color:${accent};" class="text-3xl">🎥</div>
          <div class="text-xs font-bold">Multipart Upload to /upload</div>
          <div style="color:${textSub};" class="text-[11px] font-mono">${CENTRAL_PUBLIC_URL}/upload</div>
        </div>
        <div class="space-y-3">
          <input
            id="upload-caption-input"
            type="text"
            value="Shipping 60fps Titan theme animations in Flutter #flutter #titan"
            style="background:${panelBg}; border:1px solid ${borderCol}; color:${textMain};"
            class="w-full px-3 py-2 rounded-xl text-xs"
          />
          <button
            type="button"
            id="simulate-upload-btn"
            style="background:${accent}; color:#000;"
            class="w-full py-2.5 rounded-xl text-xs font-bold cursor-pointer"
          >
            Publish Video to /feed
          </button>
        </div>
      </div>
    `;
  }

  if (activeMobileTab === 'search') {
    const filtered = feedList.filter((v: any) =>
      !searchQuery
        ? true
        : (v.caption || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (v.creator?.username || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
    return `
      <div class="p-4 space-y-3">
        <input
          id="mobile-search-input"
          type="text"
          placeholder="Search creators, #hashtags, stream_url..."
          value="${escapeHtml(searchQuery)}"
          style="background:${panelBg}; border:1px solid ${borderCol}; color:${textMain};"
          class="w-full px-3 py-2 rounded-xl text-xs"
        />
        <div class="space-y-2">
          ${filtered
            .map(
              (v: any) => `
            <div style="background:${panelBg}; border:1px solid ${borderCol};" class="p-2.5 rounded-xl flex items-center justify-between">
              <div class="min-w-0 pr-2">
                <div style="color:${accent};" class="text-xs font-bold">${v.creator?.username || '@creator'}</div>
                <div class="text-[11px] truncate">${v.caption || ''}</div>
              </div>
              <button type="button" data-profile-handle="${v.creator?.username || '@alex_rivers_dev'}" style="background:${accent}; color:#000;" class="px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer shrink-0">
                Profile
              </button>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;
  }

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
            <p class="text-xs">${n.text}</p>
          </div>
        `
          )
          .join('')}
      </div>
    `;
  }

  if (activeMobileTab === 'auth') {
    return `
      <div class="p-6 flex-1 flex flex-col justify-center space-y-4">
        <div class="text-center space-y-1">
          <div style="color:${accent};" class="text-3xl font-bold">●</div>
          <h3 class="text-sm font-bold">StreamGrid Authentication</h3>
          <p style="color:${textSub};" class="text-[11px] font-mono">${CENTRAL_PUBLIC_URL}/auth/login</p>
        </div>
        <input type="text" value="@alex_rivers_dev" style="background:${panelBg}; border:1px solid ${borderCol}; color:${textMain};" class="w-full px-3 py-2 rounded-xl text-xs" />
        <input type="password" value="••••••••••••" style="background:${panelBg}; border:1px solid ${borderCol}; color:${textMain};" class="w-full px-3 py-2 rounded-xl text-xs" />
        <button type="button" data-mobile-tab="feed" style="background:${accent}; color:#000;" class="w-full py-2.5 rounded-xl text-xs font-bold cursor-pointer">
          Sign In & Open Video Feed
        </button>
      </div>
    `;
  }

  // Screen 2: Video Feed (Adapts cleanly to both Day Mode and Night Mode!)
  const feedSurfaceGradient = isNightMode
    ? `radial-gradient(circle at 50% 30%, ${accent}33, #090A10 78%)`
    : `radial-gradient(circle at 50% 30%, ${accent}28, #F1F5F9 78%)`;

  return `
    <div class="flex-1 flex flex-col justify-between p-4 relative transition-all duration-300" style="background:${feedSurfaceGradient}; color:${textMain};">
      <!-- Top Feed Bar -->
      <div class="flex items-center justify-between text-xs">
        <span class="font-bold">Following  |  <span style="color:${accent};">For You</span></span>
        <div class="flex gap-1">
          <button type="button" id="prev-video-btn" style="background:${panelBg}; border:1px solid ${borderCol};" class="px-2 py-0.5 rounded text-[10px] cursor-pointer">▲ Prev</button>
          <button type="button" id="next-video-btn" style="background:${panelBg}; border:1px solid ${borderCol};" class="px-2 py-0.5 rounded text-[10px] cursor-pointer">▼ Next</button>
        </div>
      </div>

      <!-- Center Stream Status -->
      <div class="my-auto text-center space-y-2.5 px-3">
        <div style="border:2.5px solid ${accent}; color:${accent}; background:${panelBg};" class="w-14 h-14 rounded-full mx-auto flex items-center justify-center text-xl font-bold shadow-md">
          ▶
        </div>
        <div style="background:${panelBg}; border:1px solid ${borderCol}; color:${textMain};" class="text-[11px] font-mono px-2.5 py-1.5 rounded-xl truncate shadow-sm">
          stream_url: ${activeVideo.stream_url}
        </div>
        <div style="color:${textSub};" class="text-[10px] font-mono">
          Feed Item [${activeVideoIdx + 1}/${Math.max(feedList.length, 1)}] • ${isNightMode ? 'Night Mode' : 'Day Mode'}
        </div>
      </div>

      <!-- Right Action Rail + Bottom Metadata -->
      <div class="flex items-end justify-between gap-3">
        <div class="space-y-1.5 flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <button type="button" data-profile-handle="${activeVideo.creator?.username || '@alex_rivers_dev'}" class="font-bold text-sm hover:underline cursor-pointer">
              ${activeVideo.creator?.username || '@alex_rivers_dev'}
            </button>
            <button
              type="button"
              id="follow-creator-btn"
              style="background:${isFollowing ? panelBg : accent}; color:${isFollowing ? textMain : '#000'}; border:1px solid ${borderCol};"
              class="px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer"
            >
              ${isFollowing ? 'Following' : '+ Follow'}
            </button>
          </div>
          <p style="color:${textSub};" class="text-xs line-clamp-2">${activeVideo.caption}</p>
          <div style="color:${accent};" class="text-[11px] font-mono font-semibold truncate">♪ ${activeVideo.sound_title || 'Original Audio'}</div>
        </div>

        <div class="flex flex-col items-center gap-3">
          <button type="button" id="like-video-btn" class="flex flex-col items-center cursor-pointer">
            <span style="color:${isLiked ? accent : textMain};" class="text-2xl leading-none">♥</span>
            <span class="text-[10px] font-mono">${(activeVideo.likes_count || 1840) + (isLiked ? 1 : 0)}</span>
          </button>
          <button type="button" data-toggle-comments="true" class="flex flex-col items-center cursor-pointer">
            <span class="text-xl leading-none">💬</span>
            <span class="text-[10px] font-mono">${videoComments.length}</span>
          </button>
          <button type="button" data-toggle-share="true" class="flex flex-col items-center cursor-pointer">
            <span class="text-xl leading-none">↗</span>
            <span class="text-[10px] font-mono">Share</span>
          </button>
        </div>
      </div>

      ${
        showCommentsDrawer
          ? `
        <div style="background:${panelBg}; border-top:1px solid ${borderCol}; color:${textMain};" class="absolute inset-x-0 bottom-0 p-3.5 rounded-t-2xl space-y-2.5 z-20 shadow-xl">
          <div class="flex justify-between items-center text-xs font-bold">
            <span>${videoComments.length} Comments</span>
            <button type="button" data-toggle-comments="true" style="color:${textSub};" class="cursor-pointer">✕</button>
          </div>
          <div class="max-h-32 overflow-y-auto space-y-1.5 text-xs">
            ${videoComments
              .map(
                (c: any) => `
              <div><strong style="color:${accent};">${c.user}</strong>: ${escapeHtml(c.text)}</div>
            `
              )
              .join('')}
          </div>
          <form id="add-comment-form" class="flex gap-1.5">
            <input id="comment-input" type="text" placeholder="Add comment..." style="background:${phoneBg}; border:1px solid ${borderCol}; color:${textMain};" class="flex-1 rounded-lg px-2.5 py-1 text-xs" />
            <button type="submit" style="background:${accent}; color:#000;" class="px-3 py-1 rounded-lg text-xs font-bold cursor-pointer">Post</button>
          </form>
        </div>
      `
          : ''
      }

      ${
        showShareDrawer
          ? `
        <div style="background:${panelBg}; border-top:1px solid ${borderCol}; color:${textMain};" class="absolute inset-x-0 bottom-0 p-4 rounded-t-2xl space-y-2.5 z-20 shadow-xl">
          <div class="flex justify-between items-center text-xs font-bold">
            <span>Share stream_url</span>
            <button type="button" data-toggle-share="true" style="color:${textSub};" class="cursor-pointer">✕</button>
          </div>
          <div style="color:${accent};" class="text-[10px] font-mono truncate">${activeVideo.stream_url}</div>
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
