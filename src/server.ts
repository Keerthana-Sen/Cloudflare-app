import { AIChatAgent } from "@cloudflare/ai-chat";
import { createWorkersAI } from "workers-ai-provider";
import { streamText, convertToModelMessages } from "ai";
import { routeAgentRequest } from "agents";

export class ChatAgent extends AIChatAgent<Env> {
  async onChatMessage() {
    const workersai = createWorkersAI({ binding: this.env.AI });
    const result = streamText({
      //model: workersai("@cf/zai-org/glm-4.7-flash"),
       model: workersai("@cf/meta/llama-3.3-70b-instruct-fp8-fast"), 
      system: "You are a helpful assistant.",
      messages: await convertToModelMessages(this.messages),
    });
    return result.toUIMessageStreamResponse();
  }
}

export default {
  async fetch(request: Request, env: Env) {
    return (await routeAgentRequest(request, env)) || new Response("Not found", { status: 404 });
  },
};