import { ID, Query, ImageGravity  } from "appwrite";
import { appwriteConfig, account, databases, storage, avatars } from "./config";
import { IUpdatePost, INewPost, INewUser, IUpdateUser,  } from "@/types";



// ============================== SIGN UP
export async function createUserAccount(user: INewUser) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      user.email,
      user.password,
      user.name
    );

    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(user.name);

    const newUser = await saveUserToDB({
      accountId: newAccount.$id,
      name: newAccount.name,
      phone: newAccount.phone,
      email: newAccount.email,
      username: user.username,
      imageUrl: avatarUrl,
    });

    return newUser;
  } catch (error) {
    console.log(error);
    return error;
  }
}

// ============================== SAVE USER TO DB
export async function saveUserToDB(user: {
  accountId: string;
  email: string;
  phone: string;
  name: string;
  imageUrl: URL;
  username?: string;
}) {
  try {
    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      user
    );

    return newUser;
  } catch (error) {
    console.log(error);
  }
}

// ============================== SIGN IN
export async function singInAccount(user: { email: string; password: string }) {
  try {
    const session = await account.createEmailPasswordSession(user.email, user.password);

    return session;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET ACCOUNT
export async function getAccount() {
  try {
    const currentAccount = await account.get();

    return currentAccount;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET USER
export async function getCurrentUser() {
  try {
    const currentAccount = await getAccount();

    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
    return null;
  }
}

// ============================== SIGN OUT
export async function signOutAccount() {
  try {
    const session = await account.deleteSession("current");

    return session;
  } catch (error) {
    console.log(error);
  }
}

// POSTS
// ============================================================

// ============================== CREATE POST
export async function createPost(post: INewPost) {
  try {
    const file = post.file[0];
    if (!file) throw Error("No se ha seleccionado ningún archivo");
    const uploadedFile = await uploadFile(file);
    if (!uploadedFile) throw Error;
    const fileUrl = getFilePreview(uploadedFile.$id);
    if (!fileUrl) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }
    const isVideo = file.type.startsWith('video/');

    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      ID.unique(),
      {
        creator: post.userId,
        caption: post.caption,
        mediaUrl: fileUrl,
        mediaId: uploadedFile.$id,
        mediaType: isVideo ? 'video' : 'image',
        location: post.location,
        tags: tags,
      }
    );

    if (!newPost) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    return newPost;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// ============================== UPLOAD FILE
export async function uploadFile(file: File) {
  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      file
    );

    return uploadedFile;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET FILE URL
export function getFilePreview(fileId: string) {
  try {
    const fileUrl = storage.getFilePreview(
      appwriteConfig.storageId,
      fileId,
      2000,
      2000,
      ImageGravity.Top,
      100
    );

    if (!fileUrl) throw Error;

    return fileUrl;
  } catch (error) {
    console.log(error);
  }
}

// ============================== DELETE FILE
export async function deleteFile(fileId: string) {
  try {
    await storage.deleteFile(appwriteConfig.storageId, fileId);

    return { status: "ok" };
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET POSTS
export async function searchPosts(searchTerm: string) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.search("caption", searchTerm)]
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}

export async function getInfinitePosts({ pageParam }: { pageParam: number }) {
  const queries: any[] = [Query.orderDesc("$updatedAt"), Query.limit(9)];

  if (pageParam) {
    queries.push(Query.cursorAfter(pageParam.toString()));
  }

  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      queries
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET POST BY ID
export async function getPostById(postId: string) {
  try {
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );
    return post;
  } catch (error) {
    console.log(error);
  }
}
// ============================== UPDATE POST
export async function updatePost(post: IUpdatePost) {
  const hasFileToUpdate = post.file.length > 0;

  try {
    let mediaUrl = post.mediaUrl;
    let mediaId = post.mediaId;

    if (hasFileToUpdate) {
      const uploadedFile = await uploadFile(post.file[0]);
      if (!uploadedFile) throw Error;
      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      mediaUrl = fileUrl;
      mediaId = uploadedFile.$id;
    }
    const mediaType = hasFileToUpdate
      ? post.file[0].type.startsWith('video/') ? 'video' : 'image'
      : post.mediaType;
    const tags = post.tags?.replace(/ /g, "").split(",") || [];
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      post.postId,
      {
        caption: post.caption,
        mediaUrl: mediaUrl,
        mediaId: mediaId,
        mediaType: mediaType,
        location: post.location,
        tags: tags,
      }
    );
    if (!updatedPost) {
      if (hasFileToUpdate) {
        await deleteFile(mediaId);
      }
      throw Error;
    }
    if (hasFileToUpdate && post.mediaId) {
      await deleteFile(post.mediaId);
    }

    return updatedPost;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// ============================== DELETE POST
export async function deletePost(postId?: string, imageId?: string) {
  if (!postId || !imageId) return;

  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    if (!statusCode) throw Error;

    await deleteFile(imageId);

    return { status: "Ok" };
  } catch (error) {
    console.log(error);
  }
}

// ============================== LIKE / UNLIKE POST
export async function likePost(postId: string, likesArray: string[]) {
  try {
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId,
      {
        likes: likesArray,
      }
    );

    if (!updatedPost) throw Error;

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

// ============================== SAVE POST
export async function savePost(userId: string, postId: string) {
  try {
    const updatedPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      ID.unique(),
      {
        user: userId,
        post: postId,
      }
    );

    if (!updatedPost) throw Error;

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}
// ============================== DELETE SAVED POST
export async function deleteSavedPost(savedRecordId: string) {
  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      savedRecordId
    );

    if (!statusCode) throw Error;

    return { status: "Ok" };
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET USER'S POST
export async function getUserPosts(userId?: string) {
  if (!userId) return;

  try {
    const post = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.equal("creator", userId), Query.orderDesc("$createdAt")]
    );

    if (!post) throw Error;

    return post;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET POPULAR POSTS (BY HIGHEST LIKE COUNT)
export async function getRecentPosts() {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(20)]
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}

// USER

// ============================== GET USERS
export async function getUsers(limit?: number) {
  const queries: any[] = [Query.orderDesc("$createdAt")];

  if (limit) {
    queries.push(Query.limit(limit));
  }

  try {
    const users = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      queries
    );

    if (!users) throw Error;

    return users;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET USER BY ID
export async function getUserById(userId: string) {
  try {
    const user = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId
    );

    return user;
  } catch (error) {
    console.error(`Error al obtener usuario con ID ${userId}:`, error);
  }
}
// ============================== UPDATE USER
export async function updateUser(user: IUpdateUser) {
  const hasFileToUpdate = user.file.length > 0;
  try {
    let image = {
      imageUrl: user.imageUrl,
      imageId: user.imageId,
    };

    if (hasFileToUpdate) {
      const uploadedFile = await uploadFile(user.file[0]);
      if (!uploadedFile) throw Error;
      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }
    const updatedUser = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      user.userId,
      {
        name: user.name,
        bio: user.bio,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
      }
    );

    if (!updatedUser) {
      if (hasFileToUpdate) {
        await deleteFile(image.imageId);
      }
      throw Error;
    }

    if (user.imageId && hasFileToUpdate) {
      await deleteFile(user.imageId);
    }

    return updatedUser;
  } catch (error) {
    console.log(error);
  }
}

//FOLLOWERS
export async function seguirUsuario(followerId: string, followedId: string) {
  try {
    const nuevoSeguidor = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.followersCollectionId,
      ID.unique(),
      {
        follower_id: followerId,
        followed_id: followedId,
      }
    );
    return nuevoSeguidor;
  } catch (error) {
    console.error("Error al seguir usuario:", error);
    throw error;
  }
}

// UNFOLLOW
export async function dejarDeSeguirUsuario(followerId: string, followedId: string) {
  try {
    const relaciones = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.followersCollectionId,
      [
        Query.equal("follower_id", followerId),
        Query.equal("followed_id", followedId)
      ]
    );

    if (relaciones.documents.length > 0) {
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.followersCollectionId,
        relaciones.documents[0].$id
      );
    }
    return { success: true };
  } catch (error) {
    console.error("Error al dejar de seguir usuario:", error);
    throw error;
  }
}

