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
  
  // Fetch all tables in parallel for maximum speed
  const [icecreamResult, milkteaResult, floatResult, juiceResult] = await Promise.all([
    supabase.from('ice-cream').select('*').order('id', { ascending: true }),
    supabase.from('milk-tea').select('*').order('id', { ascending: true }),
    supabase.from('float').select('*').order('id', { ascending: true }),
    supabase.from('juice').select('*').order('id', { ascending: true })
  ])

  // Check for errors
  if (icecreamResult.error) throw new Error(`Failed to load ice-cream: ${icecreamResult.error.message}`)
  if (milkteaResult.error) throw new Error(`Failed to load milk-tea: ${milkteaResult.error.message}`)
  if (floatResult.error) throw new Error(`Failed to load float: ${floatResult.error.message}`)
  if (juiceResult.error) throw new Error(`Failed to load juice: ${juiceResult.error.message}`)

  return {
    icecream: (icecreamResult.data || []) as DatabaseRow[],
    milktea: (milkteaResult.data || []) as DatabaseRow[],
    float: (floatResult.data || []) as DatabaseRow[],
    juice: (juiceResult.data || []) as DatabaseRow[]
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
