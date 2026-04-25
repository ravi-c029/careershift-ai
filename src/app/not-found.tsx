import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        textAlign: "center",
        padding: 24,
      }}
    >
      <div style={{ fontSize: 80, marginBottom: 16, lineHeight: 1 }}>404</div>
      <h1 style={{ fontSize: 32, marginBottom: 12 }}>
        Page <span className="gradient-text">Not Found</span>
      </h1>
      <p style={{ color: "var(--text-secondary)", fontSize: 16, marginBottom: 32, maxWidth: 400 }}>
        The page you're looking for doesn't exist. Maybe your career path changed!
      </p>
      <Link href="/" className="btn btn-primary btn-lg">
        Go Home
      </Link>
    </div>
  );
}
