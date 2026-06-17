import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import api from "../services/api"

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
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

      const { token, role } = res.data
      localStorage.setItem("token", token)
      localStorage.setItem("role", role)

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
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f5f5f5" }}>
      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e0e0e0", padding: "32px", width: "100%", maxWidth: "400px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "4px" }}>Sign in</h1>
        <p style={{ fontSize: "13px", color: "#777", marginBottom: "24px" }}>Welcome back to CampusEvents</p>

        {error && (
          <div style={{ background: "#FCEBEB", border: "1px solid #F7C1C1", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#791F1F", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
            style={{ ...inputStyle, marginBottom: "8px" }}
          />

          <div style={{ textAlign: "right", marginBottom: "20px" }}>
            <Link to="/forgot-password" style={{ fontSize: "12px", color: "#777" }}>Forgot password?</Link>
          </div>

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "13px", color: "#777", marginTop: "16px" }}>
          No account yet?{" "}
          <Link to="/register" style={{ color: "#111", fontWeight: "500" }}>Register</Link>
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