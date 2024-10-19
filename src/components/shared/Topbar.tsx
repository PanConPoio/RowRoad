import { Link, useNavigate } from 'react-router-dom'
import { useSignOutAccount } from '@/lib/appwrite/react-query/queriesAndMutations'
import { useEffect, useState } from 'react'
import { useUserContext } from '@/context/AuthContext'
import { LogOut } from 'lucide-react'

export default function Topbar() {
  const { mutate: signOut, isSuccess } = useSignOutAccount()
  const navigate = useNavigate()
  const { user } = useUserContext()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    if (isSuccess) navigate(0)
  }, [isSuccess, navigate])

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <>
      <section className="topbar bg-dark-2 text-light-1 w-full">
        <div className="flex justify-between items-center py-2 px-4">
          <Link to="/" className="flex items-center">
            <img
              src="/assets/images/logo.svg"
              alt="logo"
              width={170}
              height={40}
            />
          </Link>

          <button className="p-2" onClick={toggleMenu}>
            <img 
              src={user.imageUrl || '/assets/images/profile-placeholder.svg'}
              alt="profile"
              className="h-10 w-10 rounded-full"
            />
          </button>
        </div>
      </section>

      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`} 
        onClick={toggleMenu}
      ></div>
      <div 
        className={`fixed top-0 right-0 w-64 h-full bg-dark-3 text-light-1 p-4 shadow-lg z-50 transition-transform duration-300 ease-in-out transform ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <button onClick={toggleMenu}>
            <img src="/assets/icons/close.svg" alt="Close" className="w-9 h-9" />
          </button>
        </div>
        <div className="space-y-4">
          <button
            className="w-full text-left py-2 px-4 hover:bg-dark-4 rounded-lg transition duration-200"
            onClick={() => {
              navigate(`/profile/${user.id}`)
              setIsMenuOpen(false)
            }}
          >
            <div className="flex items-center">
              <img src="/assets/icons/user.svg" alt="Profile" className="w-9 h-9 mr-2" />
              Perfil
            </div>
          </button>
          <button
            className="w-full text-left py-2 px-4 hover:bg-dark-4 rounded-lg transition duration-200"
            onClick={() => {
              navigate('/explore')
              setIsMenuOpen(false)
            }}
          >
            <span className="flex items-center">
              <img src="/assets/icons/wallpaper.svg" alt="Explore" className="w-9 h-9 mr-2" />
              Explorar
            </span>
          </button>
          <button
            className="w-full text-left py-2 px-4 hover:bg-dark-4 rounded-lg transition duration-200"
            onClick={() => {
              navigate('/notification')
              setIsMenuOpen(false)
            }}
          >
            <span className="flex items-center">
              <img src="/assets/icons/bell.svg" alt="Notifications" className="w-9 h-9 mr-2" />
              Notificaciones
            </span>
          </button>
        </div>
        <button
          className="w-full text-center py-2 px-4 bg-light-4 text-light-1 rounded-lg mt-6"
          onClick={() => signOut()}
        >
          <span className="flex items-center justify-center">
            <LogOut size={20} className="mr-2" />
            Cerrar Sesion
          </span>
        </button>
      </div>
    </>
  )
}