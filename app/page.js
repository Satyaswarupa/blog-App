import connectDB from '../lib/mongodb';
import Post from '../models/Post';
import HomeClient from '../components/HomeClient';

async function getPosts() {
  await connectDB();
  const posts = await Post.find().sort({ createdAt: -1 });
  console.log('Fetched Posts:', posts);
  return posts.map(post => ({ ...post._doc, _id: post._id.toString() }));
}

export default async function Home() {
  const posts = await getPosts();
  return <HomeClient posts={posts} />;
}