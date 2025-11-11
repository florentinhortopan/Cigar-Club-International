import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/posts/[id]/comments
 * Get all comments for a post
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: postId } = await context.params;

    // Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: postId, is_deleted: false },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    const comments = await prisma.comment.findMany({
      where: {
        post_id: postId,
        is_deleted: false,
      },
      orderBy: { created_at: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      comments,
    });
  } catch (error) {
    console.error('Error in GET /api/posts/[id]/comments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/posts/[id]/comments
 * Create a new comment on a post
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: postId } = await context.params;
    const body = await request.json();
    const { content, image_url } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      );
    }

    // Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: postId, is_deleted: false },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        post_id: postId,
        user_id: session.user.id,
        content: content.trim(),
        image_url: image_url || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Update post comment count
    await prisma.post.update({
      where: { id: postId },
      data: {
        comment_count: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({
      success: true,
      comment,
    });
  } catch (error: any) {
    console.error('Error in POST /api/posts/[id]/comments:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create comment' },
      { status: 500 }
    );
  }
}

