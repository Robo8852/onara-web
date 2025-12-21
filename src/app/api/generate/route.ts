
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
        return NextResponse.json(
            { error: "GOOGLE_API_KEY is not set in environment variables." },
            { status: 500 }
        );
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);

        // Check if we are handling a multipart form data request (file upload)
        const contentType = req.headers.get("content-type") || "";

        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            const prompt = formData.get("prompt") as string;
            const file = formData.get("image") as File;

            if (!file) {
                return NextResponse.json({ error: "No image file provided for image-to-image/text mode." }, { status: 400 });
            }

            // Convert file to base64
            const arrayBuffer = await file.arrayBuffer();
            const base64Data = Buffer.from(arrayBuffer).toString("base64");

            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const result = await model.generateContent([
                prompt,
                {
                    inlineData: {
                        data: base64Data,
                        mimeType: file.type,
                    },
                },
            ]);

            const response = await result.response;
            const text = response.text();

            return NextResponse.json({ result: text });
        } else {
            // JSON body for text-only
            const { prompt } = await req.json();

            if (!prompt) {
                return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
            }

            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            return NextResponse.json({ result: text });
        }
    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: error.message || "An error occurred during generation." },
            { status: 500 }
        );
    }
}
