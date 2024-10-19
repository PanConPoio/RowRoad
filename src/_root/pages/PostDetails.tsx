import { useParams, Link, useNavigate } from "react-router-dom";
import { multiFormatDateString } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";
import { useCreateComment, useDeletePost, useGetPostById, useGetUserPosts, useCreateNotification } from "@/lib/appwrite/react-query/queriesAndMutations";
import { Button } from "@/components/ui/button";
import Loader from "@/components/shared/Loader";
import PostStats from "@/components/shared/PostStats";
import GridPostList from "@/components/shared/GridPostList";
import CommentSection from '@/components/shared/CommentSection';
import { useState } from "react";

const PostDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useUserContext();
    const { data: post, isLoading } = useGetPostById(id || "");
    const { data: userPosts, isLoading: isUserPostLoading } = useGetUserPosts(post?.creator.$id);
    const [comment, setComment] = useState("");
    const { mutate: createComment } = useCreateComment();
    const { mutate: createNotification } = useCreateNotification();
    
    const { mutate: deletePost } = useDeletePost();

    const relatedPosts = userPosts?.documents.filter(
        (userPost) => userPost.$id !== id
    );

    const handleDeletePost = () => {
        deletePost({ postId: id, imageId: post?.mediaId });
        navigate(-1);
    };

    const handleSubmitComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (comment.trim() !== "" && id) {
            createComment({ postId: id, userId: user.id, content: comment });
            
            if (post?.creator.$id !== user.id) {
                createNotification({
                    senderId: user.id,
                    receiverId: post?.creator.$id,
                    type: "comment",
                    postId: id
                });
            }
            
            setComment("");
        }
    };

    const renderMedia = () => {
        if (!post) return null;

        if (post.mediaType === 'video') {
            return (
                <video 
                    src={post.mediaUrl} 
                    controls 
                    className="post_details-img w-full max-h-[500px] object-contain rounded-md"
                />
            );
        } else {
            return (
                <img
                    src={post.mediaUrl}
                    alt="post image"
                    className="post_details-img w-full max-h-[500px] object-contain rounded-md"
                />
            );
        }
    };

    return (
        <div className="post_details-container">
            <div className="hidden md:flex max-w-5xl w-full">
                <Button
                    onClick={() => navigate(-1)}
                    variant="ghost"
                    className="shad-button_ghost">
                    <img
                        src={"/assets/icons/back.svg"}
                        alt="back"
                        width={35}
                        height={35}
                    />
                    <p className="small-medium lg:base-medium">Regresar</p>
                </Button>
            </div>

            {isLoading || !post ? (
                <Loader />
            ) : (
                <div className="post_details-card">
                    {renderMedia()}

                    <div className="post_details-info">
                        <div className="flex-between w-full">
                            <Link
                                to={`/profile/${post?.creator.$id}`}
                                className="flex items-center gap-3">
                                <img
                                    src={
                                        post?.creator.imageUrl ||
                                        "/assets/icons/profile-placeholder.svg"
                                    }
                                    alt="creator"
                                    className="w-8 h-8 lg:w-12 lg:h-12 rounded-full"
                                />
                                <div className="flex gap-1 flex-col">
                                    <p className="base-medium lg:body-bold text-light-1">
                                        {post?.creator.name}
                                    </p>
                                    <div className="flex-center gap-2 text-light-3">
                                        <p className="subtle-semibold lg:small-regular ">
                                            {multiFormatDateString(post?.$createdAt)}
                                        </p>
                                        •
                                        <p className="subtle-semibold lg:small-regular">
                                            {post?.location}
                                        </p>
                                    </div>
                                </div>
                            </Link>

                            <div className="flex-center gap-4">
                                <Link
                                    to={`/update-post/${post?.$id}`}
                                    className={`${user.id !== post?.creator.$id && "hidden"}`}>
                                    <img
                                        src={"/assets/icons/edit.svg"}
                                        alt="edit"
                                        width={24}
                                        height={24}
                                    />
                                </Link>

                                <Button
                                    onClick={handleDeletePost}
                                    variant="ghost"
                                    className={`post_details-delete_btn ${
                                        user.id !== post?.creator.$id && "hidden"
                                    }`}>
                                    <img
                                        src={"/assets/icons/delete.svg"}
                                        alt="delete"
                                        width={32}
                                        height={32}
                                    />
                                </Button>
                            </div>
                        </div>

                        <hr className="border w-full border-dark-4/80" />

                        <div className="flex flex-col flex-1 w-full small-medium lg:base-regular">
                            <p>{post?.caption}</p>
                            <ul className="flex gap-1 mt-2">
                                {post?.tags.map((tag: string, index: string) => (
                                    <li
                                        key={`${tag}${index}`}
                                        className="text-light-3 small-regular">
                                        #{tag}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <CommentSection postId={post.$id} />

                        <div className="w-full">
                            <PostStats post={post} userId={user.id} />
                        </div>
                        <form onSubmit={handleSubmitComment} className="flex w-full gap-2 mb-90">
                            <input
                                type="text"
                                placeholder="Escribe un comentario..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="w-full bg-dark-4 rounded-lg p-2 text-light-1"
                            />
                            <button type="submit" className="bg-dark-4 p-2 rounded-lg">
                                <img src="/assets/icons/comment.svg" alt="Enviar comentario" className="w-6 h-6" />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="w-full max-w-5xl">
                <hr className="border w-full border-dark-4/80" />

                <h3 className="body-bold md:h3-bold w-full my-10">
                    Más Publicaciones del Creador
                </h3>
                {isUserPostLoading ? (
                    <Loader />
                ) : relatedPosts && relatedPosts.length > 0 ? (
                    <GridPostList posts={relatedPosts} />
                ) : (
                    <p className="text-light-4 mt-10 text-center w-full">No hay más publicaciones de este creador.</p>
                )}
            </div>
        </div>
    );
};

export default PostDetails;