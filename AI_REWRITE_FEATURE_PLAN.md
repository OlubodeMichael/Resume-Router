# AI Rewrite Feature - Implementation Plan

## Overview

This document outlines the complete plan for implementing an "AI Rewrite" feature that allows users to regenerate or rephrase individual sections of their resume using AI. The feature will help users improve clarity, tone, and phrasing while keeping the core content intact.

---

## 1. Architecture Overview

### Current System Understanding

- **Frontend**: React/Next.js with contenteditable HTML editor
- **Backend**: Node.js/Express with Prisma ORM
- **AI Integration**: LangChain with OpenAI (GPT-4o)
- **Data Storage**: PostgreSQL with JSON fields for resume content
- **Section Identification**: Sections use `data-section-type` attributes (e.g., "experience", "summary", "projects")
- **Content Format**: HTML in editor, JSON in database (conversion layer exists)

### Key Integration Points

1. **Section Detection**: Sections are identified via `data-section-type` attributes in the HTML
2. **Content Conversion**: `htmlToJsonConverter.ts` handles HTML ↔ JSON conversion
3. **AI Service**: `resume.service.ts` contains existing AI generation logic
4. **Credit System**: `credits.ts` handles feature gating via credit spending
5. **Editor**: `EditableTemplateRenderer` manages the contenteditable interface

---

## 2. Feature Flow

### User Journey

```
1. User views resume in editor
2. User clicks "Rewrite with AI" button on a section
3. System extracts section content (HTML → plain text)
4. Loading state shown
5. AI rewrites the section
6. Preview modal displays original vs rewritten
7. User can: Accept, Regenerate, or Cancel
8. If accepted: Update local state → Sync to database
```

---

## 3. Frontend Components

### 3.1 Section Rewrite Button Component

**Location**: `frontend/components/Dashboard/SectionRewriteButton.tsx`

**Purpose**: Button that appears on hover/click for each section

**Props**:

```typescript
interface SectionRewriteButtonProps {
  sectionType: string; // "experience", "summary", "projects", etc.
  sectionElement: HTMLElement; // The DOM element for the section
  onRewrite: (sectionType: string, originalContent: string) => void;
}
```

**Behavior**:

- Appears on section hover (similar to edit/delete buttons in ExperienceCard)
- Positioned near section header or as floating action button
- Shows loading state during rewrite
- Disabled if section is empty or locked (e.g., header section)

**Styling**:

- Use Tailwind CSS (per user preference)
- Minimal shadows (per user preference)
- Icon: Sparkles/Wand icon from lucide-react

### 3.2 Rewrite Preview Modal Component

**Location**: `frontend/components/Dashboard/RewritePreviewModal.tsx`

**Purpose**: Modal showing original vs rewritten content side-by-side

**Props**:

```typescript
interface RewritePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionType: string;
  originalContent: string; // Plain text or HTML
  rewrittenContent: string; // Plain text or HTML
  onAccept: (rewrittenContent: string) => void;
  onRegenerate: () => void;
  isRegenerating?: boolean;
  creditCost?: number; // Optional: show cost
}
```

**UI Layout**:

```
┌─────────────────────────────────────────────────┐
│  Rewrite Preview: [Section Name]          [X]   │
├──────────────────┬──────────────────────────────┤
│  Original        │  Rewritten                   │
│  ────────────    │  ────────────                │
│  [Content]       │  [Content]                    │
│                  │                               │
│                  │                               │
├──────────────────┴──────────────────────────────┤
│  [Cancel]  [Regenerate]  [Accept Changes]        │
└─────────────────────────────────────────────────┘
```

**Features**:

- Side-by-side comparison (or tabbed view for mobile)
- Highlight differences (optional enhancement)
- Scrollable content areas
- Loading state for "Regenerate" button
- Credit cost indicator (optional)

### 3.3 Integration with SectionReorderSidebar

**Location**: `frontend/components/Dashboard/SectionReorderSidebar.tsx`

**Changes Needed**:

- Add rewrite button to section context menu or hover state
- Pass section element reference to rewrite handler
- Handle section identification via `data-section-type`

### 3.4 Integration with Document Page

**Location**: `frontend/app/dashboard/documents/[id]/page.tsx`

**New State**:

```typescript
const [rewriteModalState, setRewriteModalState] = useState<{
  isOpen: boolean;
  sectionType: string;
  originalContent: string;
  rewrittenContent: string | null;
  isRegenerating: boolean;
} | null>(null);
```

**New Handlers**:

- `handleSectionRewrite`: Initiates rewrite request
- `handleAcceptRewrite`: Updates editor content and syncs to DB
- `handleRegenerateRewrite`: Requests new rewrite
- `handleCancelRewrite`: Closes modal without changes

