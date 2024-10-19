import PostForm from "@/components/forms/PostForm";
import Loader from "@/components/shared/Loader";
import { useGetPostById } from "@/lib/appwrite/react-query/queriesAndMutations";
import { useParams } from "react-router-dom";

const EditPost = () => {
  const { id } = useParams<{ id: string }>();
  const { data: post, isPending, isError } = useGetPostById(id || "");

  if (isPending)  return (
    <div className="flex-center w-full h-full">
      <Loader />
    </div>
  );

  if (isError) return <div 
  className="flex-center w-full h-full">
    Error al cargar la publicación
    </div>;

  return (
    <div className="flex flex-1">
      <div className="common-container">
        <div className="max-w-5xl flex-start gap-3 justify-start w-full">
          <img
            src="/assets/icons/add-post.svg"
            width={36}
            height={36}
            alt="add"
          />
          <h2 className="h3-bold md:h2-bold text-left w-full">Editar Publicación</h2>
        </div>
        {post ? (
          <PostForm action="update" post={post} />
        ) : (
          <div>No se encontró la publicación</div>
        )}
      </div>
    </div>
  );
};

export default EditPost;