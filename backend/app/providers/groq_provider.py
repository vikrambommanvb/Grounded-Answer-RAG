"""Groq LLM Provider Adapter."""
from app.providers.base import BaseLLMProvider
from app.core.config import settings
from app.core.logging import logger

class GroqProvider(BaseLLMProvider):
    """Provider adapter for Groq Cloud API."""
    
    def __init__(self, api_key: str = None, model: str = None):
        self._api_key = api_key or settings.GROQ_API_KEY
        self._model = model or settings.GROQ_MODEL
        self._client = None
        
    @property
    def provider_name(self) -> str:
        return "groq"
        
    def _get_client(self):
        if not self._api_key:
            raise ValueError(
                "GROQ_API_KEY is not configured. Please supply a valid Groq API key or switch to deterministic test mode ('mock')."
            )
        if self._client is None:
            from groq import Groq
            self._client = Groq(api_key=self._api_key)
        return self._client

    def generate(self, prompt: str, system_instruction: str) -> str:
        """Call Groq chat completion API."""
        client = self._get_client()
        logger.info(f"Dispatching generation to Groq model: {self._model}")
        
        response = client.chat.completions.create(
            model=self._model,
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": prompt}
            ],
            temperature=0.0,  # Zero temperature for maximum policy fidelity
            max_tokens=1024
        )
        
        content = response.choices[0].message.content
        return content or ""
