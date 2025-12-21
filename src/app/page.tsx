import Generator from "@/components/Generator";

export default function Home() {
  return (
    <div className="container" style={{ paddingTop: "4rem" }}>
      <header style={{ textAlign: "center", marginBottom: "4rem" }}>
        <h1>ONARA</h1>
        <p style={{ fontSize: "1.2rem", opacity: 0.8 }}>
          FART wit Gemini Nigga
        </p>
      </header>

      <main>
        <Generator />
      </main>
    </div>
  );
}
