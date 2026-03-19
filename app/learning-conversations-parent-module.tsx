import { ImageViewer } from '@/components/ImageViewer';
import SurveyButton from '@/components/SurveyButton';
import { TableViewer } from '@/components/TableViewer';
import { TextWithYouTube } from '@/components/TextWithYouTube';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useColorInheritance } from '../hooks/useColorInheritance';
import { useGoogleDocsContent } from '../hooks/useGoogleDocsContent';
import { DOCUMENT_REFS } from '../services/api';

export default function LearningConversationsParentModuleScreen() {
  const [revealedAnswers, setRevealedAnswers] = useState<Set<string>>(new Set());

  const { content, loading, error, refetch } = useGoogleDocsContent(
    DOCUMENT_REFS.MAIN_DOCUMENT,
    'raw',
    { tab: 'Learning Conversations Parent How To' }
  );

  React.useEffect(() => {
    if (content) {
      console.log('Learning Conversations Parent Content loaded:', {
        hasContentBlocks: !!content.contentBlocks,
        contentBlocksLength: content.contentBlocks?.length || 0,
        hasSections: !!content.sections,
        sectionsCount: content.sections ? Object.keys(content.sections).length : 0
      });
    }

    if (error) {
      console.error('Learning Conversations Parent Error:', error);
    }
  }, [content, error]);

  const toggleRevealAnswer = (blockId: string) => {
    setRevealedAnswers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(blockId)) {
        newSet.delete(blockId);
      } else {
        newSet.add(blockId);
      }
      return newSet;
    });
  };

  const shouldBoldHeader = (text: string): boolean => {
    if (!text) return false;
    const lowerText = text.toLowerCase();
    return lowerText.includes('why') ||
           lowerText.includes('how') ||
           lowerText.includes('what') ||
           lowerText.includes('activity') ||
           lowerText.includes('discussion') ||
           lowerText.includes('reflection');
  };

  const { getBubbleStyle } = useColorInheritance(content?.contentBlocks, styles);

  const renderContent = () => {
    if (loading) {
      return (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A2C8E6" />
          <ThemedText style={styles.loadingText}>Loading parent guide...</ThemedText>
        </ThemedView>
      );
    }

    if (error) {
      return (
        <ThemedView style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>Error loading content: {error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      );
    }

    const contentToRender = content?.contentBlocks || [];

    if (!contentToRender.length) {
      return (
        <ThemedView style={styles.noContentContainer}>
          <ThemedText style={styles.noContentText}>
            No content available yet.
          </ThemedText>
        </ThemedView>
      );
    }

    return contentToRender.map((block: any, index: number) => {
      return (
        <ThemedView key={block.id || index} style={[styles.bubble, getBubbleStyle(block.header || '', index)]}>
          {block.header && (
            <ThemedText style={[
              styles.bubbleHeader,
              shouldBoldHeader(block.header) && styles.bubbleHeaderBold
            ]}>
              {block.header}
            </ThemedText>
          )}

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
                    spans={item.spans ? [{ text: '• ', bold: false }, ...item.spans] : undefined}
                    textStyle={styles.bulletPoint}
                    videoHeight={180}
                  />
                );
              } else if (item.type === 'text') {
                return (
                  <TextWithYouTube
                    key={idx}
                    text={item.text}
                    spans={item.spans}
                    textStyle={styles.bubbleText}
                    videoHeight={200}
                  />
                );
              } else if (item.type === 'image') {
                return (
                  <ImageViewer
                    key={idx}
                    uri={item.uri}
                    alt={item.alt || 'Image'}
                    style={styles.contentImage}
                  />
                );
              } else if (item.type === 'table') {
                return (
                  <TableViewer
                    key={idx}
                    tableData={item.data}
                    style={styles.contentTable}
                  />
                );
              }
              return null;
            })}
          </ThemedView>
        </ThemedView>
      );
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.moduleTitle}>Learning Conversations Parent Guide</ThemedText>
        <ThemedText style={styles.moduleSubtitle}>
          Supporting meaningful learning conversations with your child
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.contentContainer}>
        <ThemedView style={styles.bubblesContainer}>
          {renderContent()}
        </ThemedView>
      </ThemedView>

      <SurveyButton
        moduleId="learningconversations-parent"
        moduleName="Learning Conversations Parent Guide"
        dayNumber={1}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  moduleTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  moduleSubtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 20,
  },
  bubblesContainer: {
    gap: 16,
  },
  bubble: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bubbleHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  bubbleHeaderBold: {
    fontWeight: 'bold',
  },
  bubbleSubheader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginTop: 12,
    marginBottom: 8,
  },
  bubbleContent: {
    gap: 8,
  },
  bubbleText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  bulletPoint: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginLeft: 8,
  },
  contentImage: {
    marginVertical: 12,
    borderRadius: 8,
  },
  contentTable: {
    marginVertical: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#A2C8E6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  noContentContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noContentText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
