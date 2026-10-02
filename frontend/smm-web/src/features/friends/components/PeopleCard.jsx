import { useState } from 'react';

import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import PersonRemoveOutlinedIcon from '@mui/icons-material/PersonRemoveOutlined';
import ChatBubbleRoundedIcon from '@mui/icons-material/ChatBubbleRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';

import { API_ORIGIN } from '../../../config';

export default function PeopleCard({
  user,

  onAdd,
  onCancel,
  onAccept,
  onReject,
  onMessage,
  onRemove,

  loading,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleMenuOpen(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleMenuClose() {
    setAnchorEl(null);
  }

  function handleRemoveClick() {
    handleMenuClose();
    setConfirmOpen(true);
  }

  function handleConfirmRemove() {
    onRemove?.(user.id);
    setConfirmOpen(false);
  }

  const avatar =
    user.profileImageUrl
      ? user.profileImageUrl.startsWith(
          'http'
        )
        ? user.profileImageUrl
        : `${API_ORIGIN}${user.profileImageUrl}`
      : null;

  function renderAction() {
    switch (
      user.relationshipStatus
    ) {
      case 'Friends':
        return (
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <Chip
              icon={
                <CheckRoundedIcon />
              }
              label="Friends"
              sx={{
                fontWeight: 800,

                bgcolor:
                  'rgba(16,185,129,.1)',

                color: '#059669',
              }}
            />

            <Button
              variant="contained"
              startIcon={
                <ChatBubbleRoundedIcon />
              }
              onClick={() =>
                onMessage(
                  user.id
                )
              }
              sx={{
                borderRadius: 999,

                textTransform:
                  'none',

                fontWeight: 800,
              }}
            >
              Message
            </Button>

            <IconButton
              onClick={handleMenuOpen}
              sx={{
                '&:hover': {
                  bgcolor: 'rgba(15,23,42,.05)',
                },
              }}
            >
              <MoreHorizRoundedIcon />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={menuOpen}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              PaperProps={{
                sx: {
                  borderRadius: 2.5,
                  minWidth: 190,
                },
              }}
            >
              <MenuItem
                onClick={handleRemoveClick}
                sx={{ color: '#e11d48' }}
              >
                <ListItemIcon>
                  <PersonRemoveOutlinedIcon
                    fontSize="small"
                    sx={{ color: '#e11d48' }}
                  />
                </ListItemIcon>
                <ListItemText>
                  Remove friend
                </ListItemText>
              </MenuItem>
            </Menu>
          </Stack>
        );

      case 'OutgoingRequest':
        return (
          <Button
            variant="outlined"
            startIcon={
              <ScheduleRoundedIcon />
            }
            disabled={loading}
            onClick={() =>
              onCancel(
                user.friendRequestId
              )
            }
            sx={{
              borderRadius: 999,

              textTransform:
                'none',

              fontWeight: 800,
            }}
          >
            Pending
          </Button>
        );

      case 'IncomingRequest':
        return (
          <Stack
            direction="row"
            spacing={1}
          >
            <Button
              variant="contained"
              disabled={loading}
              onClick={() =>
                onAccept(
                  user.friendRequestId
                )
              }
              sx={{
                borderRadius: 999,

                textTransform:
                  'none',

                fontWeight: 800,
              }}
            >
              Accept
            </Button>

            <Button
              variant="outlined"
              color="inherit"
              disabled={loading}
              onClick={() =>
                onReject(
                  user.friendRequestId
                )
              }
              sx={{
                minWidth: 44,

                borderRadius: 999,
              }}
            >
              <PersonRemoveOutlinedIcon />
            </Button>
          </Stack>
        );

      default:
        return (
          <Button
            variant="contained"
            startIcon={
              <PersonAddAlt1RoundedIcon />
            }
            disabled={loading}
            onClick={() =>
              onAdd(user.id)
            }
            sx={{
              borderRadius: 999,

              textTransform:
                'none',

              fontWeight: 800,

              background:
                'linear-gradient(135deg,#2563eb,#6366f1)',
            }}
          >
            Add friend
          </Button>
        );
    }
  }

  return (
    <>
    <Paper
      elevation={0}
      sx={{
        p: 2.3,

        borderRadius: 4,

        border: '1px solid',

        borderColor:
          'rgba(148,163,184,.16)',

        background:
          'linear-gradient(145deg,#fff,#f8fafc)',

        boxShadow:
          '0 16px 45px rgba(15,23,42,.06)',

        transition:
          '.2s ease',

        '&:hover': {
          transform:
            'translateY(-2px)',

          boxShadow:
            '0 22px 55px rgba(15,23,42,.1)',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',

          alignItems:
            'center',

          gap: 1.5,
        }}
      >
        <Box
          sx={{
            position:
              'relative',
          }}
        >
          <Avatar
            src={avatar || undefined}
            sx={{
              width: 58,
              height: 58,

              fontWeight: 900,

              background:
                'linear-gradient(135deg,#2563eb,#7c3aed)',
            }}
          >
            {user.firstName?.[0]}
          </Avatar>

          {user.isOnline && (
            <Box
              sx={{
                position:
                  'absolute',

                right: 0,
                bottom: 1,

                width: 14,
                height: 14,

                borderRadius:
                  '50%',

                bgcolor:
                  '#22c55e',

                border:
                  '3px solid white',
              }}
            />
          )}
        </Box>

        <Box
          sx={{
            minWidth: 0,

            flex: 1,
          }}
        >
          <Typography
            fontWeight={850}
            noWrap
          >
            {user.firstName}{' '}
            {user.lastName}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            noWrap
          >
            @{user.userName}
          </Typography>
        </Box>

        {renderAction()}
      </Box>
    </Paper>

    <Dialog
      open={confirmOpen}
      onClose={() => !loading && setConfirmOpen(false)}
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontWeight: 800 }}>
        Remove {user.firstName} from friends?
      </DialogTitle>

      <DialogContent>
        <DialogContentText>
          You will no longer see each other as friends. You can send a
          new friend request later if you change your mind.
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button
          onClick={() => setConfirmOpen(false)}
          disabled={loading}
          sx={{ textTransform: 'none', fontWeight: 700 }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          color="error"
          disableElevation
          disabled={loading}
          onClick={handleConfirmRemove}
          sx={{
            textTransform: 'none',
            fontWeight: 800,
            borderRadius: 999,
          }}
        >
          Remove
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
}