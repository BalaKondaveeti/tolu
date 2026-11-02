import { TabBar } from './components/TabBar'
import { useFlushOnHide } from './data/useBump'
import { useSession } from './lib/auth'
import { useForegroundRefresh } from './lib/cache'
import { useHashRoute } from './lib/useHashRoute'
import { CounterDetail } from './pages/CounterDetail'
import { CountersPage } from './pages/CountersPage'
import { Home } from './pages/Home'
import { QuotesPage } from './pages/QuotesPage'
import { Settings } from './pages/Settings'
import { SignIn } from './pages/SignIn'
import { WakeUp } from './pages/WakeUp'

export default function App() {
  const { session, ready } = useSession()
  const [section, param] = useHashRoute()
  useForegroundRefresh()
  useFlushOnHide()

  if (!ready) return <div className="splash" aria-label="Loading" />
  if (!session) return <SignIn />

  let page
  let tab = 'home'
  if (section === 'counter' && param) {
    page = <CounterDetail id={param} />
    tab = 'counter'
  } else if (section === 'counter') {
    page = <CountersPage />
    tab = 'counter'
  } else if (section === 'wakeup' && param === 'quotes') {
    page = <QuotesPage />
    tab = 'wakeup'
  } else if (section === 'wakeup') {
    page = <WakeUp />
    tab = 'wakeup'
  } else if (section === 'settings') {
    page = <Settings session={session} />
    tab = 'settings'
  } else {
    page = <Home />
  }

  // Keyed by user so nothing from a previous account lingers in component state.
  return (
    <div className={`app${tab === 'home' ? ' app--tabbar' : ''}`} key={session.user.id}>
      {page}
      {tab === 'home' && <TabBar active={tab} />}
    </div>
  )
}
