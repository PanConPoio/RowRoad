import{
useQuery,
useMutation,
useQueryClient,
useInfiniteQuery,
} from '@tanstack/react-query'
import { QUERY_KEYS } from './querysKeys';

import {
    createUserAccount,
    singInAccount,
    getCurrentUser,
    signOutAccount,
    getUsers,
    createPost,
    getPostById,
    updatePost,
    getUserPosts,
    deletePost,
    likePost,
    getUserById,
    updateUser,
    getRecentPosts,
    getInfinitePosts,
    searchPosts,
    savePost,
    deleteSavedPost,
    seguirUsuario,
    dejarDeSeguirUsuario,
    obtenerSeguidores,
    obtenerSeguidos,
    createComment,
    getComments,
    sendMessage,
    getMessages,
    deleteMessage,
    createNotification,
    getNotifications,
    markNotificationAsRead,
    deleteComment,
    addUserToGroup,
    removeUserFromGroup,
    getGroupMessages,
    createGroup,
    getUserGroups,
    checkEmailExists,
    requestPasswordReset,
    resetPassword,
  } from "@/lib/appwrite/api";
  import { INewPost, INewUser, IUpdatePost, IUpdateUser } from "@/types";

export const useCreateUserAccount = () => {
    return useMutation({
        mutationFn: (user: INewUser) => createUserAccount(user)
    })
}

export const useSingInAccount = () => {
    return useMutation({
        mutationFn: (user: {
        email: string; 
        password: string;
    }) => singInAccount(user)
    })
}

export const useSignOutAccount = () => {
    return useMutation({
        mutationFn: signOutAccount
    })
}

// POST QUERIES
// ============================================================

