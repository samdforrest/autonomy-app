# Assessment System Implementation Guide 🎯

## Overview

This guide explains how to implement the multi-select assessment system that determines module priority order based on user responses.

## System Architecture

### 1. Google Docs Structure

Create an "Assessment Questions" tab in your Google Doc with this format:

```
| Question/Option | Score |
|-----------------|-------|
| Mistakes: During a project presentation, you mispronounce a term and state an incorrect fact. How do you usually feel about this kind of mistake? | |
| I feel embarrassed and believe mistakes should be avoided at all costs | 3 |
| I see it as a valuable opportunity to learn and improve in the future | 1 |
| I think it's somewhat helpful, but I prefer to avoid making mistakes in presentations | 2 |
| | |
| My Job, Your Job: When working on a team project, how do you typically handle task distribution? | |
| I prefer to take on most tasks myself to ensure they're done correctly | 3 |
| I collaborate closely with teammates to divide tasks based on strengths | 1 |
| I'm comfortable delegating but like to check in frequently | 2 |
```

**Key Format Rules:**
- Module tags start questions: `"Module Name: Question text"`
- Options have scores in the last column (1-3)
- Higher scores = higher priority/need for that module
- Empty rows separate question groups

### 2. Module Mapping

The system automatically maps module prefixes to module IDs:

| Prefix Pattern | Module ID | Display Name |
|---------------|-----------|--------------|
| "Mistakes" | `mistakes` | Mistakes |
| "Job", "Work" | `job` | Responsibility |
| "Regulation", "Control", "Emotion" | `regulation` | Regulation |
| "Collaboration", "Team" | `collaboration` | Collaboration |
| "Monitor", "Monitoring" | `selfmonitoring` | Self-Monitoring |
| "Coach", "Self-Coach" | `selfcoach` | Self-Coaching |
| "Curiosity", "Wonder" | `curiosity` | Curiosity |
| "Shape", "Learning" | `shapeoflearning` | Shape of Learning |
| "Neuroplasticity", "Growth", "Brain" | `neuroplasticity` | Neuroplasticity |
| "Mastery", "Moment" | `masterymoments` | Mastery Moments |

### 3. Scoring System

**Multi-Select Logic:**
- Users can select multiple options per question
- Each selected option adds its score to the question's module
- Final module scores = sum of all selected option scores for that module
- Modules ranked by total score (highest = highest priority)

**Example Calculation:**
```javascript
// Question 1 (Mistakes module): User selects options with scores 3 and 2
mistakes: 5 points

// Question 2 (Job module): User selects option with score 1  
job: 1 point

// Question 3 (Regulation module): User selects options with scores 3, 2, 1
regulation: 6 points

// Final ranking: Regulation (6) > Mistakes (5) > Job (1)
```

## Implementation Files

### 1. Enhanced Document Parser (`functions/services/document-parser.js`)

**New Methods Added:**
- `isAssessmentTable()` - Detects assessment tables by score patterns
- `parseAssessmentTable()` - Parses questions with module tagging
- `mapModulePrefix()` - Maps module prefixes to IDs
- `extractCellText()` - Extracts text from table cells

**Usage:**
```javascript
// Automatically detects and parses assessment tables
const parser = new DocumentParser();
const result = parser.parseDocument(document, { tab: 'Assessment Questions' });
// result.contentBlocks will contain assessment data
```

### 2. Assessment Service (`services/assessment-service.ts`)

**Key Features:**
- Module priority calculation
- Local storage for results
- Assessment completion tracking
- Results summary generation

**Usage:**
```typescript
import { assessmentService } from '../services/assessment-service';

// Calculate priorities
const priorities = assessmentService.calculateModulePriorities(responses, questions);

// Save results
const summary = assessmentService.generateAssessmentSummary(priorities);
assessmentService.saveAssessmentResults(summary);

// Check completion
const hasCompleted = assessmentService.hasCompletedAssessment();
```

### 3. UI Components

**AssessmentQuestion Component (`components/AssessmentQuestion.tsx`):**
- Multi-select checkboxes
- Module color coding
- Score badges
- Selection counter

