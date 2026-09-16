import { supabase } from './supabase';

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const extension = file.name.split('.').pop() || 'jpg';
  const path = `${userId}/avatar-${Date.now()}.${extension}`;
  const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadCv(userId: string, file: File): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${userId}/${Date.now()}-${safeName}`;
  const { error } = await supabase.storage.from('cvs').upload(path, file, { upsert: false });
  if (error) throw error;
  return path;
}

export async function getCvDownloadUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from('cvs').createSignedUrl(path, 60 * 10);
  if (error) throw error;
  return data.signedUrl;
}

export async function uploadPostMedia(userId: string, file: File): Promise<string> {
  const extension = file.name.split('.').pop() || 'bin';
  const path = `${userId}/${Date.now()}.${extension}`;
  const { error } = await supabase.storage.from('post-media').upload(path, file, { upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from('post-media').getPublicUrl(path);
  return data.publicUrl;
}
