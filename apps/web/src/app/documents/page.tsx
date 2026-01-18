import { DocumentUpload } from "@/ui/documents/DocumentUpload";
import { ChatWindow } from "@/ui/chat/ChatWindow";

export default function DocumentsPage() {
  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>
        Documents
      </h1>

      <DocumentUpload />

      <div style={{ marginTop: 40 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
          Ask Questions
        </h2>
        <ChatWindow />
      </div>
    </main>
  );
}