**Assessment Screen (`app/assessment.tsx`):**
- Question progression
- Results visualization
- Module priority display
- Navigation integration

## Integration Steps

### Step 1: Update Your Google Doc

1. Create "Assessment Questions" tab
2. Add questions using the format above
3. Ensure module prefixes are consistent
4. Test table structure

### Step 2: Update Document References

```typescript
// In services/api.ts or your document config
export const DOCUMENT_REFS = {
  MAIN_DOCUMENT: 'your-google-doc-id',
  // ... other refs
};
```

### Step 3: Add Assessment Route

```typescript
// In app/_layout.tsx or routing config
import AssessmentScreen from './assessment';

// Add route for /assessment
```

### Step 4: Integrate with Module Navigation

```typescript
// In your main module screen or navigation
import { assessmentService } from '../services/assessment-service';

// Check if assessment completed
const hasAssessment = assessmentService.hasCompletedAssessment();
const results = assessmentService.loadAssessmentResults();

// Use results.recommendedOrder to sort modules
```

## Testing the System

### 1. Test Data Structure

Create test questions in your Google Doc:

```
Mistakes: Test question about mistake handling?
Option A with high need | 3
Option B with medium need | 2  
Option C with low need | 1

Regulation: Test question about emotional control?
High emotional response | 3
Moderate response | 2
Good control | 1
```

### 2. Verify Parsing

```javascript
// Check console logs for parsing results
// Should see: "🎯 Assessment parsing complete: {questionsFound: 2, ...}"
```

### 3. Test Scoring

```javascript
// Test responses
const testResponses = [
  { questionId: 'assessment_q_0', selectedOptionIds: ['option_0', 'option_1'] },
  { questionId: 'assessment_q_1', selectedOptionIds: ['option_2'] }
];

// Should calculate correct module scores
```

## Customization Options

### 1. Module Mapping

Update `mapModulePrefix()` in document-parser.js:

```javascript
mapModulePrefix(prefix) {
  const lowerPrefix = prefix.toLowerCase();
  
  // Add your custom mappings
  if (lowerPrefix.includes('custom')) return 'custom_module';
  
  // ... existing mappings
}
```

### 2. Scoring Algorithm

Modify `calculateModulePriorities()` in assessment-service.ts:

```typescript
// Add weighted scoring
response.selectedOptionIds.forEach(optionId => {
  const option = question.options.find(opt => opt.id === optionId);
  if (option) {
    // Apply custom weighting
    const weight = this.getQuestionWeight(question.module);
    this.moduleScores[question.module] += option.score * weight;
  }
});
```

### 3. UI Styling

Update styles in AssessmentQuestion.tsx and assessment.tsx to match your app's design system.

## Troubleshooting

### Common Issues

1. **Questions not parsing:**
   - Check table format in Google Docs
   - Verify "Assessment Questions" tab name
   - Ensure score column has numbers 1-3

2. **Module mapping errors:**
   - Check console logs for module prefix detection
   - Verify module prefixes match expected patterns
   - Update `mapModulePrefix()` if needed

3. **Scoring calculation issues:**
   - Verify response format matches expected structure
   - Check that all questions have valid module assignments
   - Ensure options have numeric scores

### Debug Logging

Enable detailed logging:

```javascript
// In document-parser.js
console.log('🎯 Assessment parsing complete:', {
  questionsFound: assessmentData.questions.length,
  moduleBreakdown: this.getModuleBreakdown(assessmentData.questions)
});

// In assessment-service.ts  
console.log('📊 Final module priorities:', sortedModules);
```

## Next Steps

1. **Test with real data** - Create actual assessment questions
2. **Integrate with navigation** - Use results to order modules
3. **Add analytics** - Track assessment completion and results
4. **Enhance UI** - Add progress indicators, animations
5. **Add validation** - Ensure data quality and error handling

## API Integration

The system integrates with your existing Google Docs API setup. No additional API endpoints needed - it uses the same document parsing pipeline with enhanced table detection for assessments.

---

**Ready to implement?** Start by creating the "Assessment Questions" tab in your Google Doc, then test the parsing with a few sample questions!
