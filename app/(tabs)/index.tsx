import { Image } from 'expo-image';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import { ImageViewer } from '@/components/ImageViewer';
import { TableViewer } from '@/components/TableViewer';
import { TextWithYouTube } from '@/components/TextWithYouTube';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { YouTubePlayer } from '@/components/YouTubePlayer';
import { useAppMode } from '@/contexts/AppModeContext';
import { useColorInheritance } from '@/hooks/useColorInheritance';
import { useGoogleDocsContent } from '@/hooks/useGoogleDocsContent';
import { DOCUMENT_REFS } from '@/services/api';

export default function HomeScreen() {
  const { userMode } = useAppMode();
  
  // Determine which tab to fetch based on current mode
  const tabName = userMode === 'parent' ? 'Parent Intro' : 'Student Intro';
  
  // Fetch Google Docs content for the appropriate tab
  const { content, loading, error, refetch } = useGoogleDocsContent(
    DOCUMENT_REFS.MAIN_DOCUMENT,
    'raw',
    { tab: tabName }
  );

  // Color inheritance hook for styled content blocks
  const { getBubbleStyle } = useColorInheritance(content?.contentBlocks, {
    orange: styles.bubbleOrange,
    blue: styles.bubbleBlue,
    green: styles.bubbleGreen,
    purple: styles.bubblePurple,
    yellow: styles.bubbleYellow,
    teal: styles.bubbleTeal,
  });

  // Check if header should be bold
  const shouldBoldHeader = (header: string) => {
    if (!header) return false;
    
    const lowerHeader = header.toLowerCase();
    return lowerHeader.includes('welcome') || 
           lowerHeader.includes('introduction') || 
           lowerHeader.includes('getting started') ||
           lowerHeader.includes('overview') ||
           lowerHeader.includes('important:');
  };

  // Debug: Log content structure when content changes
  React.useEffect(() => {
    if (content?.contentBlocks) {
      console.log('🏠 Home Content Blocks:', content.contentBlocks.map((block: any) => ({
        header: block.header,
        contentItems: block.content?.map((item: any) => ({
          type: item.type,
          text: item.text?.substring(0, 50) + '...',
          url: item.url,
          uri: item.uri
        }))
      })));
    }
  }, [content]);

  // Helper function to check if a string is a YouTube URL
  const isYouTubeUrl = (url: string) => {
    return url && (url.includes('youtube.com') || url.includes('youtu.be'));
  };

  const renderContentBlock = (block: any, index: number) => {
    // Check if this block's header is a YouTube URL
    const isVideoBlock = isYouTubeUrl(block.header);
    
    return (
      <ThemedView key={block.id || index} style={[styles.bubble, getBubbleStyle(block.header, index, block.id)]}>
        {/* Header/Label - or Video Player if header is YouTube URL */}
        {block.header && !isVideoBlock && (
          <ThemedText style={[
            styles.bubbleHeader, 
            shouldBoldHeader(block.header) && styles.bubbleHeaderBold
          ]}>
            {block.header}
          </ThemedText>
        )}
        
        {/* YouTube Video Player if header is a YouTube URL */}
        {isVideoBlock && (
          <YouTubePlayer
            url={block.header}
            height={200}
            showThumbnail={true}
            style={styles.bubbleVideo}
          />
        )}
        
        {/* YouTube Video Player if this block has a combined video */}
        {block.videoUrl && (
          <YouTubePlayer
            url={block.videoUrl}
            height={200}
            showThumbnail={true}
            style={styles.bubbleVideo}
          />
        )}
        
        {/* Content */}
        <ThemedView style={styles.bubbleContent}>
          {block.content && block.content.map((item: any, idx: number) => {
            if (item.type === 'subheader') {
              return (
                <ThemedText 
                  key={idx} 
                  style={[
                    styles.bubbleSubheader,
                    shouldBoldHeader(item.text) && styles.bubbleHeaderBold
                  ]}
                >
                  {item.text}
                </ThemedText>
              );
            } else if (item.type === 'bullet') {
              return (
                <TextWithYouTube 
                  key={idx} 
                  text={`• ${item.text}`}
                  textStyle={styles.bulletPoint}
                  videoHeight={180}
                />
              );
            } else if (item.type === 'text') {
              return (
                <TextWithYouTube 
                  key={idx} 
                  text={item.text}
                  textStyle={styles.bubbleText}
                  videoHeight={200}
                />
              );
            } else if (item.type === 'video' || item.type === 'youtube') {
              // Handle video content items specifically
              const videoUrl = item.url || item.uri || item.text;
              console.log('🎥 Rendering video:', videoUrl);
              return (
                <YouTubePlayer
                  key={idx}
                  url={videoUrl}
                  height={200}
                  showThumbnail={true}
                  style={styles.bubbleVideo}
                />
              );
            } else if (item.type === 'link' && (item.url?.includes('youtube.com') || item.url?.includes('youtu.be'))) {
              // Handle YouTube links that might be categorized as generic links
              console.log('🔗 Rendering YouTube link as video:', item.url);
              return (
                <YouTubePlayer
                  key={idx}
                  url={item.url}
                  height={200}
                  showThumbnail={true}
                  style={styles.bubbleVideo}
                />
              );
            } else if (item.type === 'image') {
              return (
                <ImageViewer
                  key={idx}
                  uri={item.uri}
                  alt={item.alt}
                  style={styles.bubbleImage}
                  maxHeight={250}
                  allowFullScreen={true}
                />
              );
            } else if (item.type === 'table') {
              console.log('📊 Rendering TableViewer in home tab with:', { 
                id: item.id, 
                rows: item.rows?.length, 
                columns: item.columns 
              });
              return (
                <TableViewer 
                  key={idx} 
                  tableData={item}
                  style={styles.bubbleTable}
                />
              );
            } else if (item.type === 'chart') {
              console.log('📈 Rendering chart placeholder in home tab with:', { 
                id: item.id, 
                title: item.title, 
                chartType: item.chartType 
              });
              return (
                <ThemedView key={idx} style={styles.chartPlaceholder}>
                  <ThemedText style={styles.chartTitle}>
                    📈 {item.title || 'Chart'}
                  </ThemedText>
                  <ThemedText style={styles.chartSubtitle}>
                    Type: {item.chartType || 'Unknown'}
                  </ThemedText>
                </ThemedView>
              );
            } else {
              // Debug: Log unhandled content types
              console.log('🤷 Unhandled content type:', item.type, item);
            }
            return null;
          })}
        </ThemedView>
      </ThemedView>
    );
  };

  const renderSection = (sectionKey: string, section: any, defaultIcon: string) => (
    <ThemedView key={sectionKey} style={styles.section}>
      <ThemedText style={styles.sectionTitle}>
        {defaultIcon} {section.title}
      </ThemedText>
      
      {/* Render bullet points */}
      {section.items && section.items.length > 0 && (
        <ThemedView style={styles.bulletContainer}>
          {section.items.map((item: string, index: number) => (
            <TextWithYouTube 
              key={index} 
              text={`• ${item}`}
              textStyle={styles.bulletPoint}
              videoHeight={180}
            />
          ))}
        </ThemedView>
      )}
      
      {/* Render additional content */}
      {section.content && (
        <TextWithYouTube 
          text={section.content}
          textStyle={styles.contentText}
          videoHeight={200}
        />
      )}
    </ThemedView>
  );

  const getSectionIcon = (sectionKey: string): string => {
    const iconMap: Record<string, string> = {
      welcome: userMode === 'parent' ? '👨‍👩‍👧‍👦' : '🎓',
      introduction: '📖',
      getting_started: '🚀',
      overview: '📋',
      important: '⚠️',
    };
    return iconMap[sectionKey] || (userMode === 'parent' ? '👨‍👩‍👧‍👦' : '🎓');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedView style={styles.logoContainer}>
          <Image 
            source={require('@/assets/images/autonomy-brain.png')} 
            style={styles.brainLogo}
            contentFit="contain"
          />
        </ThemedView>
        <ThemedText type="title" style={styles.title}>
          {userMode === 'parent' ? 'Parent Guide' : 'Welcome Student!'}
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          {userMode === 'parent' 
            ? 'Supporting your child\'s learning journey' 
            : 'Begin your autonomy learning adventure'
          }
        </ThemedText>
      </ThemedView>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Loading state */}
        {loading && (
          <ThemedView style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <ThemedText style={styles.loadingText}>
              Loading {userMode === 'parent' ? 'parent' : 'student'} content...
            </ThemedText>
          </ThemedView>
        )}

        {/* Error state */}
        {error && (
          <ThemedView style={styles.errorContainer}>
            <ThemedText style={styles.errorTitle}>⚠️ Content Unavailable</ThemedText>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
            <TouchableOpacity style={styles.retryButton} onPress={refetch}>
              <ThemedText style={styles.retryButtonText}>Try Again</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}

        {/* Content state */}
        {!loading && !error && (
          <>
            {/* Refresh button */}
            <TouchableOpacity style={styles.refreshButton} onPress={refetch}>
              <ThemedText style={styles.refreshButtonText}>🔄 Refresh Content</ThemedText>
            </TouchableOpacity>

            {content?.contentBlocks && content.contentBlocks.length > 0 ? (
              // Group content blocks - combine text blocks with following video blocks
              (() => {
                const groupedBlocks = [];
                let i = 0;
                
                while (i < content.contentBlocks.length) {
                  const currentBlock = content.contentBlocks[i];
                  const nextBlock = content.contentBlocks[i + 1];
                  
                  // If current block is text and next block is a video, group them
                  if (currentBlock && nextBlock && 
                      !isYouTubeUrl(currentBlock.header) && 
                      isYouTubeUrl(nextBlock.header)) {
                    
                    // Create a combined block
                    const combinedBlock = {
                      ...currentBlock,
                      id: `combined-${i}`,
                      videoUrl: nextBlock.header // Add the video URL to the text block
                    };
                    
                    groupedBlocks.push(combinedBlock);
                    i += 2; // Skip both blocks since we combined them
                  } else {
                    // Regular block or standalone video
                    groupedBlocks.push(currentBlock);
                    i += 1;
                  }
                }
                
                return groupedBlocks.map((block, index) => renderContentBlock(block, index));
              })()
            ) : content?.sections ? (
              // Fallback: Render sections from Google Docs (legacy format)
              Object.entries(content.sections).map(([sectionKey, section]) =>
                renderSection(sectionKey, section, getSectionIcon(sectionKey))
              )
            ) : (
              // Fallback content if no Google Docs content is available
              <ThemedView style={styles.section}>
                <ThemedText style={styles.sectionTitle}>
                  {userMode === 'parent' ? '👨‍👩‍👧‍👦 Parent Guide' : '🎓 Student Welcome'}
                </ThemedText>
                <ThemedText style={styles.contentText}>
                  {userMode === 'parent' 
                    ? 'Welcome to the parent dashboard! Content is loading from Google Docs...'
                    : 'Welcome to your learning journey! Content is loading from Google Docs...'
                  }
                </ThemedText>
              </ThemedView>
            )}

            {/* Content metadata */}
            {content?.metadata && (
              <ThemedView style={styles.metadataContainer}>
                <ThemedText style={styles.metadataText}>
                  Last updated: {new Date(content.metadata.lastModified).toLocaleDateString()}
                </ThemedText>
                <ThemedText style={styles.metadataText}>
                  Tab: {tabName}
                </ThemedText>
              </ThemedView>
            )}
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  brainLogo: {
    width: 60,
    height: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    color: '#666',
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 10,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E74C3C',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  refreshButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#dee2e6',
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  refreshButtonText: {
    color: '#666',
    fontSize: 14,
  },
  metadataContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginTop: 20,
  },
  metadataText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  bulletContainer: {
    marginTop: 8,
  },
  bulletPoint: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
    marginBottom: 4,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
    marginBottom: 16,
  },
  bubble: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  bubbleHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  bubbleSubheader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
    marginBottom: 8,
  },
  bubbleContent: {
    backgroundColor: 'transparent',
  },
  bubbleText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 8,
  },
  bubbleImage: {
    marginVertical: 8,
    alignSelf: 'center',
  },
  bubbleTable: {
    marginVertical: 8,
  },
  chartPlaceholder: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderStyle: 'dashed',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#6c757d',
  },
  bubbleVideo: {
    marginVertical: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  bubbleHeaderBold: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  // Color-coded bubble styles
  bubbleOrange: {
    backgroundColor: '#FFF3E0',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  bubbleBlue: {
    backgroundColor: '#E3F2FD',
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  bubbleGreen: {
    backgroundColor: '#E8F5E8',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  bubblePurple: {
    backgroundColor: '#F3E5F5',
    borderLeftWidth: 4,
    borderLeftColor: '#9C27B0',
  },
  bubbleYellow: {
    backgroundColor: '#FFFDE7',
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  bubbleTeal: {
    backgroundColor: '#E0F2F1',
    borderLeftWidth: 4,
    borderLeftColor: '#009688',
  },
});
