import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Divider,
  Menu,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  PersonAdd as PersonAddIcon,
  People as PeopleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { apiService } from '../services/api';
import { TeamMember, InviteTeamMemberRequest, TeamSettings, UpdateTeamMemberRoleRequest } from '../types/teamManagement';

const TeamManagement: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [settings, setSettings] = useState<TeamSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [inviteForm, setInviteForm] = useState<InviteTeamMemberRequest>({
    email: '',
    role: 'MEMBER',
    message: '',
  });
  const [roleForm, setRoleForm] = useState<UpdateTeamMemberRoleRequest>({
    role: 'MEMBER',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [members, teamSettings] = await Promise.all([
        apiService.getTeamMembers(),
        apiService.getTeamSettings(),
      ]);
      setTeamMembers(members);
      setSettings(teamSettings);
    } catch (err: any) {
      setError(err.message || 'Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    try {
      setInviting(true);
      setError(null);
      await apiService.inviteTeamMember(inviteForm);
      setSuccess('Invitation sent successfully');
      setInviteDialogOpen(false);
      setInviteForm({ email: '', role: 'MEMBER', message: '' });
      setTimeout(() => setSuccess(null), 3000);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!window.confirm('Are you sure you want to remove this team member?')) {
      return;
    }
    try {
      setError(null);
      await apiService.removeTeamMember(memberId);
      setSuccess('Team member removed successfully');
      setTimeout(() => setSuccess(null), 3000);
      await loadData();
      setAnchorEl(null);
    } catch (err: any) {
      setError(err.message || 'Failed to remove team member');
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!window.confirm('Are you sure you want to cancel this invitation?')) {
      return;
    }
    try {
      setError(null);
      await apiService.cancelInvitation(invitationId);
      setSuccess('Invitation cancelled successfully');
      setTimeout(() => setSuccess(null), 3000);
      await loadData();
      setAnchorEl(null);
    } catch (err: any) {
      setError(err.message || 'Failed to cancel invitation');
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedMember) return;
    try {
      setError(null);
      await apiService.updateTeamMemberRole(selectedMember.id, roleForm);
      setSuccess('Team member role updated successfully');
      setRoleDialogOpen(false);
      setSelectedMember(null);
      setTimeout(() => setSuccess(null), 3000);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to update team member role');
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, member: TeamMember) => {
    setAnchorEl(event.currentTarget);
    setSelectedMember(member);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMember(null);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'error';
      case 'ADMIN':
        return 'warning';
      case 'MEMBER':
        return 'primary';
      case 'VIEWER':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'INACTIVE':
        return 'default';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Team Management
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage your team members, send invitations, and control access to your organization.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Team Settings Card */}
        {settings && (
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PeopleIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Team Overview</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Current Members
                  </Typography>
                  <Typography variant="h4">
                    {settings.currentUserCount} / {settings.maxUsers}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Invitations
                  </Typography>
                  <Typography variant="body1">
                    {settings.allowInvitations ? 'Enabled' : 'Disabled'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Team Members Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PeopleIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Team Members</Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<PersonAddIcon />}
                  onClick={() => setInviteDialogOpen(true)}
                  disabled={settings ? !settings.allowInvitations : false}
                >
                  Invite Member
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Joined</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {teamMembers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                            No team members yet. Invite someone to get started!
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      teamMembers.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>{member.name}</TableCell>
                          <TableCell>{member.email}</TableCell>
                          <TableCell>
                            <Chip
                              label={member.role}
                              color={getRoleColor(member.role) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={member.status}
                              color={getStatusColor(member.status) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {member.joinedAt
                              ? new Date(member.joinedAt).toLocaleDateString()
                              : member.invitedAt
                              ? `Invited ${new Date(member.invitedAt).toLocaleDateString()}`
                              : '-'}
                          </TableCell>
                          <TableCell align="right">
                            {member.status === 'ACTIVE' && member.role !== 'OWNER' && (
                              <IconButton
                                size="small"
                                onClick={(e) => handleMenuOpen(e, member)}
                              >
                                <MoreVertIcon />
                              </IconButton>
                            )}
                            {member.status === 'PENDING' && (
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleCancelInvitation(member.id)}
                              >
                                <CancelIcon />
                              </IconButton>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onClose={() => setInviteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Invite Team Member</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={inviteForm.email}
            onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={inviteForm.role}
              onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as any })}
              label="Role"
            >
              <MenuItem value="MEMBER">Member</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
              <MenuItem value="VIEWER">Viewer</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Message (Optional)"
            value={inviteForm.message}
            onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleInvite}
            variant="contained"
            disabled={inviting || !inviteForm.email}
          >
            {inviting ? <CircularProgress size={20} /> : 'Send Invitation'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Role Update Dialog */}
      <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)}>
        <DialogTitle>Update Team Member Role</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={roleForm.role}
              onChange={(e) => setRoleForm({ role: e.target.value as any })}
              label="Role"
            >
              <MenuItem value="MEMBER">Member</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
              <MenuItem value="VIEWER">Viewer</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateRole} variant="contained">
            Update Role
          </Button>
        </DialogActions>
      </Dialog>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            if (selectedMember) {
              setRoleForm({ role: selectedMember.role as any });
              setRoleDialogOpen(true);
            }
            handleMenuClose();
          }}
        >
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Update Role
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedMember) {
              handleRemoveMember(selectedMember.id);
            }
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Remove Member
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default TeamManagement;

