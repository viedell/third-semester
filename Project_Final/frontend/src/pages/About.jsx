import './About.css';

export const About = () => {
  return (
    <div className="about-page">
      <div className="page-header">
        <h1>About Us</h1>
        <p>Learn more about our platform and mission</p>
      </div>

      <div className="about-content">
        <section className="about-section">
          <h2>Our Mission</h2>
          <p>
            We believe in the power of knowledge sharing and community-driven learning.
            Our platform provides a space for writers, developers, and technology enthusiasts
            to share their expertise and learn from each other.
          </p>
        </section>

        <section className="about-section">
          <h2>What We Offer</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>📝 Quality Content</h3>
              <p>
                Access well-written articles and tutorials on web development,
                programming, and technology trends.
              </p>
            </div>
            <div className="feature-card">
              <h3>👥 Community Driven</h3>
              <p>
                Join a community of passionate writers and readers who share
                knowledge and insights.
              </p>
            </div>
            <div className="feature-card">
              <h3>🎯 Easy to Use</h3>
              <p>
                Our platform is designed to be simple and intuitive for both
                readers and content creators.
              </p>
            </div>
            <div className="feature-card">
              <h3>🔒 Secure</h3>
              <p>
                Built with modern security practices to protect your data and
                ensure a safe experience.
              </p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>Technology Stack</h2>
          <p>
            Our platform is built using modern web technologies including React,
            Node.js, Express, PostgreSQL, and Prisma ORM. We prioritize performance,
            security, and user experience in everything we build.
          </p>
        </section>

        <section className="about-section">
          <h2>Get Involved</h2>
          <p>
            Whether you're a reader looking for quality content or a writer wanting
            to share your knowledge, we'd love to have you join our community.
            Register today to start your journey with us!
          </p>
        </section>
      </div>
    </div>
  );
};
