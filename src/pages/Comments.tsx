import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllComments, approveComment, rejectComment, deleteComment, bulkApproveComments, bulkRejectComments } from '../services/admin.service';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { formatDate } from '../lib/utils';
import { Check, X, Trash2, CheckSquare, Square } from 'lucide-react';

export default function Comments() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [selectedComments, setSelectedComments] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-comments', page, status],
    queryFn: () => getAllComments({ page, limit: 20, status }),
  });

  const approveMutation = useMutation({
    mutationFn: approveComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
      setSelectedComments([]);
    },
  });

  const bulkApproveMutation = useMutation({
    mutationFn: bulkApproveComments,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
      setSelectedComments([]);
      setSelectAll(false);
    },
  });

  const bulkRejectMutation = useMutation({
    mutationFn: bulkRejectComments,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
      setSelectedComments([]);
      setSelectAll(false);
    },
  });

  const handleSelectComment = (commentId: string) => {
    setSelectedComments(prev =>
      prev.includes(commentId)
        ? prev.filter(id => id !== commentId)
        : [...prev, commentId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedComments([]);
    } else {
      setSelectedComments(comments.map((c: any) => c._id));
    }
    setSelectAll(!selectAll);
  };

  const comments = data?.data || [];
  const pagination = data?.pagination || {};

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground">Comment Moderation</h2>
        <p className="text-muted-foreground mt-2">Manage and moderate all comments</p>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4 items-end">
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
            </select>
          </div>
          {selectedComments.length > 0 && (
            <div className="mt-4 flex gap-2 items-center">
              <span className="text-sm text-muted-foreground">
                {selectedComments.length} selected
              </span>
              <Button
                variant="default"
                size="sm"
                onClick={() => bulkApproveMutation.mutate(selectedComments)}
                disabled={bulkApproveMutation.isPending}
              >
                <Check className="w-4 h-4 mr-1" />
                Approve Selected
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => bulkRejectMutation.mutate(selectedComments)}
                disabled={bulkRejectMutation.isPending}
              >
                <X className="w-4 h-4 mr-1" />
                Reject Selected
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedComments([]);
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
          <div className="text-lg text-muted-foreground">Loading comments...</div>
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Comments ({pagination.total || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {comments.length > 0 && (
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
                {comments.map((comment: any) => (
                  <div key={comment._id} className="border border-border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleSelectComment(comment._id)}
                        className="mt-1 p-1 hover:bg-accent rounded"
                      >
                        {selectedComments.includes(comment._id) ? (
                          <CheckSquare className="w-5 h-5" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          by {comment.authorName || comment.authorId?.name} • {formatDate(comment.createdAt)}
                        </p>
                        {comment.postId && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Post: {comment.postId.title || comment.postId}
                          </p>
                        )}
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          comment.status === 'approved'
                            ? 'bg-green-500/10 text-green-500'
                            : comment.status === 'pending'
                            ? 'bg-yellow-500/10 text-yellow-500'
                            : 'bg-red-500/10 text-red-500'
                        }`}
                      >
                        {comment.status}
                      </span>
                    </div>
                        <p className="text-foreground mb-4">{comment.content}</p>
                        <div className="flex gap-2">
                          {comment.status === 'pending' && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => approveMutation.mutate(comment._id)}
                                disabled={approveMutation.isPending}
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => rejectMutation.mutate(comment._id)}
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
                              if (confirm('Are you sure you want to delete this comment?')) {
                                deleteMutation.mutate(comment._id);
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

