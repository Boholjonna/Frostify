<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Define the generic type for database rows
export interface DatabaseRow {
  id: number
  flavor: string
  'price-s': string
  'price-m': string
  'price-l': string
  bg: string
  image: string
  'text-color': string
  'price-bgcolor': string
  overlay?: string
}

// Props for the component
interface Props {
  tableName: string
  columns?: string
  startId?: number
  orderBy?: string
}

const props = withDefaults(defineProps<Props>(), {
  columns: '*',
  startId: undefined,
  orderBy: 'id'
})

// Emits for the component
const emit = defineEmits<{
  dataLoaded: [data: DatabaseRow[]]
  rowChanged: [row: DatabaseRow | null]
  error: [error: string]
  loading: [isLoading: boolean]
}>()

// Reactive state
const data = ref<DatabaseRow[]>([])
const loading = ref(true)
const error = ref('')
const currentIndex = ref(0)
const currentRow = computed<DatabaseRow | null>(() => {
  if (!data.value.length) return null
  return data.value[currentIndex.value]
})

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

let supabase: SupabaseClient | null = null

// Function to fetch data from database
const fetchData = async () => {
  try {
    loading.value = true
    error.value = ''

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase environment variables are missing. Define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
    }

    if (!supabase) {
      supabase = createClient(supabaseUrl, supabaseAnonKey)
    }

    const { data: fetchedData, error: fetchError } = await supabase
      .from(props.tableName)
      .select(props.columns)
      .order(props.orderBy, { ascending: true })

    if (fetchError) throw fetchError

    if (fetchedData && Array.isArray(fetchedData)) {
      data.value = fetchedData as unknown as DatabaseRow[]
      // initialize current index by startId if provided
      if (typeof props.startId === 'number') {
        const idx = data.value.findIndex(r => r.id === props.startId)
        currentIndex.value = idx >= 0 ? idx : 0
      } else {
        currentIndex.value = 0
      }
      emit('dataLoaded', data.value)
      emit('rowChanged', currentRow.value)
    } else {
      throw new Error(`No data returned from table '${props.tableName}'. Check table data and RLS policies.`)
    }
  } catch (err: any) {
    console.error(`Failed loading data from ${props.tableName}:`, err)
    error.value = err?.message ?? `Failed to load data from ${props.tableName}.`
    emit('error', error.value)
  } finally {
    loading.value = false
    emit('loading', loading.value)
  }
}

// Fetch data on mount
onMounted(() => {
  fetchData()
})

// Expose methods for parent components
defineExpose({
  fetchData,
  nextRow: () => {
    if (!data.value.length) return
    currentIndex.value = (currentIndex.value + 1) % data.value.length
    emit('rowChanged', currentRow.value)
  },
  prevRow: () => {
    if (!data.value.length) return
    currentIndex.value = (currentIndex.value - 1 + data.value.length) % data.value.length
    emit('rowChanged', currentRow.value)
  },
  data,
  currentRow,
  loading,
  error
})

// React to startId prop changes
watch(() => props.startId, (newVal) => {
  if (!data.value.length) return
  if (typeof newVal === 'number') {
    const idx = data.value.findIndex(r => r.id === newVal)
    if (idx >= 0) {
      currentIndex.value = idx
      emit('rowChanged', currentRow.value)
    }
  }
})
</script>

<template>
  <!-- This component doesn't render anything, it's just for data fetching -->
</template>
