import React, { useState, useEffect } from 'react';
import { useUserContext } from "@/context/AuthContext";
import { useDeleteSavedPost, useGetCurrentUser, useLikePost, useSavePost, useGetComments, useCreateNotification } from "@/lib/appwrite/react-query/queriesAndMutations";
import { Models } from "appwrite";
import { checkIsLiked } from '@/lib/utils';
import { Link } from 'react-router-dom';

type PostStatsProps = {
    post: Models.Document;
    userId: string;
}

const PostStats = ({ post, userId }: PostStatsProps) => {
    const likeList = post.likes.map((user: Models.Document) => user.$id)
    const [likes, setlikes] = useState(likeList);
    const [isSaved, setIsSaved] = useState(false);

    const { mutate: likePost } = useLikePost();
    const { mutate: savePost } = useSavePost();
    const { mutate: deleteSavePost } = useDeleteSavedPost();
    const { mutate: createNotification } = useCreateNotification();
    const { data: comments } = useGetComments(post.$id);
    
    const { data: currentUser } = useGetCurrentUser();
    const savedPostRecord = currentUser?.save.find(
      (record: Models.Document) => record.post.$id === post.$id);

    useEffect(() => {
      setIsSaved(savedPostRecord ? true: false)
    }, [currentUser])

    const handleLikePost = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
      e.stopPropagation();
  
      let likesArray = [...likes];
  
      if (likesArray.includes(userId)) {
        likesArray = likesArray.filter((Id) => Id !== userId);
      } else {
        likesArray.push(userId);
        // Crear notificación de like
        if (userId !== post.creator.$id) {
          createNotification({
            senderId: userId,
            receiverId: post.creator.$id,
            type: "like",
            postId: post.$id
          });
        }
      }
  
      setlikes(likesArray);
      likePost({ postId: post.$id, likesArray });
    };

    const handleSavePost = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
        e.stopPropagation();
    
        if (savedPostRecord) {
          setIsSaved(false);
          return deleteSavePost(savedPostRecord.$id);
        }
    
        savePost({ userId: userId, postId: post.$id });
        setIsSaved(true);
    };

    return (
        <div className="flex justify-between items-center z-20">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <img
                src={checkIsLiked(likes, userId) ? "/assets/icons/liked.svg" : "/assets/icons/like.svg"}
                alt="me gusta"
                width={29}
                height={29}
                onClick={handleLikePost}
                className="cursor-pointer"
              />
              <span className="text-sm">{likes.length}</span>
            </div>
    
            <Link to={`/posts/${post.$id}`} className="flex items-center gap-2">
              <img
                src="/assets/icons/comments.svg"
                alt="comentarios"
                width={29}
                height={29}
                className="cursor-pointer"
              />
              <span className="text-sm">{comments?.length || 0}</span>
            </Link>
          </div>
    
          <div className="flex items-center gap-2">
            <img
              src={isSaved ? "/assets/icons/saved.svg" : "/assets/icons/save.svg"}
              alt="guardar"
              width={29}
              height={29}
              onClick={handleSavePost}
              className="cursor-pointer"
            />
          </div>
        </div>
      )
    }

export default PostStats