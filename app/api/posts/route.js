import { currentUser } from '@clerk/nextjs/server';
import connectDB from '../../../lib/mongodb';
import Post from '../../../models/Post';

export async function GET(request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  try {
    let posts;
    if (userId) {
      posts = await Post.find({ userId }).sort({ createdAt: -1 });
    } else {
      posts = await Post.find().sort({ createdAt: -1 });
    }
    console.log('Fetched Posts:', posts);
    return new Response(JSON.stringify(posts.map(post => ({ ...post._doc, _id: post._id.toString() }))), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error fetching posts:', err);
    return new Response('Error fetching posts', { status: 500 });
  }
}

export async function POST(request) {
  const user = await currentUser();
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  console.log('User from Clerk:', { id: user.id, firstName: user.firstName, emailAddress: user.emailAddresses[0]?.emailAddress || 'No email' });

  await connectDB();
  const { title, content, userName } = await request.json();
  console.log('Request body:', { title, content, userName });

  if (!title || !content || !userName) {
    return new Response('Title, content, and userName are required', { status: 400 });
  }

  const newPost = new Post({
    title,
    content,
    userId: user.id,
    userName: userName || user.firstName || user.emailAddresses[0]?.emailAddress || 'Anonymous',
  });
  await newPost.save();
  console.log('Saved Post:', newPost);

  return new Response(JSON.stringify({ ...newPost._doc, _id: newPost._id.toString() }), { status: 201 });
}