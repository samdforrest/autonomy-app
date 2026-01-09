// CollapsibleDayCard not needed for parent modules
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

export default function SelfCoachParentModuleScreen() {
  const [revealedAnswers, setRevealedAnswers] = useState<Set<string>>(new Set());
  
  // Google Docs content
  const { content, loading, error, refetch } = useGoogleDocsContent(
    DOCUMENT_REFS.MAIN_DOCUMENT,
    'raw',
    { tab: 'Self Coach Parent How To' }
  );

  // Debug: Log content structure
  React.useEffect(() => {
    if (content) {
      console.log('📄 Self Coach Parent Content loaded:', {
        hasContentBlocks: !!content.contentBlocks,
        contentBlocksLength: content.contentBlocks?.length || 0,
        hasSections: !!content.sections,
        sectionsCount: content.sections ? Object.keys(content.sections).length : 0
      });
      
      // Log the actual content blocks for debugging
      if (content.contentBlocks) {
        console.log('📄 Self Coach Content blocks:', content.contentBlocks);
        content.contentBlocks.forEach((block: any, index: number) => {
          console.log(`Self Coach Block ${index}:`, {
            id: block.id,
            header: block.header,
            contentLength: block.content?.length || 0,
            content: block.content
          });
          
          // Log each content item in detail
          if (block.content) {
            block.content.forEach((item: any, itemIndex: number) => {
              console.log(`  Self Coach Content item ${itemIndex}:`, {
                type: item.type,
                text: item.text,
                fullItem: item
              });
            });
          }
        });
      }
    }
    
    if (error) {
      console.error('❌ Self Coach Parent Error:', error);
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

  // Helper function to determine if a header should be bold
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

  // Color inheritance for bubbles
  const { getBubbleStyle } = useColorInheritance(content?.contentBlocks, styles);

  const parseWhyHowWhatContent = () => {
    if (!content?.contentBlocks) return [];
    
    const parsedBubbles: any[] = [];
    
    content.contentBlocks.forEach((block: any, blockIndex: number) => {
      // First, add the main header as an intro bubble if it exists
      if (block.header && block.header !== 'Why?' && block.header !== 'How?' && block.header !== 'What?') {
        parsedBubbles.push({
          id: `${block.id || blockIndex}-intro`,
          header: block.header,
          content: []
        });
      }
      
      if (block.content && block.content.length > 0) {
        // Look for Why/How/What patterns within the text content
        let currentSection = '';
        let currentContent: any[] = [];
        let foundSections = false;
        
        block.content.forEach((item: any, itemIndex: number) => {
          if (item.type === 'text' && item.text) {
            const text = item.text.trim();
            console.log(`🔍 Self Coach analyzing text: "${text}"`);
            
            // Split text by Why/How/What patterns
            const whyMatch = text.match(/(Why\?.*?)(?=How\?|What\?|$)/s);
            const howMatch = text.match(/(How\?.*?)(?=What\?|$)/s);
            const whatMatch = text.match(/(What\?.*?)$/s);
            
            if (whyMatch) {
              console.log('📍 Self Coach Found Why section:', whyMatch[1]);
              parsedBubbles.push({
                id: `${block.id || blockIndex}-why`,
                header: 'Why?',
                content: [{
                  type: 'text',
                  text: whyMatch[1].replace(/^Why\?\s*/, '').trim()
                }]
              });
              foundSections = true;
            }
            
            if (howMatch) {
              console.log('📍 Self Coach Found How section:', howMatch[1]);
              parsedBubbles.push({
                id: `${block.id || blockIndex}-how`,
                header: 'How?',
                content: [{
                  type: 'text',
                  text: howMatch[1].replace(/^How\?\s*/, '').trim()
                }]
              });
              foundSections = true;
            }
            
            if (whatMatch) {
              console.log('📍 Self Coach Found What section:', whatMatch[1]);
              parsedBubbles.push({
                id: `${block.id || blockIndex}-what`,
                header: 'What?',
                content: [{
                  type: 'text',
                  text: whatMatch[1].replace(/^What\?\s*/, '').trim()
                }]
              });
              foundSections = true;
            }
            
            // If no Why/How/What found in this text, treat as regular content
            if (!whyMatch && !howMatch && !whatMatch) {
              if (!currentSection) {
                currentContent.push(item);
              }
            }
          } else {
            // Non-text content
            currentContent.push(item);
          }
        });
        
        // If no Why/How/What sections were found, create a single bubble with all content
        if (!foundSections && currentContent.length > 0) {
          parsedBubbles.push({
            id: block.id || `block-${blockIndex}`,
            header: block.header || 'Content',
            content: [...currentContent]
          });
        }
      }
    });
    
    // Fallback: if no bubbles were created, return original content
    if (parsedBubbles.length === 0 && content?.contentBlocks) {
      return content.contentBlocks;
    }
    
    console.log('🎯 Self Coach Final parsed bubbles:', parsedBubbles);
    return parsedBubbles;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFC107" />
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

    const parsedContent = parseWhyHowWhatContent();
    
    // Debug: Log parsed content
    console.log('🔍 Self Coach Parsed content length:', parsedContent.length);
    console.log('🔍 Self Coach Parsed content:', parsedContent);

    if (!parsedContent.length) {
      return (
        <ThemedView style={styles.noContentContainer}>
          <ThemedText style={styles.noContentText}>
            No content available yet.
          </ThemedText>
        </ThemedView>
      );
    }

    return parsedContent.map((block: any, index: number) => {
      const isAnswerRevealed = revealedAnswers.has(block.id || `block-${index}`);

      return (
        <ThemedView key={block.id || index} style={[styles.bubble, getBubbleStyle(block.header || '', index)]}>
          {/* Header/Label */}
          {block.header && (
            <ThemedText style={[
              styles.bubbleHeader, 
              shouldBoldHeader(block.header) && styles.bubbleHeaderBold
            ]}>
              {block.header}
            </ThemedText>
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
        <ThemedText style={styles.moduleTitle}>Self Coach Parent Guide</ThemedText>
        <ThemedText style={styles.moduleSubtitle}>
          Helping your child develop positive self-talk
        </ThemedText>
      </ThemedView>

      {/* Content Display - Show all content as bubbles */}
      <ThemedView style={styles.contentContainer}>
        <ThemedView style={styles.bubblesContainer}>
          {renderContent()}
        </ThemedView>
      </ThemedView>

      <SurveyButton 
        moduleId="selfcoach-parent"
        moduleName="Self Coach Parent Guide"
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
    backgroundColor: '#FFC107',
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