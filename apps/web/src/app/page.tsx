"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/shared/auth";

type ContentBlockProps = {
  title: string;
  subtitle?: string;
  content: string | React.ReactNode;
  videoOnLeft: boolean;
  cta?: { text: string; href: string };
  withBackground?: boolean;
};

function ContentBlock({ title, subtitle, content, videoOnLeft, cta, withBackground }: ContentBlockProps) {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: videoOnLeft ? "row" : "row-reverse",
        gap: "5%",
        alignItems: "center",
        padding: withBackground ? "80px 60px" : "0",
        margin: withBackground ? "0 -60px 120px -60px" : "0 0 120px 0",
        background: withBackground ? "var(--card-bg)" : "transparent",
      }}
      className="content-block"
    >
      {/* Video Placeholder */}
      <div
        style={{
          width: "40%",
          aspectRatio: "16/9",
          background: "#e0e0e0",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#999",
          fontSize: 14,
          flexShrink: 0,
        }}
        className="video-placeholder"
      >
        Video placeholder
      </div>

      {/* Content */}
      <div style={{ width: "55%", display: "flex", flexDirection: "column", gap: 16 }} className="content-text">
        <h2 style={{ fontSize: 32, fontWeight: 700, color: "var(--color-text-primary)", margin: 0 }}>
          {title}
        </h2>
        {subtitle && (
          <h3
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: "var(--color-text-primary)",
              margin: 0,
            }}
          >
            {subtitle}
          </h3>
        )}
        <div style={{ fontSize: 16, lineHeight: 1.6, color: "var(--color-text-secondary)" }}>
          {content}
        </div>
        {cta && (
          <Link
            href={cta.href}
            style={{
              display: "inline-block",
              padding: "12px 24px",
              fontSize: 16,
              fontWeight: 600,
              background: "#2563eb",
              color: "white",
              textDecoration: "none",
              borderRadius: 8,
              textAlign: "center",
              width: "fit-content",
              cursor: "pointer",
            }}
          >
            {cta.text}
          </Link>
        )}
      </div>
    </section>
  );
}

function HomeContent() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromNav = searchParams.get("from") === "nav";

  useEffect(() => {
    if (!isLoading && user && !fromNav) {
      router.push("/chat");
    }
  }, [user, isLoading, router, fromNav]);

  if (isLoading) {
    return <div style={{ padding: "80px 16px", textAlign: "center" }}>Loading...</div>;
  }

  const ctaHref = user ? "/chat" : "/login";

  return (
    <>
      <style jsx>{`
        @media (max-width: 768px) {
          .content-block {
            flex-direction: column !important;
            gap: 24px !important;
          }
          .video-placeholder {
            width: 100% !important;
          }
          .content-text {
            width: 100% !important;
          }
          .hero-title {
            font-size: 32px !important;
          }
        }
      `}</style>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 60px" }}>
        {/* Introduction Section with Larry */}
        <section
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "5%",
            alignItems: "center",
            marginBottom: 120,
          }}
          className="content-block"
        >
          <div style={{ width: "55%", display: "flex", flexDirection: "column", gap: 16 }} className="content-text">
            <h1
              style={{
                fontSize: 48,
                fontWeight: 700,
                color: "var(--color-text-primary)",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Hey there! I&apos;m Larry
            </h1>
            <p style={{ fontSize: 20, lineHeight: 1.5, color: "var(--color-text-secondary)", margin: 0 }}>
              Your intelligent document assistant
            </p>
          </div>

          <div
            style={{
              width: "40%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <img
              src="/larry-searching-2.png"
              alt="Larry searching through documents"
              style={{
                maxWidth: "100%",
                height: "auto",
                opacity: 0.95
              }}
            />
          </div>
        </section>

        {/* Hero Section */}
        <section
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "5%",
            alignItems: "center",
            marginBottom: 120,
          }}
          className="content-block"
        >
          <div
            style={{
              width: "40%",
              aspectRatio: "16/9",
              background: "#e0e0e0",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#999",
              fontSize: 14,
              flexShrink: 0,
            }}
            className="video-placeholder"
          >
            Video placeholder
          </div>

          <div style={{ width: "55%", display: "flex", flexDirection: "column", gap: 20 }} className="content-text">
            <h2
              className="hero-title"
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: "var(--color-text-primary)",
                margin: 0,
                lineHeight: 1.3,
              }}
            >
            </h2>
            <p style={{ fontSize: 18, lineHeight: 1.6, color: "var(--color-text-secondary)", margin: 0 }}>
              I search on your documents and respond only when the information is available.
            </p>
            <p style={{ fontSize: 18, lineHeight: 1.6, color: "var(--color-text-secondary)", margin: 0 }}>
              If I can&apos;t find it, I&apos;ll tell you.
            </p>
            <Link
              href={ctaHref}
              style={{
                display: "inline-block",
                padding: "12px 24px",
                fontSize: 16,
                fontWeight: 600,
                background: "#2563eb",
                color: "white",
                textDecoration: "none",
                borderRadius: 8,
                textAlign: "center",
                width: "fit-content",
                cursor: "pointer",
                marginTop: 8,
              }}
            >
              Upload your files
            </Link>
          </div>
        </section>

        {/* Why Larry Section */}
        <ContentBlock
          title="Why me"
          videoOnLeft={false}
          withBackground={true}
          content={
            <>
              <p style={{ margin: "0 0 12px 0" }}>Searching for a single detail in a PDF is slow.</p>
              <p style={{ margin: "0 0 12px 0" }}>Other tools often guess.</p>
              <p style={{ margin: 0, fontWeight: 600 }}>I don&apos;t.</p>
            </>
          }
        />

        {/* How it works Section */}
        <ContentBlock
          title="How it works"
          videoOnLeft={true}
          withBackground={false}
          content={
            <>
              <ol style={{ margin: 0, paddingLeft: 24 }}>
                <li style={{ marginBottom: 16 }}>Upload your files</li>
                <li style={{ marginBottom: 16 }}>Wait for them to be processed</li>
                <li style={{ marginBottom: 16 }}>Ask a question</li>
              </ol>
              <p style={{ margin: "24px 0 0 0", fontWeight: 600 }}>
                You get a clear answer or <strong>&quot;I don&apos;t know.&quot;</strong>
              </p>
            </>
          }
        />

        {/* Guaranteed confidence Section */}
        <ContentBlock
          title="Guaranteed confidence"
          subtitle="No guessing. No made-up answers."
          videoOnLeft={false}
          withBackground={true}
          content="If it's not in your documents, I won't pretend it is."
        />

        {/* Closing Section */}
        <ContentBlock
          title="Your files already contain the answers."
          subtitle="I find them for you."
          videoOnLeft={true}
          withBackground={false}
          cta={{ text: "Start now", href: ctaHref }}
          content=""
        />
      </main>
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div style={{ padding: "80px 16px", textAlign: "center" }}>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
