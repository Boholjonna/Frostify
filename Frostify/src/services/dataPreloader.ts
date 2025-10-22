import { getSupabaseClient } from './supabase'
import type { DatabaseRow } from '../components/Getdata.vue'

export interface PreloadedData {
  icecream: DatabaseRow[]
  milktea: DatabaseRow[]
  float: DatabaseRow[]
  juice: DatabaseRow[]
}

/**
 * Preload all data from all tables before rendering
 * This ensures smooth UX by loading everything upfront
 */
export async function preloadAllData(): Promise<PreloadedData> {
  const supabase = getSupabaseClient()
  // Select only the columns used by Layout.vue to reduce payload size
  // Some tables (float, juice) have 'overlay'; others do not.
  const COLUMNS_BASE = [
    'id',
    'flavor',
    'image',
    'bg',
    'price-s',
    'price-m',
    'price-l',
    'price-bgcolor',
    'text-color'
  ].join(',')
  const COLUMNS_WITH_OVERLAY = `${COLUMNS_BASE},overlay`
  
  // Fetch all tables in parallel for maximum speed
  const [icecreamResult, milkteaResult, floatResult, juiceResult] = await Promise.all([
    supabase.from('ice-cream').select(COLUMNS_BASE).order('id', { ascending: true }),
    supabase.from('milk-tea').select(COLUMNS_BASE).order('id', { ascending: true }),
    supabase.from('float').select(COLUMNS_WITH_OVERLAY).order('id', { ascending: true }),
    supabase.from('juice').select(COLUMNS_WITH_OVERLAY).order('id', { ascending: true })
  ])

  // Check for errors
  if (icecreamResult.error) throw new Error(`Failed to load ice-cream: ${icecreamResult.error.message}`)
  if (milkteaResult.error) throw new Error(`Failed to load milk-tea: ${milkteaResult.error.message}`)
  if (floatResult.error) throw new Error(`Failed to load float: ${floatResult.error.message}`)
  if (juiceResult.error) throw new Error(`Failed to load juice: ${juiceResult.error.message}`)

  return {
    icecream: ((icecreamResult.data || []) as unknown) as DatabaseRow[],
    milktea: ((milkteaResult.data || []) as unknown) as DatabaseRow[],
    float: ((floatResult.data || []) as unknown) as DatabaseRow[],
    juice: ((juiceResult.data || []) as unknown) as DatabaseRow[]
  }
}

/**
 * Preload all images from the data
 */
export async function preloadAllImages(data: PreloadedData): Promise<void> {
  const imageUrls = new Set<string>()
  
  // Collect all unique image URLs from all tables
  Object.values(data).forEach(tableData => {
    tableData.forEach((item: DatabaseRow) => {
      if (item.image) imageUrls.add(item.image)
      if (item.bg) imageUrls.add(item.bg)
      if (item.overlay) imageUrls.add(item.overlay)
    })
  })

  // Preload all images in parallel
  const promises = Array.from(imageUrls).map(url => {
    return new Promise<void>((resolve) => {
      const img = new Image()
      // Hint the browser that these are non-critical warmups
      ;(img as any).decoding = 'async'
      try { (img as any).fetchPriority = 'low' } catch {}
      img.onload = () => resolve()
      img.onerror = () => {
        console.warn(`Failed to preload image: ${url}`)
        resolve() // Continue even if an image fails
      }
      img.src = url
    })
  })

  await Promise.all(promises)
}

/**
 * Preload only the first/primary images to speed up initial render.
 * The rest can be warmed in the background.
 */
export async function preloadCriticalImages(data: PreloadedData): Promise<void> {
  const criticalUrls: string[] = []
  const firstOf = (rows: DatabaseRow[]) => (rows && rows.length ? rows[0] : null)

  const firstIce = firstOf(data.icecream)
  const firstMilk = firstOf(data.milktea)
  const firstFloat = firstOf(data.float)
  const firstJuice = firstOf(data.juice)

  ;[firstIce, firstMilk, firstFloat, firstJuice].forEach(item => {
    if (!item) return
    if (item.bg) criticalUrls.push(item.bg)
    if (item.image) criticalUrls.push(item.image)
    if (item.overlay) criticalUrls.push(item.overlay)
  })

  const promises = criticalUrls.map(url => {
    return new Promise<void>((resolve) => {
      const img = new Image()
      // Critical images should be fetched with higher priority
      ;(img as any).decoding = 'async'
      try { (img as any).fetchPriority = 'high' } catch {}
      img.onload = () => resolve()
      img.onerror = () => resolve()
      img.src = url
    })
  })

  await Promise.all(promises)
}
