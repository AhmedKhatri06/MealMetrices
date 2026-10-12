import { useState } from 'react'
import {
  Activity, ArrowRight, Bell, CalendarDays, Check, ChevronDown, Clock3,
  CookingPot, Download, Eye, FileCheck2, Leaf, Minus, PackageCheck, Search,
  ShieldCheck, Utensils, Users,
} from 'lucide-react'
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { getRoleHome } from './auth/roles'
import ProtectedRoute from './auth/ProtectedRoute'
import LoginView from './components/LoginView'
import Navbar from './components/Navbar'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/access-denied" element={<AccessDenied />} />
          <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
            <Route path="/student/dashboard" element={<ApplicationShell><StudentDashboard /></ApplicationShell>} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['STAFF']} />}>
            <Route path="/staff/operations" element={<ApplicationShell><StaffOperations /></ApplicationShell>} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin/dashboard" element={<ApplicationShell><AdminDashboard /></ApplicationShell>} />
            <Route path="/admin/waste-logs" element={<ApplicationShell><AdminWasteLogs /></ApplicationShell>} />
            <Route path="/admin/users" element={<ApplicationShell><AdminUsers /></ApplicationShell>} />
          </Route>
          <Route path="*" element={<HomeRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

function LoginRoute() {
  const { isAuthenticated, role } = useAuth()
  return isAuthenticated ? <Navigate to={getRoleHome(role)} replace /> : <LoginView />
}

function HomeRedirect() {
  const { isAuthenticated, role } = useAuth()
  return <Navigate to={isAuthenticated ? getRoleHome(role) : '/login'} replace />
}

function AccessDenied() {
  const { isAuthenticated, role } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return (
    <div className="app-shell">
      <Navbar />
      <main className="container-fluid dashboard-main">
        <section className="page-content panel access-denied">
          <ShieldCheck size={34} />
          <h1>Access restricted</h1>
          <p>Your <strong>{role}</strong> account does not have permission to open this page.</p>
          <Link className="btn btn-primary" to={getRoleHome(role)}>Return to your dashboard</Link>
        </section>
      </main>
      <footer className="app-footer">© 2026 MealMatrices MessTrack ERP. All institutional rights reserved.</footer>
    </div>
  )
}

function ApplicationShell({ children }) {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="container-fluid dashboard-main">{children}</main>
      <footer className="app-footer">© 2026 MealMatrices MessTrack ERP. All institutional rights reserved.</footer>
    </div>
  )
}

function AdminWasteLogs() {
  return <AdminDashboard />
}

function AdminUsers() {
  return (
    <div className="page-content">
      <PageHeading eyebrow="ADMINISTRATION" title="User Management" subtitle="Manage institutional access through your authorized user provisioning workflow." />
      <section className="panel admin-users-placeholder">
        <ShieldCheck size={24} />
        <h2>User directory</h2>
        <p>User records are provisioned by the institution. Connect an authorized user-management API to enable directory and account actions.</p>
      </section>
    </div>
  )
}

function PageHeading({ eyebrow, title, subtitle, action }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>{action}</div>
}

