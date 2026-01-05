"use client";

import { useState, useRef } from "react";

type Mode = "text-to-image" | "image-to-image";

const compressImage = (file: File, maxSize = 1024, quality = 0.8): Promise<File> => {
    return new Promise((resolve) => {
        const img = document.createElement("img");
        img.onload = () => {
            const canvas = document.createElement("canvas");
            let { width, height } = img;

            if (width > maxSize || height > maxSize) {
                if (width > height) {
                    height = (height / width) * maxSize;
                    width = maxSize;
                } else {
                    width = (width / height) * maxSize;
                    height = maxSize;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx?.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(new File([blob], file.name, { type: "image/jpeg" }));
                    } else {
                        resolve(file);
                    }
                },
                "image/jpeg",
                quality
            );
        };
        img.src = URL.createObjectURL(file);
    });
};

export default function Generator() {
    const [mode, setMode] = useState<Mode>("text-to-image");
    const [prompt, setPrompt] = useState("");
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const compressed = await compressImage(file);
            setSelectedImage(compressed);
            const url = URL.createObjectURL(compressed);
            setPreviewUrl(url);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            let response;

            if (mode === "image-to-image" && selectedImage) {
                const formData = new FormData();
                formData.append("prompt", prompt);
                formData.append("image", selectedImage);

                response = await fetch("/api/generate", {
                    method: "POST",
                    body: formData,
                });
            } else {
                response = await fetch("/api/generate", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ prompt }),
                });
            }

            if (!response.ok) {
                throw new Error("Failed to generate");
            }

            const data = await response.json();
            setResult(data.result);

        } catch (error) {
            console.error("Error generating:", error);
            alert("Error generating content. Please check console.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel" style={{ maxWidth: "800px", margin: "0 auto", width: "100%" }}>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", justifyContent: "center", flexWrap: "wrap" }}>
                <button
                    className={mode === "text-to-image" ? "btn-primary" : ""}
                    onClick={() => setMode("text-to-image")}
                    style={{
                        background: mode === "text-to-image" ? undefined : "transparent",
                        border: "1px solid var(--surface-border)",
                        padding: "0.5rem 1rem",
                        color: "white",
                        borderRadius: "8px",
                        cursor: "pointer"
                    }}
                >
                    Text to Image
                </button>
                <button
                    className={mode === "image-to-image" ? "btn-primary" : ""}
                    onClick={() => setMode("image-to-image")}
                    style={{
                        background: mode === "image-to-image" ? undefined : "transparent",
                        border: "1px solid var(--surface-border)",
                        padding: "0.5rem 1rem",
                        color: "white",
                        borderRadius: "8px",
                        cursor: "pointer"
                    }}
                >
                    Image to Image
                </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {mode === "image-to-image" && (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            border: "2px dashed var(--surface-border)",
                            borderRadius: "12px",
                            padding: "2rem",
                            textAlign: "center",
                            cursor: "pointer",
                            background: "rgba(0,0,0,0.2)",
                            position: "relative",
                            minHeight: "200px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageSelect}
                            accept="image/*"
                            style={{ display: "none" }}
                        />
                        {previewUrl ? (
                            <img
                                src={previewUrl}
                                alt="Selected"
                                style={{ maxWidth: "100%", maxHeight: "300px", borderRadius: "8px" }}
                            />
                        ) : (
                            <div>
                                <p>Click to upload an image</p>
                                <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>JPG, PNG supported</span>
                            </div>
                        )}
                    </div>
                )}

                <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>Prompt</label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={mode === "text-to-image" ? "Describe the image you want to gae" : "Describe how to gae the image..."}
                        rows={4}
                        required
                    />
                </div>

                <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", padding: "1rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                    {loading ? (
                        <>
                            <span className="spinning" style={{ fontSize: "1.5rem", display: "inline-block" }}>😼</span>
                            <span className="loading-dots">Generating</span>
                        </>
                    ) : (
                        "Generate Gae"
                    )}
                </button>
            </form>

            {result && (
                <div style={{ marginTop: "2rem", textAlign: "center" }} className="glass-panel">
                    <h3 style={{ marginBottom: "1.5rem" }}>Result</h3>

                    {result.startsWith("data:image") ? (
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <img src={result} alt="Generated Art" style={{ maxWidth: "100%", borderRadius: "8px", border: "1px solid var(--surface-border)" }} />
                        </div>
                    ) : (
                        <div style={{ whiteSpace: "pre-wrap", background: "rgba(0,0,0,0.3)", padding: "1rem", borderRadius: "8px", textAlign: "left" }}>
                            {result}
                        </div>
                    )}

                    {result.startsWith("data:image") && (
                        <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "center" }}>
                            <a
                                href={result}
                                download={`onara-art-${Date.now()}.png`}
                                style={{
                                    textDecoration: "none",
                                    color: "var(--primary-glow)",
                                    border: "1px solid var(--primary-glow)",
                                    padding: "0.75rem 2rem",
                                    borderRadius: "8px",
                                    fontSize: "1rem",
                                    cursor: "pointer",
                                    whiteSpace: "nowrap",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    background: "rgba(180, 65, 255, 0.1)",
                                    width: "100%",
                                    justifyContent: "center",
                                    maxWidth: "300px"
                                }}
                            >
                                Download Image
                            </a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
