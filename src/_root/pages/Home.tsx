import { Models } from "appwrite";
import { useToast } from "@/components/ui/use-toast";

import { useGetRecentPosts, useGetUsers, useGetCurrentUser } from "@/lib/appwrite/react-query/queriesAndMutations";
import Loader from "@/components/shared/Loader";
import PostCard from "@/components/shared/PostCard";
import UserCard from "@/components/shared/UseCard";

const Home = () => {
  const { toast } = useToast();

  const {
    data: posts,
    isLoading: isPostLoading,
    isError: isErrorPosts,
  } = useGetRecentPosts();
  const {
    data: creators,
    isLoading: isUserLoading,
    isError: isErrorCreators,
  } = useGetUsers(10);
  const { data: currentUser } = useGetCurrentUser();

  if (isErrorPosts || isErrorCreators) {
    return (
      <div className="flex flex-1">
        <div className="home-container">
          <p className="body-medium text-light-1">Ocurrió un error</p>
        </div>
        <div className="home-creators">
          <p className="body-medium text-light-1">Ocurrió un error</p>
        </div>
      </div>
    );
  }

  const filteredCreators = creators?.documents.filter(creator => creator.$id !== currentUser?.$id);

  return (
    <div className="flex flex-1">
      <div className="home-container flex-1 overflow-y-auto">
        <div className="home-posts px-4 py-6 md:px-8">
          <h2 className="h3-bold md:h2-bold text-left w-full mb-6">Inicio</h2>
          {isPostLoading && !posts ? (
            <Loader />
          ) : (
            <ul className="flex flex-col gap-6">
              {posts?.documents.map((post: Models.Document) => (
                <li key={post.$id} className="w-full max-w-screen-sm mx-auto">
                  <PostCard post={post} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="home-creators">
        <h3 className="h3-bold text-light-1">Sugerencias</h3>
        {isUserLoading && !creators ? (
          <Loader />
        ) : (
          <ul className="grid 2xl:grid-cols-2 gap-6">
            {filteredCreators?.map((creator) => (
              <li key={creator?.$id}>
                <UserCard user={creator} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Home;