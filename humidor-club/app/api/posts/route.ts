import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/posts
 * Get all posts (community feed)
 * Query params: limit, cursor (for pagination)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const cursor = searchParams.get('cursor');

    const where: any = {
      is_deleted: false,
    };

    const posts = await prisma.post.findMany({
      where,
      take: limit + 1, // Take one extra to check if there's more
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      orderBy: { created_at: 'desc' },
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

    // Check if there are more posts
    const hasMore = posts.length > limit;
    const postsToReturn = hasMore ? posts.slice(0, limit) : posts;

    // Parse image_urls from JSON string
    const postsWithParsedImages = postsToReturn.map(post => ({
      ...post,
      image_urls: post.image_urls ? JSON.parse(post.image_urls) : [],
      comment_count: post._count.comments,
    }));

    return NextResponse.json({
      success: true,
      posts: postsWithParsedImages,
      nextCursor: hasMore ? postsToReturn[postsToReturn.length - 1].id : null,
    });
  } catch (error) {
    console.error('Error in GET /api/posts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/posts
 * Create a new post
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content, image_urls, cigar_id, humidor_item_id } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      );
    }

    // Validate image_urls is an array
    let parsedImageUrls: string[] = [];
    if (image_urls) {
      if (Array.isArray(image_urls)) {
        parsedImageUrls = image_urls;
      } else if (typeof image_urls === 'string') {
        try {
          parsedImageUrls = JSON.parse(image_urls);
        } catch {
          parsedImageUrls = [image_urls];
        }
      }
    }

    // If humidor_item_id is provided, verify ownership and get cigar_id
    let finalCigarId = cigar_id;
    if (humidor_item_id) {
      const humidorItem = await prisma.humidorItem.findUnique({
        where: { id: humidor_item_id },
        include: {
          cigar: true,
        },
      });

      if (!humidorItem) {
        return NextResponse.json(
          { success: false, error: 'Humidor item not found' },
          { status: 404 }
        );
      }

      if (humidorItem.user_id !== session.user.id) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 403 }
        );
      }

      // Use the cigar_id from the humidor item if not provided
      if (!finalCigarId) {
        finalCigarId = humidorItem.cigar_id;
      }
    }

    const post = await prisma.post.create({
      data: {
        user_id: session.user.id,
        content: content.trim(),
        image_urls: parsedImageUrls.length > 0 ? JSON.stringify(parsedImageUrls) : null,
        cigar_id: finalCigarId || null,
        humidor_item_id: humidor_item_id || null,
      },
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
        ...post,
        image_urls: post.image_urls ? JSON.parse(post.image_urls) : [],
        comment_count: post._count.comments,
      },
    });
  } catch (error: any) {
    console.error('Error in POST /api/posts:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create post' },
      { status: 500 }
    );
  }
}

