import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Calendar, Ticket, Megaphone, QrCode } from "lucide-react"
import { useMobile } from "../hooks/useMobile"
import api from "../services/api"

export default function RegisterPage() {
  const navigate = useNavigate()
  const isMobile = useMobile()
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [verificationLink, setVerificationLink] = useState("")
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setSuccess("")
    setVerificationLink("")

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)
    try {
      const res = await api.post("/auth/register", {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
      })
      setSuccess(res.data?.message || "Account created. Check your email for a verification link, then sign in.")
      setVerificationLink(res.data?.verificationLink || "")
      setForm({ fullName: "", email: "", password: "", confirmPassword: "" })
      setTimeout(() => navigate("/login"), 1200)
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  const features = [
    { Icon: Calendar, title: "Discover Events", desc: "Browse upcoming events from every faculty, student club, and department." },
    { Icon: Ticket, title: "Instant RSVP", desc: "Reserve your seat in one click and get a personalized confirmation." },
    { Icon: Megaphone, title: "Organize & Promote", desc: "Create events, track registrations, and engage your audience in real time." },
    { Icon: QrCode, title: "QR Code Check-in", desc: "Seamless, contactless entry with your unique QR code at the venue." },
  ]

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: isMobile ? "column" : "row" }}>

      {/* ── Branding panel ── */}
      <div style={{
        ...(isMobile
          ? { width: "100%", height: "220px" }
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
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: isMobile ? "12px" : "52px" }}>
            <div style={{ background: "#fff", borderRadius: "8px", padding: "6px 8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src="/Strathmore%20logo.png" alt="Strathmore University" style={{ height: isMobile ? "32px" : "40px", objectFit: "contain" }} />
            </div>
            <div>
              <div style={{ fontWeight: "700", fontSize: isMobile ? "15px" : "17px", letterSpacing: "0.3px" }}>Strathmore</div>
              <div style={{ fontSize: "11px", opacity: 0.75, letterSpacing: "0.5px", textTransform: "uppercase" }}>University</div>
            </div>
          </div>

          {/* Mobile: just show tagline */}
          {isMobile ? (
            <div>
              <div style={{ display: "inline-block", background: "#C8922A", borderRadius: "4px", padding: "2px 8px", fontSize: "10px", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>
                Campus Events Platform
              </div>
              <h1 style={{ fontSize: "20px", fontWeight: "800", lineHeight: 1.25, margin: 0 }}>
                Your campus. Your community. Your events.
              </h1>
            </div>
          ) : (
            <>
              <div style={{ display: "inline-block", background: "#C8922A", borderRadius: "4px", padding: "3px 10px", fontSize: "11px", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "16px", width: "fit-content" }}>
                Campus Events Platform
              </div>
              <h1 style={{ fontSize: "30px", fontWeight: "800", lineHeight: 1.25, marginBottom: "16px" }}>
                Your campus.<br />Your community.<br />Your events.
              </h1>
              <p style={{ fontSize: "14px", opacity: 0.85, lineHeight: 1.75, marginBottom: "40px", maxWidth: "360px" }}>
                CampusEvents is Strathmore University's official platform for discovering,
                attending, and organizing events across all faculties, clubs, and departments.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
                {features.map(({ Icon, title, desc }) => (
                  <div key={title} style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                    <div style={{ background: "rgba(200,146,42,0.20)", borderRadius: "8px", width: "38px", height: "38px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={18} color="#C8922A" strokeWidth={2} />
                    </div>
                    <div>
                      <div style={{ fontWeight: "600", fontSize: "14px", marginBottom: "3px" }}>{title}</div>
                      <div style={{ fontSize: "12.5px", opacity: 0.72, lineHeight: 1.55 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "auto", paddingTop: "28px", borderTop: "1px solid rgba(255,255,255,0.15)", fontSize: "12px", opacity: 0.55, fontStyle: "italic" }}>
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
        <div style={{ width: "100%", maxWidth: "400px" }}>
          <h2 style={{ fontSize: isMobile ? "20px" : "22px", fontWeight: "700", marginBottom: "4px", color: "#002147" }}>
            Create your account
          </h2>
          <p style={{ fontSize: "13px", color: "#777", marginBottom: "24px" }}>
            Your role is assigned automatically from your email domain
          </p>

          {error && <div style={alertStyle("error")}>{error}</div>}
          {success && (
            <div style={alertStyle("success")}>
              {success}
              {verificationLink && (
                <div style={{ marginTop: "8px" }}>
                  <a href={verificationLink} target="_blank" rel="noreferrer" style={{ color: "#1A5E2E", fontWeight: "600" }}>
                    Open verification link
                  </a>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label style={labelStyle}>Full name</label>
            <input type="text" name="fullName" value={form.fullName} onChange={handleChange} placeholder="Jane Mwangi" required style={inputStyle} />

            <label style={labelStyle}>Email address</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="jane@strathmore.edu" required style={inputStyle} />

            <label style={labelStyle}>Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" required style={inputStyle} />

            <label style={labelStyle}>Confirm password</label>
            <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="••••••••" required style={{ ...inputStyle, marginBottom: "20px" }} />

            <button type="submit" disabled={loading} style={buttonStyle}>
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: "13px", color: "#777", marginTop: "20px" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#002147", fontWeight: "600" }}>Sign in</Link>
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
  const isError = type === "error"
  return {
    background: isError ? "#FCEBEB" : "#EAF7EE",
    border: `1px solid ${isError ? "#F7C1C1" : "#BFE4C8"}`,
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "13px",
    color: isError ? "#791F1F" : "#1A5E2E",
    marginBottom: "16px",
  }
}
