/*
 * Paper/canvas sizes for the card designer's size dropdown.
 *
 * Single source of truth: the dropdown and the preset→dimension lookup both derive
 * from `SIZE_PRESETS`. To add, remove, or reorder a size, edit this list — `dims` is
 * [width, height] in millimetres. `custom` has no `dims`; its size comes from the
 * width/height inputs instead.
 */
export type SizePreset = { key: string; label: string; dims?: [number, number] }

export const SIZE_PRESETS: SizePreset[] = [
  // ===== Print =====
  { key: '5x7', label: '5 × 7 in', dims: [127, 178] },
  { key: '5x7Horizontal', label: '5 × 7 in Horizontal', dims: [178, 127] },

  { key: 'a6', label: 'A6', dims: [105, 148] },
  { key: 'a6Horizontal', label: 'A6 Horizontal', dims: [148, 105] },

  { key: 'dl', label: 'DL', dims: [99, 210] },
  { key: 'dlHorizontal', label: 'DL Horizontal', dims: [210, 99] },

  { key: '5x5', label: '5 × 5 in', dims: [127, 127] },

  // ===== Instagram =====
  { key: 'instagramPost', label: 'Instagram Post (1:1)', dims: [127, 127] },
  { key: 'instagramPortrait', label: 'Instagram Portrait (4:5)', dims: [127, 159] },
  { key: 'instagramStory', label: 'Instagram Story (9:16)', dims: [108, 192] },

  // ===== Facebook =====
  { key: 'facebookPost', label: 'Facebook Post (1:1)', dims: [127, 127] },
  { key: 'facebookCover', label: 'Facebook Cover', dims: [210, 80] },
  { key: 'facebookStory', label: 'Facebook Story (9:16)', dims: [108, 192] },

  // ===== TikTok =====
  { key: 'tiktokVideo', label: 'TikTok Video (9:16)', dims: [108, 192] },

  // ===== Generic Digital =====
  { key: 'square', label: 'Square (1:1)', dims: [127, 127] },
  { key: 'portrait', label: 'Portrait (4:5)', dims: [127, 159] },
  { key: 'story', label: 'Story / Reel / TikTok (9:16)', dims: [108, 192] },

  // ===== Common Digital Formats =====
  { key: 'landscape', label: 'Landscape (16:9)', dims: [192, 108] },
  { key: 'youtubeThumbnail', label: 'YouTube Thumbnail (16:9)', dims: [192, 108] },

  // ===== Event & Flyer =====
  { key: 'flyer', label: 'Flyer (A5)', dims: [148, 210] },
  { key: 'flyerHorizontal', label: 'Flyer (A5 Horizontal)', dims: [210, 148] },

  { key: 'custom', label: 'Custom' },
]

/** Preset key → [width, height] in mm, for sizes that have fixed dimensions. */
export const SIZE_DIMENSIONS: Record<string, [number, number]> = Object.fromEntries(
  SIZE_PRESETS.flatMap((p) => (p.dims ? [[p.key, p.dims]] : []))
)

/** The size selected by default when a template carries no size of its own. */
export const DEFAULT_SIZE_PRESET = '5x7'
