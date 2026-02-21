import { useState, useEffect } from 'react';
import api from '../services/api';
import { MessageSquare, Heart, Share2, Plus, User, CheckCircle, Image as ImageIcon, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Community = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNewPost, setShowNewPost] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', content: '' });
    const [selectedPost, setSelectedPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await api.get('/community/posts');
            setPosts(response.data);
        } catch (err) {
            console.error('Failed to fetch posts');
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async () => {
        if (!newPost.title || !newPost.content) return;
        try {
            await api.post('/community/posts', newPost);
            setNewPost({ title: '', content: '' });
            setShowNewPost(false);
            fetchPosts();
        } catch (err) {
            console.error('Failed to create post');
        }
    };

    const viewComments = async (post) => {
        setSelectedPost(post);
        try {
            const response = await api.get(`/community/posts/${post.id}/comments`);
            setComments(response.data);
        } catch (err) {
            console.error('Failed to fetch comments');
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--secondary)' }}>Community Hub 👥</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Discuss with fellow farmers and 500+ experts.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowNewPost(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={20} /> New Post
                </button>
            </div>

            <AnimatePresence>
                {showNewPost && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card" style={{ marginBottom: '2rem', padding: '1.5rem', border: '2px solid var(--primary)' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Share your question or experience</h3>
                        <input className="input" placeholder="Title (e.g., Problem with banana leaves)" style={{ marginBottom: '1rem' }} value={newPost.title} onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} />
                        <textarea className="input" placeholder="Describe your situation in detail..." style={{ height: '120px', marginBottom: '1rem' }} value={newPost.content} onChange={(e) => setNewPost({ ...newPost, content: e.target.value })} />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button className="btn" onClick={() => setShowNewPost(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleCreatePost}>Post to Community</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {loading ? <p>Loading feed...</p> : posts.map(post => (
                    <motion.div key={post.id} className="card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <User size={20} color="var(--text-muted)" />
                            </div>
                            <div>
                                <h4 style={{ fontSize: '15px' }}>{post.username}</h4>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(post.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{post.title}</h3>
                        <p style={{ lineHeight: 1.6, color: 'var(--text)', marginBottom: '1.5rem' }}>{post.content}</p>

                        <div style={{ display: 'flex', gap: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                            <button className="btn" style={{ background: 'none', padding: 0, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => viewComments(post)}>
                                <MessageSquare size={18} /> {post.comment_count} Comments
                            </button>
                            <button className="btn" style={{ background: 'none', padding: 0, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Heart size={18} /> Like
                            </button>
                            <button className="btn" style={{ background: 'none', padding: 0, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Share2 size={18} /> Share
                            </button>
                        </div>

                        {selectedPost?.id === post.id && (
                            <div style={{ marginTop: '1.5rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
                                <div style={{ marginBottom: '1rem' }}>
                                    {comments.map(comment => (
                                        <div key={comment.id} style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                <span style={{ fontWeight: 600, fontSize: '13px' }}>{comment.username}</span>
                                                {comment.is_expert && (
                                                    <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '1px 6px', borderRadius: '4px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                                        <CheckCircle size={10} /> Expert
                                                    </span>
                                                )}
                                            </div>
                                            <p style={{ fontSize: '14px', color: 'var(--text)' }}>{comment.content}</p>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input className="input" placeholder="Add a comment..." style={{ flex: 1 }} value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                                    <button className="btn btn-primary" style={{ padding: '8px 12px' }} onClick={async () => {
                                        if (!newComment) return;
                                        const formData = new FormData();
                                        formData.append('content', newComment);
                                        await api.post(`/community/posts/${post.id}/comments`, formData);
                                        setNewComment('');
                                        viewComments(post);
                                    }}><Send size={18} /></button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Community;
