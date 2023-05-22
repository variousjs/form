import React from 'react'
import ReactDOM from 'react-dom/client'

const Entry = () => {
  return (
    <div style={{ padding: 50 }}>
      Form
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Entry />
  </React.StrictMode>,
)
