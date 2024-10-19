import { Client, Account, Databases, Storage, Avatars } from "appwrite"

// Configuración de Appwrite
export const appwriteConfig = {
  url: import.meta.env.VITE_APPWRITE_URL,
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
  storageId: import.meta.env.VITE_APPWRITE_STORAGE_ID,
  userCollectionId: import.meta.env.VITE_APPWRITE_USER_COLLECTION_ID,
  postCollectionId: import.meta.env.VITE_APPWRITE_POST_COLLECTION_ID,
  savesCollectionId: import.meta.env.VITE_APPWRITE_SAVES_COLLECTION_ID,
  followersCollectionId: import.meta.env.VITE_APPWRITE_FOLLOWERS_COLLECTION_ID,
  commentsCollectionId: import.meta.env.VITE_APPWRITE_COMMENTS_ID,
  messagesCollectionId: import.meta.env.VITE_APPRITE_MESSAGES_ID,
  notificationsCollectionId: import.meta.env.VITE_APPRITE_NOTIFICATIONS_ID,
  groupsCollectionId: import.meta.env.VITE_APPWRITE_GROUPS_COLLECTION_ID,
};

// Inicialización del cliente de Appwrite
export const client = new Client();

client.setEndpoint(appwriteConfig.url);
client.setProject(appwriteConfig.projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);
export const messagesDbId = appwriteConfig.databaseId;
export const messagesCollectionId = appwriteConfig.messagesCollectionId;