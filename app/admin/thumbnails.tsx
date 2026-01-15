import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAppMode } from '@/contexts/AppModeContext';
import { deleteThumbnail, getAllThumbnails, ThumbnailData, uploadThumbnail } from '@/services/thumbnail-service';
import { extractYouTubeVideoId, isYouTubeUrl } from '@/utils/youtube';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AdminThumbnailsScreen() {
  const router = useRouter();
  const { isAdminFamily, currentFamilyCode } = useAppMode();

  const [thumbnails, setThumbnails] = useState<ThumbnailData[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageBlob, setSelectedImageBlob] = useState<Blob | null>(null);

  // Redirect if not admin
  useEffect(() => {
    if (!isAdminFamily) {
      console.log('🚫 Non-admin attempted to access thumbnails page');
      router.replace('/(tabs)/profile');
    }
  }, [isAdminFamily, router]);

  // Load thumbnails on mount
  useEffect(() => {
    loadThumbnails();
  }, []);

  const loadThumbnails = async () => {
    setLoading(true);
    try {
      const data = await getAllThumbnails();
      setThumbnails(data);
    } catch (error) {
      console.error('❌ Failed to load thumbnails:', error);
      Alert.alert('Error', 'Failed to load thumbnails');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    // Request permissions
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library to upload thumbnails.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9], // YouTube thumbnail aspect ratio
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setSelectedImage(asset.uri);

      // Convert to blob for upload
      try {
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        setSelectedImageBlob(blob);
      } catch (error) {
        console.error('Failed to process image:', error);
        Alert.alert('Error', 'Failed to process selected image');
      }
    }
  };

  const handleUpload = async () => {
    if (!youtubeUrl.trim()) {
      Alert.alert('Error', 'Please enter a YouTube URL');
      return;
    }

    if (!isYouTubeUrl(youtubeUrl)) {
      Alert.alert('Error', 'Please enter a valid YouTube URL');
      return;
    }

    if (!selectedImageBlob) {
      Alert.alert('Error', 'Please select an image');
      return;
    }

    if (!currentFamilyCode) {
      Alert.alert('Error', 'No family code found');
      return;
    }

    setUploading(true);
    try {
      await uploadThumbnail(youtubeUrl, selectedImageBlob, currentFamilyCode);

      // Reset form
      setYoutubeUrl('');
      setSelectedImage(null);
      setSelectedImageBlob(null);

      // Reload list
      await loadThumbnails();

      Alert.alert('Success', 'Custom thumbnail uploaded successfully!');
    } catch (error) {
      console.error('❌ Failed to upload thumbnail:', error);
      Alert.alert('Error', 'Failed to upload thumbnail. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (videoId: string) => {
    Alert.alert(
      'Delete Thumbnail',
      'Are you sure you want to delete this custom thumbnail? The video will revert to the default YouTube thumbnail.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteThumbnail(videoId);
              await loadThumbnails();
              Alert.alert('Success', 'Thumbnail deleted');
            } catch (error) {
              console.error('❌ Failed to delete thumbnail:', error);
              Alert.alert('Error', 'Failed to delete thumbnail');
            }
          },
        },
      ]
    );
  };

  if (!isAdminFamily) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Redirecting...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <ThemedText style={styles.title}>Manage Thumbnails</ThemedText>
          <ThemedText style={styles.subtitle}>
            Upload custom thumbnail images for YouTube videos
          </ThemedText>
        </View>

        {/* Upload Form */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Add Custom Thumbnail</Text>

          <Text style={styles.label}>YouTube URL</Text>
          <TextInput
            style={styles.input}
            value={youtubeUrl}
            onChangeText={setYoutubeUrl}
            placeholder="https://www.youtube.com/watch?v=..."
            autoCapitalize="none"
            autoCorrect={false}
          />
          {youtubeUrl && isYouTubeUrl(youtubeUrl) && (
            <Text style={styles.videoIdHint}>
              Video ID: {extractYouTubeVideoId(youtubeUrl)}
            </Text>
          )}

          <Text style={styles.label}>Thumbnail Image</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            ) : (
              <View style={styles.imagePickerPlaceholder}>
                <Text style={styles.imagePickerText}>📷 Tap to select image</Text>
                <Text style={styles.imagePickerHint}>16:9 aspect ratio recommended</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
            onPress={handleUpload}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.uploadButtonText}>Upload Thumbnail</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Existing Thumbnails */}
        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>
            Custom Thumbnails ({thumbnails.length})
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
          ) : thumbnails.length === 0 ? (
            <Text style={styles.emptyText}>No custom thumbnails yet</Text>
          ) : (
            thumbnails.map((thumbnail) => (
              <View key={thumbnail.videoId} style={styles.thumbnailCard}>
                <Image
                  source={{ uri: thumbnail.customUrl }}
                  style={styles.thumbnailImage}
                />
                <View style={styles.thumbnailInfo}>
                  <Text style={styles.thumbnailVideoId}>
                    ID: {thumbnail.videoId}
                  </Text>
                  <Text style={styles.thumbnailUrl} numberOfLines={1}>
                    {thumbnail.originalYouTubeUrl}
                  </Text>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(thumbnail.videoId)}
                  >
                    <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 30,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  formSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  videoIdHint: {
    fontSize: 12,
    color: '#27AE60',
    marginTop: 4,
  },
  imagePicker: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  imagePickerPlaceholder: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  imagePickerText: {
    fontSize: 16,
    color: '#666',
  },
  imagePickerHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  previewImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  uploadButton: {
    backgroundColor: '#27AE60',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  uploadButtonDisabled: {
    backgroundColor: '#95a5a6',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loader: {
    marginVertical: 40,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginVertical: 40,
  },
  thumbnailCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnailImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  thumbnailInfo: {
    padding: 12,
  },
  thumbnailVideoId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  thumbnailUrl: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  deleteButton: {
    backgroundColor: '#E74C3C',
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
