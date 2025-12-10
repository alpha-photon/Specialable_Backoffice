import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllChatRooms, getAllChatMessages, getFlaggedMessages, deleteChatMessage, createChatRoom, deleteChatRoom } from '../services/admin.service';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { formatDate } from '../lib/utils';
import { Trash2, AlertTriangle, Plus, X } from 'lucide-react';

export default function Chat() {
  const [activeTab, setActiveTab] = useState<'rooms' | 'messages' | 'flagged'>('flagged');
  const [page, setPage] = useState(1);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [roomForm, setRoomForm] = useState({
    name: '',
    slug: '',
    description: '',
    topicDescription: '',
    isPrivate: false,
  });
  const queryClient = useQueryClient();

  const { data: roomsData, isLoading: roomsLoading } = useQuery({
    queryKey: ['admin-chat-rooms', page],
    queryFn: () => getAllChatRooms({ page, limit: 20 }),
    enabled: activeTab === 'rooms',
  });

  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['admin-chat-messages', page],
    queryFn: () => getAllChatMessages({ page, limit: 20 }),
    enabled: activeTab === 'messages',
  });

  const { data: flaggedData, isLoading: flaggedLoading } = useQuery({
    queryKey: ['admin-chat-flagged', page],
    queryFn: () => getFlaggedMessages({ page, limit: 20 }),
    enabled: activeTab === 'flagged',
  });

  const deleteMessageMutation = useMutation({
    mutationFn: deleteChatMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-chat'] });
    },
  });

  const createRoomMutation = useMutation({
    mutationFn: createChatRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-chat-rooms'] });
      setShowCreateRoom(false);
      setRoomForm({
        name: '',
        slug: '',
        description: '',
        topicDescription: '',
        isPrivate: false,
      });
    },
  });

  const deleteRoomMutation = useMutation({
    mutationFn: deleteChatRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-chat-rooms'] });
    },
  });

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    createRoomMutation.mutate(roomForm);
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  const isLoading = roomsLoading || messagesLoading || flaggedLoading;
  const data = activeTab === 'rooms' ? roomsData : activeTab === 'messages' ? messagesData : flaggedData;
  const items = activeTab === 'rooms' ? (data?.data || []) : (data?.data || []);
  const pagination = data?.pagination || {};

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground">Chat Moderation</h2>
        <p className="text-muted-foreground mt-2">Manage chat rooms and messages</p>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-2 justify-between items-center">
            <div className="flex gap-2">
              <Button
                variant={activeTab === 'flagged' ? 'default' : 'outline'}
                onClick={() => {
                  setActiveTab('flagged');
                  setPage(1);
                }}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Flagged Messages
              </Button>
              <Button
                variant={activeTab === 'messages' ? 'default' : 'outline'}
                onClick={() => {
                  setActiveTab('messages');
                  setPage(1);
                }}
              >
                All Messages
              </Button>
              <Button
                variant={activeTab === 'rooms' ? 'default' : 'outline'}
                onClick={() => {
                  setActiveTab('rooms');
                  setPage(1);
                }}
              >
                Chat Rooms
              </Button>
            </div>
            {activeTab === 'rooms' && (
              <Button
                variant="default"
                onClick={() => setShowCreateRoom(!showCreateRoom)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Room
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {showCreateRoom && activeTab === 'rooms' && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Create New Chat Room</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateRoom(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Room Name *
                </label>
                <input
                  type="text"
                  required
                  value={roomForm.name}
                  onChange={(e) => {
                    setRoomForm({
                      ...roomForm,
                      name: e.target.value,
                      slug: roomForm.slug || generateSlug(e.target.value),
                    });
                  }}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  placeholder="e.g., Autism Support"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Slug (URL-friendly)
                </label>
                <input
                  type="text"
                  value={roomForm.slug}
                  onChange={(e) => {
                    setRoomForm({
                      ...roomForm,
                      slug: generateSlug(e.target.value),
                    });
                  }}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  placeholder="auto-generated from name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Description
                </label>
                <textarea
                  value={roomForm.description}
                  onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  rows={3}
                  placeholder="Room description..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Topic Description
                </label>
                <textarea
                  value={roomForm.topicDescription}
                  onChange={(e) => setRoomForm({ ...roomForm, topicDescription: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  rows={3}
                  placeholder="Detailed topic description..."
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={roomForm.isPrivate}
                  onChange={(e) => setRoomForm({ ...roomForm, isPrivate: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="isPrivate" className="text-sm text-foreground">
                  Private Room
                </label>
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={createRoomMutation.isPending}
                >
                  {createRoomMutation.isPending ? 'Creating...' : 'Create Room'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateRoom(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-lg text-muted-foreground">Loading...</div>
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === 'flagged' && 'Flagged Messages'}
                {activeTab === 'messages' && 'All Messages'}
                {activeTab === 'rooms' && 'Chat Rooms'} ({pagination.total || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item: any) => (
                  <div key={item._id} className="border border-border rounded-lg p-4">
                    {activeTab === 'rooms' ? (
                      <>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground">{item.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              Slug: <code className="text-xs bg-muted px-1 py-0.5 rounded">{item.slug}</code>
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.description || 'No description'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Messages: {item.messageCount || 0} • Created: {formatDate(item.createdAt)}
                              {item.isPrivate && ' • Private'}
                            </p>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${item.name}"? This will delete all messages in this room.`)) {
                                deleteRoomMutation.mutate(item._id);
                              }
                            }}
                            disabled={deleteRoomMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              by {item.displayName || item.user?.name} • {formatDate(item.createdAt)}
                            </p>
                            {item.room && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Room: {item.room.name || item.room.slug}
                              </p>
                            )}
                            {item.isFlagged && (
                              <p className="text-xs text-red-500 mt-1">
                                Flagged: {item.flaggedReason || 'Unknown reason'}
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="text-foreground mb-4">{item.content}</p>
                        <div className="flex gap-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this message?')) {
                                deleteMessageMutation.mutate(item._id);
                              }
                            }}
                            disabled={deleteMessageMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {pagination.pages > 1 && (
                <div className="flex justify-between items-center mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                    disabled={page === pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

