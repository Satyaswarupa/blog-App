'use client';

import { useUser, SignedIn, SignedOut, RedirectToSignIn, UserButton, SignInButton, SignUpButton } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  AppBar,
  Toolbar,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  Backdrop,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';

export default function CreatePost() {
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [userName, setUserName] = useState(user?.firstName || 'Anonymous');
  const [error, setError] = useState('');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [expandedPosts, setExpandedPosts] = useState({});
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    setUserName(user?.firstName || 'Anonymous');
  }, [user]);

  useEffect(() => {
    if (user) {
      const fetchUserPosts = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/posts?userId=${user.id}`);
          if (response.ok) {
            const data = await response.json();
            setPosts(data);
          } else {
            setError('Failed to fetch posts');
          }
        } catch (err) {
          setError('An error occurred while fetching posts');
        } finally {
          setLoading(false);
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
      setSubmitting(true);
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
        setOpenDialog(false);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to create post');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setSubmitting(false);
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
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
      handleMenuClose();
    }
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
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingPostId(null);
    setEditTitle('');
    setEditContent('');
    setError('');
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setTitle('');
    setContent('');
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setTitle('');
    setContent('');
    setError('');
  };

  const toggleShowMore = (postId) => {
    setExpandedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const renderDescription = (post) => {
    const maxWords = 50;
    const words = post.content.split(' ');
    if (words.length <= maxWords || expandedPosts[post._id]) {
      return post.content;
    }
    return (
      <>
        {words.slice(0, maxWords).join(' ')}...
        <Button
          onClick={() => toggleShowMore(post._id)}
          sx={{
            textTransform: 'none',
            color: '#353535ff',
            fontWeight: 500,
            fontSize: { xs: '0.8rem', sm: '0.9rem' },
            ml: 1,
            p: 0,
            '&:hover': { color: '#4b4b4bff', textDecoration: 'underline' },
            transition: 'color 0.2s ease',
          }}
        >
          Show More
        </Button>
      </>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0f0f0fff', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="sticky" sx={{ bgcolor: '#001124ff', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <Toolbar>
          <Typography
            variant="h5"
            sx={{
              flexGrow: 1,
              fontWeight: 600,
              letterSpacing: 1,
              fontSize: { xs: '1.2rem', sm: '1.5rem' },
            }}
          >
            Scriptora
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SignedIn>
              <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
                <Button
                  color="inherit"
                  component={Link}
                  href="/"
                  disabled={pathname === '/'}
                  sx={{
                    bgcolor: '#ffffff',
                    color: '#353535ff',
                    opacity: pathname === '/' ? 0.5 : 1,
                    pointerEvents: pathname === '/' ? 'none' : 'auto',
                    '&:hover': { bgcolor: '#e0e0e0', transform: pathname === '/' ? 'none' : 'scale(1.05)' },
                    transition: 'all 0.2s ease-in-out',
                    borderRadius: 2,
                    px: { xs: 1.5, sm: 2 },
                    py: { xs: 0.5, sm: 1 },
                    textTransform: 'none',
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  }}
                >
                  <HomeIcon sx={{ mr: 0.5, fontSize: { xs: '1rem', sm: '1.2rem' } }} /> Home
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  href="/createPost"
                  disabled={pathname === '/createPost'}
                  sx={{
                    bgcolor: '#ffffff',
                    color: '#353535ff',
                    opacity: pathname === '/createPost' ? 0.5 : 1,
                    pointerEvents: pathname === '/createPost' ? 'none' : 'auto',
                    '&:hover': { bgcolor: '#e0e0e0', transform: pathname === '/createPost' ? 'none' : 'scale(1.05)' },
                    transition: 'all 0.2s ease-in-out',
                    borderRadius: 2,
                    px: { xs: 1.5, sm: 2 },
                    py: { xs: 0.5, sm: 1 },
                    textTransform: 'none',
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  }}
                >
                  <AddIcon sx={{ mr: 0.5, fontSize: { xs: '1rem', sm: '1.2rem' } }} /> Create Post
                </Button>
              </Box>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button
                  color="inherit"
                  sx={{
                    mr: 1,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                    transition: 'all 0.2s ease-in-out',
                    borderRadius: 2,
                    px: { xs: 1.5, sm: 2 },
                    py: { xs: 0.5, sm: 1 },
                    textTransform: 'none',
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  }}
                >
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button
                  color="inherit"
                  sx={{
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                    transition: 'all 0.2s ease-in-out',
                    borderRadius: 2,
                    px: { xs: 1.5, sm: 2 },
                    py: { xs: 0.5, sm: 1 },
                    textTransform: 'none',
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  }}
                >
                  Sign Up
                </Button>
              </SignUpButton>
            </SignedOut>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
        <SignedIn>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, maxWidth: 800, mx: 'auto' }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, color: '#ffffff', fontSize: { xs: '1.3rem', sm: '1.8rem' } }}
            >
              Your Posts
            </Typography>
            <IconButton
              onClick={handleOpenDialog}
              sx={{
                bgcolor: '#dad7afff',
                color: '#232323ff',
                '&:hover': { bgcolor: '#000000ff', color: '#ffffff', transform: 'scale(1.1)' },
                transition: 'all 0.2s ease',
                padding: 1.5,
              }}
              aria-label="create post"
            >
              <AddIcon sx={{ fontSize: { xs: '1.5rem', sm: '1.8rem' } }} />
            </IconButton>
          </Box>
          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                bgcolor: '#222222ff',
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                p: { xs: 2, sm: 3 },
              },
            }}
          >
            <DialogTitle sx={{ fontWeight: 600, fontSize: { xs: '1.2rem', sm: '1.5rem' }, color: '#d9d8acff' }}>
              Create a Post
            </DialogTitle>
            <DialogContent>
              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  id="title"
                  label="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  fullWidth
                  margin="normal"
                  required
                  sx={{
                    minWidth: { xs: '100%', sm: 500 },
                    '& .MuiInputBase-input': { fontSize: { xs: '1.2rem', sm: '1.5rem' }, fontWeight: 600, color: '#ffffff' },
                    '& .MuiInputLabel-root': { color: '#d9d8acff' },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#ccc' },
                      '&:hover fieldset': { borderColor: '#353535ff' },
                    },
                  }}
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
                  sx={{
                    minWidth: { xs: '100%', sm: 500 },
                    '& .MuiInputBase-input': { fontSize: { xs: '0.9rem', sm: '1rem' }, color: '#ffffff' },
                    '& .MuiInputLabel-root': { color: '#d9d8acff' },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#ccc' },
                      '&:hover fieldset': { borderColor: '#353535ff' },
                    },
                  }}
                />
                {error && (
                  <Alert
                    severity="error"
                    sx={{
                      my: 2,
                      bgcolor: '#ffebee',
                      color: '#c62828',
                      borderRadius: 2,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  >
                    {error}
                  </Alert>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleCloseDialog}
                color="secondary"
                sx={{
                  color: '#c62828',
                  '&:hover': { bgcolor: 'rgba(198,40,40,0.1)', transform: 'scale(1.05)' },
                  transition: 'all 0.2s ease',
                  borderRadius: 2,
                  px: { xs: 2, sm: 3 },
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={submitting}
                sx={{
                  bgcolor: '#353535ff',
                  '&:hover': { bgcolor: '#444444ff', transform: submitting ? 'none' : 'scale(1.05)' },
                  transition: 'all 0.2s ease',
                  borderRadius: 2,
                  px: { xs: 2, sm: 3 },
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                }}
              >
                Create Post
              </Button>
            </DialogActions>
          </Dialog>
          <Backdrop
            sx={{ color: '#353535ff', zIndex: (theme) => theme.zIndex.modal + 1, bgcolor: '#00000080' }}
            open={submitting}
          >
            <CircularProgress color="inherit" />
          </Backdrop>
          <Backdrop
            sx={{ color: '#353535ff', zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: '#00000080' }}
            open={isLoading}
          >
            <CircularProgress color="inherit" />
          </Backdrop>
          {loading ? (
            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
              {[1, 2, 3].map((_, index) => (
                <Skeleton
                  key={index}
                  variant="rectangular"
                  height={150}
                  sx={{
                    mb: 3,
                    borderRadius: 3,
                    bgcolor: '#1c1c1cff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    p: { xs: 2, sm: 3 },
                  }}
                />
              ))}
            </Box>
          ) : posts.length === 0 ? (
            <Typography
              variant="body1"
              sx={{ textAlign: 'center', color: '#aaaaaa', fontSize: { xs: '1rem', sm: '1.2rem' }, mt: 2 }}
            >
              You haven't created any posts yet.
            </Typography>
          ) : (
            <List sx={{ maxWidth: 800, mx: 'auto' }}>
              {posts.map(post => (
                <Paper
                  key={post._id}
                  sx={{
                    p: { xs: 2, sm: 3 },
                    mb: 3,
                    position: 'relative',
                    borderRadius: 3,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    bgcolor: '#242424ff',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  {user?.id === post.userId && (
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        zIndex: 10,
                        padding: 1.5,
                        bgcolor: 'rgba(39, 39, 39, 0.9)',
                        '&:hover': { bgcolor: 'rgba(200,200,200,0.9)' },
                        transition: 'background-color 0.2s ease',
                      }}
                      aria-label="more"
                      onClick={(event) => handleMenuOpen(event, post._id)}
                    >
                      <MoreVertIcon sx={{ color: '#b3b3b3ff' }} />
                    </IconButton>
                  )}
                  <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                    <ListItemText
                      primary={
                        editingPostId === post._id ? (
                          <TextField
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            fullWidth
                            label="Title"
                            margin="normal"
                            sx={{
                              minWidth: { xs: '100%', sm: 500 },
                              '& .MuiInputBase-input': { fontSize: { xs: '1.2rem', sm: '1.5rem' }, fontWeight: 600, color: '#ffffff' },
                              '& .MuiInputLabel-root': { color: '#ffffffff' },
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: '#ccc' },
                                '&:hover fieldset': { borderColor: '#353535ff' },
                              },
                            }}
                          />
                        ) : (
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 600, color: '#f1efbeff', mb: 1, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}
                          >
                            {post.title}
                          </Typography>
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
                                sx={{
                                  minWidth: { xs: '100%', sm: 500 },
                                  '& .MuiInputBase-input': { fontSize: { xs: '0.9rem', sm: '1rem' }, color: '#ffffff' },
                                  '& .MuiInputLabel-root': { color: '#ffffffff' },
                                  '& .MuiOutlinedInput-root': {
                                    '& fieldset': { borderColor: '#ccc' },
                                    '&:hover fieldset': { borderColor: '#353535ff' },
                                  },
                                }}
                              />
                              <Box sx={{ mt: 2, display: 'flex', gap: 1.5 }}>
                                <Button
                                  variant="contained"
                                  color="primary"
                                  startIcon={<SaveIcon />}
                                  onClick={() => handleSave(post._id)}
                                  disabled={isLoading}
                                  sx={{
                                    bgcolor: '#353535ff',
                                    '&:hover': { bgcolor: '#1565c0', transform: isLoading ? 'none' : 'scale(1.05)' },
                                    transition: 'all 0.2s ease',
                                    borderRadius: 2,
                                    px: { xs: 2, sm: 3 },
                                    py: 1,
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                                  }}
                                >
                                  Save
                                </Button>
                                <Button
                                  variant="outlined"
                                  color="secondary"
                                  startIcon={<CancelIcon />}
                                  onClick={handleCancel}
                                  sx={{
                                    borderColor: '#c62828',
                                    color: '#c62828',
                                    '&:hover': {
                                      borderColor: '#b71c1c',
                                      bgcolor: 'rgba(198,40,40,0.1)',
                                      transform: 'scale(1.05)',
                                    },
                                    transition: 'all 0.2s ease',
                                    borderRadius: 2,
                                    px: { xs: 2, sm: 3 },
                                    py: 1,
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                                  }}
                                >
                                  Cancel
                                </Button>
                              </Box>
                            </>
                          ) : (
                            <>
                              <Typography
                                variant="body1"
                                sx={{ color: '#e4ddb6ff', lineHeight: 1.6, mb: 1, fontSize: { xs: '0.9rem', sm: '1rem' } }}
                              >
                                {renderDescription(post)}
                              </Typography>
                              {expandedPosts[post._id] && (
                                <Button
                                  onClick={() => toggleShowMore(post._id)}
                                  sx={{
                                    textTransform: 'none',
                                    color: '#353535ff',
                                    fontWeight: 500,
                                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                                    p: 0,
                                    '&:hover': { color: '#1565c0', textDecoration: 'underline' },
                                    transition: 'color 0.2s ease',
                                  }}
                                >
                                  Show Less
                                </Button>
                              )}
                              <Typography
                                variant="caption"
                                sx={{ color: '#777', fontStyle: 'italic', fontSize: { xs: '0.7rem', sm: '0.8rem' } }}
                              >
                                Posted by{' '}
                                <Typography
                                  component="span"
                                  sx={{ fontWeight: 'bold', color: '#777' }}
                                >
                                  {post.userName || 'Unknown User'}
                                </Typography>{' '}
                                on {new Date(post.createdAt).toLocaleString()}
                              </Typography>
                            </>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                  <Divider sx={{ mt: 2, bgcolor: '#e0e0e0' }} />
                </Paper>
              ))}
            </List>
          )}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{
              sx: {
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                borderRadius: 2,
              },
            }}
          >
            <MenuItem
              onClick={() => handleEdit(posts.find(post => post._id === selectedPostId))}
              sx={{
                color: '#3e3e3eff',
                '&:hover': { bgcolor: '#f6f6f6ff' },
                transition: 'background-color 0.2s ease',
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
              }}
            >
              <EditIcon sx={{ mr: 1, color: '#1a1a1aff', fontSize: { xs: '1rem', sm: '1.2rem' } }} /> Edit
            </MenuItem>
            <MenuItem
              onClick={() => handleDelete(selectedPostId)}
              disabled={isLoading}
              sx={{
                color: '#c62828',
                '&:hover': { bgcolor: isLoading ? 'none' : '#ffebee' },
                transition: 'background-color 0.2s ease',
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
              }}
            >
              <DeleteIcon sx={{ mr: 1, color: '#b82a2aff', fontSize: { xs: '1rem', sm: '1.2rem' } }} /> Delete
            </MenuItem>
          </Menu>
        </SignedIn>
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </Container>

      <Box
        sx={{
          bgcolor: '#001124ff',
          p: 2,
          position: 'sticky',
          bottom: 0,
          zIndex: 1000,
          boxShadow: '0 -2px 6px rgba(0,0,0,0.1)',
          display: { xs: 'flex', sm: 'none' },
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <Button
          color="inherit"
          component={Link}
          href="/"
          disabled={pathname === '/'}
          sx={{
            bgcolor: '#ffffff',
            color: '#353535ff',
            opacity: pathname === '/' ? 0.5 : 1,
            pointerEvents: pathname === '/' ? 'none' : 'auto',
            '&:hover': { bgcolor: pathname === '/' ? 'none' : '#e0e0e0', transform: pathname === '/' ? 'none' : 'scale(1.05)' },
            transition: 'all 0.2s ease-in-out',
            borderRadius: 2,
            px: { xs: 1.5, sm: 2 },
            py: { xs: 0.5, sm: 1 },
            textTransform: 'none',
            fontSize: { xs: '0.8rem', sm: '0.9rem' },
          }}
        >
          <HomeIcon sx={{ mr: 0.5, fontSize: { xs: '1rem', sm: '1.2rem' } }} /> Home
        </Button>
        <Button
          color="inherit"
          component={Link}
          href="/createPost"
          disabled={pathname === '/createPost'}
          sx={{
            bgcolor: '#ffffff',
            color: '#353535ff',
            opacity: pathname === '/createPost' ? 0.5 : 1,
            pointerEvents: pathname === '/createPost' ? 'none' : 'auto',
            '&:hover': { bgcolor: pathname === '/createPost' ? 'none' : '#e0e0e0', transform: pathname === '/createPost' ? 'none' : 'scale(1.05)' },
            transition: 'all 0.2s ease-in-out',
            borderRadius: 2,
            px: { xs: 1.5, sm: 2 },
            py: { xs: 0.5, sm: 1 },
            textTransform: 'none',
            fontSize: { xs: '0.8rem', sm: '0.9rem' },
          }}
        >
          <AddIcon sx={{ mr: 0.5, fontSize: { xs: '1rem', sm: '1.2rem' } }} /> Create Post
        </Button>
      </Box>
    </Box>
  );
}