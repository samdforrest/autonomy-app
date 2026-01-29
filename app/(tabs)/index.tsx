import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import { AssessmentCard } from '@/components/AssessmentCard';
import { EnhancedYouTubePlayer } from '@/components/EnhancedYouTubePlayer';
import { ImageViewer } from '@/components/ImageViewer';
import { ModeToggle } from '@/components/ModeToggle';
import { TableViewer } from '@/components/TableViewer';
import { TextWithYouTube } from '@/components/TextWithYouTube';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAppMode } from '@/contexts/AppModeContext';
import { useTutorial } from '@/contexts/TutorialContext';
import { useColorInheritance } from '@/hooks/useColorInheritance';
import { useGoogleDocsContent } from '@/hooks/useGoogleDocsContent';
import { DOCUMENT_REFS } from '@/services/api';
import { assessmentService, type AssessmentSummary } from '@/services/assessment-service';

export default function HomeScreen() {
  const componentId = React.useRef(Math.random().toString(36).substr(2, 9));
  console.log('🏠🏠🏠 HOME SCREEN COMPONENT RENDER (ID:', componentId.current + ')');
  
  const router = useRouter();
  const { userMode, isInFamilyMode, currentFamilyCode, currentFamily, clearFamilyContext } = useAppMode();
  const tutorial = useTutorial();
  const [assessmentResults, setAssessmentResults] = React.useState<AssessmentSummary | null>(null);
  const [loadingResults, setLoadingResults] = React.useState(false);
  
  // Tutorial auto-trigger logic (much simpler now!)
  const [hasTriggeredTutorial, setHasTriggeredTutorial] = React.useState(false);
  
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

  // Load assessment results
  React.useEffect(() => {
    const loadAssessmentResults = async () => {
      setLoadingResults(true);
      try {
        // Set context based on current mode
        if (isInFamilyMode && currentFamilyCode) {
          assessmentService.setContext(currentFamilyCode, 'student');
        } else {
          assessmentService.syncFromGlobalContext();
        }
        
        const results = await assessmentService.loadAssessmentResults();
        setAssessmentResults(results);
        console.log('🏠 Loaded assessment results:', !!results);
      } catch (error) {
        console.error('❌ Error loading assessment results:', error);
      } finally {
        setLoadingResults(false);
      }
    };

    loadAssessmentResults();
  }, [isInFamilyMode, currentFamilyCode]);

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

  // Auto-trigger tutorial on first login (much simpler!)
  React.useEffect(() => {
    if (!isInFamilyMode || !currentFamily || !currentFamilyCode || hasTriggeredTutorial) {
      return;
    }

    const loginCount = currentFamily.settings.loginCount || 0;
    
    const hasCompletedTutorial = currentFamily.settings.hasCompletedTutorial || false;
    
    console.log('🎯 Checking tutorial trigger:', { 
      familyCode: currentFamilyCode, 
      loginCount,
      hasCompletedTutorial,
      isTutorialVisible: tutorial.isTutorialVisible,
      hasTriggeredTutorial
    });

    // Only trigger tutorial if this is the first login (count = 1), tutorial hasn't been completed, and we haven't triggered it yet
    if (loginCount === 1 && !hasCompletedTutorial && !tutorial.isTutorialVisible && !hasTriggeredTutorial) {
      console.log('🎉 First login detected! Auto-triggering tutorial.');
      setHasTriggeredTutorial(true);
      
      // Small delay to let the home screen fully load
      setTimeout(() => {
        tutorial.showTutorial();
      }, 1000);
    } else if (loginCount > 1) {
      console.log('👀 Subsequent login (count: ' + loginCount + '), no tutorial trigger');
    } else if (hasCompletedTutorial) {
      console.log('✅ Tutorial already completed, no trigger needed');
    }
  }, [isInFamilyMode, currentFamily, currentFamilyCode, tutorial.isTutorialVisible, hasTriggeredTutorial]);

  // Reset tutorial trigger when family changes
  React.useEffect(() => {
    setHasTriggeredTutorial(false);
  }, [currentFamilyCode]);

  // Helper function to check if a string is a YouTube URL
  const isYouTubeUrl = (url: string | null | undefined) => {
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
          <EnhancedYouTubePlayer
            url={block.header}
            title="Featured Video"
            category="lesson"
            style={styles.bubbleVideo}
            useCardMode={true}
          />
        )}
        
        {/* YouTube Video Player if this block has a combined video */}
        {block.videoUrl && (
          <EnhancedYouTubePlayer
            url={block.videoUrl}
            title="Learning Video"
            category="example"
            style={styles.bubbleVideo}
            useCardMode={true}
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
                <EnhancedYouTubePlayer
                  key={idx}
                  url={videoUrl}
                  title="Learning Video"
                  category="lesson"
                  style={styles.bubbleVideo}
                  useCardMode={true}
                />
              );
            } else if (item.type === 'link' && (item.url?.includes('youtube.com') || item.url?.includes('youtu.be'))) {
              // Handle YouTube links that might be categorized as generic links
              console.log('🔗 Rendering YouTube link as video:', item.url);
              return (
                <EnhancedYouTubePlayer
                  key={idx}
                  url={item.url}
                  title={item.text || "Learning Video"}
                  category="example"
                  style={styles.bubbleVideo}
                  useCardMode={true}
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
                    {item.title || 'Chart'}
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
        {section.title}
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
    // Icons removed - returning empty string
    return '';
  };

  const getModuleDisplayName = (moduleId: string): string => {
    const names: { [key: string]: string } = {
      mistakes: 'Mistakes',
      regulation: 'Regulation', 
      job: 'Responsibility',
      collaboration: 'Collaboration',
      selfcoach: 'Self-Coaching',
      curiosity: 'Curiosity',
      shapeoflearning: 'Shape of Learning',
      neuroplasticity: 'Neuroplasticity',
      masterymoments: 'Mastery Moments',
      selfmonitoring: 'Self-Monitoring'
    };
    return names[moduleId] || moduleId;
  };

  const renderAssessmentResults = () => {
    if (loadingResults) {
      return (
        <ThemedView style={styles.assessmentResultsSection}>
          <ThemedText style={styles.sectionTitle}>
            {userMode === 'parent' ? 'Student Learning Priorities' : 'Your Learning Priorities'}
          </ThemedText>
          <ThemedView style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#2196F3" />
            <ThemedText style={styles.loadingText}>Loading results...</ThemedText>
          </ThemedView>
        </ThemedView>
      );
    }

    if (!assessmentResults) {
      return (
        <ThemedView style={styles.assessmentResultsSection}>
          <ThemedText style={styles.sectionTitle}>
            {userMode === 'parent' ? 'Student Learning Priorities' : 'Your Learning Priorities'}
          </ThemedText>
          <ThemedText style={styles.noResultsText}>
            {userMode === 'parent' 
              ? 'Student needs to take the assessment to see personalized learning priorities!'
              : 'Take the assessment to see your personalized learning priorities!'
            }
          </ThemedText>
          {/* <TouchableOpacity 
            style={styles.takeAssessmentButton}
            onPress={() => router.push('/assessment')}
          >
            <ThemedText style={styles.takeAssessmentButtonText}>Take Assessment</ThemedText>
          </TouchableOpacity> */}
        </ThemedView>
      );
    }

    // Calculate module priorities from results
    const moduleScores = Object.entries(assessmentResults.moduleScores || {})
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5) // Show top 5 priorities
      .map(([moduleId, score]) => ({
        moduleId,
        score,
        displayName: getModuleDisplayName(moduleId),
        percentage: Math.round((score / Math.max(...Object.values(assessmentResults.moduleScores || {}))) * 100)
      }));

    return (
      <ThemedView style={styles.assessmentResultsSection}>
        <ThemedView style={styles.resultsHeader}>
          <ThemedText style={styles.sectionTitle}>
            {userMode === 'parent' ? 'Student Learning Priorities' : 'Your Learning Priorities'}
          </ThemedText>
          <TouchableOpacity 
            style={styles.viewFullResultsButton}
            onPress={() => {
              if (isInFamilyMode && currentFamilyCode) {
                router.push(`/family/${currentFamilyCode}/results`);
              } else {
                router.push('/assessment');
              }
            }}
          >
            <ThemedText style={styles.viewFullResultsButtonText}>View Results</ThemedText>
          </TouchableOpacity>
        </ThemedView>
        
        <ThemedText style={styles.resultsSubtitle}>
          {userMode === 'parent' 
            ? 'Based on your student\'s assessment, here are their top learning priorities:'
            : 'Based on your assessment, here are your top learning priorities:'
          }
        </ThemedText>

        {moduleScores.map((module, index) => (
          <ThemedView key={module.moduleId} style={styles.priorityItem}>
            <ThemedView style={styles.priorityHeader}>
              <ThemedText style={styles.priorityRank}>#{index + 1}</ThemedText>
              <ThemedText style={styles.priorityName}>{module.displayName}</ThemedText>
              <ThemedText style={styles.priorityScore}>{module.score} pts</ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.priorityProgressBar}>
              <ThemedView 
                style={[
                  styles.priorityProgressFill, 
                  { width: `${module.percentage}%` }
                ]} 
              />
            </ThemedView>
          </ThemedView>
        ))}

        {userMode === 'student' && (
          <TouchableOpacity 
            style={styles.retakeAssessmentButton}
            onPress={() => router.push('/assessment')}
          >
            <ThemedText style={styles.retakeAssessmentButtonText}>Retake Assessment</ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>
    );
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
          {userMode === 'parent' ? 'Parent Guide' : 'Welcome, Student!'}
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          {userMode === 'parent' 
            ? 'Supporting your student\'s learning journey' 
            : 'Begin your Autonomy Learning adventure'
          }
        </ThemedText>
      </ThemedView>

      {/* Mode Toggle */}
      <ModeToggle />

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Family Context Indicator */}
        {isInFamilyMode && currentFamilyCode && (
          <ThemedView style={styles.familyContextIndicator}>
            <ThemedText style={styles.familyContextTitle}>
              Currently in Family: {currentFamilyCode}
            </ThemedText>
            <ThemedText style={styles.familyContextSubtitle} />
            <ThemedView style={styles.familyContextActions}>
              <TouchableOpacity 
                style={styles.familyContextButton}
                onPress={() => router.push('/(tabs)/profile')}
              >
                <ThemedText style={styles.familyContextButtonText}>Go to Profile</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.familyContextButton, styles.familyContextButtonSecondary]}
                onPress={clearFamilyContext}
              >
                <ThemedText style={[styles.familyContextButtonText, styles.familyContextButtonTextSecondary]}>
                  Logout
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        )}

        {/* Tutorial launcher for families */}
        {isInFamilyMode && (
              <ThemedView style={styles.tutorialSection}>
                <ThemedText style={styles.tutorialSectionTitle}>
                  New to the App?
                </ThemedText>
                <ThemedText style={styles.tutorialSectionSubtitle}>
                  Take our interactive tutorial to learn how families can use the platform together - perfect for both parents and students!
                </ThemedText>
                <TouchableOpacity 
                  style={styles.tutorialButton}
                  onPress={() => tutorial.showTutorial()}
                >
                  <ThemedText style={styles.tutorialButtonText}>
                    Start Interactive Tutorial
                  </ThemedText>
                </TouchableOpacity>

                {/* DEBUG: Reset tutorial for testing auto-trigger
                <TouchableOpacity 
                  style={[styles.tutorialButton, { backgroundColor: '#ff6b6b', marginTop: 8 }]}
                  onPress={async () => {
                    await tutorial.resetTutorialStatus();
                    console.log('🧹 Tutorial status reset - refresh app to test auto-trigger');
                    alert('Tutorial status reset! Refresh the app to test auto-trigger.');
                  }}
                >
                  <ThemedText style={styles.tutorialButtonText}>
                    🧹 Reset Tutorial (Debug)
                  </ThemedText>
                </TouchableOpacity> */}
              </ThemedView>
            )}

        {/* Family Access Section - Only show if NOT in family mode */}
        {!isInFamilyMode && (
          <ThemedView style={styles.familySection}>
            <ThemedText style={styles.familySectionTitle}>Family Access</ThemedText>
            <ThemedText style={styles.familySectionSubtitle}>
              Track progress across multiple students with family codes
            </ThemedText>
            
            <ThemedView style={styles.familyButtons}>
              {/* <TouchableOpacity 
                style={styles.familyButton}
                onPress={() => router.push('/create-family')}
              >
                <ThemedText style={styles.familyButtonText}>🆕 Create Family</ThemedText>
              </TouchableOpacity> */}
              
              <TouchableOpacity 
                style={[styles.familyButton, styles.familyButtonSecondary]}
                onPress={() => router.push('/join-family')}
              >
                <ThemedText style={[styles.familyButtonText, styles.familyButtonTextSecondary]}>
                  Join Family
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        )}

        {/* Assessment Card - Only for students */}
        {userMode === 'student' && <AssessmentCard userMode={userMode} />}

        {/* Assessment Results Display */}
        {renderAssessmentResults()}

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
            <ThemedText style={styles.errorTitle}>Content Unavailable</ThemedText>
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
              <ThemedText style={styles.refreshButtonText}>Refresh Content</ThemedText>
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
                  {userMode === 'parent' ? 'Parent Guide' : 'Student Welcome'}
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
    paddingTop: 10,
    paddingBottom: 20,
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
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
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
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
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
  // Family section styles
  familySection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  familySectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  familySectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  familyButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  familyButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  familyButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  familyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  familyButtonTextSecondary: {
    color: '#007AFF',
  },
  // Family Context Indicator styles
  familyContextIndicator: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  familyContextTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 4,
  },
  familyContextSubtitle: {
    fontSize: 14,
    color: '#1976D2',
    marginBottom: 12,
  },
  familyContextActions: {
    flexDirection: 'row',
    gap: 8,
  },
  familyContextButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  familyContextButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  familyContextButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  familyContextButtonTextSecondary: {
    color: '#2196F3',
  },
  // Assessment Results Styles
  assessmentResultsSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  resultsSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  takeAssessmentButton: {
    backgroundColor: '#27AE60',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  takeAssessmentButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  viewFullResultsButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  viewFullResultsButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  priorityItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  priorityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  priorityRank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3498DB',
    marginRight: 8,
    minWidth: 24,
  },
  priorityName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  priorityScore: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#27AE60',
  },
  priorityProgressBar: {
    height: 4,
    backgroundColor: '#ECF0F1',
    borderRadius: 2,
    overflow: 'hidden',
  },
  priorityProgressFill: {
    height: '100%',
    backgroundColor: '#3498DB',
    borderRadius: 2,
  },
  retakeAssessmentButton: {
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BDC3C7',
    alignItems: 'center',
    marginTop: 8,
  },
  retakeAssessmentButtonText: {
    color: '#7F8C8D',
    fontSize: 14,
    fontWeight: '500',
  },
  // Tutorial launcher styles
  tutorialSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#17A2B8',
  },
  tutorialSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  tutorialSectionSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  tutorialButton: {
    backgroundColor: '#17A2B8',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  tutorialButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