---

## 4. Backend API Design

### 4.1 New Endpoint: POST `/api/resumes/:id/rewrite-section`

**Location**: `backend/src/routes/resumeRoute.ts` (add to existing routes)

**Request Body**:

```typescript
{
  sectionType: string; // "experience", "summary", "projects", etc.
  content: string; // Plain text content of the section
  tone?: string; // Optional: "professional", "concise", "impact-focused"
  jobDescriptionId?: string; // Optional: for context-aware rewriting
}
```

**Response**:

```typescript
{
  rewrittenContent: string; // Plain text rewritten content
  creditCost: number; // Credits used for this operation
  tokensUsed?: number; // Optional: token count
}
```

**Error Responses**:

- `400`: Invalid section type or empty content
- `401`: Unauthenticated
- `402`: Insufficient credits
- `404`: Resume not found
- `500`: AI generation failed

### 4.2 Controller Function

**Location**: `backend/src/controllers/resumeController.ts`

**Function**: `rewriteSection`

**Logic**:

1. Authenticate user
2. Verify resume ownership
3. Validate section type
4. Check credit balance (deduct before processing)
5. Extract plain text from content (strip HTML if needed)
6. Call AI service for section rewrite
7. Return rewritten content
8. Handle errors and refund credits if needed

### 4.3 AI Service Function

**Location**: `backend/src/services/resume.service.ts`

**Function**: `rewriteSectionWithAI`

**Input**:

```typescript
{
  sectionType: string;
  originalContent: string;
  tone?: string;
  jobDescriptionContext?: string; // Optional JD for context
  userId: string;
}
```

**AI Prompt Strategy**:

- Different prompts per section type (experience vs summary vs projects)
- Preserve factual information (dates, companies, metrics)
- Focus on improving clarity, tone, and phrasing
- Maintain professional language
- Keep quantifiable metrics intact

**Example Prompt Template**:

```
You are a professional resume writer. Rewrite the following [SECTION_TYPE] section
to improve clarity, tone, and professional phrasing while preserving all factual
information, dates, companies, and quantifiable metrics.

Tone preference: [tone || "professional"]

Original content:
{originalContent}

Requirements:
- Maintain all factual information (dates, companies, locations, metrics)
- Improve clarity and readability
- Use professional, impactful language
- Keep the same length (approximately)
- Preserve bullet point structure if applicable

Return ONLY the rewritten content, no explanations.
```

**Model Configuration**:

- Model: GPT-4o (same as existing generation)
- Temperature: 0.3-0.5 (lower than full generation for consistency)
- Max tokens: 500-1000 (section-specific)

---

## 5. Credit/Token Management

### 5.1 Credit Cost

**Recommended**: 1-2 credits per rewrite

- Lower than full resume generation (which uses more)
- Encourages usage while maintaining value

**Implementation**:

- Use `spendCreditsAtomic` from `credits.ts`
- Deduct before AI call
- Refund if AI call fails
- Track in `CreditLedger` with reason: `"rewrite-section:{sectionType}"`

### 5.2 Token Tracking (Optional)

- Track tokens used per rewrite
- Store in response for future analytics
- Could show in UI: "This rewrite used ~150 tokens"

---

## 6. Section-Specific Handling

### 6.1 Supported Sections

**Phase 1 (MVP)**:

- `summary` - Professional summary
- `objective` - Career objective
- `experience` - Experience entries (per entry or entire section)
- `projects` - Project descriptions
- `skills` - Skills section (if applicable)

**Phase 2 (Future)**:

- `education` - Education descriptions
- `certifications` - Certification descriptions
- `leadership` - Leadership roles
- `volunteer` - Volunteer work
- `awardsHonors` - Awards and honors

### 6.2 Section Content Extraction

**Location**: New utility function in `frontend/lib/sectionUtils.ts`

**Function**: `extractSectionContent`

**Logic**:

1. Find section element by `data-section-type`
2. Extract text content (strip HTML formatting for AI)
3. Preserve structure (bullet points, line breaks)
4. Return plain text with structure markers

**Example**:

```typescript
function extractSectionContent(sectionElement: HTMLElement): string {
  // Clone to avoid modifying original
  const clone = sectionElement.cloneNode(true) as HTMLElement;

  // Remove section header (h2)
  const header = clone.querySelector("h2");
  header?.remove();

  // Convert to plain text, preserving structure
  // Handle lists, paragraphs, etc.

  return plainTextContent;
}
```

### 6.3 Section Content Injection

**Location**: New utility function in `frontend/lib/sectionUtils.ts`

**Function**: `injectSectionContent`

**Logic**:

1. Find section element by `data-section-type`
2. Replace content (preserving section structure)
3. Maintain HTML formatting if needed
4. Trigger editor update event