export async function obtenerSeguidores(userId: string) {
  try {
    const seguidores = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.followersCollectionId,
      [Query.equal("followed_id", userId)]
    );
    return seguidores.documents.map(doc => doc.follower_id);
  } catch (error) {
    console.error("Error al obtener seguidores:", error);
    return [];
  }
}

export async function obtenerSeguidos(userId: string) {
  try {
    const seguidos = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.followersCollectionId,
      [Query.equal("follower_id", userId)]
    );
    return seguidos.documents.map(doc => doc.followed_id);
  } catch (error) {
    console.error("Error al obtener seguidos:", error);
    return [];
  }
}

export async function createComment(postId: string, userId: string, content: string) {
  try {
    const comment = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      ID.unique(),
      {
        post_id: postId,
        user_id: userId,
        content: content,
        created_at: new Date().toISOString(),
      }
    );
    return comment;
  } catch (error) {
    console.error("Error al crear comentario:", error);
    throw error;
  }
}

//COMMENTS
export async function getComments(postId: string) {
  try {
    const comments = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      [Query.equal("post_id", postId), Query.orderDesc("created_at")]
    );
    
    const commentsWithUserInfo = await Promise.all(comments.documents.map(async (comment) => {
      const user = await getUserById(comment.user_id);
      if (user) {
        return {
          ...comment,
          user_$id: user.$id,
          user_imageUrl: user.imageUrl,
          user_name: user.name,
          user_username: user.username
        };
      } else {
        // Usuario no encontrado, usar valores predeterminados
        return {
          ...comment,
          user_$id: comment.user_id,
          user_imageUrl: "/assets/icons/profile-placeholder.svg",
          user_name: "Usuario eliminado",
          user_username: "usuario_eliminado"
        };
      }
    }));
    
    return commentsWithUserInfo;
  } catch (error) {
    console.error("Error al obtener comentarios:", error);
    return [];
  }
}

