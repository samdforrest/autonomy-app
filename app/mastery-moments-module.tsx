import CollapsibleDayCard from '@/components/CollapsibleDayCard';
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

export default function MasteryMomentsModuleScreen() {
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [revealedAnswers, setRevealedAnswers] = useState<Set<string>>(new Set());
  
  // Google Docs content for the currently active day
  const { content, loading, error, refetch } = useGoogleDocsContent(
    DOCUMENT_REFS.MAIN_DOCUMENT,
    'raw',
    { tab: 'Mastery Moments', day: currentDay }
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
      title: 'Connect and Understand',
      description: '',
      dayNumber: 1,
      isCompleted: false,
      isLocked: false,
      color: '#F7EDCC',
      icon: '🌟',
      type: 'collaborative'
    },
    {
      id: 'day2',
      title: 'Think Together',
      description: '',
      dayNumber: 2,
      isCompleted: false,
      isLocked: false,
      color: '#F0DB99',
      icon: '🎉',
      type: 'collaborative'
    },
    {
      id: 'day3',
      title: 'Choose and Observe',
      description: '',
      dayNumber: 3,
      isCompleted: false,
      isLocked: false,
      color: '#E8C866',
      icon: '📢',
      type: 'collaborative'
    },
    {
      id: 'day4',
      title: 'Lead and Learn',
      description: '',
      dayNumber: 4,
      isCompleted: false,
      isLocked: false,
      color: '#E1B633',
      icon: '💪',
      type: 'collaborative'
    },
    {
      id: 'day5',
      title: 'Spotlight and Celebrate',
      description: '',
      dayNumber: 5,
      isCompleted: false,
      isLocked: false,
      color: '#D9A400',
      icon: '🏆',
      type: 'evaluation'
    }
  ];

  const handleDayToggle = (dayId: string) => {
    const dayNumber = parseInt(dayId.replace('day', ''));
    
    if (expandedDay === dayId) {
      setExpandedDay(null);
    } else {
      setExpandedDay(dayId);
      setCurrentDay(dayNumber);
    }
  };

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
  const shouldBoldHeader = (header: string) => {
    const boldPatterns = [
      /^Activity:/i,
      /^Scenario:/i,
      /^Job:/i,
      /^Instructions:/i,
      /^Question:/i,
      /^Answer:/i
    ];
    return boldPatterns.some(pattern => pattern.test(header));
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

  const renderContentBlock = (block: any, index: number) => {
    if (!block || !block.content) return null;

    const isScenario = block.header?.toLowerCase().includes('scenario:');
    const isJob = block.header?.toLowerCase().includes('job:');
    const isAnswerRevealed = revealedAnswers.has(block.id);
    
    // Parse scenario content if this is a scenario block
    let scenarioQuestion: string | null = null;
    let scenarioOptions: any[] = [];
    let answerText = null;
    let otherContent: any[] = [];
    
    if ((isScenario || isJob) && block.content) {
      block.content.forEach((item: any) => {
        if (item.label && ['A', 'B', 'C', 'D'].includes(item.label)) {
          // This is an option
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
    
    // Determine what header to display for scenarios and jobs
    const displayHeader = (isScenario || isJob)
      ? (isAnswerRevealed && answerText ? answerText : (scenarioQuestion || block.header))
      : block.header;
    
    // Filter content - for scenarios and jobs, we'll handle question/options/answer separately
    const filteredContent = (isScenario || isJob)
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

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.header}>
          <ThemedText style={styles.title}>🏆 Mastery Moments Module</ThemedText>
          <ThemedText style={styles.subtitle}>
            I notice the wins along the way.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.daysContainer}>
          {dayModules.map((day) => (
            <CollapsibleDayCard
              key={day.id}
              day={day}
              isExpanded={expandedDay === day.id}
              onToggle={() => handleDayToggle(day.id)}
            >
              {/* Content for the expanded day */}
              {expandedDay === day.id && (
                <ThemedView style={styles.dayContent}>
                  {loading && (
                    <ThemedView style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color="#0a7ea4" />
                      <ThemedText style={styles.loadingText}>Loading content...</ThemedText>
                    </ThemedView>
                  )}

                  {error && (
                    <ThemedView style={styles.errorContainer}>
                      <ThemedText style={styles.errorText}>⚠️ {error}</ThemedText>
                      <TouchableOpacity style={styles.refreshButton} onPress={refetch}>
                        <ThemedText style={styles.refreshButtonText}>🔄 Retry</ThemedText>
                      </TouchableOpacity>
                    </ThemedView>
                  )}

                  {!loading && !error && content && (
                    <ThemedView>
                      {/* Render content blocks (new bubble-based format) */}
                      {content.contentBlocks && content.contentBlocks.length > 0 && (
                        <ThemedView style={styles.contentBlocksContainer}>
                          {content.contentBlocks.map((block: any, index: number) => 
                            renderContentBlock(block, index)
                          )}
                        </ThemedView>
                      )}

                      {/* Fallback: Render legacy sections format if no content blocks */}
                      {(!content.contentBlocks || content.contentBlocks.length === 0) && content.sections && (
                        <ThemedView style={styles.sectionsContainer}>
                          {content.sections.learning_goals && renderSection('learning_goals', content.sections.learning_goals, '🎯')}
                          {content.sections.vocabulary && renderSection('vocabulary', content.sections.vocabulary, '📖')}
                          {content.sections.activity && renderSection('activity', content.sections.activity, '🎨')}
                          {content.sections.reflection && renderSection('reflection', content.sections.reflection, '💭')}
                        </ThemedView>
                      )}

                      {/* Debug/Metadata info */}
                      {content.metadata && (
                        <ThemedView style={styles.metadataContainer}>
                          <ThemedText style={styles.metadataText}>
                            📄 Sections: {content.metadata.totalSections}
                          </ThemedText>
                        </ThemedView>
                      )}

                      {/* Survey Button - Only show for Day 5 */}
                      <SurveyButton 
                        moduleId="masterymoments"
                        moduleName="Mastery Moments"
                        dayNumber={day.dayNumber}
                      />
                    </ThemedView>
                  )}

                  {!loading && !error && !content && (
                    <ThemedView style={styles.errorContainer}>
                      <ThemedText style={styles.errorText}>
                        No content available for this day yet.
                      </ThemedText>
                    </ThemedView>
                  )}
                </ThemedView>
              )}
            </CollapsibleDayCard>
          ))}
        </ThemedView>
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
  header: {
    padding: 20,
    paddingTop: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  daysContainer: {
    padding: 16,
  },
  dayContent: {
    padding: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#D63031',
    textAlign: 'center',
    marginBottom: 12,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  bulletContainer: {
    marginLeft: 8,
  },
  bulletPoint: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
  },
  contentBlocksContainer: {
    gap: 12,
  },
  sectionsContainer: {
    gap: 20,
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
