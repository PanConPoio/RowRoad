"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Models } from 'appwrite'
import { SendHorizontal, ChevronLeft, Paperclip, Trash2, Download, Users, Plus, UserPlus, UserMinus, AlertCircle, Search } from 'lucide-react'
import Loader from '@/components/shared/Loader'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { client, databases, messagesDbId, messagesCollectionId } from '@/lib/appwrite/config'
import { useCreateNotification, useDeleteMessage, useGetCurrentUser, useGetMessages, useGetUsers, useSendMessage, useCreateGroup, useGetGroupMessages, useAddUserToGroup, useGetUserGroups, useRemoveUserFromGroup } from '@/lib/appwrite/react-query/queriesAndMutations'
import { motion, AnimatePresence } from 'framer-motion'
import { ID } from 'appwrite'
import useDebounce from '@/hooks/useDebounce'

interface MessageDocument extends Models.Document {
  sender_id: string;
  receiver_id?: string;
  group_id?: string;
  content: string;
  fileUrl?: string;
  timestamp: string;
  type?: 'system' | 'user';
  userId?: string;
}

interface User extends Models.Document {
  name: string;
  username: string;
  imageUrl?: string;
  $collectionId: string;
  $databaseId: string;
  $permissions: string[];
}

interface Group extends Models.Document {
  name: string;
  creator_id: string;
  member_ids: string;
  created_at: string;
}

