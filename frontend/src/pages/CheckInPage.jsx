import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { CheckCircle, XCircle, AlertCircle, Calendar, MapPin, User } from "lucide-react"
import api from "../services/api"

export default function CheckInPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const [state, setState] = useState("loading") // loading | success | duplicate | error
  const [data, setData] = useState(null)
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!token) {
      setState("error")
      setMessage("No token provided in this link.")
      return
    }
    verifyToken()
  }, [token])

  async function verifyToken() {
    try {
      const res = await api.get(`/qr/verify?token=${token}`)
      setData(res.data)
      setState(res.data.alreadyCheckedIn ? "duplicate" : "success")
    } catch (err) {
      setState("error")
      setMessage(err.response?.data?.message || "Invalid or unrecognised QR code.")
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F0F4F8",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
      fontFamily: "sans-serif",
    }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px" }}>
        <img src="/Strathmore%20logo.png" alt="Strathmore" style={{ height: "36px", objectFit: "contain" }} />
        <div>
          <div style={{ fontWeight: "700", fontSize: "15px", color: "#002147" }}>Strathmore University</div>
          <div style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Event Check-in</div>
        </div>
      </div>

      {/* Card */}
      <div style={{
        background: "#fff",
        borderRadius: "16px",
        padding: "36px 28px",
        width: "100%",
        maxWidth: "420px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        textAlign: "center",
      }}>

        {state === "loading" && (
          <div style={{ padding: "20px 0" }}>
            <div style={{ fontSize: "14px", color: "#888" }}>Verifying QR code...</div>
          </div>
        )}

        {state === "success" && data && (
          <>
            <div style={{ marginBottom: "20px" }}>
              <CheckCircle size={56} color="#16A34A" strokeWidth={1.5} />
            </div>
            <div style={{
              background: "#F0FDF4",
              border: "1px solid #BBF7D0",
              borderRadius: "10px",
              padding: "10px 16px",
              marginBottom: "24px",
              fontSize: "14px",
              fontWeight: "700",
              color: "#15803D",
              letterSpacing: "0.2px",
            }}>
              QR Code Valid — Entry Approved
            </div>

            <InfoRow icon={<User size={15} color="#555" />} label="Attendee" value={data.fullName} />
            <InfoRow icon={<Calendar size={15} color="#555" />} label="Event" value={data.eventTitle} />
            <InfoRow icon={<Calendar size={15} color="#555" />} label="Date" value={new Date(data.eventDate).toDateString()} />
            <InfoRow icon={<MapPin size={15} color="#555" />} label="Venue" value={data.location} />

            <div style={{
              marginTop: "24px",
              background: "#002147",
              color: "#fff",
              borderRadius: "10px",
              padding: "14px",
              fontSize: "15px",
              fontWeight: "600",
            }}>
              Welcome! You may proceed to the event.
            </div>
          </>
        )}

        {state === "duplicate" && data && (
          <>
            <div style={{ marginBottom: "20px" }}>
              <AlertCircle size={56} color="#D97706" strokeWidth={1.5} />
            </div>
            <div style={{
              background: "#FFFBEB",
              border: "1px solid #FDE68A",
              borderRadius: "10px",
              padding: "10px 16px",
              marginBottom: "24px",
              fontSize: "14px",
              fontWeight: "700",
              color: "#92400E",
            }}>
              Already Checked In
            </div>

            <InfoRow icon={<User size={15} color="#555" />} label="Attendee" value={data.fullName} />
            <InfoRow icon={<Calendar size={15} color="#555" />} label="Event" value={data.eventTitle} />
            <InfoRow icon={<MapPin size={15} color="#555" />} label="Venue" value={data.location} />

            <p style={{ fontSize: "13px", color: "#888", marginTop: "20px" }}>
              This QR code has already been used for entry. If this is unexpected, contact the event organizer.
            </p>
          </>
        )}

        {state === "error" && (
          <>
            <div style={{ marginBottom: "20px" }}>
              <XCircle size={56} color="#DC2626" strokeWidth={1.5} />
            </div>
            <div style={{
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: "10px",
              padding: "10px 16px",
              marginBottom: "16px",
              fontSize: "14px",
              fontWeight: "700",
              color: "#991B1B",
            }}>
              Invalid QR Code
            </div>
            <p style={{ fontSize: "13px", color: "#888" }}>{message}</p>
          </>
        )}
      </div>

      <p style={{ fontSize: "11px", color: "#aaa", marginTop: "24px" }}>
        Strathmore University Events Management System
      </p>
    </div>
  )
}

function InfoRow({ icon, label, value }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "10px 0",
      borderBottom: "1px solid #F3F4F6",
      textAlign: "left",
    }}>
      <div style={{ flexShrink: 0 }}>{icon}</div>
      <div style={{ fontSize: "12px", color: "#888", width: "70px", flexShrink: 0 }}>{label}</div>
      <div style={{ fontSize: "14px", fontWeight: "600", color: "#111" }}>{value}</div>
    </div>
  )
}
