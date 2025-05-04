import React from 'react';
import { Link } from 'react-router-dom';
import SidebarProjects from './SidebarProjects';

interface Project {
  id: number;
  title: string;
  canUpdate: boolean;
  canDelete: boolean;
}

interface SidebarModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any; // Replace with the appropriate user type
  projects: Project[];
  canCreate: boolean;
  onCreate: () => void;
  onUpdate: (projectId: number) => void;
  onDelete: (projectId: number) => void;
  isChatOpen: boolean;
  setIsChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
  chatMessages: any[];
  newMessage: string;
  setNewMessage: React.Dispatch<React.SetStateAction<string>>;
  selectedProjectId: number | null;
  setSelectedProjectId: React.Dispatch<React.SetStateAction<number | null>>;
  handleSendMessage: () => Promise<void>;
}

const SidebarModal: React.FC<SidebarModalProps> = ({
  isOpen,
  onClose,
  user,
  projects,
  canCreate,
  onCreate,
  onUpdate,
  onDelete,
  isChatOpen,
  setIsChatOpen,
  chatMessages,
  newMessage,
  setNewMessage,
  selectedProjectId,
  setSelectedProjectId,
  handleSendMessage,
}) => {
  if (!isOpen) return null;

  const adminNavItems = [
    { to: "/organizations", label: "Organizations" },
    { to: "/users", label: "Users" }
  ];

  const userNavItems = [
    { to: "/organization", label: "Organization" },
    { to: "/users", label: "Users" }
  ];

  return (
    <div className="absolute inset-0 bg-black/25 bg-opacity-5 z-50 flex justify-start">
      <div className="w-64 bg-white shadow-lg border border-gray-200 rounded-r-lg p-4 overflow-y-auto max-h-screen flex flex-col">
        <button onClick={onClose} className="text-gray-600 hover:bg-gray-100 p-2 rounded-md mb-4">
          Close
        </button>
        <nav className="flex flex-col space-y-2 flex-grow overflow-y-auto">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
              {user.teamRole === 'admin' ? 'Administration' : 'My Workspace'}
            </h3>
            <div className="space-y-1">
              {user.teamRole === 'admin' ? (
                adminNavItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="block py-2 px-4 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                  >
                    {item.label}
                  </Link>
                ))
              ) : (
                <>
                  {userNavItems.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="block py-2 px-4 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <SidebarProjects
                    projects={projects}
                    canCreate={canCreate}
                    onCreate={onCreate}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                  />
                </>
              )}
            </div>
          </div>
        </nav>
        {/* Chat bubble */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="mt-auto mb-2 h-10 w-10 rounded-full bg-red-600 shadow-lg flex items-center justify-center text-white hover:bg-red-700 transition self-start"
          aria-label="Open chat"
        >
          💬
        </button>
        {/* Chat box */}
          {isChatOpen && (
          <div
            className="w-[36rem] h-80 bg-white border border-gray-300 rounded-lg shadow-lg p-4 flex flex-col absolute bottom-4 left-0 z-50"
            style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }}
          >
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-gray-700 flex items-center space-x-2">
                <span>Chat</span>
                <select
                  value={selectedProjectId ?? ''}
                  onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                  className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Select project for chat"
                >
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </h4>
              <button
                onClick={() => setIsChatOpen(false)}
                className="reset-button-border-and-padding text-gray-500 hover:text-gray-700 focus:outline-none h-8 w-12 rounded"
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto border border-gray-200 rounded p-2 mb-2">
              {chatMessages.length === 0 ? (
                <p className="text-gray-500 text-sm">No messages yet.</p>
              ) : (
                <ul className="space-y-1 text-sm text-gray-700">
                  {chatMessages.map((msg: any, idx: number) => {
                    const user = msg.user;
                    const userName = user
                      ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email
                      : 'System';
                    return (
                      <li key={idx} className="break-words">
                        <span className="font-semibold">{userName}:</span> <span>{msg.text}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendMessage}
                className="bg-blue-600 text-white px-3 rounded hover:bg-blue-700 transition flex items-center justify-center"
                aria-label="Send message"
              >
                <img src="/images/arrow.png" alt="Send" className="h-5 w-5" />
              </button>
            </div>
          </div>
          )}
      </div>
    </div>
  );
};

export default SidebarModal;
