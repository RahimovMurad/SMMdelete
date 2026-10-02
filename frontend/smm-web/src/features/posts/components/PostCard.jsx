import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import VideoLibraryOutlinedIcon from "@mui/icons-material/VideoLibraryOutlined";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deletePost, likePost, unlikePost, updatePost } from "../api/postsApi";

import { API_ORIGIN } from "../../../config";

import { useRef, useState } from "react";
import CommentSection from "../../comments/components/CommentSection";
import { useAuthStore } from "../../auth/store/authStore";

export default function PostCard({ post }) {
  const [showComments, setShowComments] = useState(false);
  const queryClient = useQueryClient();

  const currentUser = useAuthStore((state) => state.user);
  const isOwner = Boolean(
    currentUser?.userId && post.userId === currentUser.userId,
  );


  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  function handleMenuOpen(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleMenuClose() {
    setAnchorEl(null);
  }

 
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => deletePost(post.id),

    onSuccess: () => {
      setDeleteDialogOpen(false);

      queryClient.invalidateQueries({
        queryKey: ["posts"],
      });
    },
  });

  function handleDeleteClick() {
    handleMenuClose();
    setDeleteDialogOpen(true);
  }

  function handleConfirmDelete() {
    if (deleteMutation.isPending) {
      return;
    }

    deleteMutation.mutate();
  }

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content ?? "");

  const [editImage, setEditImage] = useState(null);
  const [editVideo, setEditVideo] = useState(null);

  const [editImagePreview, setEditImagePreview] = useState(null);
  const [editVideoPreview, setEditVideoPreview] = useState(null);

  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [removeExistingVideo, setRemoveExistingVideo] = useState(false);

  const [editError, setEditError] = useState("");

  const editImageInputRef = useRef(null);
  const editVideoInputRef = useRef(null);

  const updateMutation = useMutation({
    mutationFn: (payload) => updatePost(post.id, payload),

    onSuccess: () => {
      exitEditMode();

      queryClient.invalidateQueries({
        queryKey: ["posts"],
      });
    },

    onError: (error) => {
      setEditError(
        error.response?.data?.message || "Post could not be updated.",
      );
    },
  });

  function handleEditClick() {
    handleMenuClose();

    setEditContent(post.content ?? "");
    setEditImage(null);
    setEditVideo(null);
    setEditImagePreview(null);
    setEditVideoPreview(null);
    setRemoveExistingImage(false);
    setRemoveExistingVideo(false);
    setEditError("");

    setIsEditing(true);
  }

  function exitEditMode() {
    if (editImagePreview) {
      URL.revokeObjectURL(editImagePreview);
    }

    if (editVideoPreview) {
      URL.revokeObjectURL(editVideoPreview);
    }

    setIsEditing(false);
    setEditImage(null);
    setEditVideo(null);
    setEditImagePreview(null);
    setEditVideoPreview(null);
    setRemoveExistingImage(false);
    setRemoveExistingVideo(false);
    setEditError("");

    if (editImageInputRef.current) {
      editImageInputRef.current.value = "";
    }

    if (editVideoInputRef.current) {
      editVideoInputRef.current.value = "";
    }
  }

  function handleEditImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (editImagePreview) {
      URL.revokeObjectURL(editImagePreview);
    }

    setEditVideo(null);
    setEditVideoPreview(null);
    setRemoveExistingVideo(true);

    setRemoveExistingImage(false);
    setEditImage(file);
    setEditImagePreview(URL.createObjectURL(file));
  }

  function handleEditVideoChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (editVideoPreview) {
      URL.revokeObjectURL(editVideoPreview);
    }

    setEditImage(null);
    setEditImagePreview(null);
    setRemoveExistingImage(true);

    setRemoveExistingVideo(false);
    setEditVideo(file);
    setEditVideoPreview(URL.createObjectURL(file));
  }

  function handleRemoveEditImage() {
    if (editImagePreview) {
      URL.revokeObjectURL(editImagePreview);
    }

    setEditImage(null);
    setEditImagePreview(null);
    setRemoveExistingImage(true);

    if (editImageInputRef.current) {
      editImageInputRef.current.value = "";
    }
  }

  function handleRemoveEditVideo() {
    if (editVideoPreview) {
      URL.revokeObjectURL(editVideoPreview);
    }

    setEditVideo(null);
    setEditVideoPreview(null);
    setRemoveExistingVideo(true);

    if (editVideoInputRef.current) {
      editVideoInputRef.current.value = "";
    }
  }

  function handleSaveEdit() {
    const hasRemainingContent =
      editContent.trim() ||
      (post.imageUrl && !removeExistingImage) ||
      (post.videoUrl && !removeExistingVideo) ||
      editImage ||
      editVideo;

    if (!hasRemainingContent) {
      setEditError("Post cannot be empty.");
      return;
    }

    setEditError("");

    updateMutation.mutate({
      content: editContent,
      image: editImage,
      video: editVideo,
      removeImage: removeExistingImage,
      removeVideo: removeExistingVideo,
    });
  }


  const imageUrl = post.imageUrl
    ? post.imageUrl.startsWith("http")
      ? post.imageUrl
      : `${API_ORIGIN}${post.imageUrl}`
    : null;

  const videoUrl = post.videoUrl
    ? post.videoUrl.startsWith("http")
      ? post.videoUrl
      : `${API_ORIGIN}${post.videoUrl}`
    : null;

  const profileImageUrl = post.profileImageUrl
    ? post.profileImageUrl.startsWith("http")
      ? post.profileImageUrl
      : `${API_ORIGIN}${post.profileImageUrl}`
    : null;

  const displayedImageUrl = isEditing
    ? editImagePreview ||
      (!removeExistingImage && !editVideoPreview ? imageUrl : null)
    : imageUrl;

  const displayedVideoUrl = isEditing
    ? editVideoPreview ||
      (!removeExistingVideo && !editImagePreview ? videoUrl : null)
    : videoUrl;

  const likeMutation = useMutation({
    mutationFn: () =>
      post.isLikedByCurrentUser ? unlikePost(post.id) : likePost(post.id),

    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ["posts"],
      });

      const previousData = queryClient.getQueryData(["posts"]);

      queryClient.setQueryData(["posts"], (oldData) => {
        if (!oldData) {
          return oldData;
        }

        return {
          ...oldData,

          items: oldData.items.map((item) => {
            if (item.id !== post.id) {
              return item;
            }

            const currentlyLiked = item.isLikedByCurrentUser;

            return {
              ...item,

              isLikedByCurrentUser: !currentlyLiked,

              likeCount: item.likeCount + (currentlyLiked ? -1 : 1),
            };
          }),
        };
      });

      return {
        previousData,
      };
    },

    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["posts"], context.previousData);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["posts"],
      });
    },
  });

  function handleLike() {
    if (likeMutation.isPending) {
      return;
    }

    likeMutation.mutate();
  }

  function formatPostDate(date) {
    if (!date) {
      return "";
    }

    const postDate = new Date(date);

    const now = new Date();

    const difference = now.getTime() - postDate.getTime();

    const seconds = Math.floor(difference / 1000);

    const minutes = Math.floor(seconds / 60);

    const hours = Math.floor(minutes / 60);

    const days = Math.floor(hours / 24);

    if (seconds < 60) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes}m`;
    }

    if (hours < 24) {
      return `${hours}h`;
    }

    if (days < 7) {
      return `${days}d`;
    }

    return postDate.toLocaleDateString();
  }

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          overflow: "hidden",

          borderRadius: 4,

          border: "1px solid",

          borderColor: "rgba(148,163,184,.18)",

          background: "rgba(255,255,255,.96)",

          boxShadow: "0 16px 45px rgba(15,23,42,.065)",

          transition: "transform .2s ease, box-shadow .2s ease",

          "&:hover": {
            boxShadow: "0 20px 55px rgba(15,23,42,.09)",
          },
        }}
      >
        <Box
          sx={{
            px: 2.5,
            pt: 2.3,
            pb: 1.5,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <Avatar
              src={profileImageUrl || undefined}
              sx={{
                width: 48,
                height: 48,

                mr: 1.5,

                fontWeight: 800,

                background: "linear-gradient(135deg, #2563eb, #7c3aed)",

                boxShadow: "0 7px 18px rgba(37,99,235,.18)",
              }}
            >
              {post.firstName?.[0]}
            </Avatar>

            <Box
              sx={{
                flexGrow: 1,
                minWidth: 0,
              }}
            >
              <Typography
                sx={{
                  fontWeight: 800,
                  lineHeight: 1.25,
                  fontSize: 15.5,
                }}
              >
                {post.firstName} {post.lastName}
              </Typography>

              <Box
                sx={{
                  mt: 0.3,

                  display: "flex",
                  alignItems: "center",
                  gap: 0.6,
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontWeight: 500,
                  }}
                >
                  {formatPostDate(post.createdAt)}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  •
                </Typography>

                <PublicRoundedIcon
                  sx={{
                    fontSize: 14,
                    color: "text.secondary",
                  }}
                />
              </Box>
            </Box>

            {isOwner && (
              <>
                <IconButton
                  onClick={handleMenuOpen}
                  sx={{
                    "&:hover": {
                      bgcolor: "rgba(15,23,42,.05)",
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
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  PaperProps={{
                    sx: {
                      borderRadius: 2.5,
                      minWidth: 170,
                    },
                  }}
                >
                  <MenuItem onClick={handleEditClick}>
                    <ListItemIcon>
                      <EditRoundedIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Edit</ListItemText>
                  </MenuItem>

                  <MenuItem
                    onClick={handleDeleteClick}
                    sx={{ color: "#e11d48" }}
                  >
                    <ListItemIcon>
                      <DeleteOutlineRoundedIcon
                        fontSize="small"
                        sx={{ color: "#e11d48" }}
                      />
                    </ListItemIcon>
                    <ListItemText>Delete</ListItemText>
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>

          {isEditing ? (
            <TextField
              fullWidth
              multiline
              minRows={2}
              maxRows={10}
              autoFocus
              value={editContent}
              onChange={(event) => setEditContent(event.target.value)}
              variant="outlined"
              sx={{ mt: 2 }}
            />
          ) : (
            post.content && (
              <Typography
                sx={{
                  mt: 2,

                  whiteSpace: "pre-wrap",

                  wordBreak: "break-word",

                  fontSize: 15.5,

                  lineHeight: 1.65,

                  color: "#172033",
                }}
              >
                {post.content}
              </Typography>
            )
          )}

          {isEditing && editError && (
            <Alert severity="error" sx={{ mt: 1.5, borderRadius: 2.5 }}>
              {editError}
            </Alert>
          )}
        </Box>

        {displayedImageUrl && (
          <Box
            sx={{
              position: "relative",
              width: "100%",
              bgcolor: "#07090d",

              borderTop: "1px solid",
              borderBottom: "1px solid",

              borderColor: "rgba(148,163,184,.12)",

              overflow: "hidden",
            }}
          >
            <Box
              component="img"
              src={displayedImageUrl}
              alt="Post"
              loading="lazy"
              sx={{
                display: "block",

                width: "100%",

                maxHeight: {
                  xs: 500,
                  sm: 650,
                },

                objectFit: "contain",

                mx: "auto",
              }}
            />

            {isEditing && (
              <IconButton
                onClick={handleRemoveEditImage}
                sx={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  bgcolor: "rgba(15,23,42,.72)",
                  color: "white",
                  backdropFilter: "blur(10px)",
                  "&:hover": { bgcolor: "rgba(15,23,42,.88)" },
                }}
              >
                <CloseRoundedIcon />
              </IconButton>
            )}
          </Box>
        )}

        {/* =========================
          VIDEO
      ========================= */}

        {displayedVideoUrl && (
          <Box
            sx={{
              position: "relative",
              width: "100%",

              bgcolor: "#05070a",

              borderTop: "1px solid",
              borderBottom: "1px solid",

              borderColor: "rgba(148,163,184,.12)",

              overflow: "hidden",
            }}
          >
            <Box
              component="video"
              src={displayedVideoUrl}
              controls
              preload="metadata"
              playsInline
              sx={{
                display: "block",

                width: "100%",

                maxHeight: {
                  xs: 500,
                  sm: 650,
                },

                bgcolor: "#000",
              }}
            />

            {isEditing && (
              <IconButton
                onClick={handleRemoveEditVideo}
                sx={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  bgcolor: "rgba(15,23,42,.72)",
                  color: "white",
                  backdropFilter: "blur(10px)",
                  "&:hover": { bgcolor: "rgba(15,23,42,.88)" },
                }}
              >
                <CloseRoundedIcon />
              </IconButton>
            )}
          </Box>
        )}

        {isEditing && (
          <Box sx={{ px: 2.5, pt: 1.5 }}>
            <input
              ref={editImageInputRef}
              hidden
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleEditImageChange}
            />

            <input
              ref={editVideoInputRef}
              hidden
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={handleEditVideoChange}
            />

            <Box sx={{ display: "flex", gap: 0.5, mb: 1.5 }}>
              <Tooltip title="Change photo">
                <IconButton
                  onClick={() => editImageInputRef.current?.click()}
                  disabled={Boolean(displayedVideoUrl)}
                  sx={{ width: 40, height: 40 }}
                >
                  <ImageOutlinedIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Change video">
                <IconButton
                  onClick={() => editVideoInputRef.current?.click()}
                  disabled={Boolean(displayedImageUrl)}
                  sx={{ width: 40, height: 40 }}
                >
                  <VideoLibraryOutlinedIcon />
                </IconButton>
              </Tooltip>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
              <Button
                onClick={exitEditMode}
                disabled={updateMutation.isPending}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: 999,
                }}
              >
                Cancel
              </Button>

              <Button
                variant="contained"
                disableElevation
                onClick={handleSaveEdit}
                disabled={updateMutation.isPending}
                sx={{
                  textTransform: "none",
                  fontWeight: 800,
                  borderRadius: 999,
                  px: 3,
                  background: "linear-gradient(135deg, #2563eb, #6366f1)",
                }}
              >
                {updateMutation.isPending ? (
                  <CircularProgress size={20} sx={{ color: "white" }} />
                ) : (
                  "Save"
                )}
              </Button>
            </Box>
          </Box>
        )}

        <Box
          sx={{
            px: 2.5,
            pt: 1.4,
          }}
        >
          <Box
            sx={{
              minHeight: 30,

              display: "flex",

              alignItems: "center",

              justifyContent: "space-between",
            }}
          >
            <Box
              sx={{
                display: "flex",

                alignItems: "center",

                gap: 0.7,
              }}
            >
              {post.likeCount > 0 && (
                <>
                  <Box
                    sx={{
                      width: 21,
                      height: 21,

                      display: "grid",

                      placeItems: "center",

                      borderRadius: "50%",

                      background: "linear-gradient(135deg, #2563eb, #6366f1)",

                      boxShadow: "0 3px 8px rgba(37,99,235,.25)",
                    }}
                  >
                    <FavoriteRoundedIcon
                      sx={{
                        color: "white",
                        fontSize: 12,
                      }}
                    />
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontSize: 13.5,
                    }}
                  >
                    {post.likeCount}
                  </Typography>
                </>
              )}
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 1.5,
              }}
            >
              {post.commentCount > 0 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontSize: 13.5,

                    cursor: "pointer",

                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  {post.commentCount}{" "}
                  {post.commentCount === 1 ? "comment" : "comments"}
                </Typography>
              )}
            </Box>
          </Box>

          <Divider
            sx={{
              mt: 0.8,
            }}
          />

          <Box
            sx={{
              display: "grid",

              gridTemplateColumns: "repeat(3, 1fr)",

              py: 0.6,

              gap: 0.5,
            }}
          >

            <Box
              onClick={handleLike}
              sx={{
                cursor: likeMutation.isPending ? "default" : "pointer",

                userSelect: "none",

                minHeight: 43,

                display: "flex",

                justifyContent: "center",

                alignItems: "center",

                gap: 0.8,

                borderRadius: 2.5,

                transition: "all .18s ease",

                color: post.isLikedByCurrentUser ? "#e11d48" : "text.secondary",

                "&:hover": {
                  bgcolor: post.isLikedByCurrentUser
                    ? "rgba(225,29,72,.07)"
                    : "rgba(15,23,42,.045)",
                },

                "&:active": {
                  transform: "scale(.97)",
                },
              }}
            >
              {post.isLikedByCurrentUser ? (
                <FavoriteRoundedIcon
                  sx={{
                    fontSize: 21,
                  }}
                />
              ) : (
                <FavoriteBorderRoundedIcon
                  sx={{
                    fontSize: 21,
                  }}
                />
              )}

              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,

                  color: "inherit",
                }}
              >
                Like
              </Typography>
            </Box>

            <Box
              sx={{
                cursor: "pointer",

                userSelect: "none",

                minHeight: 43,

                display: "flex",

                justifyContent: "center",

                alignItems: "center",

                gap: 0.8,

                borderRadius: 2.5,

                color: "text.secondary",

                transition: "all .18s ease",

                "&:hover": {
                  bgcolor: "rgba(15,23,42,.045)",
                },

                "&:active": {
                  transform: "scale(.97)",
                },
              }}
              onClick={() => {
                setShowComments((value) => !value);
              }}
            >
              <ChatBubbleOutlineRoundedIcon
                sx={{
                  fontSize: 21,
                }}
              />

              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                }}
              >
                Comment
              </Typography>
            </Box>

            {/* SHARE */}

            <Box
              sx={{
                cursor: "pointer",

                userSelect: "none",

                minHeight: 43,

                display: "flex",

                justifyContent: "center",

                alignItems: "center",

                gap: 0.8,

                borderRadius: 2.5,

                color: "text.secondary",

                transition: "all .18s ease",

                "&:hover": {
                  bgcolor: "rgba(15,23,42,.045)",
                },

                "&:active": {
                  transform: "scale(.97)",
                },
              }}
            >
              <ShareOutlinedIcon
                sx={{
                  fontSize: 21,
                }}
              />

              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                }}
              >
                Share
              </Typography>
            </Box>
          </Box>
        </Box>

        {showComments && (
          <>
            <Divider />
            <CommentSection postId={post.id} />
          </>
        )}
      </Paper>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleteMutation.isPending && setDeleteDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Delete post?</DialogTitle>

        <DialogContent>
          <DialogContentText>
            This action cannot be undone. Your post will be permanently removed.
          </DialogContentText>

          {deleteMutation.isError && (
            <Alert severity="error" sx={{ mt: 2, borderRadius: 2.5 }}>
              {deleteMutation.error?.response?.data?.message ||
                "Post could not be deleted."}
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleteMutation.isPending}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color="error"
            disableElevation
            onClick={handleConfirmDelete}
            disabled={deleteMutation.isPending}
            sx={{ textTransform: "none", fontWeight: 800, borderRadius: 999 }}
          >
            {deleteMutation.isPending ? (
              <CircularProgress size={20} sx={{ color: "white" }} />
            ) : (
              "Delete"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
