import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

export default function Layout() {
  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center">
      <Header />
      <main className="w-full max-w-[1200px] px-6 md:px-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
