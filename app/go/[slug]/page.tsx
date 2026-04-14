import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function VendorGoPage({
  params,
}: {
  params: { slug: string }
}) {
  const supabase = createServerClient()
  const headersList = headers()

  const { data: vendor } = await supabase
    .from('vendors')
    .select('id, name, website, slug')
    .eq('slug', params.slug)
    .single()

  if (!vendor?.website) {
    redirect('/?error=vendor_not_found')
  }

  try {
    const referrer = headersList.get('referer') || null
    const ua = headersList.get('user-agent') || null
    await supabase.from('vendor_clicks').insert({
      vendor_id: vendor.id,
      slug: params.slug,
      referrer,
      user_agent: ua,
      clicked_at: new Date().toISOString(),
    })
  } catch {
    // Never block the redirect on tracking errors
  }

  redirect(vendor.website)
}
