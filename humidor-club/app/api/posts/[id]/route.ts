import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/posts/[id]
 * Get a single post with comments
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

    const { id } = await context.params;

    const post = await prisma.post.findUnique({
      where: { id, is_deleted: false },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        cigar: {
          select: {
            id: true,
            vitola: true,
            line: {
              select: {
                name: true,
                brand: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        humidorItem: {
          select: {
            id: true,
            quantity: true,
            cigar: {
              select: {
                id: true,
                vitola: true,
                line: {
                  select: {
                    name: true,
                    brand: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            comments: {
              where: {
                is_deleted: false,
              },
            },
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      post: {
        ...post,
        image_urls: post.image_urls ? JSON.parse(post.image_urls) : [],
        comment_count: post._count.comments,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/posts/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/posts/[id]
 * Update a post (only by owner)
 */
export async function PATCH(
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

    const { id } = await context.params;
    const body = await request.json();

    // Check ownership
    const post = await prisma.post.findUnique({
      where: { id },
      select: { user_id: true },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    if (post.user_id !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const updateData: any = {};
    if (body.content !== undefined) {
      updateData.content = body.content.trim();
    }
    if (body.image_urls !== undefined) {
      const imageUrls = Array.isArray(body.image_urls)
        ? body.image_urls
        : typeof body.image_urls === 'string'
        ? JSON.parse(body.image_urls)
        : [];
      updateData.image_urls = imageUrls.length > 0 ? JSON.stringify(imageUrls) : null;
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        cigar: {
          select: {
            id: true,
            vitola: true,
            line: {
              select: {
                name: true,
                brand: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        humidorItem: {
          select: {
            id: true,
            quantity: true,
            cigar: {
              select: {
                id: true,
                vitola: true,
                line: {
                  select: {
                    name: true,
                    brand: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            comments: {
              where: {
                is_deleted: false,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      post: {
        ...updatedPost,
        image_urls: updatedPost.image_urls ? JSON.parse(updatedPost.image_urls) : [],
        comment_count: updatedPost._count.comments,
      },
    });
  } catch (error: any) {
    console.error('Error in PATCH /api/posts/[id]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update post' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/posts/[id]
 * Soft delete a post (only by owner)
 */
export async function DELETE(
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

    const { id } = await context.params;

    // Check ownership
    const post = await prisma.post.findUnique({
      where: { id },
      select: { user_id: true },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    if (post.user_id !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await prisma.post.update({
      where: { id },
      data: {
        is_deleted: true,
        deleted_at: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/posts/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}

