export default function AboutPage() {
  const testPdfs = [
    "Nat Gilpin_42414.pdf",
    "Natalie DeCherney_14653.pdf",
    "Tracy Poddar_13856.pdf",
    "Troy Blackwell_18864.pdf",
    "Troy Staebel_25750.pdf",
    "Troy Staebel_30584.pdf",
    "Trudy Glocke_21435.pdf",
    "Trudy Schmidt_14380.pdf",
    "Valerie Takahito_22655.pdf",
    "Yana Sorensen_5434.pdf",
    "Yoseph Carroll_10563.pdf",
    "Yoseph Carroll_31061.pdf",
    "Zuschuss Carroll_15951.pdf",
  ];

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: "16px 16px 120px 16px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 16 }}>
        About this project
      </h1>

      {/* Introduction */}
      <section style={{ marginBottom: 40 }}>
        <p style={{ fontSize: 16, color: "var(--color-text-secondary)", marginBottom: 16, lineHeight: 1.6 }}>
          Larry is an intelligent document assistant that helps you find information in your PDF files. Unlike other 
          tools that often make up answers, Larry only responds when the information is actually available in your 
          documents. If it can&apos;t find what you&apos;re looking for, it tells you.
        </p>
      </section>

      {/* Creator */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 12 }}>
          Creator
        </h2>
        <p style={{ fontSize: 16, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
          Created by{" "}
          <a
            href="https://www.linkedin.com/in/imanol-maiztegui/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#2563eb", textDecoration: "none", fontWeight: 500 }}
          >
            Imanol Maiztegui
          </a>
          {" • "}
          <a
            href="mailto:imanol.mzd@gmail.com"
            style={{ color: "#2563eb", textDecoration: "none", fontWeight: 500 }}
          >
            imanol.mzd@gmail.com
          </a>
        </p>
      </section>

      {/* Source Code */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 12 }}>
          Source Code
        </h2>
        <p style={{ fontSize: 16, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
          The source code for this project is available on{" "}
          <a
            href="https://github.com/imanolmzd-svg/larry"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#2563eb", textDecoration: "none", fontWeight: 500 }}
          >
            GitHub
          </a>
        </p>
      </section>

      {/* Tech Stack */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 12 }}>
          Technologies
        </h2>
        <p style={{ fontSize: 16, color: "var(--color-text-secondary)", marginBottom: 24, lineHeight: 1.6 }}>
          Larry uses S3 storage, a message queue, and a worker to process PDFs into vector embeddings. 
          Questions are answered using vector search and an external LLM.
        </p>

        {/* Frontend Table */}
        <table style={{ 
          width: "100%", 
          borderCollapse: "collapse", 
          marginBottom: 24,
          fontSize: 15,
          color: "var(--color-text-secondary)"
        }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--card-border)" }}>
              <th style={{ textAlign: "left", padding: "12px 8px", fontWeight: 600, color: "var(--color-text-primary)", width: "33.33%" }}>
                Frontend
              </th>
              <th style={{ textAlign: "left", padding: "12px 8px", fontWeight: 600, color: "var(--color-text-primary)", width: "33.33%" }}>
                Dev
              </th>
              <th style={{ textAlign: "left", padding: "12px 8px", fontWeight: 600, color: "var(--color-text-primary)", width: "33.33%" }}>
                Prod
              </th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid var(--card-border)" }}>
              <td style={{ padding: "12px 8px", width: "33.33%" }}>Web Application</td>
              <td style={{ padding: "12px 8px", width: "33.33%" }}>Next.js + TypeScript + pnpm</td>
              <td style={{ padding: "12px 8px", width: "33.33%" }}>Vercel</td>
            </tr>
          </tbody>
        </table>

        {/* Backend Table */}
        <table style={{ 
          width: "100%", 
          borderCollapse: "collapse", 
          marginBottom: 24,
          fontSize: 15,
          color: "var(--color-text-secondary)"
        }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--card-border)" }}>
              <th style={{ textAlign: "left", padding: "12px 8px", fontWeight: 600, color: "var(--color-text-primary)", width: "33.33%" }}>
                Backend
              </th>
              <th style={{ textAlign: "left", padding: "12px 8px", fontWeight: 600, color: "var(--color-text-primary)", width: "33.33%" }}>
                Dev
              </th>
              <th style={{ textAlign: "left", padding: "12px 8px", fontWeight: 600, color: "var(--color-text-primary)", width: "33.33%" }}>
                Prod
              </th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid var(--card-border)" }}>
              <td style={{ padding: "12px 8px", width: "33.33%" }}>API Server</td>
              <td style={{ padding: "12px 8px", width: "33.33%" }}>Node.js + TypeScript + pnpm</td>
              <td style={{ padding: "12px 8px", width: "33.33%" }}>AWS EC2 (Docker)</td>
            </tr>
            <tr style={{ borderBottom: "1px solid var(--card-border)" }}>
              <td style={{ padding: "12px 8px", width: "33.33%" }}>File Storage</td>
              <td style={{ padding: "12px 8px", width: "33.33%" }}>MinIO</td>
              <td style={{ padding: "12px 8px", width: "33.33%" }}>AWS S3</td>
            </tr>
            <tr style={{ borderBottom: "1px solid var(--card-border)" }}>
              <td style={{ padding: "12px 8px", width: "33.33%" }}>Message Queue</td>
              <td style={{ padding: "12px 8px", width: "33.33%" }}>LocalStack SQS</td>
              <td style={{ padding: "12px 8px", width: "33.33%" }}>AWS SQS</td>
            </tr>
            <tr style={{ borderBottom: "1px solid var(--card-border)" }}>
              <td style={{ padding: "12px 8px", width: "33.33%" }}>Background Worker</td>
              <td style={{ padding: "12px 8px", width: "33.33%" }}>Node.js + TypeScript + pnpm</td>
              <td style={{ padding: "12px 8px", width: "33.33%" }}>AWS EC2 (Docker)</td>
            </tr>
            <tr style={{ borderBottom: "1px solid var(--card-border)" }}>
              <td style={{ padding: "12px 8px", width: "33.33%" }}>Real-time Updates</td>
              <td style={{ padding: "12px 8px", width: "33.33%" }}>Redis</td>
              <td style={{ padding: "12px 8px", width: "33.33%" }}>Upstash Redis</td>
            </tr>
            <tr style={{ borderBottom: "1px solid var(--card-border)" }}>
              <td style={{ padding: "12px 8px", width: "33.33%" }}>Database</td>
              <td style={{ padding: "12px 8px", width: "33.33%" }}>PostgreSQL + pgvector</td>
              <td style={{ padding: "12px 8px", width: "33.33%" }}>NeonDB + pgvector</td>
            </tr>
          </tbody>
        </table>

        {/* Additional Tools */}
        <p style={{ fontSize: 16, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
          Additional tools: Prisma (ORM), WebSockets, 
          <strong>OpenAI text-embedding-3-small</strong>, and <strong>OpenAI gpt-4o-mini</strong>.
        </p>
      </section>

      {/* AI Tools */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 12 }}>
          AI Tools
        </h2>
        <ul style={{ fontSize: 16, color: "var(--color-text-secondary)", lineHeight: 1.8, marginLeft: 20 }}>
          <li>ChatGPT - Architecture, Design and Copywriting</li>
          <li>Claude on Cursor - Detailed features</li>
        </ul>
      </section>

      {/* Next Features */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 12 }}>
          Next Incoming Features
        </h2>
        <ul style={{ fontSize: 16, color: "var(--color-text-secondary)", lineHeight: 1.8, marginLeft: 20 }}>
          <li>Stripe integration - Charge per question asked / File uploaded</li>
          <li>Google Login</li>
          <li>Support for .xlsx, .csv, .docx files</li>
          <li>PDF reader when file clicked, with source highlighted</li>
          <li>Improved styling and copywriting</li>
        </ul>
      </section>

      {/* Test PDFs Section */}
      <section style={{ marginTop: 40 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 16 }}>
          Test PDFs
        </h2>
        <p style={{ fontSize: 16, color: "var(--color-text-secondary)", marginBottom: 16, lineHeight: 1.5 }}>
          You can use the following test PDFs to try Larry:
        </p>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 8,
          }}
        >
          {testPdfs.map((pdf) => (
            <li key={pdf}>
              <a
                href={`/test-pdfs/${pdf}`}
                download
                style={{
                  display: "block",
                  padding: "8px 12px",
                  fontSize: 14,
                  color: "#2563eb",
                  textDecoration: "none",
                  background: "var(--card-bg)",
                  border: "1px solid var(--card-border)",
                  borderRadius: 6,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {pdf}
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA Section */}
      <section style={{ marginTop: 80, marginBottom: 120 }}>
        <p style={{ textAlign: "center", fontSize: 16, color: "var(--color-text-secondary)" }}>
          <a
            href="https://www.linkedin.com/in/imanol-maiztegui/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#2563eb",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Contact me
          </a>
        </p>
      </section>
    </main>
  );
}