export default function Component() {
  const { data: currentUser, isLoading: isLoadingCurrentUser } = useGetCurrentUser();
  const { data: usersData, isLoading: isLoadingUsers } = useGetUsers();
  const { data: userGroups, isLoading: isLoadingGroups } = useGetUserGroups(currentUser?.$id || '');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { mutate: sendMessage } = useSendMessage();
  const { mutate: deleteMessage } = useDeleteMessage();
  const { mutate: createNotification } = useCreateNotification();
  const { mutate: createGroup } = useCreateGroup();
  const { mutate: addUserToGroup } = useAddUserToGroup();
  const { mutate: removeUserFromGroup } = useRemoveUserFromGroup();
  const { data: initialMessages, isLoading: isLoadingMessages } = useGetMessages(
    currentUser?.$id || '',
    selectedUser?.$id || ''
  );
  const { data: groupMessages, isLoading: isLoadingGroupMessages } = useGetGroupMessages(
    selectedGroup?.$id || ''
  );
  const [messages, setMessages] = useState<MessageDocument[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUserList, setShowUserList] = useState(true);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showRemoveMember, setShowRemoveMember] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearchValue = useDebounce(searchValue, 500);

  useEffect(() => {
    if (selectedUser && initialMessages && Array.isArray(initialMessages)) {
      setMessages(initialMessages as MessageDocument[]);
    } else if (selectedGroup && groupMessages && Array.isArray(groupMessages)) {
      setMessages(groupMessages as MessageDocument[]);
    }
  }, [initialMessages, groupMessages, selectedUser, selectedGroup]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (!currentUser || (!selectedUser && !selectedGroup)) return;

    const unsubscribe = client.subscribe<MessageDocument>([`databases.${messagesDbId}.collections.${messagesCollectionId}.documents`], (response) => {
      if (response.events.includes('databases.*.collections.*.documents.*.create')) {
        const newMessage = response.payload;
        if (
          (selectedUser && (
            (newMessage.sender_id === currentUser.$id && newMessage.receiver_id === selectedUser.$id) ||
            (newMessage.sender_id === selectedUser.$id && newMessage.receiver_id === currentUser.$id)
          )) ||
          (selectedGroup && newMessage.group_id === selectedGroup.$id)
        ) {
          setMessages(prevMessages => [...prevMessages, newMessage]);
        }
      }
      if (response.events.includes('databases.*.collections.*.documents.*.delete')) {
        const deletedMessageId = response.payload.$id;
        setMessages(prevMessages => prevMessages.filter(msg => msg.$id !== deletedMessageId));
      }
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser, selectedUser, selectedGroup]);

  const handleSendMessage = async () => {
    if ((messageContent.trim() || selectedFile) && currentUser && (selectedUser || selectedGroup)) {
      const formData = new FormData();
      formData.append('senderId', currentUser.$id);
      
      if (selectedUser) {
        formData.append('receiverId', selectedUser.$id);
      } else if (selectedGroup) {
        formData.append('groupId', selectedGroup.$id);
        formData.append('receiverId', 'GROUP_MESSAGE');
      }
      
      formData.append('content', messageContent);
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      
      try {
        await sendMessage(formData);
        if (selectedUser) {
          createNotification({
            senderId: currentUser.$id,
            receiverId: selectedUser.$id,
            type: "message"
          });
        }
        setMessageContent('');
        setSelectedFile(null);
      } catch (error) {
        console.error("Error al enviar el mensaje:", error);
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    await deleteMessage(messageId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownload = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateGroup = async () => {
    if (newGroupName && selectedMembers.length > 0 && currentUser) {
      try {
        await createGroup({
          name: newGroupName,
          creatorId: currentUser.$id,
          memberIds: [...selectedMembers, currentUser.$id]
        });
  
        setNewGroupName('');
        setSelectedMembers([]);
        setShowCreateGroup(false);
        setSelectedUser(null);
        setShowUserList(false);
      } catch (error) {
        console.error("Error al crear el grupo:", error);
      }
    }
  };

  const sendSystemMessage = (content: string, userId?: string) => {
    if (selectedGroup) {
      const systemMessage: MessageDocument = {
        $id: ID.unique(),
        group_id: selectedGroup.$id,
        sender_id: currentUser?.$id || '',
        content: content,
        timestamp: new Date().toISOString(),
        type: 'system',
        userId: userId,
        receiver_id: undefined,
        $collectionId: messagesCollectionId,
        $databaseId: messagesDbId,
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
        $permissions: []
      };
      setMessages(prevMessages => [...prevMessages, systemMessage]);
    }
  };

  const handleAddMember = async (userId: string) => {
    if (selectedGroup && currentUser) {
      try {
        await addUserToGroup({ groupId: selectedGroup.$id, userId });
        const addedUser = getUserById(userId);
        sendSystemMessage(`Se ha añadido a ${addedUser?.name || 'un nuevo miembro'} al grupo.`, userId);
        setShowAddMember(false);
      } catch (error) {
        console.error("Error al añadir miembro al grupo:", error);
      }
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (selectedGroup && currentUser) {
      try {
        await removeUserFromGroup({ groupId: selectedGroup.$id, userId });
        const removedUser = getUserById(userId);
        sendSystemMessage(`Se ha eliminado a ${removedUser?.name || 'un miembro'} del grupo.`, userId);
        setShowRemoveMember(false);
      } catch (error) {
        console.error("Error al eliminar miembro del grupo:", error);
      }
    }
  };

  const getUserById = (userId: string): User | undefined => {
    const user = usersData?.documents.find(user => user.$id === userId);
    if (user) {
      return {
        $id: user.$id,
        $createdAt: user.$createdAt,
        $updatedAt: user.$updatedAt,
        $collectionId: user.$collectionId,
        $databaseId: user.$databaseId,
        $permissions: user.$permissions,
        name: user.name,
        username: user.username,
        imageUrl: user.imageUrl
      };
    }
    return undefined;
  };

  const renderMessage = (message: MessageDocument) => {
    const sender = getUserById(message.sender_id);
    const isCurrentUser = message.sender_id === currentUser?.$id;
    const isSystemMessage = message.type === 'system';

    if (isSystemMessage) {
      return (
        <motion.div
          key={message.$id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex justify-center items-center my-2"
        >
          <div className="bg-dark-4 text-light-2 px-4 py-2 rounded-full flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            <p className="text-sm">{message.content}</p>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        key={message.$id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex items-start space-x-2 ${
          isCurrentUser ? 'justify-end' : 'justify-start'
        }`}
      >
        {!isCurrentUser && (
          <img
            src={sender?.imageUrl || "/assets/icons/profile-placeholder.svg"}
            alt={sender?.name || "Usuario"}
            className="w-8 h-8 rounded-full flex-shrink-0"
          />
        )}
        <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
          <div
            className={`p-3 rounded-2xl ${
              isCurrentUser
                ? 'bg-primary-600 text-light-1'
                : 'bg-dark-4 text-light-1'
            }`}
          >
            {!isCurrentUser && (
              <p className="text-xs font-semibold mb-1 text-red">{sender?.username || "Usuario"}</p>
            )}
            <p className="break-words whitespace-pre-wrap">{message.content}</p>
            {message.fileUrl && (
              <Dialog>
                <DialogTrigger asChild>
                  <img 
                    src={message.fileUrl} 
                    alt="Archivo adjunto" 
                    className="max-w-full h-auto rounded mt-2 cursor-pointer transition-transform duration-200 hover:scale-105"
                    style={{ maxHeight: '200px', objectFit: 'cover' }}
                  />
                </DialogTrigger>
                <DialogContent className="max-w-[90vw] max-h-[90vh] p-0">
                  <div className="relative">
                    <img 
                      src={message.fileUrl} 
                      alt="Archivo adjunto" 
                      className="w-full h-full object-contain"
                    />
                    <Button
                      onClick={() => handleDownload(message.fileUrl!, `image_${message.$id}.jpg`)}
                      className="absolute top-2 left-2 bg-dark-4 hover:bg-dark-3 text-light-1 transition-colors duration-200"
                      size="icon"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          <div className="flex items-center mt-1 space-x-2">
            <p className="text-xs text-light-3">{formatDate(message.timestamp)}</p>
            {isCurrentUser && (
              <Button
                onClick={() => handleDeleteMessage(message.$id)}
                variant="ghost"
                size="sm"
                className="text-light-3 hover:text-light-1 transition-colors duration-200"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        {isCurrentUser && (
          <img
            src={currentUser.imageUrl || "/assets/icons/profile-placeholder.svg"}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full flex-shrink-0"
          
          />
        )}
      </motion.div>
    );
  };

  if (isLoadingCurrentUser || isLoadingUsers || isLoadingGroups) return <div className='flex-center w-full h-full'><Loader /></div>

  const users = usersData?.documents as User[] || [];
  const filteredUsers = users.filter(user => user.$id !== currentUser?.$id);

  // Filtrar los chats para mostrar solo aquellos con mensajes
  const chatsWithMessages = filteredUsers.filter(user => {
    const userMessages = messages.filter(message => 
      (message.sender_id === user.$id && message.receiver_id === currentUser?.$id) ||
      (message.sender_id === currentUser?.$id && message.receiver_id === user.$id)
    );
    return userMessages.length > 0;
  });

  // Filtrar usuarios basados en la búsqueda
  const searchedUsers = filteredUsers.filter(user =>
    user.name.toLowerCase().includes(debouncedSearchValue.toLowerCase()) ||
    user.username.toLowerCase().includes(debouncedSearchValue.toLowerCase())
  );

  return (
    <div className="flex flex-col flex-grow h-full bg-dark-1">
      <AnimatePresence mode="wait">
        {showUserList ? (
          <motion.div
            key="userList"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity:  1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col h-full"
          >
            <div className="flex justify-between items-center p-4 bg-dark-3 text-light-1 shadow">
              <h2 className="text-xl font-bold">Chats</h2>
              <Button
                onClick={() => setShowCreateGroup(true)}
                variant="ghost"
                size="sm"
                className="text-light-1 hover:bg-dark-4 transition-colors duration-200"
              >
                <Plus className="h-5 w-5 mr-2" />
                Nuevo Grupo
              </Button>
            </div>
            <div className="flex gap-1 px-4 w-full rounded-lg bg-dark-4 mt-5 mb-7 mx-4">
            <img
            src="/assets/icons/search.svg"
            alt="search"
            width={30}
            height={30}
          />
          <Input
            type="text"
            placeholder="Buscar usuarios"
            className="explore-search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {debouncedSearchValue ? (
                searchedUsers.map((user) => (
                  <motion.div
                    key={user.$id}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center p-4 hover:bg-dark-4 cursor-pointer transition-colors duration-200"
                    onClick={() => {
                      setSelectedUser(user);
                      setSelectedGroup(null);
                      setShowUserList(false);
                    }}
                  >
                    <img
                      src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
                      alt={user.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <h3 className="font-semibold text-light-1">{user.name}</h3>
                      <p className="text-sm text-light-3">@{user.username}</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <>
                  {chatsWithMessages.map((user) => (
                    <motion.div
                      key={user.$id}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center p-4 hover:bg-dark-4 cursor-pointer transition-colors duration-200"
                      onClick={() => {
                        setSelectedUser(user);
                        setSelectedGroup(null);
                        setShowUserList(false);
                      }}
                    >
                      <img
                        src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
                        alt={user.name}
                        className="w-12 h-12 rounded-full mr-4"
                      />
                      <div>
                        <h3 className="font-semibold text-light-1">{user.name}</h3>
                        <p className="text-sm text-light-3">@{user.username}</p>
                      </div>
                    </motion.div>
                  ))}
                  {userGroups && userGroups.map((group) => (
                    <motion.div
                      key={group.$id}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center p-4 hover:bg-dark-4 cursor-pointer transition-colors duration-200"
                      onClick={() => {
                        setSelectedGroup(group as unknown as Group);
                        setSelectedUser(null);
                        setShowUserList(false);
                      }}
                    >
                      <Users className="w-12 h-12 text-light-1 mr-4" />
                      <div>
                        <h3 className="font-semibold text-light-1">{group.name}</h3>
                        <p className="text-sm text-light-3">{group.member_ids.split(',').length} miembros</p>
                      </div>
                    </motion.div>
                  ))}
                </>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="chatView"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col h-full"
          >
            <div className="p-4 bg-dark-3 shadow flex items-center justify-between">
              <div className="flex items-center">
                <Button
                  onClick={() => {
                    setShowUserList(true);
                    setSelectedUser(null);
                    setSelectedGroup(null);
                  }}
                  variant="ghost"
                  size="icon"
                  className="mr-2 text-light-1 hover:bg-dark-4 transition-colors duration-200"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                {selectedUser && (
                  <div className="flex items-center">
                    <img
                      src={selectedUser.imageUrl || "/assets/icons/profile-placeholder.svg"}
                      alt={selectedUser.name}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <h2 className="font-semibold text-light-1">{selectedUser.name}</h2>
                      <p className="text-sm text-light-3">En línea</p>
                    </div>
                  </div>
                )}
                {selectedGroup && (
                  <div className="flex items-center">
                    <Users className="w-10 h-10 text-light-1 mr-3" />
                    <div>
                      <h2 className="font-semibold text-light-1">{selectedGroup.name}</h2>
                      <p className="text-sm text-light-3">{selectedGroup.member_ids.split(',').length} miembros</p>
                    </div>
                  </div>
                )}
              </div>
              {selectedGroup && (
                <div className="flex items-center">
                  <Button
                    onClick={() => setShowAddMember(true)}
                    variant="ghost"
                    size="sm"
                    className="mr-2 text-light-1 hover:bg-dark-4  transition-colors duration-200"
                  >
                    <UserPlus className="h-5 w-5 mr-2" />
                  </Button>
                  <Button
                    onClick={() => setShowRemoveMember(true)}
                    variant="ghost"
                    size="sm"
                    className="text-light-1 hover:bg-dark-4 transition-colors duration-200"
                  >
                    <UserMinus className="h-5 w-5 mr-2" />
                  </Button>
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {(isLoadingMessages || isLoadingGroupMessages) ? (
                <Loader />
              ) : (
                messages.map((message) => renderMessage(message))
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 bg-dark-3">
              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center">
                <Input
                  type="text"
                  placeholder="Escribe tu mensaje aquí..."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  className="flex-grow mr-2 bg-dark-4 border-dark-5 text-light-1 placeholder-light-3 rounded-full transition-all duration-200 focus:ring-2 focus:ring-primary-600"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  size="icon"
                  className="mr-2 bg-dark-4 hover:bg-dark-5 text-light-1 rounded-full transition-colors duration-200"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Button 
                  type="submit" 
                  size="icon" 
                  className="bg-primary-600 hover:bg-primary-700 text-light-1 rounded-full transition-colors duration-200"
                >
                  <SendHorizontal className="h-5 w-5" />
                </Button>
              </form>
              {selectedFile && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-2 flex items-center"
                >
                  <p className="text-sm text-light-3 mr-2">{selectedFile.name}</p>
                  <Button
                    onClick={() => setSelectedFile(null)}
                    variant="ghost"
                    size="sm"
                    className="text-light-3 hover:text-light-1 transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
        <DialogContent className="bg-dark-2 text-light-1">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Grupo</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Nombre del Grupo"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            className="mb-4 bg-dark-4 border-dark-5 text-light-1 placeholder-light-3"
          />
          <div className="mb-4">
            <h3 className="mb-2 font-semibold">Seleccionar Miembros:</h3>
            {filteredUsers.map((user) => (
              <div key={user.$id} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id={user.$id}
                  checked={selectedMembers.includes(user.$id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedMembers([...selectedMembers, user.$id]);
                    } else {
                      setSelectedMembers(selectedMembers.filter(id => id !== user.$id));
                    }
                  }}
                  className="mr-2"
                />
                <label htmlFor={user.$id}>{user.name}</label>
              </div>
            ))}
          </div>
          <Button onClick={handleCreateGroup} className="w-full bg-primary-600 hover:bg-primary-700 text-light-1">
            Crear Grupo
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
        <DialogContent className="bg-dark-2 text-light-1">
          <DialogHeader>
            <DialogTitle>Añadir miembro al grupo</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {filteredUsers.map((user) => (
              <div key={user.$id} className="flex items-center justify-between mb-2">
                <span>{user.name}</span>
                <Button
                  onClick={() => handleAddMember(user.$id)}
                  variant="outline"
                  size="sm"
                >
                  Añadir
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showRemoveMember} onOpenChange={setShowRemoveMember}>
        <DialogContent className="bg-dark-2 text-light-1">
          <DialogHeader>
            <DialogTitle>Eliminar miembro del grupo</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {selectedGroup && selectedGroup.member_ids.split(',').map((memberId) => {
              const member = getUserById(memberId);
              if (member && member.$id !== currentUser?.$id) {
                return (
                  <div key={member.$id} className="flex items-center justify-between mb-2">
                    <span>{member.name}</span>
                    <Button
                      onClick={() => handleRemoveMember(member.$id)}
                      variant="outline"
                      size="sm"
                    >
                      Eliminar
                    </Button>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}