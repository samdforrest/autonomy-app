// import { ThemedText } from '@/components/ThemedText';
// import { ThemedView } from '@/components/ThemedView';
// import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
// import { useGoogleDocsContent } from '../hooks/useGoogleDocsContent';
// import { DOCUMENT_REFS } from '../services/api';

// export default function RegulationDay1Screen() {
//   const { content, loading, error, refetch } = useGoogleDocsContent(
//     DOCUMENT_REFS.MAIN_DOCUMENT,
//     'regulation',
//     { tab: 'Regulation', day: 1 }
//   );

//   // Loading state
//   if (loading) {
//     return (
//       <ThemedView style={styles.container}>
//         <ThemedView style={styles.header}>
//           <ThemedText style={styles.dayLabel}>Day 1 of 5</ThemedText>
//           <ThemedText type="title" style={styles.title}>Understanding Emotions</ThemedText>
//           <ThemedText style={styles.subtitle}>Parent + Child • Collaborative Learning</ThemedText>
//         </ThemedView>
//         <ThemedView style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#E74C3C" />
//           <ThemedText style={styles.loadingText}>Loading content from Google Docs...</ThemedText>
//         </ThemedView>
//       </ThemedView>
//     );
//   }

//   // Error state
//   if (error) {
//     return (
//       <ThemedView style={styles.container}>
//         <ThemedView style={styles.header}>
//           <ThemedText style={styles.dayLabel}>Day 1 of 5</ThemedText>
//           <ThemedText type="title" style={styles.title}>Understanding Emotions</ThemedText>
//           <ThemedText style={styles.subtitle}>Parent + Child • Collaborative Learning</ThemedText>
//         </ThemedView>
//         <ThemedView style={styles.errorContainer}>
//           <ThemedText style={styles.errorTitle}>Content Unavailable</ThemedText>
//           <ThemedText style={styles.errorText}>{error}</ThemedText>
//           <TouchableOpacity style={styles.retryButton} onPress={refetch}>
//             <ThemedText style={styles.retryButtonText}>Try Again</ThemedText>
//           </TouchableOpacity>
//         </ThemedView>
//       </ThemedView>
//     );
//   }

//   // Render dynamic content from Google Docs
//   const renderSection = (sectionKey: string, section: any, defaultIcon: string) => (
//     <ThemedView key={sectionKey} style={styles.section}>
//       <ThemedText style={styles.sectionTitle}>
//         {defaultIcon} {section.title}
//       </ThemedText>
      
//       {/* Render bullet points */}
//       {section.items && section.items.length > 0 && (
//         <ThemedView style={styles.bulletContainer}>
//           {section.items.map((item: string, index: number) => (
//             <ThemedText key={index} style={styles.bulletPoint}>
//               • {item}
//             </ThemedText>
//           ))}
//         </ThemedView>
//       )}
      
//       {/* Render additional content */}
//       {section.content && (
//         <ThemedText style={styles.contentText}>
//           {section.content}
//         </ThemedText>
//       )}
//     </ThemedView>
//   );

//   // Default icons for different sections
//   const getSectionIcon = (sectionKey: string): string => {
//     const iconMap: Record<string, string> = {
//       rules: '📋',
//       instructions: '💭', 
//       activities: '🎯',
//       understanding_emotions: '😊',
//       think_together: '💭',
//       todays_activities: '🎯',
//       // Add more mappings as needed
//     };
//     return iconMap[sectionKey] || '📝';
//   };

//   return (
//     <ThemedView style={styles.container}>
//       <ThemedView style={styles.header}>
//         <ThemedText style={styles.dayLabel}>Day 1 of 5</ThemedText>
//         <ThemedText type="title" style={styles.title}>
//           {content?.dayTitle || content?.title || 'Understanding Emotions'}
//         </ThemedText>
//         <ThemedText style={styles.subtitle}>Parent + Child • Collaborative Learning</ThemedText>
        
//         {/* Refresh button */}
//         <TouchableOpacity style={styles.refreshButton} onPress={refetch}>
//           <ThemedText style={styles.refreshButtonText}>🔄 Refresh Content</ThemedText>
//         </TouchableOpacity>
//       </ThemedView>

//       <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
//         {content?.sections ? (
//           // Render dynamic content from Google Docs
//           Object.entries(content.sections).map(([sectionKey, section]) =>
//             renderSection(sectionKey, section, getSectionIcon(sectionKey))
//           )
//         ) : (
//           // Fallback content if no Google Docs content is available
//           <>
//             <ThemedView style={styles.section}>
//               <ThemedText style={styles.sectionTitle}>😊 Understanding Emotions</ThemedText>
//               <ThemedText style={styles.placeholder}>
//                 Content is loading from Google Docs...
//               </ThemedText>
//             </ThemedView>
//           </>
//         )}
        
//         {/* Content metadata */}
//         {content?.metadata && (
//           <ThemedView style={styles.metadataContainer}>
//             <ThemedText style={styles.metadataText}>
//               Last updated: {new Date(content.metadata.lastModified).toLocaleDateString()}
//             </ThemedText>
//             <ThemedText style={styles.metadataText}>
//               Sections: {content.metadata.totalSections}
//             </ThemedText>
//           </ThemedView>
//         )}
//       </ScrollView>
//     </ThemedView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#E74C3C',
//   },
//   header: {
//     padding: 20,
//     paddingTop: 60,
//     alignItems: 'center',
//     backgroundColor: 'rgba(255,255,255,0.1)',
//   },
//   dayLabel: {
//     fontSize: 14,
//     color: 'white',
//     opacity: 0.8,
//     marginBottom: 4,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: 'white',
//     marginBottom: 8,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: 'white',
//     opacity: 0.9,
//   },
//   content: {
//     flex: 1,
//   },
//   contentContainer: {
//     padding: 20,
//   },
//   section: {
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 20,
//     marginBottom: 16,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 12,
//     color: '#333',
//   },
//   placeholder: {
//     fontSize: 16,
//     lineHeight: 24,
//     color: '#666',
//   },
//   // Loading state styles
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 40,
//   },
//   loadingText: {
//     marginTop: 16,
//     fontSize: 16,
//     color: 'white',
//     opacity: 0.8,
//     textAlign: 'center',
//   },
//   // Error state styles
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 40,
//   },
//   errorTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: 'white',
//     marginBottom: 12,
//     textAlign: 'center',
//   },
//   errorText: {
//     fontSize: 16,
//     color: 'white',
//     opacity: 0.9,
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   retryButton: {
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.3)',
//   },
//   retryButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   // Refresh button
//   refreshButton: {
//     marginTop: 12,
//     backgroundColor: 'rgba(255,255,255,0.1)',
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.2)',
//   },
//   refreshButtonText: {
//     color: 'white',
//     fontSize: 14,
//     opacity: 0.9,
//   },
//   // Dynamic content styles
//   bulletContainer: {
//     marginTop: 8,
//   },
//   bulletPoint: {
//     fontSize: 16,
//     lineHeight: 24,
//     color: '#666',
//     marginBottom: 4,
//   },
//   contentText: {
//     fontSize: 16,
//     lineHeight: 24,
//     color: '#666',
//     marginTop: 8,
//   },
//   // Metadata styles
//   metadataContainer: {
//     backgroundColor: 'rgba(255,255,255,0.1)',
//     borderRadius: 8,
//     padding: 12,
//     marginTop: 20,
//   },
//   metadataText: {
//     fontSize: 12,
//     color: 'white',
//     opacity: 0.7,
//     textAlign: 'center',
//   },
// });