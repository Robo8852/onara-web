import Generator from "@/components/Generator";

export default function Home() {
  return (
    <div className="container" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", paddingBottom: "2rem" }}>
      <header style={{ textAlign: "center", marginBottom: "2rem", marginTop: "2rem" }}>
        <h1>ONARA</h1>
        <p style={{ fontSize: "1.2rem", opacity: 0.8 }}>
          It's boo boo time!
        </p>
      </header>

      <main>
        <Generator />
      </main>
    </div>
  );
}
