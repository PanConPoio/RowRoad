import { Link, useLocation } from "react-router-dom";

import { bottombarLinks } from "@/constants";

const Bottombar = ({ unreadNotifications = 0 }) => {
  const { pathname } = useLocation();

  return (
    <section className="bottom-bar">
      {bottombarLinks.map((link) => {
        const isActive = pathname === link.route;
        const isNotificationLink = link.label === 'Notificaciones';
        return (
          <Link
            key={`bottombar-${link.label}`}
            to={link.route}
            className={`${
              isActive ? "rounded-[10px] bg-primary-500" : ""
            } flex-center p-2 transition relative`}
          >
            <img
              src={link.imgURL}
              alt={link.label}
              width={30}
              height={30}
            />
            {isNotificationLink && unreadNotifications > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 w-2 h-2 rounded-full"></span>
            )}
          </Link>
        );
      })}
    </section>
  );
};

export default Bottombar;