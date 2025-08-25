/*
  # Personal Codex Agent Webhook Handler

  This edge function processes form submissions for the Personal Codex Agent.
  It handles the JSON data structure as specified:
  - cv: string or object format
  - supporting_docs: single document or array of documents  
  - mode: agent interaction mode
  - message: initial user message

  The function can be extended to:
  - Process text chunking for RAG
  - Generate session contexts
  - Initialize AI agent training
  - Send notifications
  - Integrate with vector databases
*/

interface CodexSubmission {
  id?: string;
  cv: string | {
    file_path: string;
    content: string;
    filename: string;
    type: string;
  };
  supporting_docs: Array<{
    file_path: string;
    content: string;
    filename: string;
    type: string;
  }> | {
    file_path: string;
    content: string;
    filename: string;
    type: string;
  };
  mode: string;
  message: string;
  session_id: string;
  created_at: string;
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
    const submission: CodexSubmission = await req.json();

    // Log the submission for debugging
    console.log("Personal Codex Agent submission received:", {
      session_id: submission.session_id,
      mode: submission.mode,
      cv_type: typeof submission.cv,
      supporting_docs_count: Array.isArray(submission.supporting_docs) 
        ? submission.supporting_docs.length 
        : submission.supporting_docs ? 1 : 0,
      timestamp: submission.created_at
    });

    // Process the CV content for RAG chunking
    const cvContent = await processCvContent(submission.cv);
    
    // Process supporting documents
    const supportingContent = await processSupportingDocs(submission.supporting_docs);
    
    // Create comprehensive context object
    const contextObject = await createContextObject({
      cv: cvContent,
      supporting_docs: supportingContent,
      mode: submission.mode,
      message: submission.message,
      session_id: submission.session_id
    });

    // Initialize the context-aware agent
    await initializeAgent(contextObject);

    // Send success notification (optional)
    await sendNotification(submission);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Personal Codex Agent created successfully",
        session_id: submission.session_id,
        context_chunks: contextObject.chunks?.length || 0,
        agent_initialized: true
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Codex webhook error:", error);
    
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

async function processCvContent(cv: string | object): Promise<any> {
  console.log("Processing CV content...");
  
  if (typeof cv === 'string') {
    // Direct text content
    return {
      type: 'text',
      content: cv,
      chunks: chunkText(cv)
    };
  } else {
    // Object with file metadata and content
    const cvObj = cv as any;
    return {
      type: 'file',
      filename: cvObj.filename,
      file_type: cvObj.type,
      content: cvObj.content,
      chunks: chunkText(cvObj.content)
    };
  }
}

async function processSupportingDocs(docs: any): Promise<any[]> {
  console.log("Processing supporting documents...");
  
  if (!docs) return [];
  
  // Handle both single document and array of documents
  const docsArray = Array.isArray(docs) ? docs : [docs];
  
  return docsArray.map((doc: any) => ({
    filename: doc.filename,
    file_type: doc.type,
    content: doc.content,
    chunks: chunkText(doc.content)
  }));
}

async function createContextObject(data: any): Promise<any> {
  console.log("Creating comprehensive context object...");
  
  // Combine all text chunks for RAG processing
  const allChunks = [
    ...data.cv.chunks,
    ...data.supporting_docs.flatMap((doc: any) => doc.chunks)
  ];
  
  return {
    session_id: data.session_id,
    mode: data.mode,
    initial_message: data.message,
    cv_content: data.cv,
    supporting_documents: data.supporting_docs,
    chunks: allChunks,
    metadata: {
      total_chunks: allChunks.length,
      cv_type: data.cv.type,
      supporting_docs_count: data.supporting_docs.length,
      created_at: new Date().toISOString()
    }
  };
}

async function initializeAgent(context: any): Promise<void> {
  console.log(`Initializing agent for session: ${context.session_id}`);
  
  // Here you would typically:
  // 1. Store context chunks in a vector database
  // 2. Initialize the RAG pipeline
  // 3. Set up the conversational AI agent
  // 4. Configure the agent based on the specified mode
  
  // Example initialization logic:
  // await vectorDB.storeEmbeddings(context.chunks, context.session_id);
  // await agentService.initialize(context);
  
  console.log("Agent initialization completed");
}

async function sendNotification(submission: CodexSubmission): Promise<void> {
  console.log("Sending notification for new Personal Codex Agent creation");
  
  // Example: Send email notification, Slack message, etc.
  // This is where you would integrate with your notification service
  
  // Example implementation:
  // await emailService.send({
  //   to: 'admin@yourcompany.com',
  //   subject: 'New Personal Codex Agent Created',
  //   template: 'codex-agent-created',
  //   data: {
  //     session_id: submission.session_id,
  //     mode: submission.mode,
  //     created_at: submission.created_at
  //   }
  // });
}

function chunkText(text: string, chunkSize: number = 500, overlap: number = 50): string[] {
  // Simple text chunking for RAG processing
  const chunks: string[] = [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  let currentChunk = '';
  
  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (currentChunk.length + trimmedSentence.length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      
      // Add overlap by keeping the last part of the previous chunk
      const words = currentChunk.split(' ');
      const overlapWords = words.slice(-Math.floor(overlap / 10));
      currentChunk = overlapWords.join(' ') + ' ' + trimmedSentence;
    } else {
      currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
    }
  }
  
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks.length > 0 ? chunks : [text]; // Fallback to original text if no chunks created
}