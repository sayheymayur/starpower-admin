import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import dashboardAPI from "../services/dashboardAPI";
import { formatLocalDate } from "../utils/dateUtils";
import useGoBack from "../hooks/useGoBack";

interface ChatMessage {
  id: number;
  chat_id_fk: number;
  sender_user_id: number;
  message_text: string;
  message_type: number;
  created_at: string;
  metadata: any;
}

interface ChatDetails {
  chat_id_pk: number;
  user_id: string;
  listener_id: string;
  participants?: {
    a: any;
    b: any;
  };
}

export default function ChatHistory() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const goBack = useGoBack();
  const chatId = searchParams.get('chatId');
  const userId = searchParams.get('userId');
  const listenerId = searchParams.get('listenerId');
  
  const [chatDetails, setChatDetails] = useState<ChatDetails | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatId) {
      fetchChatDetails();
      fetchMessages(1);
    } else if (userId && listenerId) {
      // If no chatId but we have userId and listenerId, ensure chat exists first
      ensureChat();
    } else {
      setError('Missing required parameters: chatId or (userId and listenerId)');
      setLoading(false);
    }
  }, [chatId, userId, listenerId]);

  const ensureChat = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.ensureChatExists({
        userId: userId!,
        listenerId: listenerId!,
      });

      if (response.success && response.data) {
        const chatIdFromResponse = response.data.chat_id_pk || response.data.chat_id_fk;
        if (chatIdFromResponse) {
          // Redirect to chat history with the chatId
          navigate(`/chat-history?chatId=${chatIdFromResponse}`, { replace: true });
        } else {
          throw new Error('Failed to get chat ID from response');
        }
      } else {
        throw new Error(response.message || 'Failed to ensure chat exists');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error ensuring chat:', err);
      setLoading(false);
    }
  };

  const fetchChatDetails = async () => {
    try {
      const response = await dashboardAPI.getChatById(Number(chatId));

      if (response.success && response.data) {
        setChatDetails(response.data as ChatDetails);
      } else {
        throw new Error(response.message || 'Failed to fetch chat details');
      }
    } catch (err) {
      console.error('Error fetching chat details:', err);
      // Don't fail completely if chat details fail
    }
  };

  const fetchMessages = async (page: number = 1, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      }

      const response = await dashboardAPI.getChatMessages(Number(chatId), {
        page,
        limit: 50,
      });

      if (response.success && response.data) {
        const fetchedMessages = response.data as ChatMessage[];
        
        if (append) {
          // When appending, prepend older messages to the beginning
          setMessages(prev => [...fetchedMessages.reverse(), ...prev]);
        } else {
          // Reverse messages so oldest first, newest last
          setMessages(fetchedMessages.reverse());
        }

        // Check if there are more messages
        if (response.pagination) {
          const { page: currentPageNum, totalPages } = response.pagination;
          setHasMore(currentPageNum < totalPages);
          setCurrentPage(currentPageNum);
        } else {
          setHasMore(fetchedMessages.length === 50);
        }

        // Scroll to bottom after initial load or when new messages are added (not when loading older)
        if (!append) {
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      } else {
        throw new Error(response.message || 'Failed to fetch messages');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreMessages = () => {
    if (!loadingMore && hasMore) {
      fetchMessages(currentPage + 1, true);
    }
  };

  const getParticipantInfo = () => {
    if (!chatDetails?.participants) {
      // Fallback to URL params if available
      return {
        user: userId ? { user_id_pk: Number(userId) } : null,
        listener: listenerId ? { user_id_pk: Number(listenerId) } : null,
      };
    }

    // Determine which participant is user and which is listener
    const participantA = chatDetails.participants.a;
    const participantB = chatDetails.participants.b;

    // The user_id in chat is typically the user, listener_id is the listener
    const userParticipant = participantA?.user_id_pk?.toString() === chatDetails.user_id 
      ? participantA 
      : participantB?.user_id_pk?.toString() === chatDetails.user_id 
      ? participantB 
      : participantA;
    
    const listenerParticipant = participantA?.user_id_pk?.toString() === chatDetails.listener_id 
      ? participantA 
      : participantB?.user_id_pk?.toString() === chatDetails.listener_id 
      ? participantB 
      : participantB;

    return {
      user: userParticipant,
      listener: listenerParticipant,
    };
  };

  const getSenderInfo = (senderUserId: number) => {
    const participants = getParticipantInfo();
    const senderIdStr = senderUserId.toString();
    
    // Check if sender is the user
    const isUser = senderIdStr === (chatDetails?.user_id || userId || '');
    
    if (isUser) {
      return {
        type: 'user' as const,
        name: participants.user?.full_name || `User ${participants.user?.user_id_pk || senderUserId}`,
        avatar: participants.user?.profile_photo,
        id: participants.user?.user_id_pk || senderUserId,
      };
    } else {
      return {
        type: 'listener' as const,
        name: participants.listener?.full_name || `Listener ${participants.listener?.user_id_pk || senderUserId}`,
        avatar: participants.listener?.profile_photo,
        id: participants.listener?.user_id_pk || senderUserId,
      };
    }
  };

  const formatMessageTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return formatLocalDate(dateString);
    } catch {
      return dateString;
    }
  };

  const groupMessagesByDate = () => {
    const grouped: { [key: string]: ChatMessage[] } = {};
    
    // Messages are already in chronological order (oldest to newest)
    messages.forEach((message) => {
      const date = new Date(message.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(message);
    });

    return grouped;
  };

  // Scroll to bottom when component mounts or messages change
  useEffect(() => {
    if (messages.length > 0 && !loadingMore) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages.length, loading]);

  if (loading && !chatId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={goBack}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const participants = getParticipantInfo();
  const groupedMessages = groupMessagesByDate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Chat History
            </h1>
            {chatDetails && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Chat ID: {chatDetails.chat_id_pk}
              </p>
            )}
          </div>
          <button
            onClick={goBack}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm font-medium"
          >
            ← Go Back
          </button>
        </div>

        {/* Participants Info */}
        {(participants.user || participants.listener) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <div className="flex gap-6">
              {participants.user && (
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">User:</div>
                  <div className="flex items-center gap-2">
                    {participants.user.profile_photo && (
                      <img
                        src={participants.user.profile_photo}
                        alt={participants.user.full_name || 'User'}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    )}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {participants.user.full_name || `User ${participants.user.user_id_pk}`}
                    </span>
                  </div>
                </div>
              )}
              {participants.listener && (
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Listener:</div>
                  <div className="flex items-center gap-2">
                    {participants.listener.profile_photo && (
                      <img
                        src={participants.listener.profile_photo}
                        alt={participants.listener.full_name || 'Listener'}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    )}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {participants.listener.full_name || `Listener ${participants.listener.user_id_pk}`}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">💬</div>
              <p className="text-gray-500 dark:text-gray-400">No messages found in this chat</p>
            </div>
          ) : (
            <div 
              ref={messagesContainerRef}
              className="space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto"
            >
              {/* Load More Button - Show at top for older messages */}
              {hasMore && (
                <div className="text-center pb-4 sticky top-0 bg-white dark:bg-gray-800 z-10">
                  <button
                    onClick={loadMoreMessages}
                    disabled={loadingMore}
                    className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingMore ? 'Loading...' : 'Load Older Messages'}
                  </button>
                </div>
              )}

              {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                <div key={date}>
                  <div className="text-center mb-4">
                    <span className="inline-block px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full">
                      {date}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {dateMessages.map((message, index) => {
                      const senderInfo = getSenderInfo(message.sender_user_id);
                      const isUserMessage = senderInfo.type === 'user';
                      const showSenderInfo = index === 0 || 
                        dateMessages[index - 1].sender_user_id !== message.sender_user_id;
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'} items-end gap-2`}
                        >
                          {/* Listener Avatar - Left side */}
                          {!isUserMessage && (
                            <div className="flex-shrink-0">
                              {senderInfo.avatar ? (
                                <img
                                  src={senderInfo.avatar}
                                  alt={senderInfo.name}
                                  className="h-8 w-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                    {senderInfo.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div className={`flex flex-col ${isUserMessage ? 'items-end' : 'items-start'} max-w-[70%]`}>
                            {/* Sender Label - Show when sender changes */}
                            {showSenderInfo && (
                              <div className={`flex items-center gap-1 mb-1 ${isUserMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                                <span className={`text-xs font-medium ${
                                  isUserMessage 
                                    ? 'text-blue-600 dark:text-blue-400' 
                                    : 'text-gray-600 dark:text-gray-400'
                                }`}>
                                  {senderInfo.type === 'user' ? 'User' : 'Listener'}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-500">
                                  {senderInfo.name}
                                </span>
                              </div>
                            )}
                            
                            <div
                              className={`rounded-2xl px-4 py-2 ${
                                isUserMessage
                                  ? 'bg-blue-500 text-white rounded-br-none'
                                  : 'bg-gray-100 text-gray-900 rounded-bl-none dark:bg-gray-700 dark:text-white'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap break-words">
                                {message.message_text}
                              </p>
                              <p
                                className={`mt-1 text-xs ${
                                  isUserMessage
                                    ? 'text-blue-100'
                                    : 'text-gray-500 dark:text-gray-400'
                                }`}
                              >
                                {formatMessageTime(message.created_at)}
                              </p>
                            </div>
                          </div>
                          
                          {/* User Avatar - Right side */}
                          {isUserMessage && (
                            <div className="flex-shrink-0">
                              {senderInfo.avatar ? (
                                <img
                                  src={senderInfo.avatar}
                                  alt={senderInfo.name}
                                  className="h-8 w-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                                  <span className="text-xs font-medium text-white">
                                    {senderInfo.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Scroll anchor at bottom */}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

