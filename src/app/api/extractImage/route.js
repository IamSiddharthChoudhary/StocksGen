import axios from "axios";
import { NextResponse } from "next/server";

async function downloadImageAsBase64(url) {
  try {
    const response = await axios({
      url,
      method: "GET",
      responseType: "arraybuffer",
    });

    const base64Image = Buffer.from(response.data, "binary").toString("base64");

    const contentType = response.headers["content-type"];
    return `data:${contentType};base64,${base64Image}`;
  } catch (error) {
    console.error("Error downloading the image:", error);
    throw new Error("Failed to download and encode the image.");
  }
}

export async function POST(req) {
  const { imageUrl } = await req.json();

  if (!imageUrl || typeof imageUrl !== "string") {
    return NextResponse.json({
      error: 'Missing or invalid "imageUrl" query parameter.',
    });
  }

  try {
    const base64EncodedImage = await downloadImageAsBase64(imageUrl);
    return NextResponse.json({ base64Image: base64EncodedImage });
  } catch (error) {
    return NextResponse.json({ error: error.message });
  }
}

export async function GET() {
  return NextResponse.json({ Shukar: "maalik da" });
}
