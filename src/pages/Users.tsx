import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllUsers, blockUser, unblockUser, deleteUser, updateUser, bulkBlockUsers, bulkUnblockUsers, exportUsers } from '../services/admin.service';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { formatDate } from '../lib/utils';
import { Ban, Unlock, Trash2, Search, Download, CheckSquare, Square } from 'lucide-react';

export default function Users() {
  const [page, setPage] = useState(1);
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const [blocked, setBlocked] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, role, search, blocked],
    queryFn: () => getAllUsers({ page, limit: 20, role, search, blocked }),
  });

  const blockMutation = useMutation({
    mutationFn: blockUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const unblockMutation = useMutation({
    mutationFn: unblockUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setSelectedUsers([]);
    },
  });

  const bulkBlockMutation = useMutation({
    mutationFn: bulkBlockUsers,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setSelectedUsers([]);
      setSelectAll(false);
    },
  });

  const bulkUnblockMutation = useMutation({
    mutationFn: bulkUnblockUsers,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setSelectedUsers([]);
      setSelectAll(false);
    },
  });

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((u: any) => u._id));
    }
    setSelectAll(!selectAll);
  };

  const handleExport = async () => {
    try {
      const blob = await exportUsers({ role, blocked });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export users');
    }
  };

  const users = data?.data || [];
  const pagination = data?.pagination || {};

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground">User Management</h2>
        <p className="text-muted-foreground mt-2">Manage all platform users</p>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground"
                />
              </div>
            </div>
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-input rounded-md bg-background text-foreground"
            >
              <option value="">All Roles</option>
              <option value="parent">Parent</option>
              <option value="teacher">Teacher</option>
              <option value="therapist">Therapist</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </select>
            <select
              value={blocked}
              onChange={(e) => {
                setBlocked(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-input rounded-md bg-background text-foreground"
            >
              <option value="">All Status</option>
              <option value="false">Active</option>
              <option value="true">Blocked</option>
            </select>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
          {selectedUsers.length > 0 && (
            <div className="mt-4 flex gap-2 items-center">
              <span className="text-sm text-muted-foreground">
                {selectedUsers.length} selected
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => bulkBlockMutation.mutate(selectedUsers)}
                disabled={bulkBlockMutation.isPending}
              >
                <Ban className="w-4 h-4 mr-1" />
                Block Selected
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => bulkUnblockMutation.mutate(selectedUsers)}
                disabled={bulkUnblockMutation.isPending}
              >
                <Unlock className="w-4 h-4 mr-1" />
                Unblock Selected
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedUsers([]);
                  setSelectAll(false);
                }}
              >
                Clear Selection
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-lg text-muted-foreground">Loading users...</div>
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Users ({pagination.total || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground w-12">
                        <button
                          onClick={handleSelectAll}
                          className="p-1 hover:bg-accent rounded"
                        >
                          {selectAll ? (
                            <CheckSquare className="w-5 h-5" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Email</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Role</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Joined</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user: any) => (
                      <tr key={user._id} className="border-b border-border">
                        <td className="p-4">
                          <button
                            onClick={() => handleSelectUser(user._id)}
                            className="p-1 hover:bg-accent rounded"
                          >
                            {selectedUsers.includes(user._id) ? (
                              <CheckSquare className="w-5 h-5" />
                            ) : (
                              <Square className="w-5 h-5" />
                            )}
                          </button>
                        </td>
                        <td className="p-4">{user.name}</td>
                        <td className="p-4">{user.email || 'N/A'}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4">
                          {user.blocked ? (
                            <span className="px-2 py-1 bg-destructive/10 text-destructive rounded text-xs">
                              Blocked
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded text-xs">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            {user.blocked ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => unblockMutation.mutate(user._id)}
                                disabled={unblockMutation.isPending}
                              >
                                <Unlock className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => blockMutation.mutate(user._id)}
                                disabled={blockMutation.isPending}
                              >
                                <Ban className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this user?')) {
                                  deleteMutation.mutate(user._id);
                                }
                              }}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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