---

## 7. Data Flow

### 7.1 Rewrite Request Flow

```
User clicks "Rewrite with AI"
  ↓
Frontend: Extract section content (HTML → plain text)
  ↓
Frontend: Show loading state
  ↓
Frontend: POST /api/resumes/:id/rewrite-section
  ↓
Backend: Authenticate, validate, check credits
  ↓
Backend: Deduct credits
  ↓
Backend: Call AI service (rewriteSectionWithAI)
  ↓
Backend: Return rewritten content
  ↓
Frontend: Show preview modal
```

### 7.2 Accept Flow

```
User clicks "Accept Changes"
  ↓
Frontend: Inject rewritten content into section
  ↓
Frontend: Update editor HTML
  ↓
Frontend: Trigger content change handler
  ↓
Frontend: Convert HTML to JSON (existing logic)
  ↓
Frontend: POST /api/resumes/:id (updateResume)
  ↓
Backend: Save to database
  ↓
Frontend: Show success toast
```

### 7.3 Regenerate Flow

```
User clicks "Regenerate"
  ↓
Frontend: Show loading state
  ↓
Frontend: POST /api/resumes/:id/rewrite-section (same request)
  ↓
Backend: Process (deduct credits again)
  ↓
Frontend: Update preview modal with new content
```

---

## 8. Error Handling

### 8.1 Frontend Errors

- **Network errors**: Show error toast, allow retry
- **Credit insufficient**: Show upgrade prompt
- **AI timeout**: Show timeout message, allow retry
- **Invalid section**: Disable button or show warning

### 8.2 Backend Errors

- **Credit check fails**: Return 402 with message
- **AI service fails**: Refund credits, return 500
- **Invalid section type**: Return 400 with valid types
- **Resume not found**: Return 404

---

## 9. UI/UX Considerations

### 9.1 Button Placement

- **Option A**: Floating button on section hover (top-right corner)
- **Option B**: Context menu item (right-click on section)
- **Option C**: Toolbar button when section is selected
- **Recommendation**: Option A (hover button) for discoverability

### 9.2 Loading States

- Button shows spinner during rewrite
- Modal shows skeleton/loading in preview area
- Disable actions during processing

### 9.3 Accessibility

- Keyboard navigation for modal
- ARIA labels for buttons
- Screen reader announcements for state changes
- Focus management (trap focus in modal)

### 9.4 Mobile Responsiveness

- Stacked comparison view on mobile (instead of side-by-side)
- Full-width buttons
- Touch-friendly button sizes

---

## 10. Implementation Phases

### Phase 1: MVP (Core Functionality)

1. ✅ Backend API endpoint
2. ✅ AI service function with basic prompt
3. ✅ Frontend rewrite button component
4. ✅ Preview modal component
5. ✅ Integration with document page
6. ✅ Credit deduction
7. ✅ Basic error handling

### Phase 2: Polish

1. ✅ Improved AI prompts (section-specific)
2. ✅ Better content extraction/injection
3. ✅ Enhanced error handling
4. ✅ Loading states and animations
5. ✅ Accessibility improvements

### Phase 3: Enhancements (Future)

1. Tone options (professional, concise, impact-focused)
2. Token/credit cost display
3. Diff highlighting (show changes)
4. Undo/redo for rewrites
5. Batch rewrite (multiple sections)
6. Context-aware rewriting (use job description)

---

## 11. Technical Considerations

### 11.1 Content Format Handling

- **Input**: HTML from editor → Convert to plain text for AI
- **Output**: Plain text from AI → Inject back as HTML (preserve structure)
- **Challenge**: Maintaining formatting (bold, lists, etc.)
- **Solution**: Strip formatting for AI, reapply basic structure on injection

### 11.2 Section Identification

- Use `data-section-type` attribute (already in place)
- Handle nested sections (e.g., multiple experience entries)
- Consider: Rewrite entire section vs. individual entries

### 11.3 State Management

- Modal state in document page component
- Editor content state (existing)
- Unsaved changes tracking (existing)

### 11.4 Performance

- Debounce rewrite requests (prevent spam)
- Cache recent rewrites (optional)
- Optimize AI prompt length

---

## 12. Testing Considerations

### 12.1 Unit Tests

- Content extraction function
- Content injection function
- Credit deduction logic
- AI prompt generation

### 12.2 Integration Tests

- End-to-end rewrite flow
- Error scenarios (insufficient credits, AI failure)
- Multiple section types

### 12.3 Manual Testing

- Test all supported section types
- Test with various content lengths
- Test error scenarios
- Test mobile responsiveness

---

## 13. Future Enhancements (Optional)

### 13.1 Tone Options

