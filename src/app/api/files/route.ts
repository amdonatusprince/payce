import { NextResponse, type NextRequest } from "next/server";
import { pinata } from "@/utils/config"

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Upload to Pinata
    const uploadData = await pinata.upload.file(file);
    
    if (!uploadData || !uploadData.IpfsHash) {
      throw new Error("Failed to upload to IPFS");
    }

    // Get the gateway URL
    const url = await pinata.gateways.convert(uploadData.IpfsHash);
    
    return NextResponse.json({
      cid: uploadData.IpfsHash,
      url: url
    }, { status: 200 });
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