function StudentDashboard() {
  const [dinnerOptIn, setDinnerOptIn] = useState(true)
  const { user } = useAuth()
  const displayName = user?.fullName || user?.institutionalId || 'Student'
  const nameInitials = displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('')
  const studentRoom = [user?.roomNumber, user?.hostelBlock].filter(Boolean).join(' · ')
  const logs = [
    ['Oct 14, 2026', 'Lunch', 'Attended', '11:00 AM', '#MM-8849-AF'],
    ['Oct 13, 2026', 'Dinner', 'Skipped', '06:30 PM', '#MM-8831-BC'],
    ['Oct 13, 2026', 'Lunch', 'Attended', '11:00 AM', '#MM-8827-D2'],
  ]
  return (
    <div className="page-content">
      <div className="student-profile panel">
        <div className="profile-avatar">{nameInitials}</div>
        <div className="profile-info"><div className="profile-name">{displayName}{studentRoom && <span className="room-tag">{studentRoom}</span>}</div><div className="profile-plan">{user?.messSubscription ? `Mess Subscription: ${user.messSubscription}` : 'Student dining profile'}</div></div>
        <div className="profile-actions"><span className="meal-open"><span /> Lunch Open</span><button className="icon-button notification-btn" aria-label="Notifications"><Bell size={19} /><i /></button></div>
      </div>
      <div className="schedule-line"><div><div className="eyebrow">TODAY&apos;S SCHEDULE</div><div className="schedule-date">Wednesday, Oct 14, 2026</div></div><div className="cutoff-pill"><Clock3 size={15} /> Dinner opt-out cutoff: <strong>06:30 PM</strong></div></div>
      <div className="kpi-grid student-kpis">
        <MetricCard icon={<CalendarDays />} label="Monthly Attended" value="24 meals" detail="+3 from last month" iconColor="blue" />
        <MetricCard icon={<Minus />} label="Monthly Skipped" value="4 meals" detail="2.1 kg food saved" iconColor="amber" />
        <MetricCard icon={<Leaf />} label="Food Waste Prevented" value="~1.8 kg" detail="Your impact this month" iconColor="green" />
      </div>
      <section className="section-block">
        <div className="section-title-row"><div><h2>Daily Meal Matrix</h2><p>Mess Hall #3 <span>•</span> Block B Wing</p></div><button className="subtle-link">View weekly menu <ArrowRight size={15} /></button></div>
        <div className="meal-grid">
          <article className="meal-card panel">
            <div className="meal-card-head"><div className="meal-symbol breakfast"><Utensils size={17} /></div><span className="badge-soft success"><Check size={12} /> Served</span></div>
            <h3>Breakfast</h3><div className="meal-time">07:30 AM – 09:30 AM</div>
            <div className="menu-line"><span className="eyebrow">TODAY&apos;S MENU</span><p>Pohe, Boiled Eggs, Fresh Fruit, Tea &amp; Coffee</p></div>
            <div className="meal-card-footer"><Check size={14} /> Attendance: Logged (08:15 AM)</div>
          </article>
          <article className="meal-card panel meal-card-active">
            <div className="active-banner"><span className="pulse-dot" /> ACTIVE SERVICE</div>
            <div className="meal-card-head"><div className="meal-symbol lunch"><CookingPot size={17} /></div><span className="badge-soft blue">Serving Now</span></div>
            <h3>Lunch</h3><div className="meal-time">12:00 PM – 02:00 PM</div>
            <div className="menu-line"><span className="eyebrow">TODAY&apos;S MENU</span><p>Steamed Rice, Dal Tadka, Paneer Butter Masala, Roti, Green Salad</p></div>
            <div className="meal-card-footer lunch-footer"><button className="btn btn-light btn-sm" disabled>Cutoff Passed (11:00 AM)</button><span><Check size={13} /> Meal attendance confirmed</span></div>
          </article>
          <article className="meal-card panel">
            <div className="meal-card-head"><div className="meal-symbol dinner"><Clock3 size={17} /></div><span className="badge-soft warning"><Clock3 size={12} /> Closes in 02h 14m</span></div>
            <h3>Dinner</h3><div className="meal-time">07:30 PM – 09:30 PM</div>
            <div className="menu-line"><span className="eyebrow">TODAY&apos;S MENU</span><p>Mix Veg, Dal Fry, Chapati, Jeera Rice, Gulab Jamun</p></div>
            <div className="meal-toggle-row"><div><strong>{dinnerOptIn ? 'Opt-In (Attending)' : 'Opted out'}</strong><span>{dinnerOptIn ? 'Skip to save food & get credit' : 'You will not be counted for dinner'}</span></div><button className={`toggle ${dinnerOptIn ? 'on' : ''}`} role="switch" aria-checked={dinnerOptIn} aria-label="Toggle dinner attendance" onClick={() => setDinnerOptIn(!dinnerOptIn)}><span /></button></div>
            <div className="meal-footnote">Toggling off updates mess kitchen estimates instantly.</div>
          </article>
        </div>
      </section>
      <section className="panel audit-panel">
        <div className="panel-heading"><div><h2>Recent Meal Logs</h2><p>Your attendance history and confirmations</p></div><button className="subtle-link">View All History <ArrowRight size={15} /></button></div>
        <div className="table-responsive"><table className="table data-table"><thead><tr><th>Date</th><th>Meal Type</th><th>Status</th><th>Cutoff Timestamp</th><th>Confirmation Hash</th></tr></thead><tbody>{logs.map((row) => <tr key={row[4]}><td className="fw-semibold">{row[0]}</td><td>{row[1]}</td><td><span className={`badge-soft ${row[2] === 'Attended' ? 'success' : 'warning'}`}>● {row[2]}</span></td><td>{row[3]}</td><td className="hash-text">{row[4]}</td></tr>)}</tbody></table></div>
      </section>
    </div>
  )
}

