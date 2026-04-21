import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'

function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
      <h1 className="text-4xl font-bold text-slate-900">404</h1>
      <p className="text-slate-600">The page you requested does not exist.</p>
      <Link to="/">
        <Button>Back to home</Button>
      </Link>
    </div>
  )
}

export default NotFoundPage
