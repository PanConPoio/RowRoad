import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import { useSignOutAccount } from '@/lib/appwrite/react-query/queriesAndMutations';
import { useEffect } from 'react';
import { useUserContext } from '@/context/AuthContext';
import { sidebarLinks } from '@/constants';
import { INavLink } from '@/types';

const LeftSidebar = ({ unreadNotifications = 0 }) => {
    const { mutate: signOut, isSuccess } = useSignOutAccount();
    const navigate = useNavigate();
    const { user } = useUserContext();

    useEffect(() => {
        if(isSuccess) navigate(0);
    }, [isSuccess])

  return (
    <nav className='leftsidebar'>
        <div className='flex flex-col gap-11'>
            <Link to="/" className="flex gap-3 items-center">
                <img
                    src='/assets/images/logo.svg'
                    alt='logo'
                    width={180}
                    height={38}
                />
            </Link>

            <Link to={`/profile/${user.id}`} className="flex gap-3 items-center">
                <img
                    src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
                    alt="profile"
                    className="h-14 w-14 rounded-full"
                />
                <div className="flex flex-col">
                    <p className="body-bold">{user.name}</p>
                    <p className="small-regular text-light-5">@{user.username}</p>
                </div>
            </Link>

            <ul className='flex flex-col gap-6'>
                {sidebarLinks.map((link: INavLink) => {
                    const isNotificationLink = link.label === 'Notificaciones';
                    return(
                        <li key={link.label} className="leftsidebar-link relative">
                            <NavLink 
                                to={link.route}
                                className={({ isActive }) => `
                                    flex gap-4 items-center p-4 transition-colors duration-200 rounded-lg
                                    ${isActive 
                                        ? "bg-primary-500 text-gray-900" 
                                        : "text-white hover:bg-primary-600"
                                    }
                                `}
                            >
                                <img 
                                    src={link.imgURL}
                                    alt={link.label}
                                    className='w-6 h-6'
                                />
                                <span>{link.label}</span>
                                {isNotificationLink && unreadNotifications > 0 && (
                                    <span className="absolute top-0 right-0 bg-red-500 text-red rounded-full px-2 py-1 text-xs">
                                        {unreadNotifications}
                                    </span>
                                )}
                            </NavLink>
                        </li>
                    )
                })}
            </ul>
        </div>

        <Button
            variant="ghost"
            className="shad-button_ghost"
            onClick={() => signOut()}
        >
            <img src="/assets/icons/logout.svg" alt="logout" />
            <p className='small-medium lg:base-medium'>Cerrar Sesión</p>
        </Button>
    </nav>
  )
}

export default LeftSidebar