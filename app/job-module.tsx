import CollapsibleDayCard from '@/components/CollapsibleDayCard';
import { ImageViewer } from '@/components/ImageViewer';
import { TableViewer } from '@/components/TableViewer';
import { TextWithYouTube } from '@/components/TextWithYouTube';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useColorInheritance } from '../hooks/useColorInheritance';
import { useGoogleDocsContent } from '../hooks/useGoogleDocsContent';
import { DOCUMENT_REFS } from '../services/api';
import { getColorFromHeader } from '../utils/colorInheritance';

interface DayModule {
  id: string;
  title: string;
  description: string;
  dayNumber: number;
  isCompleted: boolean;
  isLocked: boolean;
  color: string;
  icon: string;
  type: 'collaborative' | 'independent' | 'evaluation';
}

export default function JobModuleScreen() {
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [revealedAnswers, setRevealedAnswers] = useState<Set<number>>(new Set());
  
  // Google Docs content for the currently active day
  const { content, loading, error, refetch } = useGoogleDocsContent(
    DOCUMENT_REFS.MAIN_DOCUMENT,
    'job',
    { tab: 'My Job, Your Job', day: currentDay }
  );


  // Debug: Log content structure to help troubleshoot images
  React.useEffect(() => {
    if (content) {
      console.log('📄 Content loaded:', {
        hasContentBlocks: !!content.contentBlocks,
        contentBlocksLength: content.contentBlocks?.length || 0,
        hasSections: !!content.sections,
        sectionsCount: content.sections ? Object.keys(content.sections).length : 0
      });
      
      if (content.contentBlocks) {
        content.contentBlocks.forEach((block, index) => {
          const imageCount = block.content?.filter(item => item.type === 'image').length || 0;
          if (imageCount > 0) {
            console.log(`🖼️ Block ${index + 1} has ${imageCount} images`);
            block.content?.filter(item => item.type === 'image').forEach((img, imgIndex) => {
              const isDataUrl = img.uri?.startsWith('data:');
              console.log(`   Image ${imgIndex + 1}: ${isDataUrl ? 'DATA URL' : 'EXTERNAL URL'} - ${img.alt}`);
            });
          }
        });
      }
    }
  }, [content]);
  const dayModules: DayModule[] = [
    {
      id: 'day1',
      title: 'Understanding Roles',
      description: 'Learning about different job roles and responsibilities',
      dayNumber: 1,
      isCompleted: false,
      isLocked: false,
      color: '#FFC93C',
      icon: '👔',
      type: 'collaborative'
    },
    {
      id: 'day2',
      title: 'Communication at Work',
      description: 'Effective workplace communication skills',
      dayNumber: 2,
      isCompleted: false,
      isLocked: false,
      color: '#FF9A3C',
      icon: '💬',
      type: 'collaborative'
    },
    {
      id: 'day3',
      title: 'Teamwork',
      description: 'Working together to achieve goals',
      dayNumber: 3,
      isCompleted: false,
      isLocked: false,
      color: '#FF6F3C',
      icon: '🤝',
      type: 'collaborative'
    },
    {
      id: 'day4',
      title: 'Problem Solving',
      description: 'Handling workplace challenges',
      dayNumber: 4,
      isCompleted: false,
      isLocked: false,
      color: '#155263',
      icon: '💡',
      type: 'collaborative'
    },
    {
      id: 'day5',
      title: 'Reflection',
      description: 'Putting workplace skills into practice',
      dayNumber: 5,
      isCompleted: false,
      isLocked: false,
      color: '#939393',
      icon: '🌟',
      type: 'evaluation'
    }
  ];

  const handleDayToggle = (dayId: string) => {
    const dayNumber = parseInt(dayId.replace('day', ''));
    
    // If clicking the same day, collapse it
    if (expandedDay === dayId) {
      setExpandedDay(null);
    } else {
      // Expanding a new day - set it as current and load its content
      setCurrentDay(dayNumber);
      setExpandedDay(dayId);
    }
  };

  const toggleRevealAnswer = (blockId: number) => {
    console.log('🔄 Toggle Answer for block:', blockId);
    setRevealedAnswers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(blockId)) {
        console.log('➖ Hiding answer for block:', blockId);
        newSet.delete(blockId);
      } else {
        console.log('➕ Revealing answer for block:', blockId);
        newSet.add(blockId);
      }
      console.log('📊 Updated revealed answers:', Array.from(newSet));
      return newSet;
    });
  };

  // Color inheritance hook
  const { getBubbleStyle } = useColorInheritance(content?.contentBlocks, {
    day1: styles.bubbleDay1,
    day2: styles.bubbleDay2,
    day3: styles.bubbleDay3,
    day4: styles.bubbleDay4,
    day5: styles.bubbleDay5,
    // Keep legacy styles for fallback
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
    return lowerHeader.includes('activity:') || 
           lowerHeader.includes('learning:') || 
           lowerHeader.includes('opener:') || 
           lowerHeader.includes('connect and share:') ||
           lowerHeader.includes('closing conversation:') ||
           lowerHeader.includes('read the purpose together:') ||
           lowerHeader.includes('scenario:') ||
           lowerHeader.includes('instructions:') ||
           lowerHeader.includes('answer:');
  };

  const renderContentBlock = (block: any, index: number) => {
    if (!block || !block.content) return null;

    const isScenario = block.header && block.header.toLowerCase().includes('scenario:');
    const isAnswerRevealed = revealedAnswers.has(block.id);
    
    // For scenario blocks, separate content into question, options, and answer
    let scenarioQuestion: string | null = null;
    let scenarioOptions: any[] = [];
    let answerText: string | null = null;
    let otherContent: any[] = [];
    
    if (isScenario && block.content) {
      block.content.forEach((item: any) => {
        if (item.type === 'option') {
          // This is an A:, B:, C: option
          scenarioOptions.push(item);
        } else if (item.text && item.text.toLowerCase().includes('answer:')) {
          // This is the answer
          answerText = item.text;
        } else if (item.type === 'text' && !scenarioQuestion) {
          // First text item is the scenario question
          scenarioQuestion = item.text;
        } else {
          // Everything else
          otherContent.push(item);
        }
      });
      
      console.log('🔍 Scenario Block Parsed:', {
        blockId: block.id,
        hasQuestion: !!scenarioQuestion,
        optionsCount: scenarioOptions.length,
        hasAnswer: !!answerText,
        otherContentCount: otherContent.length
      });
    }
    
    // Determine what header to display for scenarios
    const displayHeader = isScenario 
      ? (isAnswerRevealed && answerText ? answerText : (scenarioQuestion || block.header))
      : block.header;
    
    // Filter content - for scenarios, we'll handle question/options/answer separately
    const filteredContent = isScenario 
      ? otherContent  // Everything except question, options, and answer
      : block.content;

    return (
      <ThemedView key={block.id || index} style={[styles.bubble, getBubbleStyle(block.header, index, block.id)]}>
        {/* Header/Label - shows Scenario question or Answer based on reveal state */}
        {displayHeader && (
          <ThemedText style={[
            styles.bubbleHeader, 
            shouldBoldHeader(displayHeader) && styles.bubbleHeaderBold
          ]}>
            {displayHeader}
          </ThemedText>
        )}
        
        {/* Scenario Options (A, B, C) - Always visible for scenarios */}
        {isScenario && scenarioOptions.length > 0 && (
          <ThemedView style={styles.optionsContainer}>
            {scenarioOptions.map((option: any, idx: number) => (
              <ThemedView key={idx} style={styles.optionItem}>
                <ThemedText style={styles.optionLabel}>{option.label}:</ThemedText>
                <ThemedText style={styles.optionText}>{option.text}</ThemedText>
              </ThemedView>
            ))}
          </ThemedView>
        )}
        
        {/* Reveal Answer Button for Scenarios - positioned after options */}
        {isScenario && (
          <TouchableOpacity 
            style={styles.revealButton} 
            onPress={() => toggleRevealAnswer(block.id)}
          >
            <ThemedText style={styles.revealButtonText}>
              {isAnswerRevealed ? 'Show Scenario' : 'Reveal Answer'}
            </ThemedText>
          </TouchableOpacity>
        )}
        
        {/* Other Content */}
        <ThemedView style={styles.bubbleContent}>
          {filteredContent && filteredContent.map((item: any, idx: number) => {
            if (item.type === 'subheader') {
              // Render subheaders (like Instructions: within Activity:)
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
              // console.log('🖼️ Rendering ImageViewer with:', { uri: item.uri, alt: item.alt });
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
              console.log('📊 Rendering TableViewer with:', { 
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
              console.log('📈 Rendering chart placeholder with:', { 
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
            }
            return null;
          })}
        </ThemedView>
      </ThemedView>
    );
  };

  // Compute color inheritance for sections (similar to contentBlocks)
  const sectionColors = useMemo(() => {
    if (!content?.sections) return new Map<string, string>();
    
    const colorMap = new Map<string, string>();
    let currentColor: string | null = null;
    
    // Process sections in order to build inheritance map
    Object.entries(content.sections).forEach(([sectionKey, section]: [string, any]) => {
      const sectionTitle = section.title || sectionKey;
      const blockColor = getColorFromHeader(sectionTitle);
      
      if (blockColor) {
        currentColor = blockColor;
      }
      
      // Store the color for this section (inherited or new)
      if (currentColor) {
        colorMap.set(sectionKey, currentColor);
      }
    });
    
    return colorMap;
  }, [content?.sections]);

  // Helper to get bubble style from color name
  const getBubbleStyleFromColor = (color: string | null) => {
    if (!color) return {};
    
    const styleMap: Record<string, any> = {
      // Day-specific styles (new system)
      day1: styles.bubbleDay1,
      day2: styles.bubbleDay2,
      day3: styles.bubbleDay3,
      day4: styles.bubbleDay4,
      day5: styles.bubbleDay5,
      // Legacy color names (fallback)
      orange: styles.bubbleOrange,
      blue: styles.bubbleBlue,
      green: styles.bubbleGreen,
      purple: styles.bubblePurple,
      yellow: styles.bubbleYellow,
      teal: styles.bubbleTeal,
    };
    
    return styleMap[color] || {};
  };

  const renderSection = (sectionKey: string, section: any, defaultIcon: string) => {
    // Get color from inheritance map (with fallback to direct keyword match)
    const sectionTitle = section.title || sectionKey;
    const inheritedColor = sectionColors.get(sectionKey);
    const directColor = getColorFromHeader(sectionTitle);
    const color = inheritedColor || directColor;
    const colorStyle = getBubbleStyleFromColor(color);
    
    return (
      <ThemedView key={sectionKey} style={[styles.bubble, colorStyle]}>
        <ThemedText style={[
          styles.bubbleHeader,
          shouldBoldHeader(sectionTitle) && styles.bubbleHeaderBold
        ]}>
          {sectionTitle}
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
            textStyle={styles.bubbleText}
            videoHeight={200}
          />
        )}
      </ThemedView>
    );
  };


  const renderDayContent = (day: DayModule) => {
    // Only render content for the currently expanded day
    if (expandedDay !== day.id) {
      return null;
    }

    // Check if this is the day we're currently loading content for
    if (day.dayNumber === currentDay) {
      // Loading state
      if (loading) {
        return (
          <ThemedView style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={day.color} />
            <ThemedText style={styles.loadingText}>Loading Day {day.dayNumber} content from Google Docs...</ThemedText>
          </ThemedView>
        );
      }

      // Error state
      if (error) {
        return (
          <ThemedView style={styles.errorContainer}>
            <ThemedText style={styles.errorTitle}>⚠️ Content Unavailable</ThemedText>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
            <TouchableOpacity style={styles.retryButton} onPress={refetch}>
              <ThemedText style={styles.retryButtonText}>Try Again</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        );
      }

      // Content state - render dynamic content for any day
      return (
        <ThemedView>
          {/* Refresh button */}
          <TouchableOpacity style={styles.refreshButton} onPress={refetch}>
            <ThemedText style={styles.refreshButtonText}>🔄 Refresh Content</ThemedText>
          </TouchableOpacity>

          {content?.contentBlocks && content.contentBlocks.length > 0 ? (
            // Render content blocks from Google Docs (includes images)
            content.contentBlocks.map((block, index) => renderContentBlock(block, index))
          ) : content?.sections ? (
            // Fallback: Render sections from Google Docs (old format)
            Object.entries(content.sections).map(([sectionKey, section]) =>
              renderSection(sectionKey, section, '')
            )
          ) : (
            // Fallback content if no Google Docs content is available
            <ThemedView style={styles.section}>
              <ThemedText style={styles.sectionTitle}>📝 Day {day.dayNumber} Content</ThemedText>
              <ThemedText style={styles.contentText}>
                Content is loading from Google Docs...
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
                Sections: {content.metadata.totalSections}
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      );
    }
    
    // This shouldn't happen with our new logic, but keeping as fallback
    return (
      <ThemedView>
        <ThemedText style={styles.contentTitle}>🚀 Loading...</ThemedText>
        <ThemedText style={styles.contentText}>
          Preparing Day {day.dayNumber} content...
        </ThemedText>
      </ThemedView>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.moduleTitle}>💼 My Job, Your Job</ThemedText>
        <ThemedText style={styles.moduleSubtitle}>
          Understanding workplace roles and responsibilities through 5 focused days...
        </ThemedText>
      </ThemedView>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.daysContainer}
        showsVerticalScrollIndicator={false}
      >
        {dayModules.map((day) => (
          <CollapsibleDayCard
            key={day.id}
            day={day}
            isExpanded={expandedDay === day.id}
            onToggle={handleDayToggle}
          >
            {renderDayContent(day)}
          </CollapsibleDayCard>
        ))}
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
    paddingTop: 20,
    alignItems: 'center',
  },
  moduleTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  moduleSubtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    color: '#666',
  },
  scrollContainer: {
    flex: 1,
  },
  daysContainer: {
    padding: 20,
    paddingTop: 10,
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
    marginBottom: 16,
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
  // Color-coded bubble styles
  bubbleOrange: {
    backgroundColor: '#FFF3E0', // Light orange background
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800', // Orange border
  },
  bubbleBlue: {
    backgroundColor: '#E3F2FD', // Light blue background
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3', // Blue border
  },
  bubbleGreen: {
    backgroundColor: '#E8F5E8', // Light green background
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50', // Green border
  },
  bubblePurple: {
    backgroundColor: '#F3E5F5', // Light purple background
    borderLeftWidth: 4,
    borderLeftColor: '#9C27B0', // Purple border
  },
  bubbleYellow: {
    backgroundColor: '#FFFDE7', // Light yellow background
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107', // Yellow border
  },
  bubbleTeal: {
    backgroundColor: '#E0F2F1', // Light teal background
    borderLeftWidth: 4,
    borderLeftColor: '#009688', // Teal border
  },
  // Day-specific bubble styles that match day card colors
  bubbleDay1: {
    backgroundColor: '#FFF8E1', // Light version of #FFC93C
    borderLeftWidth: 4,
    borderLeftColor: '#FFC93C', // Day 1 golden yellow
  },
  bubbleDay2: {
    backgroundColor: '#FFF3E0', // Light version of #FF9A3C  
    borderLeftWidth: 4,
    borderLeftColor: '#FF9A3C', // Day 2 orange
  },
  bubbleDay3: {
    backgroundColor: '#FFEBE0', // Light version of #FF6F3C
    borderLeftWidth: 4, 
    borderLeftColor: '#FF6F3C', // Day 3 red-orange
  },
  bubbleDay4: {
    backgroundColor: '#E0F4F3', // Light version of #155263
    borderLeftWidth: 4,
    borderLeftColor: '#155263', // Day 4 dark teal  
  },
  bubbleDay5: {
    backgroundColor: '#F5F5F5', // Light version of #939393
    borderLeftWidth: 4,
    borderLeftColor: '#939393', // Day 5 gray
  },
  // Bold header style
  bubbleHeaderBold: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  // Reveal Answer Button styles
  revealButton: {
    backgroundColor: '#2196F3', // Blue background
    borderRadius: 25, // Rounded corners like in the image
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 8,
    marginBottom: 12,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8, // Android shadow
  },
  revealButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  // Options container styles
  optionsContainer: {
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: 'transparent', // No background color
  },
  optionItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
    backgroundColor: 'transparent', // No background color
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
    minWidth: 20,
  },
  optionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    flex: 1,
  },
});
