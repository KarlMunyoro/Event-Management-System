import { Link, useLocation } from "react-router-dom"

export default function EmailVerificationStatusPage() {
  const params = new URLSearchParams(useLocation().search)
  const isSuccess = params.get("status") === "success"

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f5f5f5" }}>
      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e0e0e0", padding: "32px", width: "100%", maxWidth: "420px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "10px" }}>
          {isSuccess ? "Email verified" : "Verification failed"}
        </h1>

        <div
          style={{
            background: isSuccess ? "#EAF7EE" : "#FCEBEB",
            border: isSuccess ? "1px solid #BFE4C8" : "1px solid #F7C1C1",
            borderRadius: "8px",
            padding: "12px 14px",
            fontSize: "13px",
            color: isSuccess ? "#1A5E2E" : "#791F1F",
            marginBottom: "16px",
          }}
        >
          {isSuccess
            ? "Your email has been verified successfully."
            : "This verification link is invalid or expired."}
        </div>

        <Link
          to={isSuccess ? "/login?verified=1" : "/login?verified=0"}
          style={{ color: "#111", fontWeight: "500", fontSize: "14px" }}
        >
          Continue to sign in
        </Link>
      </div>
    </div>
  )
}
