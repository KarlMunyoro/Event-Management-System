import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import api from "../services/api"

export default function RegisterPage() {
  const navigate = useNavigate()
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
      setForm({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
      })

      setTimeout(() => {
        navigate("/login")
      }, 1200)
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f5f5f5" }}>
      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e0e0e0", padding: "32px", width: "100%", maxWidth: "400px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "4px" }}>Create your account</h1>
        <p style={{ fontSize: "13px", color: "#777", marginBottom: "24px" }}>Your role is assigned automatically from your email domain</p>

        {error && (
          <div style={{ background: "#FCEBEB", border: "1px solid #F7C1C1", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#791F1F", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ background: "#EAF7EE", border: "1px solid #BFE4C8", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#1A5E2E", marginBottom: "16px" }}>
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
          <label style={{ fontSize: "12px", color: "#777", display: "block", marginBottom: "4px" }}>Full name</label>
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Jane Mwangi"
            required
            style={inputStyle}
          />

          <label style={{ fontSize: "12px", color: "#777", display: "block", marginBottom: "4px" }}>Email address</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="jane@strathmore.edu"
            required
            style={inputStyle}
          />

          <label style={{ fontSize: "12px", color: "#777", display: "block", marginBottom: "4px" }}>Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
            style={inputStyle}
          />

          <label style={{ fontSize: "12px", color: "#777", display: "block", marginBottom: "4px" }}>Confirm password</label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            required
            style={{ ...inputStyle, marginBottom: "20px" }}
          />

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "13px", color: "#777", marginTop: "16px" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#111", fontWeight: "500" }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}

const inputStyle = {
  width: "100%",
  border: "1px solid #e0e0e0",
  borderRadius: "8px",
  padding: "9px 12px",
  fontSize: "13px",
  marginBottom: "14px",
  outline: "none",
  boxSizing: "border-box",
}

const buttonStyle = {
  width: "100%",
  background: "#111",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  padding: "11px",
  fontSize: "13px",
  fontWeight: "600",
  cursor: "pointer",
}