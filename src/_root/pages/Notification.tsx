import React from 'react'
import { Link } from 'react-router-dom'
import { useGetNotifications, useMarkNotificationAsRead } from '@/lib/appwrite/react-query/queriesAndMutations'
import { useUserContext } from '@/context/AuthContext'
import Loader from '@/components/shared/Loader'
import { ScrollArea } from '@/components/ui/scroll-area'
import { BellIcon } from 'lucide-react'
import NotificationItem from '@/components/shared/NotificationItem'

const Notification = () => {
  const { user } = useUserContext()
  const { data: notifications, isLoading } = useGetNotifications(user.id)
  const { mutate: markAsRead } = useMarkNotificationAsRead()

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId)
  }

  if (isLoading) return <div className='flex-center w-full h-full'><Loader /></div>

  return (
    <div className="notifications-container">
      <div className="notifications-header">
          <BellIcon className="w-9 h-6 gap-3" />
          <h2 className="h3-bold md:h2-bold text-left w-full">Notificaciones</h2>
        
      </div>
      <ScrollArea className="w-full max-w-5xl">
        <div className="notifications-list">
          {notifications && notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.$id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
              />
            ))
          ) : (
            <p className="text-center py-4 text-light-3">No tienes notificaciones</p>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

export default Notification