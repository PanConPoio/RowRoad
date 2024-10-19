import GridPostList from "@/components/shared/GridPostList";
import Loader from "@/components/shared/Loader";
import { savePost } from "@/lib/appwrite/api";
import { useGetCurrentUser } from "@/lib/appwrite/react-query/queriesAndMutations"
import { Models } from "appwrite";

const Saved = () => {
  const { data: currentUser } = useGetCurrentUser();

  const savePosts = currentUser?.save
    .map((savePost: Models.Document) => ({
      ...savePost.post,
      creator: {
        imageUrl: currentUser.imageUrl,
      },
    }))
    .reverse();

  return (
    <div className="saved-container">
      <div className="flex gap-2 w-full max-w-5xl">
        <img
          src="/assets/icons/save.svg"
          width={36}
          height={36}
          alt="edit"
          className="invert-white"
        />
        <h2 className="h3-bold md:h2-bold text-left w-full">Publicaciones Guardadas</h2>
      </div>

      {!currentUser ? (
        <Loader />
      ) : (
        <ul className="w-full flex justify-center max-w-5xl gap-9">
          {savePosts.length === 0 ? (
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
          ) : (
            <GridPostList posts={savePosts} showStats={false} />
          )}
        </ul>
      )}
    </div>
  );
};

export default Saved;