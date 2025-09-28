import connectDB from '../lib/mongodb';
import Post from '../models/Post';
import HomeClient from '../components/HomeClient';

export const dynamic = 'force-dynamic'; // Disable caching, fetch fresh data

async function getPosts() {
  await connectDB();
  const posts = await Post.find().sort({ createdAt: -1 });
  return posts.map(post => ({
    ...post._doc,
    _id: post._id.toString(),
    createdAt: post.createdAt.toISOString(), // Ensure serializable
  }));
}

export default async function Home() {
  const posts = await getPosts();
  return <HomeClient posts={posts} />;
}