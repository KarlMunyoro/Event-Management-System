import { useEffect } from "react"
import api from "../services/api"
import { useParams } from "react-router-dom"

export default function VerifyEmailPage() {
  const { token } = useParams()

  useEffect(() => {
    if (!token) return
    window.location.href = `${api.defaults.baseURL}/auth/verify/${token}`
  }, [token])

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f5f5f5" }}>
      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e0e0e0", padding: "32px", width: "100%", maxWidth: "420px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "10px" }}>Email verification</h1>
        <p style={{ fontSize: "14px", color: "#4B5563" }}>
          Redirecting to verify your email...
        </p>
      </div>
    </div>
  )
}
