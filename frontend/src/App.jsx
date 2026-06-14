import { useEffect, useState } from 'react'

function App() {
  const [message, setMessage] = useState('Loading...')

  useEffect(() => {
    fetch('http://localhost:5000/api/test')
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(() => setMessage('❌ Could not connect to backend'))
  }, [])

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold text-blue-500">{message}</h1>
    </div>
  )
}

export default App