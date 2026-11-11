"""Factory for instantiating LLM Provider Adapters."""
from typing import Optional
from app.providers.base import BaseLLMProvider
from app.providers.mock_provider import MockLLMProvider
from app.providers.groq_provider import GroqProvider
from app.core.config import settings

def get_provider(provider_name: Optional[str] = None) -> BaseLLMProvider:
    """
    Get configured LLM provider adapter.
    Defaults to settings.DEFAULT_PROVIDER ('mock').
    """
    name = (provider_name or settings.DEFAULT_PROVIDER).lower().strip()
    
    if name == "groq":
        return GroqProvider()
    elif name == "mock":
        return MockLLMProvider()
    else:
        # Default fallback to deterministic mock provider
        return MockLLMProvider()
