'use client';

import { UserButton, SignedIn, SignedOut, SignInButton, SignUpButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
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

export default function HomeClient({ posts: initialPosts }) {
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [posts, setPosts] = useState(initialPosts);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [expandedPosts, setExpandedPosts] = useState({});
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Handle splash screen timeout
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000); // 1.5 seconds

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Simulate client-side loading for consistency with createPost
    const fetchPosts = async () => {
      try {
        setLoading(true);
        // If server-side posts are passed, no need to fetch again unless revalidating
        setTimeout(() => {
          setLoading(false);
        }, 500); // Simulate network delay
      } catch (err) {
        setError('An error occurred while loading posts');
        setLoading(false);
      }
    };
    if (!showSplash) {
      fetchPosts();
    }
  }, [showSplash]);

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
            color: '#1976d2',
            fontWeight: 500,
            fontSize: { xs: '0.8rem', sm: '0.9rem' },
            ml: 1,
            p: 0,
            '&:hover': { color: '#1565c0', textDecoration: 'underline' },
            transition: 'color 0.2s ease',
          }}
        >
          Show More
        </Button>
      </>
    );
  };

  if (showSplash) {
    return (
      <Box
        sx={{
          height: '100vh',
          width: '100vw',
          bgcolor: '#0f0f0fff',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 2000,
          animation: 'fadeOut 0.5s ease-out forwards 1s', // Fade out after 1s
          '@keyframes fadeOut': {
            '0%': { opacity: 1 },
            '100%': { opacity: 0 },
          },
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: '#ffffff',
            fontWeight: 700,
            textAlign: 'center',
            fontSize: { xs: '1.5rem', sm: '2rem' },
            animation: 'fadeInScale 0.5s ease-in forwards',
            '@keyframes fadeInScale': {
              '0%': { opacity: 0, transform: 'scale(0.8)' },
              '100%': { opacity: 1, transform: 'scale(1)' },
            },
          }}
        >
          Share your beautiful thoughts here
        </Typography>
      </Box>
    );
  }

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
                    color: '#1976d2',
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
                    color: '#1976d2',
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
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontWeight: 700, color: '#ffffff', textAlign: 'center', mb: 4, fontSize: { xs: '1.5rem', sm: '2rem' } }}
        >
          All Posts
        </Typography>
        <Backdrop
          sx={{ color: '#1976d2', zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: '#00000080' }}
          open={isLoading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              bgcolor: '#ffebee',
              color: '#c62828',
              borderRadius: 2,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}
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
                  bgcolor: '#2a2a2aff',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  p: { xs: 2, sm: 3 },
                }}
              />
            ))}
          </Box>
        ) : posts.length === 0 ? (
          <Typography
            variant="body1"
            sx={{ textAlign: 'center', color: '#aaaaaa', fontSize: { xs: '1rem', sm: '1.2rem' } }}
          >
            No posts available. Create one!
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
                <SignedIn>
                  {user?.id === post.userId && (
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        zIndex: 10,
                        padding: 1.5,
                        bgcolor: 'rgba(255,255,255,0.9)',
                        '&:hover': { bgcolor: 'rgba(200,200,200,0.9)' },
                        transition: 'background-color 0.2s ease',
                      }}
                      aria-label="more"
                      onClick={(event) => handleMenuOpen(event, post._id)}
                    >
                      <MoreVertIcon sx={{ color: '#555' }} />
                    </IconButton>
                  )}
                </SignedIn>
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
                              '&:hover fieldset': { borderColor: '#1976d2' },
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
                                  '&:hover fieldset': { borderColor: '#1976d2' },
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
                                  bgcolor: '#1976d2',
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
                              sx={{ color: '#f3f2c9ff', lineHeight: 1.6, mb: 1, fontSize: { xs: '0.9rem', sm: '1rem' } }}
                            >
                              {renderDescription(post)}
                            </Typography>
                            {expandedPosts[post._id] && (
                              <Button
                                onClick={() => toggleShowMore(post._id)}
                                sx={{
                                  textTransform: 'none',
                                  color: '#1976d2',
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
              color: '#333',
              '&:hover': { bgcolor: '#e3f2fd' },
              transition: 'background-color 0.2s ease',
              fontSize: { xs: '0.8rem', sm: '0.9rem' },
            }}
          >
            <EditIcon sx={{ mr: 1, color: '#1976d2', fontSize: { xs: '1rem', sm: '1.2rem' } }} /> Edit
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
            <DeleteIcon sx={{ mr: 1, color: '#c62828', fontSize: { xs: '1rem', sm: '1.2rem' } }} /> Delete
          </MenuItem>
        </Menu>
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
            color: '#1976d2',
            opacity: pathname === '/' ? 0.5 : 1,
            pointerEvents: pathname === '/' ? 'none' : 'auto',
            '&:hover': { bgcolor: pathname === '/' ? '#ffffff' : '#e0e0e0', transform: pathname === '/' ? 'none' : 'scale(1.05)' },
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
            color: '#1976d2',
            opacity: pathname === '/createPost' ? 0.5 : 1,
            pointerEvents: pathname === '/createPost' ? 'none' : 'auto',
            '&:hover': { bgcolor: pathname === '/createPost' ? '#ffffff' : '#e0e0e0', transform: pathname === '/createPost' ? 'none' : 'scale(1.05)' },
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