export async function deleteComment(commentId: string, postId: string) {
  try {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      commentId
    );
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar comentario:", error);
    throw error;
  }
}

//mensajeria
export async function sendMessage(formData: FormData) {
  try {
    let fileUrl = null;
    const file = formData.get('file') as File;
    if (file && file.size > 0) {
      const uploadedFile = await storage.createFile(
        appwriteConfig.storageId,
        ID.unique(),
        file
      );
      fileUrl = storage.getFileView(appwriteConfig.storageId, uploadedFile.$id).href;
    }

    const message = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.messagesCollectionId,
      ID.unique(),
      {
        sender_id: formData.get('senderId'),
        receiver_id: formData.get('receiverId'),
        group_id: formData.get('groupId') || null,
        content: formData.get('content'),
        fileUrl: fileUrl,
        timestamp: new Date().toISOString(),
      }
    );
    return message;
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
    throw error;
  }
}

export async function deleteMessage(messageId: string) {
  try {
    const message = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.messagesCollectionId,
      messageId
    );

    if (message.fileUrl) {
      const fileId = message.fileUrl.split('/').pop();
      await storage.deleteFile(appwriteConfig.storageId, fileId);
    }

    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.messagesCollectionId,
      messageId
    );

    return { success: true };
  } catch (error) {
    console.error("Error al eliminar mensaje:", error);
    throw error;
  }
}

// Función para obtener mensajes entre dos usuarios
export async function getMessages(userId1: string, userId2: string) {
  try {
    const messages = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.messagesCollectionId,
      [
        Query.or([
          Query.and([
            Query.equal("sender_id", userId1),
            Query.equal("receiver_id", userId2),
          ]),
          Query.and([
            Query.equal("sender_id", userId2),
            Query.equal("receiver_id", userId1),
          ]),
        ]),
        Query.orderAsc("timestamp"),
      ]
    );
    return messages.documents;
  } catch (error) {
    console.error("Error al obtener mensajes:", error);
    return [];
  }
}

// Crear una notificación
export async function createNotification(senderId: string, receiverId: string, type: string, postId?: string) {
  try {
    const notificationId = ID.unique();
    const notificationData: any = {
      id: notificationId,
      sender_id: senderId,
      receiver_id: receiverId,
      type: type,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    const notification = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      notificationId,
      notificationData
    );

    return notification;
  } catch (error) {
    console.error("Error al crear la notificación:", error);
    throw error;
  }
}

