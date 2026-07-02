import { useState } from "react"
import { useNavigate, Link, useLocation } from "react-router-dom"
import { useMobile } from "../hooks/useMobile"
import api from "../services/api"

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useMobile()
  const params = new URLSearchParams(location.search)
  const showVerifiedBanner = params.get("verified") === "1"
  const showVerifyErrorBanner = params.get("verified") === "0"
  const [form, setForm] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [resendMessage, setResendMessage] = useState("")
  const [resendLink, setResendLink] = useState("")
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  const shouldShowResend =
    !!form.email &&
    (showVerifyErrorBanner || error.toLowerCase().includes("verify your email"))

  function handleChange(e) {
    if (resendMessage) setResendMessage("")
    if (resendLink) setResendLink("")
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleResendVerification() {
    setResendMessage("")
    setResending(true)
    try {
      const res = await api.post("/auth/resend-verification", { email: form.email })
      setResendMessage(res.data?.message || "Verification email sent. Please check your inbox.")
      setResendLink(res.data?.verificationLink || "")
    } catch (err) {
      setResendMessage(err.response?.data?.message || "Could not send verification email")
      setResendLink(err.response?.data?.verificationLink || "")
    } finally {
      setResending(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await api.post("/auth/login", {
        email: form.email,
        password: form.password,
      })
      const { token, role, fullName } = res.data
      localStorage.setItem("token", token)
      localStorage.setItem("role", role)
      localStorage.setItem("fullName", fullName)
      localStorage.setItem('userID', res.data.userID)

      if (role === "Admin") navigate("/admin/dashboard")
      else if (role === "Organizer") navigate("/organizer/dashboard")
      else navigate("/events")
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: isMobile ? "column" : "row" }}>

      {/* ── Branding panel ── */}
      <div style={{
        ...(isMobile
          ? { width: "100%", height: "200px" }
          : { flex: "0 0 52%", minHeight: "100vh" }
        ),
        position: "relative",
        backgroundImage: "url('/Strathmore%20image.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        color: "#fff",
        overflow: "hidden",
        flexShrink: 0,
      }}>
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(160deg, rgba(0,33,71,0.90) 0%, rgba(0,50,100,0.82) 100%)",
        }} />

        <div style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          padding: isMobile ? "24px 20px" : "40px 44px",
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: isMobile ? "16px" : "auto" }}>
            <div style={{ background: "#fff", borderRadius: "8px", padding: "6px 8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src="/Strathmore%20logo.png" alt="Strathmore University" style={{ height: isMobile ? "32px" : "40px", objectFit: "contain" }} />
            </div>
            <div>
              <div style={{ fontWeight: "700", fontSize: isMobile ? "15px" : "17px", letterSpacing: "0.3px" }}>Strathmore</div>
              <div style={{ fontSize: "11px", opacity: 0.75, letterSpacing: "0.5px", textTransform: "uppercase" }}>University</div>
            </div>
          </div>

          {isMobile ? (
            <div>
              <div style={{ display: "inline-block", background: "#C8922A", borderRadius: "4px", padding: "2px 8px", fontSize: "10px", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>
                Campus Events Platform
              </div>
              <h1 style={{ fontSize: "20px", fontWeight: "800", lineHeight: 1.25, margin: 0 }}>
                Welcome back to CampusEvents.
              </h1>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: "auto" }}>
                <div style={{ display: "inline-block", background: "#C8922A", borderRadius: "4px", padding: "3px 10px", fontSize: "11px", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "20px" }}>
                  Campus Events Platform
                </div>
                <h1 style={{ fontSize: "34px", fontWeight: "800", lineHeight: 1.2, marginBottom: "20px" }}>
                  Welcome back<br />to CampusEvents.
                </h1>
                <p style={{ fontSize: "15px", opacity: 0.80, lineHeight: 1.75, maxWidth: "340px" }}>
                  Sign in to discover what's happening across Strathmore — from faculty seminars
                  and cultural nights to sports tournaments and career fairs.
                </p>
              </div>

              <div style={{ display: "flex", gap: "32px", marginBottom: "32px" }}>
                {[
                  { value: "500+", label: "Students" },
                  { value: "50+", label: "Events/year" },
                  { value: "20+", label: "Clubs" },
                ].map(({ value, label }) => (
                  <div key={label}>
                    <div style={{ fontSize: "22px", fontWeight: "800", color: "#C8922A" }}>{value}</div>
                    <div style={{ fontSize: "12px", opacity: 0.65 }}>{label}</div>
                  </div>
                ))}
              </div>

              <div style={{ paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.15)", fontSize: "12px", opacity: 0.50, fontStyle: "italic" }}>
                "In the service of society" — Strathmore University
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Form panel ── */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: isMobile ? "flex-start" : "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        padding: isMobile ? "28px 20px 40px" : "40px 32px",
        overflowY: "auto",
      }}>
        <div style={{ width: "100%", maxWidth: "380px" }}>
          <h2 style={{ fontSize: isMobile ? "20px" : "22px", fontWeight: "700", marginBottom: "4px", color: "#002147" }}>
            Sign in
          </h2>
          <p style={{ fontSize: "13px", color: "#777", marginBottom: "24px" }}>
            Welcome back to CampusEvents
          </p>

          {showVerifiedBanner && <div style={alertStyle("success")}>Email verified successfully. You can now sign in.</div>}
          {showVerifyErrorBanner && <div style={alertStyle("error")}>Verification link is invalid or expired. Please register again or request a new link.</div>}
          {error && <div style={alertStyle("error")}>{error}</div>}
          {resendMessage && (
            <div style={alertStyle("neutral")}>
              {resendMessage}
              {resendLink && (
                <div style={{ marginTop: "8px" }}>
                  <a href={resendLink} target="_blank" rel="noreferrer" style={{ color: "#111", fontWeight: "600" }}>Open verification link</a>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label style={labelStyle}>Email address</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="jane@strathmore.edu" required style={inputStyle} />

            <label style={labelStyle}>Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" required style={{ ...inputStyle, marginBottom: "8px" }} />

            <div style={{ textAlign: "right", marginBottom: "20px" }}>
              <Link to="/forgot-password" style={{ fontSize: "12px", color: "#777" }}>Forgot password?</Link>
            </div>

            <button type="submit" disabled={loading} style={buttonStyle}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {shouldShowResend && (
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resending}
              style={{ width: "100%", marginTop: "10px", background: "#fff", color: "#002147", border: "1px solid #c6ccd6", borderRadius: "8px", padding: "10px", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}
            >
              {resending ? "Sending verification link..." : "Resend verification email"}
            </button>
          )}

          <p style={{ textAlign: "center", fontSize: "13px", color: "#777", marginTop: "20px" }}>
            No account yet?{" "}
            <Link to="/register" style={{ color: "#002147", fontWeight: "600" }}>Register</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

const labelStyle = {
  fontSize: "12px",
  fontWeight: "500",
  color: "#555",
  display: "block",
  marginBottom: "5px",
}

const inputStyle = {
  width: "100%",
  border: "1px solid #e0e0e0",
  borderRadius: "8px",
  padding: "10px 13px",
  fontSize: "13px",
  marginBottom: "14px",
  outline: "none",
  boxSizing: "border-box",
}

const buttonStyle = {
  width: "100%",
  background: "#002147",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  padding: "12px",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
  letterSpacing: "0.2px",
}

function alertStyle(type) {
  if (type === "error")
    return { background: "#FCEBEB", border: "1px solid #F7C1C1", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#791F1F", marginBottom: "16px" }
  if (type === "success")
    return { background: "#EAF7EE", border: "1px solid #BFE4C8", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#1A5E2E", marginBottom: "16px" }
  return { background: "#F2F4F7", border: "1px solid #DEE3EA", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#4B5563", marginBottom: "16px" }
}
