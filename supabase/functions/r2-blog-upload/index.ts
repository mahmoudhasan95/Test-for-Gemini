import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "npm:@aws-sdk/client-s3@3.621.0";
import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner@3.621.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
];

const MAX_FILE_SIZE = {
  author_profile: 5 * 1024 * 1024, // 5MB
  featured_image: 10 * 1024 * 1024, // 10MB
  content_image: 10 * 1024 * 1024, // 10MB
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const R2_ACCOUNT_ID = Deno.env.get("R2_ACCOUNT_ID");
    const R2_ACCESS_KEY_ID = Deno.env.get("R2_ACCESS_KEY_ID");
    const R2_SECRET_ACCESS_KEY = Deno.env.get("R2_SECRET_ACCESS_KEY");
    const R2_BUCKET_NAME = Deno.env.get("R2_BUCKET_NAME");
    const R2_PUBLIC_DOMAIN = Deno.env.get("R2_PUBLIC_DOMAIN");

    if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !R2_PUBLIC_DOMAIN) {
      throw new Error("Missing required R2 environment variables");
    }

    const s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });

    if (req.method === "DELETE") {
      const { fileUrl } = await req.json();

      if (!fileUrl) {
        return new Response(
          JSON.stringify({ error: "fileUrl is required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const url = new URL(fileUrl);
      const key = url.pathname.substring(1);

      const deleteCommand = new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      });

      await s3Client.send(deleteCommand);

      return new Response(
        JSON.stringify({ success: true, message: "File deleted successfully" }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { filename, contentType, uploadType } = await req.json();

    if (!filename || !contentType || !uploadType) {
      return new Response(
        JSON.stringify({ error: "filename, contentType, and uploadType are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate upload type
    if (!['featured_image', 'content_image', 'author_profile'].includes(uploadType)) {
      return new Response(
        JSON.stringify({ error: "uploadType must be 'featured_image', 'content_image', or 'author_profile'" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate content type
    if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
      return new Response(
        JSON.stringify({ error: "Only image files (JPEG, PNG, WebP, GIF) are allowed" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    
    // Determine folder based on upload type
    let folder = 'blog/';
    if (uploadType === 'author_profile') {
      folder = 'blog/authors/';
    } else if (uploadType === 'featured_image') {
      folder = 'blog/featured/';
    } else if (uploadType === 'content_image') {
      folder = 'blog/content/';
    }

    const key = `${folder}${timestamp}-${sanitizedFilename}`;

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    const publicUrl = `https://${R2_PUBLIC_DOMAIN}/${key}`;

    return new Response(
      JSON.stringify({
        presignedUrl,
        publicUrl,
        key,
        maxSize: MAX_FILE_SIZE[uploadType as keyof typeof MAX_FILE_SIZE]
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});