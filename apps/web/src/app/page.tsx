"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/shared/auth";
import styles from "./page.module.css";

type ContentBlockProps = {
  title?: string | React.ReactNode;
  subtitle?: string;
  content: string | React.ReactNode;
  videoOnLeft: boolean;
  cta?: { text: string; href: string };
  withBackground?: boolean;
  imageSrc: string;
  imageAlt: string;
};

function ContentBlock({
  title,
  subtitle,
  content,
  videoOnLeft,
  cta,
  withBackground,
  imageSrc,
  imageAlt,
}: ContentBlockProps) {
  return (
    <div style={{
      width: "100%",
      background: withBackground ? "var(--card-bg)" : "transparent",
      display: "flex",
      justifyContent: "center", alignItems: "center",
      padding: "80px 60px",
    }}>
      <section
        style={{
          display: "flex",
          maxWidth: 1200,
          width: "100%",
          flexDirection: videoOnLeft ? "row" : "row-reverse",
          gap: "5%",
          alignItems: "center",
        }}
        className={styles.contentBlock}
      >
        {/* Image */}
        <div
          style={{
            width: "55%",
            aspectRatio: "16/9",
            background: "#e0e0e0",
            borderRadius: 12,
            border: "1px solid rgba(0, 0, 0, 0.08)",
            position: "relative",
            overflow: "hidden",
            flexShrink: 0,
          }}
          className={styles.videoPlaceholder}
        >
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(max-width: 768px) 100vw, 55vw"
            style={{ objectFit: "contain" }}
          />
        </div>

        {/* Content */}
        <div
          style={{ width: "42%", display: "flex", flexDirection: "column", gap: 16 }}
          className={styles.contentText}
        >
          {typeof title === "string" && title.trim().length > 0 && (
            <h2 style={{ fontSize: 32, fontWeight: 700, color: "var(--color-text-primary)", margin: 0 }}>
              {title}
            </h2>
          )}
          {typeof title !== "string" && title}
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
    </div>
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
      <main style={{
            marginBottom: 180,
          }}>
        {/* Introduction Section with Larry */}
        <section
          style={{
            maxWidth: 1200, margin: "0 auto", padding: "80px 60px",
            display: "flex",
            flexDirection: "row",
            gap: "5%",
            alignItems: "center",
            marginBottom: 120,
          }}
          className={styles.contentBlock}
        >
          <div
            style={{ width: "55%", display: "flex", flexDirection: "column", gap: 16 }}
            className={styles.contentText}
          >
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
            className={styles.videoPlaceholder}
          >
            <Image
              src="/larry-searching-2.png"
              alt="Larry searching through documents"
              width={400}
              height={400}
              style={{
                maxWidth: "100%",
                height: "auto",
                opacity: 0.95
              }}
            />
          </div>
        </section>

        {/* Hero Section */}
        <ContentBlock
          videoOnLeft={true}
          withBackground={false}
          imageSrc="/landing/documents-img.jpg"
          imageAlt="Documents preview"
          cta={{ text: "Upload your files", href: ctaHref }}
          subtitle="I search on your documents and respond only when the information is available."
          content="If I can&apos;t find it, I&apos;ll tell you."
        />

        {/* Why Larry Section */}
        <ContentBlock
          title="Why me"
          videoOnLeft={false}
          withBackground={true}
          imageSrc="/landing/img-question-1.jpg"
          imageAlt="Searching for a detail in documents"
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
          imageSrc="/landing/img-question-2.jpg"
          imageAlt="How the process works"
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
          content="If it's not in your documents, I won't pretend it is."
          videoOnLeft={false}
          withBackground={true}
          imageSrc="/landing/img-question-3.jpg"
          imageAlt="Guaranteed confidence"
        />

        {/* Closing Section */}
        <ContentBlock
          title="Your files already contain the answers."
          subtitle="I find them for you."
          videoOnLeft={true}
          withBackground={false}
          cta={{ text: "Start now", href: ctaHref }}
          imageSrc="/landing/img-question-4.jpg"
          imageAlt="Find answers in your files"
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
