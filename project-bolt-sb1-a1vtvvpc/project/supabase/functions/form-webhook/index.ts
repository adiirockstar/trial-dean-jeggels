/*
  # Form Webhook Handler

  This edge function handles webhook requests after form submissions.
  It can be used to:
  - Send notification emails
  - Integrate with third-party services
  - Log analytics events
  - Trigger business workflows
*/

interface FormSubmission {
  id: string;
  name: string;
  email: string;
  company?: string;
  message: string;
  category: string;
  file_paths: string[];
  created_at: string;
}

interface WebhookPayload {
  submission: FormSubmission;
  files: string[];
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse the request body
    const payload: WebhookPayload = await req.json();
    const { submission, files } = payload;

    // Log the submission (in production, you might want to send this to a logging service)
    console.log("New form submission received:", {
      id: submission.id,
      name: submission.name,
      email: submission.email,
      category: submission.category,
      fileCount: files.length,
      timestamp: submission.created_at
    });

    // Here you can add your custom webhook logic:
    // 1. Send notification emails
    // 2. Integrate with CRM systems
    // 3. Send to Slack/Discord
    // 4. Trigger automation workflows
    // 5. Send analytics events

    // Example: Send a notification email (you would implement this)
    await sendNotificationEmail(submission);

    // Example: Post to Slack (you would implement this)
    await postToSlack(submission);

    // Example: Log analytics event (you would implement this)
    await logAnalyticsEvent('form_submission', {
      category: submission.category,
      hasFiles: files.length > 0,
      fileCount: files.length
    });

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Webhook processed successfully",
        submissionId: submission.id
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Webhook error:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Placeholder functions for common webhook integrations
// Replace these with your actual implementations

async function sendNotificationEmail(submission: FormSubmission) {
  // Example: Send email using a service like SendGrid, Mailgun, etc.
  console.log(`Would send notification email for submission from ${submission.email}`);
  
  // Example implementation:
  // const emailService = new EmailService();
  // await emailService.send({
  //   to: 'admin@yourcompany.com',
  //   subject: `New form submission from ${submission.name}`,
  //   template: 'new-submission',
  //   data: submission
  // });
}

async function postToSlack(submission: FormSubmission) {
  // Example: Post to Slack webhook
  console.log(`Would post to Slack about submission from ${submission.name}`);
  
  // Example implementation:
  // const slackWebhookUrl = Deno.env.get('SLACK_WEBHOOK_URL');
  // if (slackWebhookUrl) {
  //   await fetch(slackWebhookUrl, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({
  //       text: `New form submission from ${submission.name} (${submission.email})`,
  //       blocks: [
  //         {
  //           type: "section",
  //           text: {
  //             type: "mrkdwn",
  //             text: `*New Form Submission*\n*Name:* ${submission.name}\n*Email:* ${submission.email}\n*Category:* ${submission.category}`
  //           }
  //         }
  //       ]
  //     })
  //   });
  // }
}

async function logAnalyticsEvent(eventName: string, properties: Record<string, any>) {
  // Example: Send to analytics service
  console.log(`Would log analytics event: ${eventName}`, properties);
  
  // Example implementation:
  // const analyticsService = new AnalyticsService();
  // await analyticsService.track(eventName, properties);
}