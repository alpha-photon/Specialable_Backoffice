import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPlanVisibility,
  createPlanVisibility,
  updatePlanVisibility,
  initPlanVisibility,
  type PlanVisibility,
} from '../services/subscription.service';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Eye, EyeOff, Star, Edit, Save, X, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';

export default function PlanVisibility() {
  const [userTypeFilter, setUserTypeFilter] = useState('');
  const [editingPlan, setEditingPlan] = useState<PlanVisibility | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState({
    userType: 'parent' as 'doctor' | 'parent' | 'all',
    plan: 'monthly' as 'monthly' | 'quarterly' | 'yearly',
    isVisible: true,
    isDefault: false,
    customPrice: '',
    customDiscount: '',
    description: '',
    order: 0,
  });
  const queryClient = useQueryClient();

  const { data: visibilityData, isLoading } = useQuery({
    queryKey: ['plan-visibility', userTypeFilter],
    queryFn: () => getPlanVisibility(userTypeFilter || undefined),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updatePlanVisibility(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plan-visibility'] });
      setEditingPlan(null);
    },
  });

  const createMutation = useMutation({
    mutationFn: createPlanVisibility,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plan-visibility'] });
      setShowCreateDialog(false);
      setCreateForm({
        userType: 'parent',
        plan: 'monthly',
        isVisible: true,
        isDefault: false,
        customPrice: '',
        customDiscount: '',
        description: '',
        order: 0,
      });
    },
  });

  const initMutation = useMutation({
    mutationFn: initPlanVisibility,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plan-visibility'] });
    },
  });

  const handleSave = (plan: PlanVisibility) => {
    updateMutation.mutate({
      id: plan._id,
      data: {
        isVisible: plan.isVisible,
        isDefault: plan.isDefault,
        customPrice: plan.customPrice ? parseFloat(plan.customPrice.toString()) : null,
        customDiscount: plan.customDiscount ? parseFloat(plan.customDiscount.toString()) : null,
        description: plan.description,
        order: plan.order,
      },
    });
  };

  const handleCreate = () => {
    createMutation.mutate({
      userType: createForm.userType,
      plan: createForm.plan,
      isVisible: createForm.isVisible,
      isDefault: createForm.isDefault,
      customPrice: createForm.customPrice ? parseFloat(createForm.customPrice) : undefined,
      customDiscount: createForm.customDiscount ? parseFloat(createForm.customDiscount) : undefined,
      description: createForm.description,
      order: createForm.order,
    });
  };

  const groupedPlans = visibilityData?.reduce((acc: any, plan: PlanVisibility) => {
    const key = plan.userType;
    if (!acc[key]) acc[key] = [];
    acc[key].push(plan);
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Plan Visibility</h1>
          <p className="text-muted-foreground mt-1">
            Control which plans are visible to which user types
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => initMutation.mutate()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Initialize Defaults
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Create Plan Visibility
          </Button>
        </div>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label>Filter by User Type</Label>
              <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All User Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All User Types</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plans by User Type */}
      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        Object.keys(groupedPlans || {}).map((userType) => (
          <Card key={userType}>
            <CardHeader>
              <CardTitle className="capitalize">
                {userType === 'all' ? 'All Users' : `${userType} Plans`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {groupedPlans[userType]
                  .sort((a: PlanVisibility, b: PlanVisibility) => a.order - b.order)
                  .map((plan: PlanVisibility) => {
                    const isEditing = editingPlan?._id === plan._id;
                    return (
                      <div
                        key={plan._id}
                        className="border rounded-lg p-4 space-y-4 hover:bg-muted/50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold capitalize">{plan.plan} Plan</h3>
                              {plan.isDefault && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  <Star className="w-3 h-3" />
                                  Default
                                </span>
                              )}
                              {plan.isVisible ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <Eye className="w-3 h-3" />
                                  Visible
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  <EyeOff className="w-3 h-3" />
                                  Hidden
                                </span>
                              )}
                            </div>
                            {plan.description && (
                              <p className="text-sm text-muted-foreground mb-2">{plan.description}</p>
                            )}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Order:</span>{' '}
                                {isEditing ? (
                                  <Input
                                    type="number"
                                    value={plan.order}
                                    onChange={(e) =>
                                      setEditingPlan({
                                        ...plan,
                                        order: parseInt(e.target.value) || 0,
                                      })
                                    }
                                    className="w-20 inline-block"
                                  />
                                ) : (
                                  <span className="font-medium">{plan.order}</span>
                                )}
                              </div>
                              {plan.customPrice && (
                                <div>
                                  <span className="text-muted-foreground">Custom Price:</span>{' '}
                                  <span className="font-medium">₹{plan.customPrice}</span>
                                </div>
                              )}
                              {plan.customDiscount !== null && (
                                <div>
                                  <span className="text-muted-foreground">Custom Discount:</span>{' '}
                                  <span className="font-medium">{plan.customDiscount}%</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isEditing ? (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingPlan(null)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleSave(plan)}
                                  disabled={updateMutation.isPending}
                                >
                                  <Save className="w-4 h-4" />
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingPlan({ ...plan })}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        {isEditing && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                            <div className="flex items-center justify-between">
                              <Label>Visible</Label>
                              <Switch
                                checked={plan.isVisible}
                                onCheckedChange={(checked) =>
                                  setEditingPlan({ ...plan, isVisible: checked })
                                }
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label>Default Plan</Label>
                              <Switch
                                checked={plan.isDefault}
                                onCheckedChange={(checked) =>
                                  setEditingPlan({ ...plan, isDefault: checked })
                                }
                              />
                            </div>
                            <div>
                              <Label>Custom Price (₹)</Label>
                              <Input
                                type="number"
                                value={plan.customPrice || ''}
                                onChange={(e) =>
                                  setEditingPlan({
                                    ...plan,
                                    customPrice: e.target.value ? parseFloat(e.target.value) : null,
                                  })
                                }
                                placeholder="Leave empty for default"
                              />
                            </div>
                            <div>
                              <Label>Custom Discount (%)</Label>
                              <Input
                                type="number"
                                value={plan.customDiscount || ''}
                                onChange={(e) =>
                                  setEditingPlan({
                                    ...plan,
                                    customDiscount: e.target.value
                                      ? parseFloat(e.target.value)
                                      : null,
                                  })
                                }
                                placeholder="Leave empty for default (5%)"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <Label>Description</Label>
                              <Textarea
                                value={plan.description || ''}
                                onChange={(e) =>
                                  setEditingPlan({ ...plan, description: e.target.value })
                                }
                                placeholder="Plan description"
                                rows={2}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Plan Visibility</DialogTitle>
            <DialogDescription>Configure plan visibility for a user type</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>User Type</Label>
              <Select
                value={createForm.userType}
                onValueChange={(value: 'doctor' | 'parent' | 'all') =>
                  setCreateForm({ ...createForm, userType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Plan</Label>
              <Select
                value={createForm.plan}
                onValueChange={(value: 'monthly' | 'quarterly' | 'yearly') =>
                  setCreateForm({ ...createForm, plan: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Visible</Label>
              <Switch
                checked={createForm.isVisible}
                onCheckedChange={(checked) => setCreateForm({ ...createForm, isVisible: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Default Plan</Label>
              <Switch
                checked={createForm.isDefault}
                onCheckedChange={(checked) => setCreateForm({ ...createForm, isDefault: checked })}
              />
            </div>
            <div>
              <Label>Custom Price (₹) - Optional</Label>
              <Input
                type="number"
                value={createForm.customPrice}
                onChange={(e) => setCreateForm({ ...createForm, customPrice: e.target.value })}
                placeholder="Leave empty for default pricing"
              />
            </div>
            <div>
              <Label>Custom Discount (%) - Optional</Label>
              <Input
                type="number"
                value={createForm.customDiscount}
                onChange={(e) => setCreateForm({ ...createForm, customDiscount: e.target.value })}
                placeholder="Leave empty for default (5%)"
              />
            </div>
            <div>
              <Label>Order</Label>
              <Input
                type="number"
                value={createForm.order}
                onChange={(e) => setCreateForm({ ...createForm, order: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                placeholder="Plan description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

