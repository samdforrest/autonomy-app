/**
 * Thumbnail Service
 * Manages custom YouTube video thumbnails for admin users
 */

import { collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { extractYouTubeVideoId } from '@/utils/youtube';
import { db, storage } from './firebase-config';

export interface ThumbnailData {
  videoId: string;
  customUrl: string;
  originalYouTubeUrl: string;
  uploadedBy: string;
  uploadedAt: any;
}

// In-memory cache for thumbnail lookups
const thumbnailCache: Map<string, string | null> = new Map();

/**
 * Upload a custom thumbnail for a YouTube video
 */
export async function uploadThumbnail(
  youtubeUrl: string,
  imageBlob: Blob,
  familyCode: string
): Promise<string> {
  const videoId = extractYouTubeVideoId(youtubeUrl);
  if (!videoId) throw new Error('Invalid YouTube URL');

  console.log('📸 Uploading custom thumbnail for video:', videoId);

  // Upload to Storage
  const storageRef = ref(storage, `thumbnails/${videoId}`);
  await uploadBytes(storageRef, imageBlob);
  const downloadUrl = await getDownloadURL(storageRef);

  // Save to Firestore
  await setDoc(doc(db, 'videoThumbnails', videoId), {
    videoId,
    customUrl: downloadUrl,
    originalYouTubeUrl: youtubeUrl,
    uploadedBy: familyCode,
    uploadedAt: serverTimestamp(),
  });

  // Update cache
  thumbnailCache.set(videoId, downloadUrl);

  console.log('✅ Custom thumbnail uploaded successfully');
  return downloadUrl;
}

/**
 * Get the custom thumbnail URL for a YouTube video (if exists)
 */
export async function getThumbnailUrl(youtubeUrl: string): Promise<string | null> {
  const videoId = extractYouTubeVideoId(youtubeUrl);
  if (!videoId) return null;

  // Check cache first
  if (thumbnailCache.has(videoId)) {
    return thumbnailCache.get(videoId) || null;
  }

  try {
    // Check Firestore
    const docSnap = await getDoc(doc(db, 'videoThumbnails', videoId));
    const url = docSnap.exists() ? docSnap.data().customUrl : null;

    // Cache result (including null for videos without custom thumbnails)
    thumbnailCache.set(videoId, url);
    return url;
  } catch (error) {
    console.log('Failed to fetch custom thumbnail:', error);
    return null;
  }
}

/**
 * Delete a custom thumbnail
 */
export async function deleteThumbnail(videoId: string): Promise<void> {
  console.log('🗑️ Deleting custom thumbnail for video:', videoId);

  try {
    // Delete from Storage
    const storageRef = ref(storage, `thumbnails/${videoId}`);
    await deleteObject(storageRef);
  } catch (error) {
    // Storage file might not exist, continue with Firestore deletion
    console.log('Storage deletion failed (may not exist):', error);
  }

  // Delete from Firestore
  await deleteDoc(doc(db, 'videoThumbnails', videoId));

  // Clear from cache
  thumbnailCache.delete(videoId);

  console.log('✅ Custom thumbnail deleted');
}

/**
 * Get all custom thumbnails (for admin page)
 */
export async function getAllThumbnails(): Promise<ThumbnailData[]> {
  console.log('📋 Fetching all custom thumbnails');

  const querySnapshot = await getDocs(collection(db, 'videoThumbnails'));
  const thumbnails: ThumbnailData[] = [];

  querySnapshot.forEach((doc) => {
    thumbnails.push(doc.data() as ThumbnailData);
  });

  console.log(`✅ Found ${thumbnails.length} custom thumbnails`);
  return thumbnails;
}

/**
 * Clear the thumbnail cache (useful after bulk operations)
 */
export function clearThumbnailCache(): void {
  thumbnailCache.clear();
  console.log('🧹 Thumbnail cache cleared');
}
