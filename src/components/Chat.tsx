import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, UserPlus, MessageCircle, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
}

interface ConnectionRequest {
  id: string;
  fromUser: User;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: string;
}

interface Connection {
  id: string;
  user: User;
  status: 'connected';
}

export const Chat = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([]);
  const [showRequests, setShowRequests] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Get current user
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }

    // Load mock users (in real app, this would come from MongoDB)
    const mockUsers: User[] = [
      { id: '1', name: 'Alice Johnson', email: 'alice@example.com' },
      { id: '2', name: 'Bob Smith', email: 'bob@example.com' },
      { id: '3', name: 'Charlie Brown', email: 'charlie@example.com' },
      { id: '4', name: 'Diana Prince', email: 'diana@example.com' },
      { id: '5', name: 'Eve Wilson', email: 'eve@example.com' },
    ];
    setUsers(mockUsers);

    // Load connections and requests from localStorage
    const savedConnections = localStorage.getItem('connections') || '[]';
    const savedRequests = localStorage.getItem('connectionRequests') || '[]';
    setConnections(JSON.parse(savedConnections));
    setConnectionRequests(JSON.parse(savedRequests));
  }, []);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    user.id !== currentUser?.id &&
    !connections.some(conn => conn.user.id === user.id)
  );

  const pendingRequests = connectionRequests.filter(req => 
    req.toUserId === currentUser?.id && req.status === 'pending'
  );

  const handleSendRequest = (user: User) => {
    if (!currentUser) return;

    const newRequest: ConnectionRequest = {
      id: Math.random().toString(36).substr(2, 9),
      fromUser: currentUser,
      toUserId: user.id,
      status: 'pending',
      timestamp: new Date().toISOString()
    };

    const updatedRequests = [...connectionRequests, newRequest];
    setConnectionRequests(updatedRequests);
    localStorage.setItem('connectionRequests', JSON.stringify(updatedRequests));
    
    toast.success(`Connection request sent to ${user.name}`);
  };

  const handleAcceptRequest = (request: ConnectionRequest) => {
    // Add to connections
    const newConnection: Connection = {
      id: Math.random().toString(36).substr(2, 9),
      user: request.fromUser,
      status: 'connected'
    };

    const updatedConnections = [...connections, newConnection];
    setConnections(updatedConnections);
    localStorage.setItem('connections', JSON.stringify(updatedConnections));

    // Update request status
    const updatedRequests = connectionRequests.map(req =>
      req.id === request.id ? { ...req, status: 'accepted' as const } : req
    );
    setConnectionRequests(updatedRequests);
    localStorage.setItem('connectionRequests', JSON.stringify(updatedRequests));

    toast.success(`Connected with ${request.fromUser.name}`);
  };

  const handleRejectRequest = (request: ConnectionRequest) => {
    const updatedRequests = connectionRequests.map(req =>
      req.id === request.id ? { ...req, status: 'rejected' as const } : req
    );
    setConnectionRequests(updatedRequests);
    localStorage.setItem('connectionRequests', JSON.stringify(updatedRequests));

    toast.success(`Request from ${request.fromUser.name} rejected`);
  };

  const isRequestSent = (userId: string) => {
    return connectionRequests.some(req => 
      req.fromUser.id === currentUser?.id && 
      req.toUserId === userId && 
      req.status === 'pending'
    );
  };

  return (
    <div className="space-y-6">
      {/* Search and Requests Header */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users to connect..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-700 border-green-500/30 text-white"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowRequests(!showRequests)}
          className="border-green-500/30 text-green-400 hover:bg-green-500/10"
        >
          Requests {pendingRequests.length > 0 && (
            <Badge className="ml-2 bg-red-500 text-white">
              {pendingRequests.length}
            </Badge>
          )}
        </Button>
      </div>

      {/* Connection Requests */}
      {showRequests && (
        <Card className="bg-gray-800 border-green-500/20">
          <CardHeader>
            <CardTitle className="text-green-400">Connection Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingRequests.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No pending requests</p>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{request.fromUser.name}</p>
                      <p className="text-gray-400 text-sm">{request.fromUser.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAcceptRequest(request)}
                        className="bg-green-500 text-black hover:bg-green-400"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectRequest(request)}
                        className="border-red-500 text-red-400 hover:bg-red-500/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {searchTerm && (
        <Card className="bg-gray-800 border-green-500/20">
          <CardHeader>
            <CardTitle className="text-green-400">Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No users found</p>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleSendRequest(user)}
                      disabled={isRequestSent(user.id)}
                      className="bg-green-500 text-black hover:bg-green-400 disabled:opacity-50"
                    >
                      {isRequestSent(user.id) ? 'Request Sent' : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Connect
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Connected Users */}
      <Card className="bg-gray-800 border-green-500/20">
        <CardHeader>
          <CardTitle className="text-green-400">Your Connections</CardTitle>
        </CardHeader>
        <CardContent>
          {connections.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No connections yet. Search for users to connect!</p>
          ) : (
            <div className="space-y-3">
              {connections.map((connection) => (
                <div key={connection.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{connection.user.name}</p>
                    <p className="text-gray-400 text-sm">{connection.user.email}</p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-blue-500 text-white hover:bg-blue-400"
                  >
                    🗨️
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};