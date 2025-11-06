import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { put } from '@vercel/blob';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'cigars');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Check if we're in a serverless environment (Vercel)
const isServerless = process.env.VERCEL === '1' || !!process.env.BLOB_READ_WRITE_TOKEN;

// Ensure upload directory exists (only for local development)
async function ensureUploadDir() {
  if (!isServerless && !existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const filename = `cigars/${timestamp}-${randomStr}.${extension}`;

    let url: string;

    if (isServerless) {
      // Use Vercel Blob Storage for serverless environments
      const token = process.env.BLOB_READ_WRITE_TOKEN;
      if (!token) {
        throw new Error('BLOB_READ_WRITE_TOKEN environment variable is required for Vercel Blob storage');
      }
      const blob = await put(filename, file, {
        access: 'public',
        contentType: file.type,
        token, // Pass the token explicitly
      });
      url = blob.url;
      console.log('✅ Image uploaded to Vercel Blob:', url);
    } else {
      // Use local filesystem for development
      await ensureUploadDir();
      const filepath = join(UPLOAD_DIR, filename.split('/').pop()!);
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);
      url = `/uploads/${filename}`;
      console.log('✅ Image uploaded locally:', url);
    }

    return NextResponse.json({
      success: true,
      url,
      filename: filename.split('/').pop(),
    });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}

