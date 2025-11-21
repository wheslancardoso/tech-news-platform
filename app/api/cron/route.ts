import { generateNewsletterService } from '@/lib/services/newsletter'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  
  // Segurança: Verifica o Bearer Token
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    await generateNewsletterService()
    return NextResponse.json({ success: true, message: 'Newsletter generated successfully' })
  } catch (error) {
    console.error('Cron Job Error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to generate newsletter' },
      { status: 500 }
    )
  }
}