export const useGetPosts = () => {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
    queryFn: getInfinitePosts,
    //@ts-ignore
    getNextPageParam: (lastPage) => {
      if (lastPage && lastPage.documents.length === 0) return null;
      const lastId = lastPage?.documents[lastPage.documents.length - 1].$id;
      return lastId;
    },
  });
};
  
  export const useSearchPosts = (searchTerm: string) => {
    return useQuery({
      queryKey: [QUERY_KEYS.SEARCH_POSTS, searchTerm],
      queryFn: () => searchPosts(searchTerm),
      enabled: !!searchTerm,
    });
  };
  
  export const useGetRecentPosts = () => {
    return useQuery({
      queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      queryFn: getRecentPosts,
    });
  };
  
  export const useCreatePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (post: INewPost) => createPost(post),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
        });
      },
    });
  };
  
  export const useGetPostById = (postId: string) => {
    return useQuery({
      queryKey: [QUERY_KEYS.GET_POST_BY_ID, postId],
      queryFn: () => getPostById(postId),
      enabled: !!postId,
    });
  };
  
  export const useGetUserPosts = (userId?: string) => {
    return useQuery({
      queryKey: [QUERY_KEYS.GET_USER_POSTS, userId],
      queryFn: () => getUserPosts(userId),
      enabled: !!userId,
    });
  };
  
  export const useUpdatePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (post: IUpdatePost) => updatePost(post),
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id],
        });
      },
    });
  };
  
  export const useDeletePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ postId, imageId }: { postId?: string; imageId: string }) =>
        deletePost(postId, imageId),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
        });
      },
    });
  };
  
  export const useLikePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({
        postId,
        likesArray,
      }: {
        postId: string;
        likesArray: string[];
      }) => likePost(postId, likesArray),
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id],
        });
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
        });
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_POSTS],
        });
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_CURRENT_USER],
        });
      },
    });
  };
  
  export const useSavePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ userId, postId }: { userId: string; postId: string }) =>
        savePost(userId, postId),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
        });
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_POSTS],
        });
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_CURRENT_USER],
        });
      },
    });
  };
  
  export const useDeleteSavedPost = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (savedRecordId: string) => deleteSavedPost(savedRecordId),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
        });
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_POSTS],
        });
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_CURRENT_USER],
        });
      },
    });
  };
  
  // ============================================================
  // USER QUERIES
  // ============================================================
  
  export const useGetCurrentUser = () => {
    return useQuery({
      queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      queryFn: getCurrentUser,
    });
  };
  
  export const useGetUsers = (limit?: number) => {
    return useQuery({
      queryKey: [QUERY_KEYS.GET_USERS],
      queryFn: () => getUsers(limit),
    });
  };
  
  export const useGetUserById = (userId: string) => {
    return useQuery({
      queryKey: [QUERY_KEYS.GET_USER_BY_ID, userId],
      queryFn: () => getUserById(userId),
      enabled: !!userId,
    });
  };
  
  export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (user: IUpdateUser) => updateUser(user),
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_CURRENT_USER],
        });
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_USER_BY_ID, data?.$id],
        });
      },
    });
  };

  export const useSeguirUsuario = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ followerId, followedId }: { followerId: string; followedId: string }) =>
        seguirUsuario(followerId, followedId),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_USER_BY_ID],
        });
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_CURRENT_USER],
        });
      },
    });
  };
  
  export const useDejarDeSeguirUsuario = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ followerId, followedId }: { followerId: string; followedId: string }) =>
        dejarDeSeguirUsuario(followerId, followedId),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_USER_BY_ID],
        });
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_CURRENT_USER],
        });
      },
    });
  };
  
  export const useObtenerSeguidores = (userId: string) => {
    return useQuery({
      queryKey: [QUERY_KEYS.GET_USER_FOLLOWERS, userId],
      queryFn: () => obtenerSeguidores(userId),
    });
  };
  
  export const useObtenerSeguidos = (userId: string) => {
    return useQuery({
      queryKey: [QUERY_KEYS.GET_USER_FOLLOWING, userId],
      queryFn: () => obtenerSeguidos(userId),
    });
  };

  export const useCreateComment = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ postId, userId, content }: { postId: string; userId: string; content: string }) =>
        createComment(postId, userId, content),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_COMMENTS, variables.postId]
        });
      },
    });
  };
  
  export const useGetComments = (postId: string) => {
    return useQuery({
      queryKey: [QUERY_KEYS.GET_COMMENTS, postId],
      queryFn: () => getComments(postId),
      enabled: !!postId,
    });
  };

  export const useDeleteComment = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ commentId, postId }: { commentId: string; postId: string }) =>
        deleteComment(commentId, postId),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_COMMENTS, variables.postId],
        });
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_POST_BY_ID, variables.postId],
        });
      },
    });
  };

  export const useSendMessage = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (formData: FormData) => sendMessage(formData),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_MESSAGES],
        });
      },
    });
  };
  
  export const useDeleteMessage = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (messageId: string) => deleteMessage(messageId),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_MESSAGES],
        });
      },
    });
  };
  
  export const useGetMessages = (userId1: string, userId2: string) => {
    return useQuery({
      queryKey: [QUERY_KEYS.GET_MESSAGES, userId1, userId2],
      queryFn: () => getMessages(userId1, userId2),
      enabled: !!userId1 && !!userId2,
    });
  };

  export const useCreateNotification = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ senderId, receiverId, type, postId }: { senderId: string; receiverId: string; type: string; postId?: string }) =>
        createNotification(senderId, receiverId, type, postId),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_NOTIFICATIONS],
        });
      },
    });
  };
  
  export const useGetNotifications = (userId: string) => {
    return useQuery({
      queryKey: [QUERY_KEYS.GET_NOTIFICATIONS, userId],
      queryFn: () => getNotifications(userId),
      enabled: !!userId,
    });
  };
  
  export const useMarkNotificationAsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (notificationId: string) => markNotificationAsRead(notificationId),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_NOTIFICATIONS],
        });
      },
    });
  };

  export const useCreateGroup = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ name, creatorId, memberIds }: { name: string; creatorId: string; memberIds: string[] }) =>
        createGroup(name, creatorId, memberIds),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_USER_GROUPS],
        });
      },
    });
  };
  export const useAddUserToGroup = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ groupId, userId }: { groupId: string; userId: string }) =>
        addUserToGroup(groupId, userId),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_USER_GROUPS],
        });
      },
    });
  };
  
  export const useRemoveUserFromGroup = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ groupId, userId }: { groupId: string; userId: string }) =>
        removeUserFromGroup(groupId, userId),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_USER_GROUPS],
        });
      },
    });
  };
  
  export const useGetGroupMessages = (groupId: string) => {
    return useQuery({
      queryKey: [QUERY_KEYS.GET_GROUP_MESSAGES, groupId],
      queryFn: () => getGroupMessages(groupId),
      enabled: !!groupId,
    });
  };

  export const useGetUserGroups = (userId: string) => {
    return useQuery({
      queryKey: [QUERY_KEYS.GET_USER_GROUPS, userId],
      queryFn: () => getUserGroups(userId),
      enabled: !!userId,
    });
  };

  export const useCheckEmailExists = () => {
    return useMutation({
      mutationFn: (email: string) => checkEmailExists(email),
    });
  };
  
  export const useRequestPasswordReset = () => {
    return useMutation({
      mutationFn: (email: string) => requestPasswordReset(email),
    });
  };
  
  export const useResetPassword = () => {
    return useMutation({
      mutationFn: ({ userId, secret, password}: { userId: string; secret: string; password: string}) =>
        resetPassword(userId, secret, password),
    });
  };