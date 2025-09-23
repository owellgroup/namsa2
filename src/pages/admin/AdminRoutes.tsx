import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import AdminPendingProfiles from './AdminPendingProfiles';
import AdminPendingMusic from './AdminPendingMusic';
import AdminLicenseApplications from './AdminLicenseApplications';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { adminAPI, invoiceAPI } from '@/services/api';
import DataTable, { Column } from '@/components/common/DataTable';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Company, Admin as AdminType, ArtistWork, LogSheet, MemberDetails, Invoice, ArtistInvoiceReports, User } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import InvoiceForm from './InvoiceForm';
import ArtistPaymentForm from './ArtistPaymentForm';

// Placeholder pages to resolve 404s; can be expanded
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <DashboardLayout title={title}>
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Manage {title.toLowerCase()}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  </DashboardLayout>
);

const PendingProfiles: React.FC = () => {
  const [rows, setRows] = React.useState<MemberDetails[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();
  const reload = React.useCallback(() => {
    setLoading(true);
    adminAPI.getPendingProfiles()
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);
  React.useEffect(() => { reload(); }, [reload]);
  const cols: Column<MemberDetails>[] = [
    { key: 'firstName', header: 'First Name', accessor: 'firstName' },
    { key: 'surname', header: 'Surname', accessor: (r) => r.surname || '-' },
    { key: 'email', header: 'Email', accessor: 'email' },
    { key: 'phoneNumber', header: 'Phone', accessor: 'phoneNumber' },
    { key: 'status', header: 'Status', accessor: (r) => r.status?.statusName || 'PENDING' },
  ];
  return (
    <Section title="Pending Profiles">
      <DataTable
        data={rows}
        columns={cols}
        loading={loading}
        emptyMessage="No pending profiles"
        actions={[
          {
            label: 'Approve',
            variant: 'success',
            onClick: async (item: MemberDetails) => {
              const ipi = window.prompt('Enter IPI number to approve:');
              if (!ipi) return;
              try {
                await adminAPI.approveProfile(item.id, ipi);
                toast({ title: 'Profile approved' });
                reload();
              } catch (e) {
                toast({ title: 'Approval failed', variant: 'destructive' });
              }
            },
            show: (item: MemberDetails) => item.status?.statusName !== 'APPROVED',
          },
          {
            label: 'Reject',
            variant: 'destructive',
            onClick: async (item: MemberDetails) => {
              const notes = window.prompt('Enter rejection notes:') || '';
              try {
                await adminAPI.rejectProfile(item.id, notes);
                toast({ title: 'Profile rejected' });
                reload();
              } catch (e) {
                toast({ title: 'Rejection failed', variant: 'destructive' });
              }
            },
            show: (item: MemberDetails) => item.status?.statusName !== 'REJECTED',
          },
        ]}
      />
    </Section>
  );
};

const Payments: React.FC = () => {
  const [rows, setRows] = React.useState<ArtistInvoiceReports[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();
  const reload = React.useCallback(() => {
    setLoading(true);
    invoiceAPI.getAllArtistPayments().then(setRows).catch(() => setRows([])).finally(() => setLoading(false));
  }, []);
  React.useEffect(() => { reload(); }, [reload]);
  const cols: Column<ArtistInvoiceReports>[] = [
    { key: 'artistName', header: 'Artist', accessor: 'artistName' },
    { key: 'artistId', header: 'Artist ID', accessor: 'artistId' },
    { key: 'totalEarnings', header: 'Amount', accessor: 'totalEarnings' },
    { key: 'period', header: 'Period', accessor: 'period' },
  ];
  const sendPayment = async () => {
    window.location.href = '/admin/payments/new';
  };
  return (
    <Section title="Artist Payments">
      <div className="mb-4">
        <Button onClick={sendPayment} className="hover-scale">
          <Plus className="w-4 h-4 mr-2" /> New Payment
        </Button>
      </div>
      <DataTable data={rows} columns={cols} loading={loading} emptyMessage="No payments" />
    </Section>
  );
};

const Invoices: React.FC = () => {
  const [rows, setRows] = React.useState<Invoice[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();
  const reload = React.useCallback(() => {
    setLoading(true);
    invoiceAPI.getAllInvoices().then(setRows).catch(() => setRows([])).finally(() => setLoading(false));
  }, []);
  React.useEffect(() => { reload(); }, [reload]);
  const cols: Column<Invoice>[] = [
    { key: 'invoiceNumber', header: 'Number', accessor: 'invoiceNumber' },
    { key: 'invoiceDate', header: 'Date', accessor: 'invoiceDate' },
    { key: 'billingToCompanyName', header: 'Billed To', accessor: 'billingToCompanyName' },
    { key: 'totalAmount', header: 'Amount', accessor: 'totalAmount' },
  ];
  const createInvoice = async () => {
    window.location.href = '/admin/invoices/new';
  };
  return (
    <Section title="Invoices">
      <div className="mb-4">
        <Button onClick={createInvoice} className="hover-scale">
          <Plus className="w-4 h-4 mr-2" /> Send Invoice
        </Button>
      </div>
      <DataTable data={rows} columns={cols} loading={loading} emptyMessage="No invoices" />
    </Section>
  );
};

const LogSheets: React.FC = () => {
  const [rows, setRows] = React.useState<LogSheet[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();
  const reload = React.useCallback(() => {
    setLoading(true);
    adminAPI.getAllLogSheets().then(setRows).catch(() => setRows([])).finally(() => setLoading(false));
  }, []);
  React.useEffect(() => { reload(); }, [reload]);
  const cols: Column<LogSheet>[] = [
    { key: 'id', header: 'ID', accessor: 'id' },
    { key: 'logSheetName', header: 'Name', accessor: 'logSheetName' },
    { key: 'company', header: 'Company', accessor: (l) => l.company?.companyName },
    { key: 'createdDate', header: 'Created', accessor: 'createdDate' },
  ];
  return (
    <Section title="All LogSheets">
      <DataTable
        data={rows}
        columns={cols}
        loading={loading}
        emptyMessage="No log sheets"
        actions={[
          {
            label: 'View',
            onClick: async (l: LogSheet) => {
              try {
                const details = await adminAPI.getLogSheetById(l.id);
                window.alert(`LogSheet ${details.logSheetName} with ${details.selectedMusic?.length || 0} tracks`);
              } catch {}
            },
          },
        ]}
      />
    </Section>
  );
};

const AllMusic: React.FC = () => {
  const [rows, setRows] = React.useState<ArtistWork[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();
  const reload = React.useCallback(() => {
    setLoading(true);
    adminAPI.getAllMusic().then(setRows).catch(() => setRows([])).finally(() => setLoading(false));
  }, []);
  React.useEffect(() => { reload(); }, [reload]);
  const cols: Column<ArtistWork>[] = [
    { key: 'title', header: 'Title', accessor: 'title' },
    { key: 'artist', header: 'Artist', accessor: 'artist' },
    { key: 'status', header: 'Status', accessor: (r) => r.status?.statusName },
    { key: 'isrcCode', header: 'ISRC', accessor: (r) => r.isrcCode || '-' },
  ];
  return (
    <Section title="All Music">
      <DataTable
        data={rows}
        columns={cols}
        loading={loading}
        emptyMessage="No music"
        actions={[]}
      />
    </Section>
  );
};

const Admins: React.FC = () => {
  const [rows, setRows] = React.useState<AdminType[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [createForm, setCreateForm] = React.useState({
    email: '',
    password: '',
    name: '',
    role: 'ADMIN',
  });
  const [editingAdmin, setEditingAdmin] = React.useState<AdminType | null>(null);
  const [editForm, setEditForm] = React.useState({ name: '', role: 'ADMIN' });
  const [savingEdit, setSavingEdit] = React.useState(false);
  const { toast } = useToast();
  const reload = React.useCallback(() => {
    setLoading(true);
    adminAPI.getAllAdmins().then(setRows).catch(() => setRows([])).finally(() => setLoading(false));
  }, []);
  React.useEffect(() => { reload(); }, [reload]);
  const cols: Column<AdminType>[] = [
    { key: 'id', header: 'ID', accessor: 'id' },
    { key: 'name', header: 'Name', accessor: 'name' },
    { key: 'role', header: 'Role', accessor: 'role' },
    { key: 'email', header: 'Email', accessor: (a) => a.user?.email },
  ];

  const handleCreate = async () => {
    if (!createForm.email || !createForm.password || !createForm.name) {
      toast({ title: 'Please fill required fields', variant: 'destructive' });
      return;
    }
    try {
      setCreating(true);
      await adminAPI.createAdmin(createForm);
      toast({ title: 'Admin created' });
      setShowCreateDialog(false);
      setCreateForm({ email: '', password: '', name: '', role: 'ADMIN' });
      reload();
    } catch {
      toast({ title: 'Create failed', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (a: AdminType) => {
    setEditingAdmin(a);
    setEditForm({ name: a.name || '', role: a.role || 'ADMIN' });
  };

  const handleSaveEdit = async () => {
    if (!editingAdmin) return;
    try {
      setSavingEdit(true);
      await adminAPI.updateAdmin(editingAdmin.id, { name: editForm.name, role: editForm.role });
      toast({ title: 'Admin updated' });
      setEditingAdmin(null);
      reload();
    } catch {
      toast({ title: 'Update failed', variant: 'destructive' });
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <Section title="All Admins">
      <div className="mb-4">
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="hover-scale">
              <Plus className="w-4 h-4 mr-2" /> New Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Admin</DialogTitle>
              <DialogDescription>Enter admin details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="admin@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Temporary Password</Label>
                <Input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="Enter temporary password"
                />
              </div>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={createForm.name}
                  onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Admin full name"
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={createForm.role} onValueChange={(v) => setCreateForm((p) => ({ ...p, role: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                    <SelectItem value="SUPER_ADMIN">SUPER_ADMIN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={creating} className="flex-1">
                  {creating ? 'Creating...' : 'Create Admin'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <DataTable
        data={rows}
        columns={cols}
        loading={loading}
        emptyMessage="No admins"
        actions={[
          {
            label: 'Edit',
            onClick: openEdit,
          },
          {
            label: 'Delete',
            variant: 'destructive',
            onClick: async (a: AdminType) => {
              if (!window.confirm('Delete this admin?')) return;
              try {
                await adminAPI.deleteAdmin(a.id);
                toast({ title: 'Admin deleted' });
                reload();
              } catch {
                toast({ title: 'Delete failed', variant: 'destructive' });
              }
            },
          },
        ]}
      />

      {/* Edit Admin Dialog */}
      <Dialog open={!!editingAdmin} onOpenChange={() => setEditingAdmin(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Admin</DialogTitle>
            <DialogDescription>Update admin info</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={editForm.role} onValueChange={(v) => setEditForm((p) => ({ ...p, role: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                  <SelectItem value="SUPER_ADMIN">SUPER_ADMIN</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditingAdmin(null)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={savingEdit} className="flex-1">
                {savingEdit ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Section>
  );
};

const PendingMusic: React.FC = () => {
  const [rows, setRows] = React.useState<ArtistWork[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();
  const reload = React.useCallback(() => {
    setLoading(true);
    adminAPI.getPendingMusic()
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);
  React.useEffect(() => { reload(); }, [reload]);
  const cols: Column<ArtistWork>[] = [
    { key: 'title', header: 'Title', accessor: 'title' },
    { key: 'artist', header: 'Artist', accessor: 'artist' },
    { key: 'uploadedDate', header: 'Uploaded', accessor: 'uploadedDate' },
    { key: 'status', header: 'Status', accessor: (r) => r.status?.statusName || 'PENDING' },
  ];
  return (
    <Section title="Pending Music">
      <DataTable
        data={rows}
        columns={cols}
        loading={loading}
        emptyMessage="No pending music"
        actions={[
          {
            label: 'Approve',
            variant: 'success',
            onClick: async (item: ArtistWork) => {
              const isrc = window.prompt('Enter ISRC code to approve:');
              if (!isrc) return;
              try {
                await adminAPI.approveMusic(item.id, isrc);
                toast({ title: 'Music approved' });
                reload();
              } catch (e) {
                toast({ title: 'Approval failed', variant: 'destructive' });
              }
            },
            show: (item: ArtistWork) => item.status?.statusName !== 'APPROVED',
          },
          {
            label: 'Reject',
            variant: 'destructive',
            onClick: async (item: ArtistWork) => {
              const notes = window.prompt('Enter rejection notes:') || '';
              try {
                await adminAPI.rejectMusic(item.id, notes);
                toast({ title: 'Music rejected' });
                reload();
              } catch (e) {
                toast({ title: 'Rejection failed', variant: 'destructive' });
              }
            },
            show: (item: ArtistWork) => item.status?.statusName !== 'REJECTED',
          },
        ]}
      />
    </Section>
  );
};

const AllUsers: React.FC = () => {
  const [rows, setRows] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();
  const reload = React.useCallback(() => {
    setLoading(true);
    adminAPI.getAllUsers().then(setRows).catch(() => setRows([])).finally(() => setLoading(false));
  }, []);
  React.useEffect(() => { reload(); }, [reload]);
  const cols: Column<User>[] = [
    { key: 'id', header: 'ID', accessor: 'id' },
    { key: 'email', header: 'Email', accessor: 'email' },
    { key: 'role', header: 'Role', accessor: 'role' },
    { key: 'isEnabled', header: 'Enabled', accessor: (u) => (u.isEnabled ? 'Yes' : 'No') },
  ];
  const artists = rows.filter((u) => u.role === 'ARTIST');
  const companies = rows.filter((u) => u.role === 'COMPANY');
  const admins = rows.filter((u) => u.role === 'ADMIN');
  return (
    <DashboardLayout title="Users">
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
            <CardDescription>Browse all Members</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable data={artists} columns={cols} loading={loading} emptyMessage="No Members" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Music Users</CardTitle>
            <CardDescription>Manage Music Users</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={companies}
              columns={cols}
              loading={loading}
              emptyMessage="No Music Users"
              actions={[
                {
                  label: 'Edit',
                  onClick: async (user: User) => {
                    const email = window.prompt('Email:', user.email) || user.email;
                    try {
                      await adminAPI.updateUser(user.id, { email });
                      toast({ title: 'User updated' });
                      reload();
                    } catch {
                      toast({ title: 'Update failed', variant: 'destructive' });
                    }
                  },
                },
                {
                  label: 'Toggle Enable',
                  onClick: async (user: User) => {
                    try {
                      await adminAPI.updateUser(user.id, { isEnabled: !user.isEnabled });
                      toast({ title: 'User updated' });
                      reload();
                    } catch {
                      toast({ title: 'Update failed', variant: 'destructive' });
                    }
                  },
                },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admins</CardTitle>
            <CardDescription>Manage admins</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={admins}
              columns={cols}
              loading={loading}
              emptyMessage="No admins"
              actions={[
                {
                  label: 'Edit',
                  onClick: async (user: User) => {
                    const email = window.prompt('Email:', user.email) || user.email;
                    try {
                      await adminAPI.updateUser(user.id, { email });
                      toast({ title: 'User updated' });
                      reload();
                    } catch {
                      toast({ title: 'Update failed', variant: 'destructive' });
                    }
                  },
                },
                {
                  label: 'Toggle Enable',
                  onClick: async (user: User) => {
                    try {
                      await adminAPI.updateUser(user.id, { isEnabled: !user.isEnabled });
                      toast({ title: 'User updated' });
                      reload();
                    } catch {
                      toast({ title: 'Update failed', variant: 'destructive' });
                    }
                  },
                },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

const Companies: React.FC = () => {
  const [rows, setRows] = React.useState<Company[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editingCompany, setEditingCompany] = React.useState<Company | null>(null);
  const [editForm, setEditForm] = React.useState<Partial<Company>>({});
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  const [createForm, setCreateForm] = React.useState({
    email: '',
    password: '',
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    companyAddress: '',
    contactPerson: '',
  });
  const [saving, setSaving] = React.useState(false);
  const { toast } = useToast();
  const reload = React.useCallback(() => {
    setLoading(true);
    adminAPI.getAllCompanies().then(setRows).catch(() => setRows([])).finally(() => setLoading(false));
  }, []);
  React.useEffect(() => { reload(); }, [reload]);

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setEditForm({
      companyName: company.companyName,
      companyEmail: company.companyEmail,
      companyPhone: company.companyPhone,
      companyAddress: company.companyAddress,
      contactPerson: company.contactPerson,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingCompany) return;
    try {
      setSaving(true);
      await adminAPI.updateCompany(editingCompany.id, editForm);
      toast({ title: 'Company updated' });
      setEditingCompany(null);
      reload();
    } catch {
      toast({ title: 'Update failed', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    try {
      setSaving(true);
      await adminAPI.createCompany(createForm);
      toast({ title: 'Company created' });
      setShowCreateDialog(false);
      setCreateForm({
        email: '',
        password: '',
        companyName: '',
        companyEmail: '',
        companyPhone: '',
        companyAddress: '',
        contactPerson: '',
      });
      reload();
    } catch {
      toast({ title: 'Create failed', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const cols: Column<Company>[] = [
    { key: 'id', header: 'ID', accessor: 'id' },
    { key: 'companyName', header: 'Name', accessor: 'companyName' },
    { key: 'companyEmail', header: 'Email', accessor: 'companyEmail' },
    { key: 'companyPhone', header: 'Phone', accessor: 'companyPhone' },
    { key: 'contactPerson', header: 'Contact', accessor: 'contactPerson' },
  ];

  return (
    <Section title="All Companies">
      <div className="mb-4">
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="hover-scale">
              <Plus className="w-4 h-4 mr-2" /> New Music User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Music User</DialogTitle>
              <DialogDescription>Enter the company details below</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Login Email</Label>
                <Input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="user@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Temporary Password</Label>
                <Input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter temporary password"
                />
              </div>
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input
                  value={createForm.companyName}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Enter company name"
                />
              </div>
            <div className="space-y-2">
                <Label>Company Email</Label>
                <Input
                  type="email"
                  value={createForm.companyEmail}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, companyEmail: e.target.value }))}
                  placeholder="info@company.com"
                />
              </div>
            <div className="space-y-2">
              <Label>Company Phone</Label>
              <Input
                value={createForm.companyPhone}
                onChange={(e) => setCreateForm(prev => ({ ...prev, companyPhone: e.target.value }))}
                placeholder="+1234567890"
              />
            </div>
            <div className="space-y-2">
              <Label>Company Address</Label>
              <Input
                value={createForm.companyAddress}
                onChange={(e) => setCreateForm(prev => ({ ...prev, companyAddress: e.target.value }))}
                placeholder="123 Main St, City"
              />
            </div>
              <div className="space-y-2">
                <Label>Contact Person</Label>
                <Input
                  value={createForm.contactPerson}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, contactPerson: e.target.value }))}
                  placeholder="Enter contact person name"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={saving} className="flex-1">
                  {saving ? 'Creating...' : 'Create Company'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <DataTable
        data={rows}
        columns={cols}
        loading={loading}
        emptyMessage="No Music Users"
        actions={[
          {
            label: 'Edit',
            icon: Edit,
            onClick: handleEdit,
          },
          {
            label: 'Delete',
            icon: Trash2,
            variant: 'destructive',
            onClick: async (c: Company) => {
              if (!window.confirm('Delete this company?')) return;
              try {
                await adminAPI.deleteCompany(c.id);
                toast({ title: 'Company deleted' });
                reload();
              } catch {
                toast({ title: 'Delete failed', variant: 'destructive' });
              }
            },
          },
        ]}
      />

      {/* Edit Company Dialog */}
      <Dialog open={!!editingCompany} onOpenChange={() => setEditingCompany(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
            <DialogDescription>Update company information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input
                value={editForm.companyName || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, companyName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Company Email</Label>
              <Input
                type="email"
                value={editForm.companyEmail || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, companyEmail: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Company Phone</Label>
              <Input
                value={editForm.companyPhone || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, companyPhone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Company Address</Label>
              <Input
                value={editForm.companyAddress || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, companyAddress: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Contact Person</Label>
              <Input
                value={editForm.contactPerson || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, contactPerson: e.target.value }))}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditingCompany(null)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={saving} className="flex-1">
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Section>
  );
};

const ArtistsList: React.FC = () => {
  const [rows, setRows] = React.useState<MemberDetails[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');
  const reload = React.useCallback(() => {
    setLoading(true);
    adminAPI.getAllProfiles().then(setRows).catch(() => setRows([])).finally(() => setLoading(false));
  }, []);
  React.useEffect(() => { reload(); }, [reload]);
  const cols: Column<MemberDetails>[] = [
    { key: 'firstName', header: 'First Name', accessor: 'firstName', sortable: true },
    { key: 'surname', header: 'Surname', accessor: (r) => r.surname || '-' },
    { key: 'artistId', header: 'Artist ID', accessor: (r) => (r as any).artistId || (r as any).ArtistId || '-' },
    { key: 'email', header: 'Email', accessor: 'email' },
    { key: 'phoneNumber', header: 'Phone', accessor: 'phoneNumber' },
    { key: 'status', header: 'Status', accessor: (r) => r.status?.statusName || '-' },
    { key: 'ipi', header: 'IPI', accessor: (r) => (r as any).IPI_number || (r as any).ipiNumber || '-' },
  ];
  const filtered = React.useMemo(() => {
    if (statusFilter === 'ALL') return rows;
    return rows.filter((r) => (r.status?.statusName || '-') === statusFilter);
  }, [rows, statusFilter]);
  return (
    <DashboardLayout title="All members">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>All Members</CardTitle>
              <CardDescription>Browse and search all  members</CardDescription>
            </div>
            <div className="w-44">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable data={filtered} columns={cols} loading={loading} emptyMessage="No Members found" />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<AdminDashboard />} />
      <Route path="stats" element={<AdminDashboard />} />
      <Route path="profiles/pending" element={<AdminPendingProfiles />} />
      <Route path="music/pending" element={<AdminPendingMusic />} />
      <Route path="licenses" element={<AdminLicenseApplications />} />
      <Route path="artists" element={<ArtistsList />} />
      <Route path="users" element={<AllUsers />} />
      <Route path="companies" element={<Companies />} />
      <Route path="admins" element={<Admins />} />
      <Route path="music" element={<AllMusic />} />
      <Route path="logsheets" element={<LogSheets />} />
      <Route path="invoices" element={<Invoices />} />
      <Route path="invoices/new" element={<InvoiceForm />} />
      <Route path="payments" element={<Payments />} />
      <Route path="payments/new" element={<ArtistPaymentForm />} />
      <Route path="*" element={<Navigate to="." replace />} />
    </Routes>
  );
};

export default AdminRoutes;

