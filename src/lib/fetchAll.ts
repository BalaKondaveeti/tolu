const PAGE = 1000

interface PageResult<T> {
  data: T[] | null
  error: { message: string } | null
  status: number
}

// PostgREST caps responses at 1000 rows, so keep requesting ranges until a
// short page comes back.
export async function fetchAll<T>(page: (from: number, to: number) => PromiseLike<PageResult<T>>): Promise<T[]> {
  const rows: T[] = []
  for (let from = 0; ; from += PAGE) {
    const { data, error, status } = await page(from, from + PAGE - 1)
    if (error) throw Object.assign(new Error(error.message), { status })
    rows.push(...(data ?? []))
    if (!data || data.length < PAGE) break
  }
  return rows
}
