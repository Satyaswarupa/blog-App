'use client';

import { UserButton, SignedIn, SignedOut, SignInButton, SignUpButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  IconButton,
  Alert,
  TextField,
  Menu,
  MenuItem,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import MoreVertIcon from '@mui/icons-material/MoreVert';

export default function HomeClient({ posts: initialPosts }) {
  const { user } = useUser();
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [error, setError] = useState('');
  const [editingPostId, setEditingPostId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);

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
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            My Posts App
          </Typography>
          <SignedIn>
            <Typography sx={{ mr: 2 }}>Welcome, {user?.firstName || 'User'}!</Typography>
            <Button color="inherit" component={Link} href="/createPost">
              Create Post
            </Button>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button color="inherit">Sign In</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button color="inherit">Sign Up</Button>
            </SignUpButton>
          </SignedOut>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          All Posts
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {posts.length === 0 ? (
          <Typography variant="body1">No posts available. Create one!</Typography>
        ) : (
          <List>
            {posts.map(post => {
              console.log('Post:', post);
              return (
                <Paper key={post._id} sx={{ p: 2, mb: 2, position: 'relative' }}>
                  <SignedIn>
                    {user?.id === post.userId && (
                      <IconButton
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          zIndex: 10,
                          padding: 1.5, // Increase hitbox
                          backgroundColor: 'background.paper', // Ensure visibility
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
                  </SignedIn>
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
              );
            })}
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
      </Container>
    </Box>
  );
}