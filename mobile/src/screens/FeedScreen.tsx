import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { Heart, MessageCircle, Share2, Play, PlusCircle, Video, Send, GraduationCap, Building2, Briefcase, Sparkles, ImagePlus } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { theme, shadow } from '../theme';
import { Post } from '../types';
import * as ImagePicker from 'expo-image-picker';
import { uploadUserImage } from '../lib/dataService';
import UserAvatar from '../components/UserAvatar';

export default function FeedScreen() {
  const { currentUser, posts, handleAddPost, handleLikePost, handleAddComment, isFirstVisit, markWelcomeSeen } = useApp();
  const [activeFilter, setActiveFilter] = useState<'all' | 'students'>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState<'text' | 'showcase' | 'video' | 'career_journey'>('text');
  const [videoUrl, setVideoUrl] = useState('');
  const [projectImageUrl, setProjectImageUrl] = useState('');
  const [projectLink, setProjectLink] = useState('');
  const [isUploadingProject, setIsUploadingProject] = useState(false);
  const [activeVideo, setActiveVideo] = useState<Post | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (currentUser && isFirstVisit) markWelcomeSeen();
  }, [currentUser, isFirstVisit, markWelcomeSeen]);

  if (!currentUser) return <View style={styles.center}><Text>Not authenticated</Text></View>;

  const filtered = posts.filter((p) => (activeFilter === 'students' ? p.authorRole === 'student' : true));

  const createPost = () => {
    if (!postContent.trim()) return;
    const newPost: Post = {
      id: `post-${Date.now()}`, authorId: currentUser.id, authorName: currentUser.name, authorRole: currentUser.role, authorAvatar: currentUser.avatar,
      authorHeadline: currentUser.headline || `${currentUser.role} @Richfield`, campus: currentUser.campus || 'Richfield College',
      timestamp: 'Just now', content: projectLink.trim() && postType === 'showcase' ? `${postContent}\n\nProject link: ${projectLink.trim()}` : postContent, type: postType,
      videoUrl: postType === 'video' ? (videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4') : undefined,
      videoThumbnail: postType === 'video' ? 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=450&fit=crop' : undefined,
      videoDuration: postType === 'video' ? '0:45' : undefined, mediaUrl: postType === 'showcase' ? projectImageUrl || undefined : undefined, tags: ['Enrich', postType === 'video' ? 'VideoPitch' : 'CampusUpdate'], likes: 1, hasLiked: true, targetAudience: 'all', comments: []
    };
    handleAddPost(newPost);
    setPostContent(''); setVideoUrl(''); setProjectImageUrl(''); setProjectLink(''); setIsCreating(false);
  };

  const pickProjectImage = async () => {
    if (isUploadingProject) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo access to attach a project screenshot.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'] as any, quality: 0.85 });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    setIsUploadingProject(true);
    try {
      const url = await uploadUserImage(currentUser.id, result.assets[0].uri, 'project');
      setProjectImageUrl(url);
    } catch (error: any) {
      Alert.alert('Upload failed', error?.message || 'Could not upload the project image.');
    } finally {
      setIsUploadingProject(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'student': return <GraduationCap color={theme.colors.darkCyan} size={12} />;
      case 'alumni': return <Briefcase color={theme.colors.rosyBrown} size={12} />;
      case 'business': return <Building2 color={theme.colors.delftBlue} size={12} />;
      default: return <Sparkles color={theme.colors.darkCyan} size={12} />;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <View>
            <Text style={styles.bannerEyebrow}>Personalized Feed</Text>
            <Text style={styles.bannerTitle}>{isFirstVisit ? 'Welcome' : 'Welcome back'}, {currentUser.name}!</Text>
            <Text style={styles.bannerSub}>{currentUser.role === 'student' ? 'Peer projects & graduate openings' : currentUser.role === 'alumni' ? 'Alumni networks & mentorship' : 'Verified talent spotlights'}</Text>
          </View>
          <TouchableOpacity style={styles.bannerBtn} onPress={() => setIsCreating(true)}><PlusCircle color="#fff" size={14} /><Text style={styles.bannerBtnText}>New Post</Text></TouchableOpacity>
        </View>

        <View style={styles.filterRow}>
          {[
            { id: 'all', label: 'All Updates' },
            { id: 'students', label: 'Student Showcases' },
          ].map((f) => (
            <TouchableOpacity key={f.id} onPress={() => setActiveFilter(f.id as any)} style={[styles.filterPill, activeFilter === f.id && styles.filterActive]}>
              <Text style={[styles.filterText, activeFilter === f.id && styles.filterActiveText]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {isCreating ? (
          <View style={styles.composer}>
            <View style={styles.composerHeader}><Text style={styles.composerTitle}>Share with the Richfield Community</Text><TouchableOpacity onPress={() => setIsCreating(false)}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity></View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[
                  { type: 'text', label: 'Update' },
                  { type: 'showcase', label: 'Project Showcase' },
                  { type: 'video', label: 'Video Pitch (45s)' },
                  { type: 'career_journey', label: 'Career Story' },
                ].map((t) => (
                  <TouchableOpacity key={t.type} onPress={() => setPostType(t.type as any)} style={[styles.typePill, postType === t.type && styles.typeActive]}>
                    <Text style={[styles.typeText, postType === t.type && styles.typeActiveText]}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <TextInput value={postContent} onChangeText={setPostContent} placeholder={postType === 'video' ? 'Introduce your video pitch...' : 'What are you working on at Richfield?'} style={styles.textArea} placeholderTextColor={theme.colors.slate400} multiline />
            {postType === 'showcase' && (
              <View style={styles.videoInputBox}>
                <Text style={styles.label}>Project Evidence</Text>
                <TouchableOpacity onPress={() => void pickProjectImage()} style={styles.attachBtn}><ImagePlus color={theme.colors.darkCyan} size={14} /><Text style={styles.attachBtnText}>{isUploadingProject ? 'Uploading image...' : projectImageUrl ? 'Image attached ✓' : 'Attach Project Image / Screenshot'}</Text></TouchableOpacity>
                {projectImageUrl ? <Image source={{ uri: projectImageUrl }} style={styles.projectPreview} /> : null}
                <TextInput value={projectLink} onChangeText={setProjectLink} placeholder="Optional GitHub, Drive or live project URL" style={styles.input} placeholderTextColor={theme.colors.slate400} autoCapitalize="none" />
                <Text style={styles.hint}>Attach a real screenshot and/or link so recruiters can see evidence of the project.</Text>
              </View>
            )}
            {postType === 'video' && (
              <View style={styles.videoInputBox}>
                <Text style={styles.label}>Video URL</Text>
                <TextInput value={videoUrl} onChangeText={setVideoUrl} placeholder="https://..." style={styles.input} placeholderTextColor={theme.colors.slate400} autoCapitalize="none" />
                <Text style={styles.hint}>💡 Pitch videos under 60s receive 3x more views.</Text>
              </View>
            )}
            <View style={styles.composerActions}>
              <TouchableOpacity style={styles.btnGhost} onPress={() => setIsCreating(false)}><Text style={styles.btnGhostText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.btnPrimary} onPress={createPost}><Text style={styles.btnPrimaryText}>Publish Update</Text></TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.fakeComposer} onPress={() => setIsCreating(true)}>
            <UserAvatar uri={currentUser.avatar} name={currentUser.name} size={32} />
            <Text style={styles.fakeText}>Share a project update, pitch video, or achievement...</Text>
            <View style={styles.videoIcon}><Video color={theme.colors.darkCyan} size={16} /></View>
          </TouchableOpacity>
        )}

        {filtered.map((post) => {
          const isOpen = expanded[post.id];
          return (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <UserAvatar uri={post.authorAvatar} name={post.authorName} size={40} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}><Text style={styles.authorName}>{post.authorName}</Text><View style={styles.roleDot}>{getRoleIcon(post.authorRole)}</View>{post.isShowcase && <View style={styles.samplePill}><Text style={styles.samplePillText}>Presentation sample</Text></View>}</View>
                  <Text style={styles.headline} numberOfLines={1}>{post.authorHeadline}</Text>
                  <Text style={styles.meta}>{post.campus} • {post.timestamp}</Text>
                </View>
                {post.type === 'video' && <View style={styles.videoBadge}><Video color={theme.colors.darkCyan} size={10} /><Text style={styles.videoBadgeText}>Video Pitch</Text></View>}
              </View>
              <Text style={styles.postContent}>{post.content}</Text>
              {post.tags?.length ? <View style={styles.tagsRow}>{post.tags.map((t) => <Text key={t} style={styles.tag}>#{t}</Text>)}</View> : null}
              {post.mediaUrl ? <Image source={{ uri: post.mediaUrl }} style={styles.projectMedia} resizeMode="cover" /> : null}
              {post.type === 'video' && post.videoThumbnail && (
                <TouchableOpacity style={styles.videoCard} onPress={() => setActiveVideo(post)}>
                  <Image source={{ uri: post.videoThumbnail }} style={styles.videoThumb} />
                  <View style={styles.playOverlay}><View style={styles.playBtn}><Play color="#fff" size={18} style={{ marginLeft: 2 }} /></View></View>
                  <View style={styles.duration}><Text style={styles.durationText}>{post.videoDuration || '0:45'}</Text></View>
                </TouchableOpacity>
              )}
              <View style={styles.actions}>
                <TouchableOpacity disabled={post.isShowcase} style={[styles.actionBtn, post.isShowcase && { opacity: 0.55 }]} onPress={() => !post.isShowcase && handleLikePost(post.id)}><Heart color={post.hasLiked ? '#BE123C' : theme.colors.slate500} size={16} fill={post.hasLiked ? '#BE123C' : 'none'} /><Text style={[styles.actionText, post.hasLiked && { color: '#BE123C' }]}>{post.likes}</Text></TouchableOpacity>
                <TouchableOpacity disabled={post.isShowcase} style={[styles.actionBtn, post.isShowcase && { opacity: 0.55 }]} onPress={() => !post.isShowcase && setExpanded((p) => ({ ...p, [post.id]: !p[post.id] }))}><MessageCircle color={theme.colors.slate500} size={16} /><Text style={styles.actionText}>{post.comments.length}</Text></TouchableOpacity>
                <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}><Share2 color={theme.colors.slate400} size={12} /><Text style={styles.shareText}>Richfield Network</Text></View>
              </View>
              {isOpen && (
                <View style={styles.commentsBox}>
                  {post.comments.map((c) => (
                    <View key={c.id} style={styles.comment}>
                      <UserAvatar uri={c.authorAvatar} name={c.authorName} size={28} />
                      <View style={{ flex: 1 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={styles.commentAuthor}>{c.authorName}</Text><Text style={styles.commentTime}>{c.timestamp}</Text></View><Text style={styles.commentContent}>{c.content}</Text></View>
                    </View>
                  ))}
                  <View style={styles.commentInputRow}>
                    <Image source={{ uri: currentUser.avatar }} style={styles.commentAvatar} />
                    <TextInput value={commentInputs[post.id] || ''} onChangeText={(t) => setCommentInputs((p) => ({ ...p, [post.id]: t }))} placeholder="Write a supportive comment..." style={styles.commentInput} placeholderTextColor={theme.colors.slate400} onSubmitEditing={() => {
                      const text = commentInputs[post.id];
                      if (!text?.trim()) return;
                      handleAddComment(post.id, text);
                      setCommentInputs((p) => ({ ...p, [post.id]: '' }));
                    }} />
                    <TouchableOpacity style={styles.sendBtn} onPress={() => {
                      const text = commentInputs[post.id];
                      if (!text?.trim()) return;
                      handleAddComment(post.id, text);
                      setCommentInputs((p) => ({ ...p, [post.id]: '' }));
                    }}><Send color="#fff" size={14} /></TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <Modal visible={!!activeVideo} transparent animationType="fade" onRequestClose={() => setActiveVideo(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}><Image source={{ uri: activeVideo?.authorAvatar }} style={styles.avatarSmall} /><View><Text style={styles.modalTitle}>{activeVideo?.authorName}</Text><Text style={styles.modalSub}>Richfield Student Pitch Showcase</Text></View></View>
              <TouchableOpacity onPress={() => setActiveVideo(null)} style={styles.closeBtn}><Text style={styles.closeText}>Close</Text></TouchableOpacity>
            </View>
            <View style={styles.modalVideoMock}>
              <Text style={styles.modalVideoText}>Video: {activeVideo?.videoUrl}</Text>
              <Text style={styles.modalVideoHint}>Video playback requires expo-av. Link: {activeVideo?.videoUrl}</Text>
              <TouchableOpacity style={styles.linkBtn} onPress={() => activeVideo?.videoUrl && Alert.alert('Video URL', activeVideo.videoUrl)}><Text style={styles.linkBtnText}>View URL</Text></TouchableOpacity>
            </View>
            <Text style={styles.modalDesc}>{activeVideo?.content}</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.slate50 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 12, gap: 12, paddingBottom: 24 },
  banner: { backgroundColor: theme.colors.navy, borderRadius: 16, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  bannerEyebrow: { color: theme.colors.rosyBrown, fontSize: 9, fontWeight: '800', textTransform: 'uppercase', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start' },
  bannerTitle: { color: '#fff', fontWeight: '800', fontSize: 13, marginTop: 4 },
  bannerSub: { color: '#CBD5E1', fontSize: 10 },
  bannerBtn: { backgroundColor: theme.colors.darkCyan, flexDirection: 'row', gap: 6, alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  bannerBtnText: { color: '#fff', fontWeight: '800', fontSize: 11 },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterPill: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: theme.colors.slate200 },
  filterActive: { backgroundColor: theme.colors.navy, borderColor: theme.colors.navy },
  filterText: { fontSize: 11, fontWeight: '700', color: theme.colors.slate600 },
  filterActiveText: { color: '#fff' },
  composer: { backgroundColor: '#fff', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: theme.colors.slate200, gap: 10 },
  composerHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: theme.colors.slate100, paddingBottom: 8 },
  composerTitle: { fontWeight: '800', fontSize: 11, color: theme.colors.navy },
  cancel: { color: theme.colors.slate400, fontSize: 11 },
  typePill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: theme.colors.slate100 },
  typeActive: { backgroundColor: theme.colors.darkCyan },
  typeText: { fontSize: 10, fontWeight: '700', color: theme.colors.slate600 },
  typeActiveText: { color: '#fff' },
  textArea: { backgroundColor: '#fff', borderWidth: 1, borderColor: theme.colors.slate200, borderRadius: 12, padding: 10, fontSize: 12, minHeight: 80, textAlignVertical: 'top', color: theme.colors.navy },
  videoInputBox: { backgroundColor: theme.colors.slate50, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.slate200, gap: 6 },
  label: { fontWeight: '700', fontSize: 11, color: theme.colors.slate700 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: theme.colors.slate200, borderRadius: 8, paddingHorizontal: 10, height: 36, fontSize: 11, color: theme.colors.navy },
  hint: { fontSize: 10, color: theme.colors.slate500 },
  attachBtn: { flexDirection: 'row', gap: 7, alignItems: 'center', backgroundColor: '#ECFEFF', borderWidth: 1, borderColor: '#A5F3FC', paddingHorizontal: 10, paddingVertical: 9, borderRadius: 10 },
  attachBtnText: { fontSize: 10, fontWeight: '800', color: theme.colors.navy },
  projectPreview: { width: '100%', height: 150, borderRadius: 10, backgroundColor: theme.colors.slate100 },
  composerActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  btnGhost: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.slate200 },
  btnGhostText: { fontWeight: '700', fontSize: 11, color: theme.colors.slate600 },
  btnPrimary: { backgroundColor: theme.colors.navy, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  btnPrimaryText: { color: '#fff', fontWeight: '800', fontSize: 11 },
  fakeComposer: { flexDirection: 'row', gap: 10, backgroundColor: '#fff', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.slate200, alignItems: 'center' },
  avatarSmall: { width: 32, height: 32, borderRadius: 16 },
  fakeText: { flex: 1, backgroundColor: theme.colors.slate50, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, fontSize: 11, color: theme.colors.slate500, borderWidth: 1, borderColor: theme.colors.slate200 },
  videoIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center' },
  postCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: theme.colors.slate200, overflow: 'hidden', gap: 0 },
  postHeader: { flexDirection: 'row', gap: 10, padding: 12, alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  authorName: { fontWeight: '800', fontSize: 12, color: theme.colors.navy },
  roleDot: { width: 18, height: 18, borderRadius: 9, backgroundColor: theme.colors.slate100, alignItems: 'center', justifyContent: 'center' },
  samplePill: { backgroundColor: '#FFF7ED', borderWidth: 1, borderColor: '#FED7AA', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  samplePillText: { color: '#9A3412', fontSize: 8, fontWeight: '800' },
  headline: { fontSize: 10, color: theme.colors.slate500 },
  meta: { fontSize: 9, color: theme.colors.slate400, marginTop: 2 },
  videoBadge: { flexDirection: 'row', gap: 4, backgroundColor: '#FDF2F8', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 999, alignItems: 'center', borderWidth: 1, borderColor: '#FBCFE8' },
  videoBadgeText: { fontSize: 9, fontWeight: '800', color: theme.colors.navy },
  postContent: { fontSize: 12, color: theme.colors.slate700, lineHeight: 18, paddingHorizontal: 12 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: 12, marginTop: 8 },
  projectMedia: { width: 'auto', height: 200, marginHorizontal: 12, marginTop: 10, borderRadius: 12, backgroundColor: theme.colors.slate100 },
  tag: { color: theme.colors.darkCyan, fontSize: 10, fontWeight: '700' },
  videoCard: { margin: 12, height: 180, borderRadius: 12, overflow: 'hidden', backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
  videoThumb: { ...StyleSheet.absoluteFill, width: undefined, height: undefined } as any,
  playOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' } as any,
  playBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.darkCyan, alignItems: 'center', justifyContent: 'center' },
  duration: { position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  durationText: { color: '#fff', fontSize: 9, fontFamily: 'monospace' },
  actions: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: theme.colors.slate100, alignItems: 'center' },
  actionBtn: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  actionText: { fontSize: 11, color: theme.colors.slate500, fontWeight: '700' },
  shareText: { fontSize: 10, color: theme.colors.slate400 },
  commentsBox: { backgroundColor: theme.colors.slate50, padding: 12, borderTopWidth: 1, borderTopColor: theme.colors.slate100, gap: 10 },
  comment: { flexDirection: 'row', gap: 10, backgroundColor: '#fff', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.slate200 },
  commentAvatar: { width: 28, height: 28, borderRadius: 14 },
  commentAuthor: { fontWeight: '800', fontSize: 11, color: theme.colors.navy },
  commentTime: { fontSize: 9, color: theme.colors.slate400 },
  commentContent: { fontSize: 11, color: theme.colors.slate700, marginTop: 4, lineHeight: 16 },
  commentInputRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  commentInput: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: theme.colors.slate200, borderRadius: 12, paddingHorizontal: 12, height: 36, fontSize: 11, color: theme.colors.navy },
  sendBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: theme.colors.navy, alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', padding: 16, justifyContent: 'center' },
  modalCard: { backgroundColor: '#0F172A', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#1E293B' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, backgroundColor: '#1E293B', borderBottomWidth: 1, borderBottomColor: '#334155', alignItems: 'center' },
  modalTitle: { color: '#fff', fontWeight: '800', fontSize: 12 },
  modalSub: { color: '#94A3B8', fontSize: 10 },
  closeBtn: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  closeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  modalVideoMock: { height: 200, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12 },
  modalVideoText: { color: '#fff', fontSize: 11, textAlign: 'center' },
  modalVideoHint: { color: '#94A3B8', fontSize: 9, textAlign: 'center' },
  linkBtn: { backgroundColor: theme.colors.darkCyan, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  linkBtnText: { color: '#fff', fontWeight: '700', fontSize: 11 },
  modalDesc: { color: '#CBD5E1', fontSize: 11, lineHeight: 16, padding: 12 },
});
