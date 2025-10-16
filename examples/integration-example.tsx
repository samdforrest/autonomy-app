/**
 * INTEGRATION EXAMPLES
 * 
 * This file shows how to integrate YouTubePlayer into your existing components
 * Copy these patterns into your actual app components where you want YouTube videos
 */

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { YouTubePlayer } from '@/components/YouTubePlayer';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

// ========================================
// EXAMPLE 1: Replace ExternalLink with YouTubePlayer
// ========================================

// BEFORE (using ExternalLink):
/*
import { ExternalLink } from '@/components/ExternalLink';

<ExternalLink href="https://www.youtube.com/shorts/RO4ZzfoVyWQ">
  <ThemedText>Watch Video</ThemedText>
</ExternalLink>
*/

// AFTER (using YouTubePlayer):
export function VideoSectionExample() {
  return (
    <ThemedView style={styles.section}>
      <ThemedText style={styles.sectionTitle}>🎥 Watch This Video</ThemedText>
      <YouTubePlayer
        url="https://www.youtube.com/shorts/RO4ZzfoVyWQ"
        height={200}
        style={styles.videoPlayer}
      />
    </ThemedView>
  );
}

// ========================================
// EXAMPLE 2: Multiple Videos in a Module
// ========================================

export function MistakesModuleWithVideos() {
  const videos = [
    {
      title: "Understanding Mistakes - Part 1",
      url: "https://www.youtube.com/shorts/RO4ZzfoVyWQ?feature=share",
      description: "Learn the basics of how mistakes help us grow"
    },
    {
      title: "Parent-Child Collaboration",
      url: "https://youtube.com/shorts/ZmpeyPHTdwU?si=7WR3U5DUaJt2x8ZQ",
      description: "Working together through challenges"
    }
  ];

  return (
    <ScrollView style={styles.container}>
      <ThemedText type="title" style={styles.moduleTitle}>
        Mistakes Module - Day 1
      </ThemedText>
      
      {videos.map((video, index) => (
        <ThemedView key={index} style={styles.videoSection}>
          <ThemedText style={styles.videoTitle}>{video.title}</ThemedText>
          <ThemedText style={styles.videoDescription}>{video.description}</ThemedText>
          
          <YouTubePlayer
            url={video.url}
            height={200}
            style={styles.videoPlayer}
          />
        </ThemedView>
      ))}
    </ScrollView>
  );
}

// ========================================
// EXAMPLE 3: Conditional Video Loading
// ========================================

export function ConditionalVideoExample({ showVideo }: { showVideo: boolean }) {
  const videoUrl = "https://www.youtube.com/shorts/RO4ZzfoVyWQ";

  return (
    <ThemedView style={styles.section}>
      <ThemedText style={styles.sectionTitle}>📚 Learning Content</ThemedText>
      
      {/* Regular content */}
      <ThemedText style={styles.contentText}>
        Here's some text content about the lesson...
      </ThemedText>
      
      {/* Conditionally show video */}
      {showVideo && (
        <ThemedView style={styles.videoContainer}>
          <ThemedText style={styles.videoLabel}>Related Video:</ThemedText>
          <YouTubePlayer
            url={videoUrl}
            height={180}
            showThumbnail={true} // Show thumbnail first
            style={styles.videoPlayer}
          />
        </ThemedView>
      )}
    </ThemedView>
  );
}

// ========================================
// EXAMPLE 4: Integration with Google Docs Content
// ========================================

export function GoogleDocsWithVideoExample() {
  // This shows how to integrate with your existing Google Docs content system
  const renderContentWithVideos = (content: any) => {
    return (
      <ThemedView style={styles.section}>
        {/* Regular Google Docs content */}
        {content?.sections && Object.entries(content.sections).map(([key, section]: [string, any]) => (
          <ThemedView key={key} style={styles.contentSection}>
            <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
            
            {/* Render bullet points */}
            {section.items?.map((item: string, index: number) => (
              <ThemedText key={index} style={styles.bulletPoint}>
                • {item}
              </ThemedText>
            ))}
            
            {/* Add video if this section should have one */}
            {key === 'examples' && (
              <YouTubePlayer
                url="https://www.youtube.com/shorts/RO4ZzfoVyWQ"
                height={200}
                style={styles.videoPlayer}
              />
            )}
          </ThemedView>
        ))}
      </ThemedView>
    );
  };

  return renderContentWithVideos;
}

// ========================================
// EXAMPLE 5: Video Gallery/List
// ========================================

export function VideoGalleryExample() {
  const videoPlaylist = [
    "https://www.youtube.com/shorts/RO4ZzfoVyWQ?feature=share",
    "https://youtube.com/shorts/ZmpeyPHTdwU?si=7WR3U5DUaJt2x8ZQ",
    // Add more videos as needed
  ];

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.galleryTitle}>Video Gallery</ThemedText>
      
      {videoPlaylist.map((url, index) => (
        <ThemedView key={index} style={styles.galleryItem}>
          <ThemedText style={styles.galleryItemTitle}>Video {index + 1}</ThemedText>
          <YouTubePlayer
            url={url}
            height={160}
            showThumbnail={true}
            style={styles.galleryVideo}
          />
        </ThemedView>
      ))}
    </ThemedView>
  );
}

// ========================================
// STYLES
// ========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  moduleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  videoSection: {
    marginBottom: 25,
    padding: 16,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 0, 0, 0.05)',
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  videoDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
  },
  videoPlayer: {
    marginTop: 10,
  },
  contentText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  videoContainer: {
    marginTop: 16,
  },
  videoLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  contentSection: {
    marginBottom: 20,
  },
  bulletPoint: {
    fontSize: 14,
    marginBottom: 4,
    marginLeft: 10,
  },
  galleryTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  galleryItem: {
    marginBottom: 20,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  galleryItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  galleryVideo: {
    // Custom styling for gallery videos
  },
});

// ========================================
// QUICK INTEGRATION CHECKLIST
// ========================================

/*
TO INTEGRATE INTO YOUR EXISTING COMPONENTS:

1. Import the YouTubePlayer:
   import { YouTubePlayer } from '@/components/YouTubePlayer';

2. Replace ExternalLink components that point to YouTube:
   BEFORE: <ExternalLink href="youtube-url">Text</ExternalLink>
   AFTER:  <YouTubePlayer url="youtube-url" height={200} />

3. Add to your content sections:
   <YouTubePlayer 
     url="https://youtube.com/shorts/VIDEO_ID"
     height={200}
     style={yourStyles.video}
   />

4. For better UX, use thumbnails:
   <YouTubePlayer 
     url="youtube-url"
     height={200}
     showThumbnail={true}
   />

SUPPORTED URL FORMATS:
✅ https://www.youtube.com/watch?v=VIDEO_ID
✅ https://www.youtube.com/shorts/VIDEO_ID
✅ https://youtu.be/VIDEO_ID
✅ https://youtube.com/shorts/VIDEO_ID
✅ All with query parameters (?feature=share, ?si=xxx, etc.)

WORKS ON:
✅ iOS (WKWebView)
✅ Android (WebView)
✅ Web Browser (iframe)
*/