function MetricCard({ icon, label, value, detail, iconColor, trend, trendColor, alert }) {
  return <div className="metric-card panel"><div className={`metric-icon ${iconColor}`}>{icon}</div><div className="metric-content"><div className="metric-label">{label}</div><div className="metric-value">{value}</div><div className="metric-detail">{trend && <span className={`trend-pill ${trendColor || 'green'}`}>{trend}</span>}{detail}{alert && <span className="metric-alert">⚠ {alert}</span>}</div></div></div>
}

function StaffOperations() {
  const [cooked, setCooked] = useState('150')
  const [waste, setWaste] = useState('12.3')
  const [saved, setSaved] = useState(false)
  const [committed, setCommitted] = useState(false)
  const wasteRate = Number(cooked) > 0 ? ((Number(waste) / Number(cooked)) * 100).toFixed(1) : '0.0'
  return (
    <div className="page-content">
      <PageHeading eyebrow="KITCHEN OPERATIONS" title="Operations Hub" subtitle="Manage live meal service, production quantities, and end-of-shift reporting." />
      <section className="ops-session panel">
        <div className="session-select"><div className="eyebrow">ACTIVE MESS SESSION</div><button>Dinner – Cook Session #2 <ChevronDown size={16} /></button></div>
        <div className="headcount-block"><div className="eyebrow">LIVE HEADCOUNT TARGET</div><div><Users size={19} /><strong>312 <span>/ 400</span></strong><span className="diners-label">Diners Expected</span></div></div>
        <div className="optout-notice"><span className="notice-icon"><Activity size={17} /></span><div><strong>88 Opt-outs registered</strong><span>via Student Portal</span></div></div>
      </section>
      <section className="panel forecast-panel">
        <div className="panel-heading"><div><h2>Kitchen Quantity Forecast</h2><p>Dynamic ingredient guidance scaled for <strong>312 diners</strong> (+5% buffer included)</p></div><span className="version-tag"><Activity size={13} /> AI Model Algorithm v2.4</span></div>
        <div className="ingredient-grid">
          {[['RICE', '42.5', 'kg', 'Basmati Grade A', 'rice'], ['DAL', '35.0', 'L', 'Yellow Toor Dal', 'dal'], ['CURRY / VEG', '48.0', 'kg', 'Paneer Lababdar', 'curry'], ['ROTI', '720', 'units', 'Whole Wheat Tava', 'roti']].map(([name, amount, unit, sub, tone]) => <div className={`ingredient-tile ${tone}`} key={name}><div className="ingredient-top"><span>{name}</span><PackageCheck size={16} /></div><div className="ingredient-amount">{amount} <small>{unit}</small></div><div className="ingredient-sub">{sub}</div><div className="ingredient-bar"><span /></div></div>)}
        </div>
      </section>
      <div className="production-grid">
        <section className="panel entry-panel">
          <div className="entry-heading"><div className="entry-icon cooking"><CookingPot size={19} /></div><div><h2>Cooking Entry</h2><p>Log prepared batches before service begins</p></div></div>
          <label className="form-label" htmlFor="quantity">Total Quantity Cooked <span>(kg)</span></label><div className="input-with-unit"><input id="quantity" type="number" value={cooked} onChange={(event) => setCooked(event.target.value)} /><span>kg</span></div>
          <label className="form-label" htmlFor="chef">Chef In-Charge</label><div className="select-wrap"><select id="chef" defaultValue="ramesh"><option value="ramesh">Chef Ramesh Kumar (Head Chef)</option><option value="priya">Chef Priya Sharma</option></select><ChevronDown size={16} /></div>
          <label className="form-label" htmlFor="completion-time">Completion Timestamp</label><div className="input-with-icon"><Clock3 size={16} /><input id="completion-time" defaultValue="06:30 PM" /></div>
          <button className="btn btn-outline-secondary save-button" onClick={() => setSaved(true)}><FileCheck2 size={16} /> {saved ? 'Batch Log Saved' : 'Save Batch Log'}</button>
        </section>
        <section className="panel entry-panel">
          <div className="entry-heading"><div className="entry-icon waste"><Leaf size={19} /></div><div><h2>End-of-Service Waste Entry</h2><p>Record leftovers and plate returns post-service</p></div></div>
          <label className="form-label" htmlFor="waste">Leftover / Unconsumed Food <span>(kg)</span></label><div className="input-with-unit"><input id="waste" type="number" step="0.1" value={waste} onChange={(event) => setWaste(event.target.value)} /><span>kg</span></div>
          <div className="form-label waste-category-label">Waste Categorization</div>
          <label className="check-row"><input type="checkbox" defaultChecked /> Leftover in Pots &amp; Warmers <span>(Excess production)</span></label>
          <label className="check-row"><input type="checkbox" defaultChecked /> Plate Scraps &amp; Student Returns</label>
          <div className="calculation-card"><div className="calc-head"><span>WASTE RATE CALCULATION</span><span className="target-pill"><span /> Target &lt; 5%</span></div><div className="calc-equation">Waste % = (<strong>{Number(waste || 0).toFixed(1)} kg</strong> ÷ {Number(cooked || 0).toFixed(1)} kg) × 100 = <strong className={Number(wasteRate) > 5 ? 'text-danger' : 'text-success'}>{wasteRate}%</strong></div><div className="calc-track"><span style={{ width: `${Math.min(Number(wasteRate) * 5, 100)}%` }} /></div></div>
        </section>
      </div>
      <section className="finalize-bar panel"><div className="finalize-copy"><span className="finalize-icon"><ShieldCheck size={20} /></span><div><strong>Ready to Finalize Shift?</strong><p>Committing this log will lock current numbers and push audit data to Admin Analytics.</p></div></div><button className="btn btn-primary" onClick={() => setCommitted(true)}><Check size={16} /> {committed ? 'Shift Log Committed' : 'Commit & Close Shift Log'}</button></section>
    </div>
  )
}

