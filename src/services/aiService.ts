export interface GeneratedBirthdayContent {
  openingWish: string;
  intro: string;
  story: string;
  photoCaptions: string[];
  innerCircleIntro: string;
  vaultIntro: string;
  surpriseText?: string;
  finalWish: string;
}

export type RegenerableSection = 
  | 'openingWish'
  | 'intro'
  | 'story'
  | 'innerCircleIntro'
  | 'vaultIntro'
  | 'surpriseText'
  | 'finalWish';

export interface GenerateBirthdayContentRequest {
  recipientName: string;
  relationship?: string;
  customRelationship?: string;
  milestoneAge?: number;
  birthdayDate?: string;
  senderName?: string;
  creatorMessage?: string;
  photoCount: number;
  hasSurprisePhoto: boolean;
  template?: string;
}

export interface RegenerateSectionRequest {
  section: RegenerableSection;
  recipientName: string;
  relationship?: string;
  customRelationship?: string;
  milestoneAge?: number;
  creatorMessage?: string;
  senderName?: string;
  currentValue?: string;
  template?: string;
}

/**
 * Generate full initial 7-act cinematic birthday story content via Gemini.
 */
export async function generateBirthdayContent(
  req: GenerateBirthdayContentRequest
): Promise<GeneratedBirthdayContent> {
  try {
    const res = await fetch('/api/ai/generate-birthday-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });

    if (!res.ok) {
      throw new Error(`AI server responded with status: ${res.status}`);
    }

    const data = await res.json();
    return data.content as GeneratedBirthdayContent;
  } catch (error) {
    // Fail safely with high-grade fallback content so the creator is never blocked
    return generateFallbackContent(req);
  }
}

/**
 * Regenerate an individual section without modifying other sections.
 */
export async function regenerateSection(
  req: RegenerateSectionRequest
): Promise<string> {
  try {
    const res = await fetch('/api/ai/regenerate-section', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });

    if (!res.ok) {
      throw new Error(`AI server responded with status: ${res.status}`);
    }

    const data = await res.json();
    return data.text as string;
  } catch (error) {
    return generateFallbackSection(req);
  }
}

/**
 * Safe local fallback generator preserving creator intent if API is offline.
 */
function generateFallbackContent(req: GenerateBirthdayContentRequest): GeneratedBirthdayContent {
  const name = req.recipientName || 'Alex';
  const age = req.milestoneAge ? `${req.milestoneAge}th` : '';
  const rel = req.relationship === 'Other' ? req.customRelationship : req.relationship;

  const openingWish = req.creatorMessage && req.creatorMessage.trim().length > 10
    ? req.creatorMessage.trim()
    : `Happy Birthday, ${name}! Today is a tribute to every laugh, journey, and quiet adventure that makes you irreplaceable.`;

  const intro = req.milestoneAge
    ? `${req.milestoneAge} Orbits Around The Sun`
    : 'A Tribute to Unforgettable Moments';

  const story = req.creatorMessage && req.creatorMessage.trim().length > 15
    ? req.creatorMessage
    : `From early dawn departures to late-night conversations under starlit skies, your steady light and relentless kindness continue to inspire everyone lucky enough to share this journey with you.`;

  const innerCircleIntro = rel
    ? `An intimate circle of those who know your light best—celebrating our cherished bond as ${rel.toLowerCase()}.`
    : `A sacred constellation of the memories and people closest to your heart.`;

  const vaultIntro = 'Some moments are too precious for ordinary days. Here they are preserved eternally in the 3D vault.';

  const surpriseText = req.hasSurprisePhoto
    ? 'A confidential memory unlocked exclusively for your eyes.'
    : undefined;

  const finalWish = `May the year ahead bring the same unyielding joy, laughter, and courage that you give to the world every single day. Happy ${age} Birthday, ${name}.`;

  return {
    openingWish,
    intro,
    story,
    photoCaptions: Array.from({ length: req.photoCount }).map((_, i) => `Chapter ${i + 1} Memory`),
    innerCircleIntro,
    vaultIntro,
    surpriseText,
    finalWish,
  };
}

function generateFallbackSection(req: RegenerateSectionRequest): string {
  const name = req.recipientName || 'Alex';
  const rel = req.relationship === 'Other' ? req.customRelationship : req.relationship;

  switch (req.section) {
    case 'openingWish':
      return `To ${name}: on your special day, we honor the boundless warmth, curiosity, and steady grace you bring to everyone around you.`;
    case 'intro':
      return req.milestoneAge
        ? `Celebrating ${req.milestoneAge} Remarkable Years`
        : 'A Motion Picture of Cherished Moments';
    case 'story':
      return `Every road taken and every story lived has led to this moment. Today we celebrate not just the passage of time, but the laughter, grit, and joy that define your extraordinary character.`;
    case 'innerCircleIntro':
      return `The people who stood by you through every storm and celebrated every sunrise—the true inner constellation of your world.`;
    case 'vaultIntro':
      return `Time moves forward, but memories remain anchored here. Sealed inside your personal 3D digital vault.`;
    case 'surpriseText':
      return `One final secret from the archives—unsealed in celebration of who you are.`;
    case 'finalWish':
      return `Here is to the next chapter of bold adventures, deep peace, and boundless light. Happy Birthday, ${name}!`;
    default:
      return req.currentValue || '';
  }
}
