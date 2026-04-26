import { useState } from 'react'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import Plans from './pages/Plans'
import Agents from './pages/Agents'
import Policies from './pages/Policies'
import Nominees from './pages/Nominees'
import Payments from './pages/Payments'
import Claims from './pages/Claims'

const tabs = [
  { key: 'dashboard', label: 'Dashboard',       icon: '📊' },
  { key: 'customers', label: 'Customers',       icon: '👥' },
  { key: 'plans',     label: 'Insurance Plans', icon: '📋' },
  { key: 'agents',    label: 'Agents',          icon: '🧑‍💼' },
  { key: 'policies',  label: 'Policies',        icon: '📄' },
  { key: 'nominees',  label: 'Nominees',        icon: '👤' },
  { key: 'payments',  label: 'Payments',        icon: '💳' },
  { key: 'claims',    label: 'Claims',          icon: '📝' },
]

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />
      case 'customers': return <Customers />
      case 'plans':     return <Plans />
      case 'agents':    return <Agents />
      case 'policies':  return <Policies />
      case 'nominees':  return <Nominees />
      case 'payments':  return <Payments />
      case 'claims':    return <Claims />
      default:          return <Dashboard />
    }
  }

  return (
    <div className="app">
      <button className="mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? '✕' : '☰'}
      </button>
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h1>Insurance Policy Management</h1>
          <p>DBMS Mini Project</p>
        </div>
        <nav className="sidebar-nav">
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={activeTab === tab.key ? 'active' : ''}
              onClick={() => { setActiveTab(tab.key); setSidebarOpen(false) }}
            >
              <span className="nav-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  )
}

export default App
