"""Abstract Base Class for LLM Provider Adapters."""
from abc import ABC, abstractmethod

class BaseLLMProvider(ABC):
    """Abstract interface for pluggable LLM providers."""
    
    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Name of the provider e.g. mock, groq, openai."""
        pass
        
    @abstractmethod
    def generate(self, prompt: str, system_instruction: str) -> str:
        """Generate response text from prompt and system instruction."""
        pass
