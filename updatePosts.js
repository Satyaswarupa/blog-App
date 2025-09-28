import mongoose from 'mongoose';
import connectDB from './lib/mongodb';
import Post from './models/Post';

async function updatePosts() {
  await connectDB();
  const posts = await Post.find();
  for (const post of posts) {
    if (!post.userName || post.userName === 'Unknown User') {
      post.userName = 'Anonymous';
      await post.save();
    }
  }
  console.log('Posts updated');
  mongoose.connection.close();
}

updatePosts();