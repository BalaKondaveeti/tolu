import { useQuery } from '../lib/cache'
import { COUNTERS_KEY, fetchCounters } from './counters'

export function useCounters() {
  return useQuery(COUNTERS_KEY, fetchCounters)
}
