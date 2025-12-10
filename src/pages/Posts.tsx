import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllPosts, approvePost, rejectPost, deletePost, bulkApprovePosts, bulkRejectPosts, exportPosts } from '../services/admin.service';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { formatDate } from '../lib/utils';
import { Check, X, Trash2, Search, Download, CheckSquare, Square } from 'lucide-react';

export default function Posts() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-posts', page, status, search],
    queryFn: () => getAllPosts({ page, limit: 20, status, search }),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => approvePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => rejectPost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      setSelectedPosts([]);
    },
  });

  const bulkApproveMutation = useMutation({
    mutationFn: (postIds: string[]) => bulkApprovePosts(postIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      setSelectedPosts([]);
      setSelectAll(false);
    },
  });

  const bulkRejectMutation = useMutation({
    mutationFn: (postIds: string[]) => bulkRejectPosts(postIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      setSelectedPosts([]);
      setSelectAll(false);
    },
  });

  const handleSelectPost = (postId: string) => {
    setSelectedPosts(prev =>
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(posts.map((p: any) => p._id));
    }
    setSelectAll(!selectAll);
  };

  const handleExport = async () => {
    try {
      const blob = await exportPosts({ status });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `posts-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export posts');
    }
  };

  const posts = data?.data || [];
  const pagination = data?.pagination || {};

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground">Post Moderation</h2>
        <p className="text-muted-foreground mt-2">Manage and moderate all posts</p>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap items-end">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search posts..."
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
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-input rounded-md bg-background text-foreground"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="flagged">Flagged</option>
            </select>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
          {selectedPosts.length > 0 && (
            <div className="mt-4 flex gap-2 items-center">
              <span className="text-sm text-muted-foreground">
                {selectedPosts.length} selected
              </span>
              <Button
                variant="default"
                size="sm"
                onClick={() => bulkApproveMutation.mutate(selectedPosts)}
                disabled={bulkApproveMutation.isPending}
              >
                <Check className="w-4 h-4 mr-1" />
                Approve Selected
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => bulkRejectMutation.mutate(selectedPosts)}
                disabled={bulkRejectMutation.isPending}
              >
                <X className="w-4 h-4 mr-1" />
                Reject Selected
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedPosts([]);
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
          <div className="text-lg text-muted-foreground">Loading posts...</div>
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Posts ({pagination.total || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {posts.length > 0 && (
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
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
                    <span className="text-sm text-muted-foreground">Select All</span>
                  </div>
                )}
                {posts.map((post: any) => (
                  <div key={post._id} className="border border-border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleSelectPost(post._id)}
                        className="mt-1 p-1 hover:bg-accent rounded"
                      >
                        {selectedPosts.includes(post._id) ? (
                          <CheckSquare className="w-5 h-5" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-foreground">{post.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              by {post.authorName || post.authorId?.name} • {formatDate(post.createdAt)}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              post.status === 'approved'
                                ? 'bg-green-500/10 text-green-500'
                                : post.status === 'pending'
                                ? 'bg-yellow-500/10 text-yellow-500'
                                : 'bg-red-500/10 text-red-500'
                            }`}
                          >
                            {post.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {post.excerpt || post.content?.substring(0, 150)}...
                        </p>
                        <div className="flex gap-2">
                          {post.status === 'pending' && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => approveMutation.mutate(post._id)}
                                disabled={approveMutation.isPending}
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => rejectMutation.mutate(post._id)}
                                disabled={rejectMutation.isPending}
                              >
                                <X className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this post?')) {
                                deleteMutation.mutate(post._id);
                              }
                            }}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
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

