import os
from typing import Dict, Tuple

from dotenv import load_dotenv
from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer
import anthropic

# Load environment variables
load_dotenv()

class OrdinAIEngine:
    def __init__(self):
        print("Initializing OrdinAI Core...")
        
        # 1. Initialize Local Embedder
        self.embedder = SentenceTransformer('BAAI/bge-large-en-v1.5', device='cpu') 
        
        # 2. Connect to Qdrant Cloud
        self.qdrant = QdrantClient(
            url=os.getenv("QDRANT_URL"), 
            api_key=os.getenv("QDRANT_API_KEY")
        )
        self.collection_name = "ordinai_finance"
        
        # 3. Connect to Claude
        self.claude = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        
    def retrieve_context(self, query: str, top_k: int = 6) -> Dict[str, str]:
        """Embeds the query and fetches the best Parent Nodes from Qdrant."""
        print(f"Searching database for: '{query}'")
        
        try:
            query_vector = self.embedder.encode(query).tolist()
            
            search_response = self.qdrant.query_points(
                collection_name=self.collection_name,
                query=query_vector,
                limit=top_k
            )
            
            unique_parents = {}
            for hit in search_response.points:
                source = hit.payload.get('source_file', 'Unknown Source')
                parent_text = hit.payload.get('parent_text', '')
                
                # source_file -> parent_text for frontend compatibility
                if source not in unique_parents:
                    unique_parents[source] = parent_text
                    
            return unique_parents
        except Exception as e:
            print(f"Qdrant Search Error: {e}")
            return {}

    def generate_answer(self, query: str) -> Tuple[str, Dict[str, str]]:
        """Retrieves context and asks Claude to generate a cited response."""
        
        contexts = self.retrieve_context(query)
        
        if not contexts:
            return "I couldn't find relevant information in the regulatory database. Please try rephrasing your query.", {}

        formatted_context = ""
        # Now contexts is {source: text}, so iterate accordingly
        for i, (source, text) in enumerate(contexts.items(), 1):
            formatted_context += f"--- DOCUMENT {i} (Source: {source}) ---\n{text}\n\n"

        # Improved Prompt: Allows synthesis while maintaining citations
        system_prompt = (
            "You are OrdinAI, an advanced financial compliance assistant for the Indian BFSI sector. "
            "Use the provided Document Context to answer the user's query comprehensively. "
            "If the exact answer is not available, summarize the closest relevant regulations found in the context. "
            "If the context is completely irrelevant, state: 'I cannot find this in the current database.' "
            "CRITICAL RULES:\n"
            "1. You MUST cite the source file for EVERY major claim using this exact format: [Source: filename.pdf].\n"
            "2. Format your response with clear Markdown headings (H2, H3) and bullet points."
        )

        user_prompt = f"Context Documents:\n{formatted_context}\n\nUser Query: {query}"

        print("Generating response via Claude...")

        try:
            # Using the messages API which is the current standard
            response = self.claude.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=1500,
                system=system_prompt,
                messages=[
                    {"role": "user", "content": user_prompt}
                ]
            )
            return response.content[0].text, contexts
        except Exception as e:
            error_msg = str(e)
            print(f"Claude API Error: {error_msg}")
            
            # Provide more helpful error messages
            if "api_key" in error_msg.lower() or "authentication" in error_msg.lower():
                return "Error: Invalid or missing Anthropic API key. Please check your .env file.", contexts
            elif "rate_limit" in error_msg.lower():
                return "Error: Rate limit exceeded. Please try again later.", contexts
            elif "model" in error_msg.lower():
                return "Error: Invalid model specified. Please check the model name.", contexts
            else:
                # Return a user-friendly error message
                return f"An error occurred while generating the report. Please check the backend logs for details.", contexts

    def close(self):
        self.qdrant.close()

if __name__ == "__main__":
    engine = OrdinAIEngine()
    test_query = "Summarize the Responsible Business Conduct framework for Small Finance Banks regarding Customer Service."
    answer, used_context = engine.generate_answer(test_query)
    print("\n" + "="*50)
    print(answer)
    engine.close()

