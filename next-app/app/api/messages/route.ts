
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const otherUserId = searchParams.get('userId')
    
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Step 1: Fetch messages with basic data
    let query = supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true })

    if (otherUserId) {
      query = query.or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
    } else {
      query = query.eq('receiver_id', user.id)
    }

    const { data: messages, error: messagesError } = await query

    if (messagesError) {
      console.error('Error fetching messages:', messagesError)
      return NextResponse.json({ error: messagesError.message }, { status: 500 })
    }

    if (!messages || messages.length === 0) {
      return NextResponse.json({ messages: [] })
    }

    // Step 2: Fetch unique user IDs and product IDs to get their names
    const userIds = Array.from(new Set([
      ...messages.map(m => m.sender_id),
      ...messages.map(m => m.receiver_id)
    ])).filter(Boolean) as string[]

    const productIds = Array.from(new Set(
      messages.map(m => m.product_id)
    )).filter(Boolean) as string[]

    // Use service role client to fetch more reliably if available
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const adminSupabase = serviceRoleKey 
      ? createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          serviceRoleKey,
          { cookies: { get: () => undefined } }
        )
      : supabase

    // Fetch user names from public.users table
    const { data: userData } = await adminSupabase
      .from('users')
      .select('id, full_name, email')
      .in('id', userIds)

    // Also fetch from dealer_profiles as a fallback or for dealers
    const { data: dealerData } = await adminSupabase
      .from('dealer_profiles')
      .select('user_id, full_name')
      .in('user_id', userIds)

    const userMap = new Map()
    
    // First pass: metadata from userData
    userData?.forEach(u => {
      if (u.full_name && u.full_name !== 'User') {
        userMap.set(u.id, u.full_name)
      }
    })
    
    // Second pass: metadata from dealerData (often more up to date for dealers)
    dealerData?.forEach(d => {
      if (d.full_name && d.full_name !== 'Agro-Dealer' && (!userMap.has(d.user_id) || userMap.get(d.user_id) === 'User')) {
        userMap.set(d.user_id, d.full_name)
      }
    })

    // Third pass: if still missing, try to get from auth.users (if using admin client)
    if (serviceRoleKey && adminSupabase) {
      for (const id of userIds) {
        if (!userMap.has(id)) {
          try {
            const { data: { user: authUser } } = await (adminSupabase as any).auth.admin.getUserById(id)
            if (authUser?.user_metadata?.full_name) {
              userMap.set(id, authUser.user_metadata.full_name)
            } else if (authUser?.email) {
              // Last resort: use name part of email
              const nameFromEmail = authUser.email.split('@')[0]
              userMap.set(id, nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1))
            }
          } catch (e) {
            console.error('Error fetching auth metadata for user:', id, e)
          }
        }
      }
    }

    // Fetch product names
    let productMap = new Map()
    if (productIds.length > 0) {
      const { data: prodData } = await adminSupabase
        .from('products')
        .select('id, name')
        .in('id', productIds)
      productMap = new Map(prodData?.map(p => [p.id, p]) || [])
    }

    // Step 3: Transform messages to include the names
    const transformedMessages = messages.map(m => {
      const senderName = userMap.get(m.sender_id) || 'User'
      const receiverName = userMap.get(m.receiver_id) || 'User'
      
      return {
        ...m,
        sender: { full_name: senderName },
        receiver: { full_name: receiverName },
        product: m.product_id ? productMap.get(m.product_id) : null
      }
    })

    return NextResponse.json({ messages: transformedMessages })
  } catch (error) {
    console.error('Messages API exception:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  console.log('📨 POST /api/messages called')
  try {
    const cookieStore = await cookies()
    const body = await request.json()
    console.log('📦 Message body:', body)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('❌ Auth error:', userError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!body.receiverId || !body.content) {
      return NextResponse.json({ error: 'Receiver ID and content are required' }, { status: 400 })
    }

    // Prepare message object
    const messageData: any = {
      sender_id: user.id,
      receiver_id: body.receiverId,
      content: body.content,
      is_read: false
    }

    // Only add product_id if it's a valid UUID
    if (body.productId && body.productId.length > 10) {
      messageData.product_id = body.productId
    }

    console.log('🚀 Attempting insert:', messageData)

    const { data, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single()

    if (error) {
      console.error('❌ Supabase insert error:', error)
      
      // If it fails because product_id column doesn't exist yet, try without it
      if (error.message?.includes('column "product_id" does not exist')) {
        console.log('⚠️ Retrying without product_id...')
        delete messageData.product_id
        const { data: retryData, error: retryError } = await supabase
          .from('messages')
          .insert(messageData)
          .select()
          .single()
          
        if (retryError) {
          console.error('❌ Retry failed:', retryError)
          return NextResponse.json({ error: retryError.message }, { status: 500 })
        }
        return NextResponse.json({ message: retryData })
      }

      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('✅ Message sent successfully')
    return NextResponse.json({ message: data })
  } catch (error: any) {
    console.error('❌ Messages POST exception:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
