import React, { useEffect, useState } from 'react';
import { Link, Outlet, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { useGetUserById, useSeguirUsuario, useDejarDeSeguirUsuario, useObtenerSeguidores, useObtenerSeguidos, useCreateNotification } from "@/lib/appwrite/react-query/queriesAndMutations";
import { useUserContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import GridPostList from "@/components/shared/GridPostList";
import Loader from "@/components/shared/Loader";
import LikePosts from './LikePosts';

const Profile = () => {
  const { pathname } = useLocation();
  const { id } = useParams<{ id: string }>();
  const { user } = useUserContext();
  const { data: currentUser, isLoading: isLoadingUser } = useGetUserById(id || "");
  const { data: seguidores, isLoading: isLoadingSeguidores } = useObtenerSeguidores(id || "");
  const { data: seguidos, isLoading: isLoadingSeguidos } = useObtenerSeguidos(id || "");
  const { mutate: seguirUsuario } = useSeguirUsuario();
  const { mutate: dejarDeSeguirUsuario } = useDejarDeSeguirUsuario();
  const [estaSiguiendo, setEstaSiguiendo] = useState(false);
  const { mutate: createNotification } = useCreateNotification();
const StatBlock = ({ value, label }: { value: number, label: string }) => (
  <div className="flex-center gap-2">
    <p className="small-semibold lg:body-bold text-primary-500">{value}</p>
    <p className="small-medium lg:base-medium text-light-2">{label}</p>
  </div>
);
  useEffect(() => {
    if (seguidores && user) {
      setEstaSiguiendo(seguidores.includes(user.id));
    }
  }, [seguidores, user]);

  const handleSeguirUsuario = () => {
    if (!user?.id || !currentUser?.$id) return;

    if (estaSiguiendo) {
      dejarDeSeguirUsuario({ followerId: user.id, followedId: currentUser.$id });
      createNotification({
        senderId: user.id,
        receiverId: currentUser.$id,
        type: "unfollow"
      });
    } else {
      seguirUsuario({ followerId: user.id, followedId: currentUser.$id });
      createNotification({
        senderId: user.id,
        receiverId: currentUser.$id,
        type: "follow"
      });
    }
    setEstaSiguiendo(!estaSiguiendo);
  };
  if (isLoadingUser || isLoadingSeguidores || isLoadingSeguidos) return <div className='flex-center w-full h-full'> <Loader /></div>;

  return (
    <div className="profile-container">
      <div className="profile-inner_container">
        <div className="flex xl:flex-row flex-col max-xl:items-center flex-1 gap-7">
          <img
            src={currentUser?.imageUrl || "/assets/icons/profile-placeholder.svg"}
            alt="foto de perfil"
            className="w-28 h-28 lg:h-36 lg:w-36 rounded-full"
          />
          <div className="flex flex-col flex-1 justify-between md:mt-2">
            <div className="flex flex-col w-full">
              <h1 className="text-center xl:text-left h3-bold md:h1-semibold w-full">
                {currentUser?.name}
              </h1>
              <p className="small-regular md:body-medium text-light-3 text-center xl:text-left">
                @{currentUser?.username}
              </p>
            </div>

            <div className="flex gap-8 mt-10 items-center justify-center xl:justify-start flex-wrap z-20">
              <StatBlock value={currentUser?.posts?.length || 0} label="Posts" />
              <StatBlock value={seguidores?.length || 0} label="Seguidores" />
              <StatBlock value={seguidos?.length || 0} label="Siguiendo" />
            </div>

            <p className="small-medium md:base-medium text-center xl:text-left mt-7 max-w-screen-sm">
              {currentUser?.bio}
            </p>
          </div>

          <div className="flex justify-center gap-4">
            {user.id !== currentUser?.$id && (
              <Button 
                type="button" 
                className="shad-button_primary px-8"
                onClick={handleSeguirUsuario}
              >
                {estaSiguiendo ? "Dejar de seguir" : "Seguir"}
              </Button>
            )}
            {user.id === currentUser?.$id && (
              <Link
                to={`/update-profile/${currentUser.$id}`}
                className={`h-12 bg-dark-4 px-5 text-light-1 flex-center gap-2 rounded-lg`}>
                <img
                  src={"/assets/icons/edit.svg"}
                  alt="editar"
                  width={20}
                  height={20}
                />
                <p className="flex whitespace-nowrap small-medium">
                  Editar Perfil
                </p>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="flex max-w-5xl w-full">
        <Link
          to={`/profile/${id}`}
          className={`profile-tab rounded-l-lg ${
            pathname === `/profile/${id}` && "!bg-dark-3"}`}>
          <img
            src={"/assets/icons/posts.svg"}
            alt="posts"
            width={30}
            height={30}
          />
          Publicaciones
        </Link>
        {currentUser?.$id === user.id && (
          <Link
            to={`/profile/${id}/like-posts`}
            className={`profile-tab rounded-r-lg ${
              pathname === `/profile/${id}/liked-posts` && "!bg-dark-3"}`}>
            <img
              src={"/assets/icons/like-posts.svg"}
              alt="like"
              width={30}
              height={30}
            />
            Tus Likes
          </Link>
        )}
      </div>

      <Routes>
        <Route
          index
          element={
            currentUser?.posts.length > 0 ? (
              <GridPostList posts={currentUser?.posts} showUser={false} />
            ) : (
              <div className="flex-center flex-col w-full h-full">
                <img
                  src={"/assets/icons/no-posts.svg"}
                  alt="No posts"
                  width={80}
                  height={80}
                  className="mb-4"
                />
                <p className="text-light-4">Sin publicaciones disponibles</p>
              </div>
            )
          }
        />
        {currentUser?.$id === user.id && (
          <Route path="/like-posts" element={<LikePosts />} />
        )}
      </Routes>
      <Outlet />
    </div>
  );
};

export default Profile;