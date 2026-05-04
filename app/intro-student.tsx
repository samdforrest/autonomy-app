import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { TextWithYouTube } from '@/components/TextWithYouTube';
import { useGoogleDocsContent } from '@/hooks/useGoogleDocsContent';
import { useColorInheritance } from '@/hooks/useColorInheritance';
import { useAppMode } from '@/contexts/AppModeContext';
import { familyService } from '@/services/family-service';
import { DOCUMENT_REFS } from '@/services/api';

export default function StudentIntroScreen() {
  const router = useRouter();
  const { currentFamilyCode, switchMode } = useAppMode();
  const [isCompleting, setIsCompleting] = useState(false);

  // Fetch Google Docs content for Student Intro tab
  const { content, loading, error } = useGoogleDocsContent(
    DOCUMENT_REFS.MAIN_DOCUMENT,
    'raw',
    { tab: 'Student Intro' }
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

  // Check if header should be bold (same logic as home screen)
  const shouldBoldHeader = (header: string) => {
    if (!header) return false;
    
    const lowerHeader = header.toLowerCase();
    return lowerHeader.includes('welcome') || 
           lowerHeader.includes('introduction') || 
           lowerHeader.includes('getting started') ||
           lowerHeader.includes('overview') ||
           lowerHeader.includes('student');
  };

  // Helper function to check if a string is a YouTube URL
  const isYouTubeUrl = (url: string | null | undefined) => {
    return url && (url.includes('youtube.com') || url.includes('youtu.be'));
  };

  const renderContentBlock = (block: any, index: number) => {
    // Check if this block's header is a YouTube URL
    const isVideoBlock = isYouTubeUrl(block.header);
    
    return (
      <ThemedView key={block.id || index} style={[styles.bubble, getBubbleStyle(block.header, index, block.id)]}>
        {/* Video Player if header is YouTube URL */}
        {block.header && isVideoBlock && (
          <TextWithYouTube
            text={block.header}
            textStyle={styles.bubbleText}
            videoHeight={200}
          />
        )}

        {/* Header/Label (not a video) */}
        {block.header && !isVideoBlock && (
          <ThemedText style={[
            styles.bubbleHeader,
            shouldBoldHeader(block.header) && styles.bubbleHeaderBold
          ]}>
            {block.header}
          </ThemedText>
        )}
        
        {/* Content */}
        <ThemedView style={styles.bubbleContent}>
          {block.items?.map((item: any, itemIndex: number) => (
            <View key={itemIndex} style={styles.contentItem}>
              {item.text && (
                <TextWithYouTube 
                  text={item.text} 
                  textStyle={styles.bubbleText}
                />
              )}
              {item.uri && (
                <TextWithYouTube
                  text={item.uri}
                  textStyle={styles.bubbleText}
                  videoHeight={180}
                />
              )}
            </View>
          ))}
        </ThemedView>
      </ThemedView>
    );
  };

  const handleContinue = async () => {
    if (!currentFamilyCode || isCompleting) return;

    setIsCompleting(true);
    try {
      console.log('🎓 Student intro completed, marking as complete');
      await familyService.markStudentIntroComplete(currentFamilyCode);

      console.log('🎓 Switching to student mode before assessment');
      switchMode('student');

      console.log('📝 Navigating to assessment');
      router.replace('/assessment');
    } catch (error) {
      console.error('❌ Error completing student intro:', error);
      setIsCompleting(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.loadingText}>Loading student introduction...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.errorText}>Error loading content: {error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>Student Introduction</ThemedText>
          <ThemedText style={styles.subtitle}>
            Now let's see how the app works from a student's perspective!
          </ThemedText>
        </View>

        {/* Content Blocks - Videos first, then other content */}
        {content?.contentBlocks && (() => {
          // Separate video blocks from non-video blocks
          const videoBlocks = content.contentBlocks.filter((block: any) => isYouTubeUrl(block.header));
          const otherBlocks = content.contentBlocks.filter((block: any) => !isYouTubeUrl(block.header));
          // Render videos first, then other content
          return [...videoBlocks, ...otherBlocks].map((block: any, index: number) => renderContentBlock(block, index));
        })()}

        {/* Assessment Prompt */}
        <View style={styles.buttonContainer}>
          <ThemedText style={styles.assessmentPrompt}>
            Now, take a few minutes to find out where your learning can grow.
          </ThemedText>
          <TouchableOpacity
            style={[styles.continueButton, isCompleting && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={isCompleting}
          >
            <ThemedText style={styles.buttonText}>
              {isCompleting ? 'Loading...' : 'Take the Assessment'}
            </ThemedText>
          </TouchableOpacity>
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
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
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
  bubbleHeaderBold: {
    fontWeight: 'bold',
    fontSize: 15,
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
  contentItem: {
    marginBottom: 8,
  },
  buttonContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  assessmentPrompt: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
    marginBottom: 20,
    lineHeight: 26,
    paddingHorizontal: 10,
  },
  continueButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 200,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 50,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'red',
    marginTop: 50,
  },
  // Color inheritance styles (same as home screen)
  bubbleOrange: {
    backgroundColor: '#FFF3E0',
  },
  bubbleBlue: {
    backgroundColor: '#E3F2FD',
  },
  bubbleGreen: {
    backgroundColor: '#E8F5E8',
  },
  bubblePurple: {
    backgroundColor: '#F3E5F5',
  },
  bubbleYellow: {
    backgroundColor: '#FFFDE7',
  },
  bubbleTeal: {
    backgroundColor: '#E0F2F1',
  },
});