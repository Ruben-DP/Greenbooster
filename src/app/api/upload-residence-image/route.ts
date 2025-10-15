import { NextRequest, NextResponse } from "next/server";
// highlight-start
// REMOVE: Filesystem imports are no longer needed
// import { writeFile, mkdir } from "fs/promises";
// import { join } from "path";
// import { existsSync } from "fs";

// ADD: Import the 'put' function from Vercel Blob
import { put } from '@vercel/blob';
// highlight-end

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // --- All your validation logic can stay exactly the same ---
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ success: false, error: "File size exceeds 5MB limit" }, { status: 400 });
    }
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: "Invalid file type. Only images are allowed" }, { status: 400 });
    }

    // --- Create unique filename (this is still a good idea) ---
    const timestamp = Date.now();
    const originalName = file.name.replace(/\s+/g, "-");
    const filename = `${timestamp}-${originalName}`;
    
    // highlight-start
    // --- This is the new part that replaces all the fs commands ---
    
    // 1. Upload the file to Vercel Blob storage
    const blob = await put(filename, file, {
      access: 'public',
    });

    // 2. The 'blob' object contains the public URL. This is what you'll save in your database.
    const imagePath = blob.url;
    // highlight-end
    
    return NextResponse.json({
      success: true,
      // Return the full public URL from Vercel Blob
      data: { imagePath }
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 }
    );
  }
}