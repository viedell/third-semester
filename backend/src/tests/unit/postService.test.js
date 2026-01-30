const postService = require('../../services/postService');

describe('PostService', () => {
  describe('generateSlug', () => {
    it('should generate slug from title', () => {
      const title = 'Building Scalable Microservices';
      const slug = postService.generateSlug(title);
      expect(slug).toBe('building-scalable-microservices');
    });

    it('should handle special characters', () => {
      const title = 'React & Vue: A Comparison!';
      const slug = postService.generateSlug(title);
      expect(slug).toBe('react-vue-a-comparison');
    });
  });

  describe('calculateReadTime', () => {
    it('should calculate read time correctly', () => {
      const content = 'word '.repeat(200); // 200 words
      const readTime = postService.calculateReadTime(content);
      expect(readTime).toBe(1); // 200 words / 200 wpm = 1 minute
    });

    it('should round up read time', () => {
      const content = 'word '.repeat(250); // 250 words
      const readTime = postService.calculateReadTime(content);
      expect(readTime).toBe(2); // 250 words / 200 wpm = 1.25, rounded to 2
    });
  });
});