import { NextRequest, NextResponse } from 'next/server';
import { getMagicLink } from '@/lib/magic-link-store';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    // Get email from query params or session
    const { searchParams } = new URL(request.url);
    const emailParam = searchParams.get('email');
    
    // Try to get email from session if not provided
    let email = emailParam;
    if (!email) {
      const session = await getServerSession(authOptions);
      email = session?.user?.email || null;
    }
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email required' },
        { status: 400 }
      );
    }
    
    const magicLink = getMagicLink(email);
    
    if (!magicLink) {
      return NextResponse.json(
        { success: false, error: 'No magic link found for this email' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      magicLink,
      email,
    });
  } catch (error: any) {
    console.error('Error getting magic link:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get magic link' },
      { status: 500 }
    );
  }
}


