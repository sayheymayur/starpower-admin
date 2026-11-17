import React, { useState } from "react";
import PageMeta from "../components/common/PageMeta";

interface ChatUser {
  id: number;
  name: string;
  role: string;
  image: string;
  lastSeen: string;
  unread?: number;
  online?: boolean;
}

interface ChatMessage {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
  isYou?: boolean;
}

const chatUsers: ChatUser[] = [
  {
    id: 1,
    name: "Carla George",
    role: "Front-end Developer",
    image: "/images/user/user-01.jpg",
    lastSeen: "2 days",
    online: false
  },
  {
    id: 2,
    name: "Abram Schleifer",
    role: "Digital Marketer",
    image: "/images/user/user-02.jpg",
    lastSeen: "1 hour",
    online: true
  },
  {
    id: 3,
    name: "Lincoln Donin",
    role: "Project Manager",
    image: "/images/user/user-03.jpg",
    lastSeen: "",
    unread: 3,
    online: true
  },
  {
    id: 4,
    name: "Erin Geldthem",
    role: "Copyrighter",
    image: "/images/user/user-01.jpg",
    lastSeen: "5 days",
    online: false
  },
  {
    id: 5,
    name: "Alena Baptista",
    role: "SEO Expert",
    image: "/images/user/user-02.jpg",
    lastSeen: "2 hours",
    online: true
  },
  {
    id: 6,
    name: "William Vamos",
    role: "Content Writer",
    image: "/images/user/user-03.jpg",
    lastSeen: "5 days",
    online: false
  }
];

const chatMessages: ChatMessage[] = [
  {
    id: 1,
    sender: "Lindsey Curtis",
    content: "I want more detailed information.",
    timestamp: "2 hours ago",
    isYou: false
  },
  {
    id: 2,
    sender: "William Vamos",
    content: "Please preview the image",
    timestamp: "2 hours ago",
    isYou: false
  },
  {
    id: 3,
    sender: "You",
    content: "If you don't like something, I'll stay away from it. They got there early, and got really good seats.",
    timestamp: "2 hours ago",
    isYou: true
  }
];

const Chat: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(2); // Default to Abram Schleifer
  const [newMessage, setNewMessage] = useState("");

  const filteredUsers = chatUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedUser = chatUsers.find(user => user.id === selectedUserId);
  const userMessages = chatMessages;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      // In a real app, you would add the message to your state/backend here
      console.log("Message sent:", newMessage);
      setNewMessage("");
    }
  };

  return (
    <>
      <PageMeta
        title="Chat"
        description="Communicate with your team members"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6 p-4 md:p-6">
        {/* Left Sidebar - Chat List */}
        <div className="col-span-12 lg:col-span-4 xl:col-span-3">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              Chats
            </h2>
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="w-full rounded-xl border border-gray-300 bg-gray-50 pl-10 pr-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="max-h-[calc(100vh-220px)] space-y-2 overflow-y-auto">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-colors ${
                    user.id === selectedUserId
                      ? "bg-blue-50 dark:bg-blue-900/30"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => setSelectedUserId(user.id)}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={user.image}
                      alt={user.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    {user.online && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-gray-800"></div>
                    )}
                    {user.unread && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                        {user.unread}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="truncate font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </p>
                      {user.lastSeen && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {user.lastSeen}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                      {user.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Chat Messages */}
        <div className="col-span-12 lg:col-span-8 xl:col-span-9">
          <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-full">
                  <img
                    src={selectedUser?.image}
                    alt={selectedUser?.name}
                    className="h-full w-full object-cover"
                  />
                  {selectedUser?.online && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-gray-800"></div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedUser?.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedUser?.role}
                  </p>
                </div>
              </div>
              <button className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                </svg>
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {userMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isYou ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.isYou
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-gray-100 text-gray-900 rounded-bl-none dark:bg-gray-700 dark:text-white"
                    }`}
                  >
                    {!message.isYou && (
                      <p className="font-medium text-sm mb-1">{message.sender}</p>
                    )}
                    <p>{message.content}</p>
                    <p className={`mt-1 text-xs ${
                      message.isYou 
                        ? "text-blue-100" 
                        : "text-gray-500 dark:text-gray-400"
                    }`}>
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <form
              onSubmit={handleSendMessage}
              className="border-t border-gray-200 p-4 dark:border-gray-700"
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type a message"
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 pr-12 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-500 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-blue-400"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;