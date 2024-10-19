import React from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Models } from 'appwrite'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { HeartIcon, UserMinus, UserPlusIcon, MessageSquareIcon, BookmarkIcon, ShareIcon, MessageCircle, BellIcon } from 'lucide-react'

interface NotificationItemProps {
  notification: Models.Document
  onMarkAsRead: (id: string) => void
}

const NotificationIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'like':
      return <HeartIcon className="w-4 h-4 text-light-4" />
    case 'follow':
      return <UserPlusIcon className="w-4 h-4 text-light-4" />
    case 'unfollow':
      return <UserMinus className="w-4 h-4 text-light-4" />
    case 'comment':
      return <MessageSquareIcon className="w-4 h-4 text-light-4" />
    case 'save':
      return <BookmarkIcon className="w-4 h-4 text-light-4" />
    case 'share':
      return <ShareIcon className="w-4 h-4 text-light-4" />
    case 'message':
      return <MessageCircle className="w-4 h-4 text-light-4" />
    default:
      return <BellIcon className="w-4 h-4 text-light-4" />
  }
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkAsRead }) => {
  return (
    <div className={`notification-item ${!notification.is_read ? 'bg-dark-3' : ''}`}>
      <div className="notification-content">
        <div className="notification-icon">
          <NotificationIcon type={notification.type} />
        </div>
        <div className="notification-text">
          <Link to={`/profile/${notification.sender.$id}`} className="flex items-center gap-2 mb-1">
            <Avatar
              imageUrl={notification.sender.imageUrl || "/assets/icons/profile-placeholder.svg"}
              username={notification.sender.name}
              fallback={notification.sender.name.charAt(0)}
              size="sm"
            />
            <span className="font-semibold text-sm text-light-1">{notification.sender.name}</span>
          </Link>
          <p className="notification-message">
            {notification.type === 'like' && 'le dio like a tu publicación'}
            {notification.type === 'comment' && 'comentó en tu publicación'}
            {notification.type === 'follow' && 'comenzó a seguirte'}
            {notification.type === 'unfollow' && 'dejó de seguirte'}
            {notification.type === 'save' && 'guardó tu publicación'}
            {notification.type === 'share' && 'compartió tu publicación'}
            {notification.type === 'message' && 'te envió un mensaje'}
          </p>
          <p className="notification-time">
            {formatDistanceToNow(new Date(notification.$createdAt), { addSuffix: true, locale: es })}
          </p>
        </div>
        {notification.type !== 'follow' && notification.type !== 'unfollow' && notification.post && (
          <Link to={`/posts/${notification.post.$id}`} className="flex-shrink-0">
            <img
              src={notification.post.imageUrl || "/assets/icons/post-placeholder.svg"}
              alt="post"
              className="w-14 h-14 rounded-md object-cover"
            />
          </Link>
        )}
      </div>
      {!notification.is_read && (
        <div className="notification-actions">
          <Button 
            onClick={() => onMarkAsRead(notification.$id)} 
            variant="ghost" 
            size="sm" 
            className="notification-button"
          >
            Marcar como leída
          </Button>
        </div>
      )}
    </div>
  )
}

export default NotificationItem