function AdminDashboard() {
  const [filter, setFilter] = useState('')
  const [wasteStatus, setWasteStatus] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const rows = [
    ['Oct 14, 2026', 'Dinner', '420', '145.0', '18.0', '12.4%', 'Critical', '₹1,800'],
    ['Oct 14, 2026', 'Lunch', '650', '210.0', '8.0', '3.8%', 'Normal', '₹800'],
    ['Oct 13, 2026', 'Dinner', '410', '140.0', '11.5', '8.2%', 'Warning', '₹1,150'],
    ['Oct 13, 2026', 'Breakfast', '530', '120.0', '4.2', '3.5%', 'Normal', '₹420'],
    ['Oct 12, 2026', 'Lunch', '680', '225.0', '24.5', '10.8%', 'Critical', '₹2,450'],
  ]
  const filteredRows = rows.filter((row) => row.slice(0, 2).join(' ').toLowerCase().includes(search.toLowerCase()) && (!filter || row[1] === filter) && (!wasteStatus || row[6] === wasteStatus))
  return (
    <div className="page-content admin-content">
      <div className="admin-toolbar panel">
        <div className="toolbar-select"><CalendarDays size={16} /><span>Last 30 Days: Sep 15 – Oct 14, 2026</span><ChevronDown size={15} /></div>
        <div className="toolbar-select"><span className="toolbar-label">Mess Block:</span><span>Central Dining Hall A</span><ChevronDown size={15} /></div>
        <div className="toolbar-actions"><button className="btn btn-outline-secondary"><Download size={15} /> Export CSV</button><button className="btn btn-primary"><FileCheck2 size={15} /> Print Audit PDF</button></div>
      </div>
      <PageHeading eyebrow="INSTITUTIONAL OVERVIEW" title="Admin Analytics" subtitle="Food consumption, waste performance, and compliance insights across your mess facilities." />
      <div className="kpi-grid admin-kpis">
        <MetricCard icon={<CookingPot />} label="Total Food Cooked" value="4,280 kg" detail="compared to previous month" trend="+2.1% MoM" trendColor="blue" iconColor="blue" />
        <MetricCard icon={<Leaf />} label="Total Food Leftover" value="385.2 kg" detail="compared to previous month" trend="-14.3% reduction" iconColor="green" />
        <MetricCard icon={<Activity />} label="Average Waste Rate" value="9.0%" detail="target < 5%" alert="Moderate Alert" iconColor="amber" />
        <MetricCard icon={<span className="rupee-icon">₹</span>} label="Estimated Cost Loss" value="₹38,520" detail="Based on ₹100/kg avg cost" iconColor="red" />
      </div>
      <div className="analytics-grid">
        <section className="panel chart-panel"><div className="panel-heading"><div><h2>Cooked vs. Wasted Volume Over Time</h2><p>Daily aggregated metrics across past 30 days (kg)</p></div><button className="icon-button" aria-label="More chart options"><ChevronDown size={17} /></button></div><div className="chart-legend"><span><i className="legend-blue" /> Cooked</span><span><i className="legend-red" /> Wasted</span></div><VolumeChart /></section>
        <section className="panel chart-panel breakdown-panel"><div className="panel-heading"><div><h2>Waste % Breakdown by Meal Shift</h2><p>Proportional comparison across Breakfast, Lunch, and Dinner</p></div><button className="icon-button" aria-label="More breakdown options"><ChevronDown size={17} /></button></div><div className="shift-bars">{[['Breakfast', '6.2%', 'Normal', 'blue', 31], ['Lunch', '8.5%', 'Warning', 'amber', 43], ['Dinner', '12.1%', 'Critical', 'red', 61]].map(([label, value, status, tone, width]) => <div className="shift-row" key={label}><div className="shift-top"><span>{label}</span><span className="shift-value">{value} <span>avg waste</span><b className={`status-tag ${tone}`}>{status}</b></span></div><div className="progress shift-progress"><div className={`progress-bar ${tone}`} style={{ width: `${width}%` }} /></div></div>)}</div><div className="benchmark-line"><span>BENCHMARK THRESHOLDS</span><div><i className="benchmark-blue" /> &lt;5% Normal <i className="benchmark-amber" /> 5–10% Warning <i className="benchmark-red" /> &gt;10% Critical</div></div></section>
      </div>
      <section className="panel admin-audit">
        <div className="panel-heading"><div><h2>Mess Log Audit &amp; Compliance</h2><p>Detailed service records with verified waste and financial-loss calculations</p></div><span className="record-count"><span /> LIVE AUDIT DATA</span></div>
        <div className="audit-toolbar"><div className="search-box"><Search size={16} /><input placeholder="Search date, meal..." value={search} onChange={(event) => setSearch(event.target.value)} /></div><select aria-label="Filter meal type" value={filter} onChange={(event) => setFilter(event.target.value)}><option value="">All Meal Types</option><option>Breakfast</option><option>Lunch</option><option>Dinner</option></select><select aria-label="Filter waste status" value={wasteStatus} onChange={(event) => setWasteStatus(event.target.value)}><option value="">All Waste Statuses</option><option>Normal</option><option>Warning</option><option>Critical</option></select><span className="showing-count">Showing 1–{filteredRows.length} of 180 entries</span></div>
        <div className="table-responsive"><table className="table data-table admin-table"><thead><tr><th>DATE</th><th>MEAL</th><th>HEADCOUNT</th><th>COOKED (KG)</th><th>WASTED (KG)</th><th>WASTE %</th><th>FINANCIAL LOSS (₹)</th><th>ACTION</th></tr></thead><tbody>{filteredRows.map((row) => <tr key={`${row[0]}-${row[1]}`}><td>{row[0]}</td><td className="fw-semibold">{row[1]}</td><td>{row[2]}</td><td>{row[3]}</td><td>{row[4]}</td><td><span className={`waste-chip ${row[6].toLowerCase()}`}>{row[5]} <small>{row[6]}</small></span></td><td className="fw-semibold">{row[7]}</td><td><button className="view-row" aria-label={`View ${row[1]} record for ${row[0]}`}><Eye size={16} /></button></td></tr>)}</tbody></table>{filteredRows.length === 0 && <div className="empty-table">No records match your search.</div>}</div>
        <div className="pagination-row"><span>Showing <strong>{filteredRows.length ? 1 : 0}–{filteredRows.length}</strong> of <strong>180</strong> records</span><div className="pagination-controls"><button disabled={page === 1} onClick={() => setPage(Math.max(1, page - 1))}>‹</button><button className="current-page">{page}</button><button onClick={() => setPage(page + 1)}>{page + 1}</button><button onClick={() => setPage(page + 2)}>{page + 2}</button><span>…</span><button onClick={() => setPage(36)}>36</button><button onClick={() => setPage(Math.min(36, page + 1))}>›</button></div><span>Page <strong>{page} of 36</strong></span></div>
      </section>
    </div>
  )
}

