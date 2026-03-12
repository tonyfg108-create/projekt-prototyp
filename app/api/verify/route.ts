import { generateText, Output } from 'ai'
import { z } from 'zod'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// AI verification schema
const verificationSchema = z.object({
  isValid: z.boolean().describe('Whether the before/after photos show real environmental improvement'),
  confidenceScore: z.number().min(0).max(100).describe('Confidence score from 0-100'),
  trashDetectedBefore: z.number().nullable().describe('Estimated number of trash items in before photo'),
  trashDetectedAfter: z.number().nullable().describe('Estimated number of trash items in after photo'),
  estimatedKgRemoved: z.number().nullable().describe('Estimated kg of trash removed based on visual analysis'),
  sceneSimilarity: z.number().min(0).max(100).describe('How similar the scenes are (should be high for same location)'),
  fraudIndicators: z.array(z.string()).describe('Any detected fraud indicators'),
  analysis: z.string().describe('Brief analysis of the environmental improvement'),
  recommendation: z.enum(['approve', 'reject', 'manual_review']).describe('Recommendation for submission'),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { submissionId } = await request.json()

    if (!submissionId) {
      return NextResponse.json({ error: 'Missing submission ID' }, { status: 400 })
    }

    // Fetch the submission
    const { data: submission, error: fetchError } = await supabase
      .from('task_submissions')
      .select('*, task:tasks(*)')
      .eq('id', submissionId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    if (!submission.before_photo_url || !submission.after_photo_url) {
      return NextResponse.json({ error: 'Missing photos' }, { status: 400 })
    }

    // Call OpenAI Vision to analyze the images
    const result = await generateText({
      model: 'openai/gpt-4o',
      output: Output.object({ schema: verificationSchema }),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are an AI verification system for environmental cleanup tasks. Analyze these before and after photos to verify if a real cleanup task was completed.

Task Details:
- Title: ${submission.task?.title || 'Environmental cleanup'}
- Category: ${submission.task?.category || 'cleanup'}
- Description: ${submission.task?.description || 'Clean the area'}

VERIFICATION CRITERIA:
1. Scene Similarity: Both photos should show the same location (at least 70% similarity)
2. Trash Detection: Before photo should show more trash/debris than after photo
3. Time Consistency: Photos should appear to be taken at similar times (lighting, weather)
4. Fraud Detection: Look for signs of manipulation, stock photos, or fake submissions

FRAUD INDICATORS TO CHECK:
- Different locations in before/after
- Stock photos or images from the internet
- Obvious photo manipulation
- Unrelated images
- Same exact photo with minor edits
- Photos that don't match the task category

Provide your analysis and recommendation.`,
            },
            {
              type: 'image',
              image: submission.before_photo_url,
            },
            {
              type: 'image',
              image: submission.after_photo_url,
            },
          ],
        },
      ],
    })

    const verification = result.output

    // Calculate tokens and impact based on verification
    let tokensAwarded = 0
    let impactAwarded = 0
    let newStatus: 'approved' | 'rejected' | 'manual_review' = 'manual_review'

    if (verification.recommendation === 'approve' && verification.confidenceScore >= 70) {
      tokensAwarded = submission.task?.token_reward || 10
      impactAwarded = submission.task?.impact_points || 5
      newStatus = 'approved'
    } else if (verification.recommendation === 'reject' || verification.confidenceScore < 40) {
      newStatus = 'rejected'
    } else {
      newStatus = 'manual_review'
    }

    // Update the submission with AI analysis
    const { error: updateError } = await supabase
      .from('task_submissions')
      .update({
        status: newStatus,
        ai_confidence_score: verification.confidenceScore,
        ai_analysis: verification,
        ai_trash_detected_before: verification.trashDetectedBefore,
        ai_trash_detected_after: verification.trashDetectedAfter,
        ai_estimated_kg_removed: verification.estimatedKgRemoved,
        tokens_awarded: tokensAwarded,
        impact_awarded: impactAwarded,
        completed_at: new Date().toISOString(),
      })
      .eq('id', submissionId)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 })
    }

    // If approved, create token transaction
    if (newStatus === 'approved') {
      await supabase.from('token_transactions').insert({
        user_id: user.id,
        amount: tokensAwarded,
        transaction_type: 'task_reward',
        description: `Reward for completing: ${submission.task?.title}`,
        related_task_id: submission.task_id,
      })

      // Update global stats
      const { data: stats } = await supabase
        .from('global_stats')
        .select('*')
        .single()

      if (stats) {
        await supabase
          .from('global_stats')
          .update({
            total_tasks_completed: stats.total_tasks_completed + 1,
            total_trash_kg: stats.total_trash_kg + (verification.estimatedKgRemoved || 0),
            total_tokens_distributed: stats.total_tokens_distributed + tokensAwarded,
            updated_at: new Date().toISOString(),
          })
          .eq('id', stats.id)
      }
    }

    return NextResponse.json({
      success: true,
      status: newStatus,
      verification: {
        confidenceScore: verification.confidenceScore,
        analysis: verification.analysis,
        recommendation: verification.recommendation,
        tokensAwarded,
        impactAwarded,
      },
    })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
