import { currentUser } from '@clerk/nextjs/server';
import connectDB from '../../../../lib/mongodb';
import Post from '../../../../models/Post';

export async function DELETE(request, { params }) {
  const user = await currentUser();
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  await connectDB();
  const post = await Post.findById(params.id);
  if (!post || post.userId !== user.id) {
    return new Response('Forbidden', { status: 403 });
  }

  await Post.findByIdAndDelete(params.id);
  return new Response('Deleted', { status: 200 });
}

export async function PUT(request, { params }) {
  const user = await currentUser();
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  console.log('User:', { id: user.id, firstName: user.firstName, emailAddress: user.emailAddress });

  await connectDB();
  const { title, content } = await request.json();
  if (!title || !content) {
    return new Response('Title and content are required', { status: 400 });
  }

  const post = await Post.findById(params.id);
  if (!post || post.userId !== user.id) {
    return new Response('Forbidden', { status: 403 });
  }

  post.title = title;
  post.content = content;
  post.userName = user.firstName || user.emailAddress || 'Anonymous';
  await post.save();
  console.log('Updated Post:', post);

  return new Response(JSON.stringify(post), { status: 200 });
}