**UI**: Dropdown in rewrite button or modal
**Options**:

- Professional (default)
- Concise
- Impact-focused
- Technical
- Creative

**Implementation**: Pass `tone` parameter to AI prompt

### 13.2 Context-Aware Rewriting

**Feature**: Use job description for context
**Implementation**:

- Pass `jobDescriptionId` in request
- Include JD context in AI prompt
- Tailor rewrite to match JD keywords

### 13.3 Diff Highlighting

**Feature**: Show what changed in preview
**Implementation**:

- Use diff library (e.g., `diff` npm package)
- Highlight added/removed/changed text
- Side-by-side with color coding

### 13.4 Batch Rewrite

**Feature**: Rewrite multiple sections at once
**UI**: Checkboxes to select sections
**Implementation**: Parallel API calls, combined preview

### 13.5 Rewrite History

**Feature**: Show previous rewrites for a section
**Storage**: Store in database or local storage
**UI**: Dropdown to select from history

---

## 14. File Structure

### New Files to Create

```
frontend/
  components/
    Dashboard/
      SectionRewriteButton.tsx      # Rewrite button component
      RewritePreviewModal.tsx       # Preview modal component
  lib/
    sectionUtils.ts                 # Section content extraction/injection
backend/
  src/
    controllers/
      resumeController.ts            # Add rewriteSection function
    services/
      resume.service.ts              # Add rewriteSectionWithAI function
    routes/
      resumeRoute.ts                 # Add rewrite endpoint
```

### Files to Modify

```
frontend/
  app/dashboard/documents/[id]/page.tsx    # Add rewrite handlers
  components/Dashboard/SectionReorderSidebar.tsx  # Add rewrite button
backend/
  src/services/credits.ts                   # Ensure credit deduction works
```

---

## 15. API Examples

### Request Example

```bash
POST /api/resumes/123/rewrite-section
Authorization: Bearer <token>
Content-Type: application/json

{
  "sectionType": "experience",
  "content": "Developed web applications using React and Node.js. Improved performance by 30%.",
  "tone": "professional"
}
```

### Response Example

```json
{
  "rewrittenContent": "Engineered scalable web applications leveraging React and Node.js, achieving a 30% performance improvement through optimization techniques.",
  "creditCost": 1,
  "tokensUsed": 45
}
```

---

## 16. Success Metrics

### Key Metrics to Track

- Number of rewrites per user
- Acceptance rate (accept vs. regenerate vs. cancel)
- Average credits spent per user
- Most rewritten section types
- Time to rewrite (performance)

### Analytics Events

- `rewrite_initiated` - User clicked rewrite button
- `rewrite_completed` - AI returned result
- `rewrite_accepted` - User accepted changes
- `rewrite_regenerated` - User requested new rewrite
- `rewrite_cancelled` - User closed modal without accepting

---

## 17. Security Considerations

### 17.1 Authentication

- Verify user owns the resume
- Check authentication on every request

### 17.2 Rate Limiting

- Prevent abuse (too many rewrites)
- Consider: Max rewrites per minute/hour

### 17.3 Content Validation

- Sanitize user input
- Validate section types
- Check content length limits

### 17.4 Credit Protection

- Atomic credit deduction
- Refund on failure
- Prevent double-spending

---

## 18. Dependencies

### New NPM Packages (if needed)

- None required (use existing dependencies)
- Optional: `diff` package for diff highlighting (future)

### Existing Dependencies Used

- `@langchain/openai` - AI integration
- `lucide-react` - Icons
- React/Next.js - UI framework
- Prisma - Database ORM

---

## 19. Rollout Plan

### Phase 1: Development

1. Backend API and AI service
2. Frontend components
3. Integration and testing

### Phase 2: Beta Testing

1. Internal testing
2. Limited user beta
3. Gather feedback

### Phase 3: Production

1. Full rollout
2. Monitor metrics
3. Iterate based on usage

---

## 20. Open Questions / Decisions Needed

1. **Credit Cost**: Finalize cost per rewrite (1 or 2 credits?)
2. **Section Granularity**: Rewrite entire section or individual entries?
3. **Formatting Preservation**: How much HTML formatting to preserve?
4. **Job Description Context**: Include JD context in MVP or Phase 2?
5. **Tone Options**: Include in MVP or Phase 2?
6. **Mobile UX**: Side-by-side or stacked comparison on mobile?

---

## Conclusion

This plan provides a comprehensive roadmap for implementing the AI Rewrite feature. The phased approach allows for iterative development and testing, ensuring a high-quality feature that integrates seamlessly with the existing codebase.

**Next Steps**:

1. Review and approve plan
2. Finalize open questions
3. Begin Phase 1 implementation
4. Set up testing environment
5. Create feature branch
