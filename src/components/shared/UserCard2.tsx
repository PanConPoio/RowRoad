import { Models } from "appwrite";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";

type UserCardProps = {
  user: Models.Document;
  onSelectForChat?: (user: Models.Document) => void;
};

const UserCard2 = ({ user, onSelectForChat }: UserCardProps) => {
  const handleChatClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onSelectForChat) {
      onSelectForChat(user);
    }
  };

  return (
    <div className="user-card flex items-center justify-between p-4 border-b">
      <Link to={`/profile/${user.$id}`} className="flex items-center">
        <img
          src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
          alt="creator"
          className="rounded-full w-14 h-14 mr-4"
        />

        <div className="flex-col">
          <p className="base-medium text-light-1 line-clamp-1">
            {user.name}
          </p>
          <p className="small-regular text-light-3 line-clamp-1">
            @{user.username}
          </p>
        </div>
      </Link>

      <div className="flex gap-2">
        <Button type="button" size="sm" className="shad-button_primary px-5">
          Seguir
        </Button>
        {onSelectForChat && (
          <Button 
            type="button" 
            size="sm" 
            variant="outline" 
            className="px-5"
            onClick={handleChatClick}
          >
            Chat
          </Button>
        )}
      </div>
    </div>
  );
};

export default UserCard2;