// Obtener notificaciones para un usuario
export async function getNotifications(userId: string) {
  try {
    const notifications = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      [
        Query.equal("receiver_id", userId),
        Query.orderDesc("created_at"),
        Query.limit(50)
      ]
    );
    // Obtener información adicional para cada notificación
    const notificationsWithInfo = await Promise.all(notifications.documents.map(async (notification) => {
      const sender = await getUserById(notification.sender_id);
      let post = null;
      if (notification.post_id) {
        post = await getPostById(notification.post_id);
      }
      return {
        ...notification,
        sender,
        post
      };
    }));
    
    return notificationsWithInfo;
  } catch (error) {
    console.error("Error al obtener las notificaciones:", error);
    return [];
  }
}

// Marcar notificación como leída
export async function markNotificationAsRead(notificationId: string) {
  try {
    const updatedNotification = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      notificationId,
      {
        is_read: true
      }
    );
    return updatedNotification;
  } catch (error) {
    console.error("Error al marcar la notificación como leída:", error);
    throw error;
  }
}

//GRUPOS
export async function createGroup(name: string, creatorId: string, memberIds: string[]) {
  try {
    const groupId = ID.unique();
    const memberIdsString = memberIds.join(',').slice(0, 2000); // Convert to string and limit to 2000 chars
    const group = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.groupsCollectionId,
      groupId,
      {
        name,
        creator_id: creatorId,
        member_ids: memberIdsString,
        created_at: new Date().toISOString(),
      }
    );
    return { ...group, $id: groupId };
  } catch (error) {
    console.error("Error al crear el grupo:", error);
    throw error;
  }
}
export async function addUserToGroup(groupId: string, userId: string) {
  try {
    const group = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.groupsCollectionId,
      groupId
    );
    
    if (!group) {
      throw new Error("Grupo no encontrado");
    }

    let memberIds = group.member_ids ? group.member_ids.split(',') : [];
    if (!memberIds.includes(userId)) {
      memberIds.push(userId);
    }
    
    const updatedGroup = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.groupsCollectionId,
      groupId,
      { member_ids: memberIds.join(',') }
    );
    return updatedGroup;
  } catch (error) {
    console.error("Error al añadir usuario al grupo:", error);
    throw error;
  }
}

export async function getUserGroups(userId: string) {
  try {
    const groups = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.groupsCollectionId,
      [Query.search("member_ids", userId)]
    );
    return groups.documents;
  } catch (error) {
    console.error("Error al obtener los grupos del usuario:", error);
    throw new Error("No se pudieron obtener los grupos del usuario. Por favor, intenta de nuevo más tarde.");
  }
}
export async function getGroupMessages(groupId: string) {
  try {
    const messages = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.messagesCollectionId,
      [
        Query.equal("group_id", groupId),
        Query.orderAsc("timestamp"),
      ]
    );
    return messages.documents;
  } catch (error) {
    console.error("Error getting group messages:", error);
    throw error;
  }
}


export async function removeUserFromGroup(groupId: string, userId: string) {
  try {
    const group = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.groupsCollectionId,
      groupId
    );
    const memberIds = group.member_ids ? group.member_ids.split(',') : [];
    const updatedMemberIds = memberIds.filter((id: string) => id !== userId);
    const updatedGroup = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.groupsCollectionId,
      groupId,
      { member_ids: updatedMemberIds.join(',') }
    );
    return updatedGroup;
  } catch (error) {
    console.error("Error removing user from group:", error);
    throw error;
  }
}

export async function checkEmailExists(email: string) {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("email", email)]
    );
    return response.documents.length > 0;
  } catch (error) {
    console.error("Error checking email existence:", error);
    throw error;
  }
}

export async function requestPasswordReset(email: string) {
  try {
    await account.createRecovery(email, 'https://cloud.appwrite.io/v1/reset-password');
    return true;
  } catch (error) {
    console.error("Error requesting password reset:", error);
    throw error;
  }
}

export async function resetPassword(userId: string, secret: string, password: string) {
  try {
    await account.updateRecovery(userId, secret, password);
    return true;
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
}
