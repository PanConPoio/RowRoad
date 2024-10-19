import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";
import { useCreateComment, useGetComments, useDeleteComment } from "@/lib/appwrite/react-query/queriesAndMutations";
import { multiFormatDateString } from "@/lib/utils";
import { Models } from 'appwrite';
import { Avatar } from '../ui/avatar';
import { Button } from '../ui/button';
import { Trash2 } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import Loader from './Loader';

type CommentSectionProps = {
    postId: string;
}

const CommentSection = ({ postId }: CommentSectionProps) => {
    const { user } = useUserContext();
    const [comment, setComment] = useState("");
    const { data: comments, isLoading } = useGetComments(postId);
    const { mutate: deleteComment } = useDeleteComment();

    const handleDeleteComment = (commentId: string) => {
        deleteComment({ commentId, postId });
    };

    return (
        <div className="w-full mt-4">
            <h3 className="text-lg font-semibold mb-2">Comentarios</h3>
            <ScrollArea className="h-[200px] w-full">
                {isLoading ? (
                    <div className="flex-center w-full h-full">
                    <Loader />
                  </div>
                ) : (
                    <div className="space-y-4">
                        {comments?.map((comment: Models.Document) => (
                            <div key={comment.$id} className="flex items-start gap-3">
                                <Link to={`/profile/${comment.user?.$id || comment.user_id}`}>
                                    <Avatar
                                        imageUrl={comment.user?.imageUrl || comment.user_imageUrl}
                                        username={comment.user?.username || comment.user_username}
                                    />
                                </Link>
                                <div className="flex-1">
                                    <div className="flex gap-2 items-center">
                                        <Link to={`/profile/${comment.user?.$id || comment.user_id}`} className="small-medium lg:base-medium text-light-1">
                                            {comment.user?.username || comment.user_username || 'Usuario desconocido'}
                                        </Link>
                                        <p className="subtle-semibold lg:small-regular text-light-3">
                                            {multiFormatDateString(comment.$createdAt)}
                                        </p>
                                    </div>
                                    <p className="small-regular lg:base-regular text-light-2">{comment.content}</p>
                                </div>
                                {(user.id === comment.user?.$id || user.id === comment.user_id) && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteComment(comment.$id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
};

export default CommentSection;