function VolumeChart() {
  return (
    <div className="chart-area">
      <div className="chart-y-labels"><span>250</span><span>200</span><span>150</span><span>100</span><span>50</span><span>0</span></div>
      <svg className="volume-chart" viewBox="0 0 700 220" role="img" aria-label="Line chart showing cooked volume substantially above wasted volume across September 15 to October 14">
        <defs><linearGradient id="cookedFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity=".16" /><stop offset="100%" stopColor="#3b82f6" stopOpacity="0" /></linearGradient></defs>
        {[20, 56, 92, 128, 164, 200].map((y) => <line key={y} x1="12" x2="690" y1={y} y2={y} className="chart-gridline" />)}
        <path d="M12 76 C45 68 52 92 85 84 S128 52 160 63 S205 86 236 70 S282 49 312 60 S357 78 388 66 S431 89 462 73 S509 42 538 54 S583 73 614 62 S663 42 690 50 L690 200 L12 200 Z" fill="url(#cookedFill)" />
        <path d="M12 76 C45 68 52 92 85 84 S128 52 160 63 S205 86 236 70 S282 49 312 60 S357 78 388 66 S431 89 462 73 S509 42 538 54 S583 73 614 62 S663 42 690 50" className="chart-line cooked" />
        <path d="M12 164 C42 160 57 175 85 168 S130 156 160 162 S207 173 236 166 S280 157 312 163 S357 172 388 165 S433 175 462 168 S505 153 538 160 S585 172 614 164 S663 154 690 161" className="chart-line wasted" />
        {[['Sep 15', 12], ['Sep 22', 177], ['Sep 29', 345], ['Oct 07', 513], ['Oct 14', 675]].map(([text, x]) => <text key={text} x={x} y="218" textAnchor={x === 12 ? 'start' : x === 675 ? 'end' : 'middle'} className="chart-x-label">{text}</text>)}
      </svg>
    </div>
  )
}

export default App
