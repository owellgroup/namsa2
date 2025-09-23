import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable, { Column, Action } from '@/components/common/DataTable';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { artistAPI } from '@/services/api';
import { ArtistWork } from '@/types';
import { Edit, Trash2, Eye, Play, Download } from 'lucide-react';

const ArtistMyMusic: React.FC = () => {
  const [rows, setRows] = useState<ArtistWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMusic, setEditingMusic] = useState<ArtistWork | null>(null);
  const [editForm, setEditForm] = useState<Partial<ArtistWork>>({});
  const [saving, setSaving] = useState(false);
  const [editFile, setEditFile] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await artistAPI.getMyMusic().catch(() => []);
        setRows(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleEdit = (music: ArtistWork) => {
    setEditingMusic(music);
    setEditForm({
      title: music.title,
      albumName: music.albumName,
      artist: music.artist,
      duration: music.duration,
      // Only include editable fields, exclude workId, ISRC_code, etc.
    });
  };

  const handleSaveEdit = async () => {
    if (!editingMusic) return;
    if (!editFile) {
      toast({
        title: 'File Required',
        description: 'Please select a new audio/video file to upload',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      await artistAPI.updateMusic(editingMusic.id, editingMusic as any, editForm as any, editFile);
      toast({
        title: 'Music Updated',
        description: 'Your music has been updated successfully',
      });
      setEditingMusic(null);
      setEditFile(null);
      // Reload data
      const data = await artistAPI.getMyMusic().catch(() => []);
      setRows(data);
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error?.response?.data?.message || 'Failed to update music',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (music: ArtistWork) => {
    if (!window.confirm(`Are you sure you want to delete "${music.title}"?`)) return;
    
    try {
      await artistAPI.deleteMusic(music.id);
      toast({
        title: "Music Deleted",
        description: "Your music has been deleted successfully",
      });
      setRows(prev => prev.filter(r => r.id !== music.id));
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error?.response?.data?.message || "Failed to delete music",
        variant: "destructive",
      });
    }
  };
  const cols: Column<ArtistWork>[] = [
    { key: 'title', header: 'Title', accessor: 'title' },
    { key: 'artist', header: 'Artist', accessor: 'artist' },
    { key: 'duration', header: 'Duration', accessor: 'duration' },
    { key: 'status', header: 'Status', accessor: (r) => r.status?.statusName || '-' },
    { key: 'isrcCode', header: 'ISRC', accessor: (r) => r.isrcCode || 'Pending' },
  ];

  const actions: Action<ArtistWork>[] = [
    {
      label: 'View',
      icon: Eye,
      onClick: (item) => {
        // View details - could open a modal or navigate to detail page
        toast({
          title: "Track Details",
          description: `${item.title} by ${item.artist}`,
        });
      },
    },
    {
      label: 'Play',
      icon: Play,
      onClick: (item) => {
        if (item.fileUrl) {
          const audio = new Audio(item.fileUrl);
          audio.play().catch(console.error);
        }
      },
    },
    {
      label: 'Download',
      icon: Download,
      onClick: (item) => {
        if (item.fileUrl) {
          const link = document.createElement('a');
          link.href = item.fileUrl;
          link.download = `${item.title}.${item.fileType || 'mp3'}`;
          link.click();
        }
      },
    },
    {
      label: 'Edit',
      icon: Edit,
      onClick: handleEdit,
      show: (item) => item.status?.statusName !== 'APPROVED'
    },
    {
      label: 'Delete',
      icon: Trash2,
      variant: 'destructive',
      onClick: handleDelete,
      show: (item) => item.status?.statusName !== 'APPROVED'
    }
  ];

  return (
    <DashboardLayout title="My Music">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Music</h1>
          <p className="text-muted-foreground">
            Manage your uploaded music tracks
          </p>
        </div>

        {loading ? (
          <div className="h-32 bg-muted rounded-lg animate-pulse"></div>
        ) : (
          <DataTable data={rows} columns={cols} actions={actions} searchable emptyMessage="No music uploaded yet" />
        )}

        {/* Edit Music Dialog */}
        <Dialog open={!!editingMusic} onOpenChange={() => setEditingMusic(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Music</DialogTitle>
              <DialogDescription>
                Update your music information (approved tracks cannot be edited)
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={editForm.title || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Artist</Label>
                <Input
                  value={editForm.artist || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, artist: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Album</Label>
                <Input
                  value={editForm.albumName || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, albumName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Duration</Label>
                <Input
                  value={editForm.duration || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="e.g., 3:45"
                />
              </div>
              <div className="space-y-2">
                <Label>New File (required)</Label>
                <Input
                  type="file"
                  accept="audio/*,video/*"
                  onChange={(e) => setEditFile(e.target.files?.[0] || null)}
                />
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setEditingMusic(null)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit} disabled={saving} className="flex-1">
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default ArtistMyMusic;

