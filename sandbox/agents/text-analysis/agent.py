#!/usr/bin/env python3
"""
Text Analysis AI Agent
Performs sentiment analysis, keyword extraction, and text summarization
"""

import sys
import json
import re
from collections import Counter
from typing import Dict, List, Any


class TextAnalysisAgent:
    """AI Agent for text analysis tasks"""

    def __init__(self):
        # Sentiment word lists (simple approach for demo)
        self.positive_words = {
            'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic',
            'positive', 'happy', 'love', 'perfect', 'best', 'awesome', 'brilliant',
            'outstanding', 'superb', 'magnificent', 'delightful', 'pleased',
            'хороший', 'отличный', 'прекрасный', 'замечательный', 'великолепный'
        }

        self.negative_words = {
            'bad', 'terrible', 'awful', 'horrible', 'poor', 'worst', 'hate',
            'negative', 'sad', 'disappointing', 'disappointing', 'unpleasant',
            'disgusting', 'pathetic', 'dreadful', 'appalling',
            'плохой', 'ужасный', 'отвратительный', 'неприятный'
        }

        # Stop words for keyword extraction (English and Russian)
        self.stop_words = {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
            'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
            'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that',
            'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
            'в', 'и', 'на', 'с', 'по', 'для', 'к', 'от', 'из', 'о', 'об',
            'это', 'я', 'ты', 'он', 'она', 'мы', 'вы', 'они'
        }

    def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """
        Analyze sentiment of the text
        Returns: sentiment score and label
        """
        words = self._tokenize(text)

        positive_count = sum(1 for word in words if word in self.positive_words)
        negative_count = sum(1 for word in words if word in self.negative_words)

        total_sentiment_words = positive_count + negative_count

        if total_sentiment_words == 0:
            score = 0.0
            label = 'neutral'
        else:
            score = (positive_count - negative_count) / len(words) if len(words) > 0 else 0

            if score > 0.05:
                label = 'positive'
            elif score < -0.05:
                label = 'negative'
            else:
                label = 'neutral'

        return {
            'score': round(score, 3),
            'label': label,
            'positive_words': positive_count,
            'negative_words': negative_count,
            'confidence': round(total_sentiment_words / len(words), 3) if len(words) > 0 else 0
        }

    def extract_keywords(self, text: str, top_n: int = 10) -> List[Dict[str, Any]]:
        """
        Extract keywords from text
        Returns: list of keywords with frequencies
        """
        words = self._tokenize(text)

        # Filter out stop words and short words
        filtered_words = [
            word for word in words
            if word not in self.stop_words and len(word) > 2
        ]

        # Count word frequencies
        word_counts = Counter(filtered_words)

        # Get top N keywords
        top_keywords = word_counts.most_common(top_n)

        return [
            {
                'keyword': word,
                'frequency': count,
                'relevance': round(count / len(filtered_words), 3) if len(filtered_words) > 0 else 0
            }
            for word, count in top_keywords
        ]

    def summarize_text(self, text: str, num_sentences: int = 3) -> Dict[str, Any]:
        """
        Create a simple summary of the text
        Returns: summary with statistics
        """
        sentences = self._split_sentences(text)

        if len(sentences) <= num_sentences:
            summary = text
            compression_ratio = 1.0
        else:
            # Simple extractive summarization: take first, middle, and last sentences
            indices = self._get_representative_sentences(len(sentences), num_sentences)
            summary_sentences = [sentences[i] for i in sorted(indices)]
            summary = ' '.join(summary_sentences)
            compression_ratio = len(summary) / len(text)

        return {
            'summary': summary.strip(),
            'original_sentences': len(sentences),
            'summary_sentences': min(len(sentences), num_sentences),
            'compression_ratio': round(compression_ratio, 3),
            'original_length': len(text),
            'summary_length': len(summary)
        }

    def _tokenize(self, text: str) -> List[str]:
        """Tokenize text into words"""
        text = text.lower()
        # Remove punctuation and split
        words = re.findall(r'\b\w+\b', text)
        return words

    def _split_sentences(self, text: str) -> List[str]:
        """Split text into sentences"""
        # Simple sentence splitting
        sentences = re.split(r'[.!?]+', text)
        return [s.strip() for s in sentences if s.strip()]

    def _get_representative_sentences(self, total: int, num: int) -> List[int]:
        """Get indices of representative sentences"""
        if num >= total:
            return list(range(total))

        # Take first, last, and evenly distributed middle sentences
        indices = [0]  # First sentence

        if num > 2:
            # Add middle sentences
            step = (total - 1) / (num - 1)
            for i in range(1, num - 1):
                indices.append(int(i * step))

        if num > 1:
            indices.append(total - 1)  # Last sentence

        return indices

    def analyze(self, text: str, options: Dict[str, bool]) -> Dict[str, Any]:
        """
        Perform full text analysis based on options
        """
        result = {
            'text_length': len(text),
            'word_count': len(self._tokenize(text)),
            'sentence_count': len(self._split_sentences(text))
        }

        # Perform analyses based on options
        if options.get('sentiment', True):
            result['sentiment'] = self.analyze_sentiment(text)

        if options.get('keywords', True):
            result['keywords'] = self.extract_keywords(text)

        if options.get('summary', True):
            result['summary'] = self.summarize_text(text)

        return result


def main():
    """Main execution function"""
    try:
        # Read options from command line argument
        options_str = sys.argv[1] if len(sys.argv) > 1 else '{}'
        options = json.loads(options_str)

        # Read input text from stdin
        input_text = sys.stdin.read().strip()

        if not input_text:
            print(json.dumps({
                'error': 'No input text provided'
            }))
            sys.exit(1)

        # Create agent and analyze
        agent = TextAnalysisAgent()
        result = agent.analyze(input_text, options)

        # Output result as JSON
        print(json.dumps(result, ensure_ascii=False, indent=2))

    except Exception as e:
        print(json.dumps({
            'error': str(e),
            'type': type(e).__name__
        }))
        sys.exit(1)


if __name__ == '__main__':
    main()
