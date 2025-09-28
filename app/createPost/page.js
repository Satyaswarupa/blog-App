'use client';

import { useUser, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import MoreVertIcon from '@mui/icons-material/MoreVert';

export default function CreatePost() {
  const { user } = useUser();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [userName, setUserName] = useState(user?.firstName || 'Anonymous');
  const [error, setError] = useState('');
  const [posts, setPosts] = useState([]);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);

  useEffect(() => {
    setUserName(user?.firstName || 'Anonymous');
  }, [user]);

  useEffect(() => {
    if (user) {
      const fetchUserPosts = async () => {
        try {
          const response = await fetch(`/api/posts?userId=${user.id}`);
          if (response.ok) {
            const data = await response.json();
            setPosts(data);
          } else {
            setError('Failed to fetch posts');
          }
        } catch (err) {
          setError('An error occurred while fetching posts');
        }
      };
      fetchUserPosts();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      setError('Title and description are required');
      return;
    }

    console.log('Submitting post:', { title, content, userName });

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, userName }),
      });

      if (response.ok) {
        const newPost = await response.json();
        setPosts([newPost, ...posts]);
        setTitle('');
        setContent('');
        setError('');
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to create post');
      }
    } catch (err) {
      setError('An error occurred');
    }
  };

  const handleMenuOpen = (event, postId) => {
    console.log('Menu opened for post:', postId);
    setAnchorEl(event.currentTarget);
    setSelectedPostId(postId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPostId(null);
  };

  const handleDelete = async (postId) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        setPosts(posts.filter(post => post._id !== postId));
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete post');
      }
    } catch (err) {
      setError('An error occurred while deleting the post');
    }
    handleMenuClose();
  };

  const handleEdit = (post) => {
    setEditingPostId(post._id);
    setEditTitle(post.title);
    setEditContent(post.content);
    handleMenuClose();
  };

  const handleSave = async (postId) => {
    if (!editTitle || !editContent) {
      setError('Title and description are required');
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle, content: editContent }),
      });

      if (response.ok) {
        const updatedPost = await response.json();
        setPosts(posts.map(post => (post._id === postId ? updatedPost : post)));
        setEditingPostId(null);
        setEditTitle('');
        setEditContent('');
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to update post');
      }
    } catch (err) {
      setError('An error occurred while updating the post');
    }
  };

  const handleCancel = () => {
    setEditingPostId(null);
    setEditTitle('');
    setEditContent('');
    setError('');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create a Post
        </Typography>
        <SignedIn>
          <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto', mt: 2 }}>
            <TextField
              id="userName"
              label="Posted by"
              value={userName}
              fullWidth
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              id="title"
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              id="content"
              label="Description"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              fullWidth
              margin="normal"
              multiline
              rows={5}
              required
            />
            {error && (
              <Alert severity="error" sx={{ my: 2 }}>
                {error}
              </Alert>
            )}
            <Button type="submit" variant="contained" color="primary">
              Create Post
            </Button>
          </Box>

          <Typography variant="h5" sx={{ mt: 6, mb: 2 }}>
            Your Posts
          </Typography>
          {posts.length === 0 ? (
            <Typography variant="body1">You haven't created any posts yet.</Typography>
          ) : (
            <List>
              {posts.map(post => (
                <Paper key={post._id} sx={{ p: 2, mb: 2, position: 'relative' }}>
                  {user?.id === post.userId && (
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        zIndex: 10,
                        padding: 1.5,
                        backgroundColor: 'background.paper',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                      aria-label="more"
                      onClick={(event) => handleMenuOpen(event, post._id)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  )}
                  <ListItem>
                    <ListItemText
                      primary={
                        editingPostId === post._id ? (
                          <TextField
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            fullWidth
                            label="Title"
                            margin="normal"
                          />
                        ) : (
                          post.title
                        )
                      }
                      secondary={
                        <>
                          {editingPostId === post._id ? (
                            <>
                              <TextField
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                fullWidth
                                label="Description"
                                multiline
                                rows={5}
                                margin="normal"
                              />
                              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                <Button
                                  variant="contained"
                                  color="primary"
                                  startIcon={<SaveIcon />}
                                  onClick={() => handleSave(post._id)}
                                >
                                  Save
                                </Button>
                                <Button
                                  variant="outlined"
                                  color="secondary"
                                  startIcon={<CancelIcon />}
                                  onClick={handleCancel}
                                >
                                  Cancel
                                </Button>
                              </Box>
                            </>
                          ) : (
                            <>
                              <Typography variant="body2">{post.content}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                Posted by {post.userName || 'Unknown User'} on{' '}
                                {new Date(post.createdAt).toLocaleString()}
                              </Typography>
                            </>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                  <Divider />
                </Paper>
              ))}
            </List>
          )}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={() => handleEdit(posts.find(post => post._id === selectedPostId))}>
              <EditIcon sx={{ mr: 1 }} /> Edit
            </MenuItem>
            <MenuItem onClick={() => handleDelete(selectedPostId)}>
              <DeleteIcon sx={{ mr: 1 }} /> Delete
            </MenuItem>
          </Menu>
        </SignedIn>
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </Container>
    </Box>
  );
}