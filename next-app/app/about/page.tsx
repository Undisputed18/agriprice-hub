'use client';

import Link from 'next/link';

export default function AboutPage() {
  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '2rem',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Hero Section */}
      <section style={{
        backgroundColor: '#f5f5f5',
        padding: '3rem 2rem',
        borderRadius: '8px',
        marginBottom: '3rem',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          color: '#2e7d32', 
          marginBottom: '1rem' 
        }}>
          About Agri Price Hub
        </h1>
        <p style={{ 
          fontSize: '1.1rem', 
          color: '#555', 
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          Empowering agricultural stakeholders with real-time market price information
        </p>
      </section>

      {/* Mission Section */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ 
          fontSize: '2rem', 
          color: '#2e7d32', 
          marginBottom: '1rem',
          borderBottom: '3px solid #2e7d32',
          paddingBottom: '0.5rem'
        }}>
          Our Mission
        </h2>
        <p style={{ 
          fontSize: '1rem', 
          lineHeight: '1.6', 
          color: '#333',
          marginBottom: '1rem'
        }}>
          Agri Price Hub is dedicated to revolutionizing agricultural market information 
          accessibility in Africa. We bridge the gap between farmers, agrodealers, and market 
          officers by providing transparent, real-time pricing data.
        </p>
        <p style={{ 
          fontSize: '1rem', 
          lineHeight: '1.6', 
          color: '#333'
        }}>
          Our platform enables farmers to make informed decisions, helps agrodealers manage 
          inventory efficiently, and assists market officers in maintaining price regulations.
        </p>
      </section>

      {/* Vision Section */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ 
          fontSize: '2rem', 
          color: '#2e7d32', 
          marginBottom: '1rem',
          borderBottom: '3px solid #2e7d32',
          paddingBottom: '0.5rem'
        }}>
          Our Vision
        </h2>
        <p style={{ 
          fontSize: '1rem', 
          lineHeight: '1.6', 
          color: '#333'
        }}>
          To create an inclusive digital ecosystem where agricultural pricing is transparent, 
          accessible, and equitable for all stakeholders across the continent.
        </p>
      </section>

      {/* Key Features */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ 
          fontSize: '2rem', 
          color: '#2e7d32', 
          marginBottom: '2rem',
          borderBottom: '3px solid #2e7d32',
          paddingBottom: '0.5rem'
        }}>
          Why Choose Agri Price Hub?
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem'
        }}>
          <div style={{
            backgroundColor: '#f0f0f0',
            padding: '1.5rem',
            borderRadius: '8px',
            borderLeft: '4px solid #2e7d32'
          }}>
            <h3 style={{ color: '#2e7d32', marginBottom: '0.5rem' }}>Real-Time Data</h3>
            <p style={{ color: '#555', lineHeight: '1.5' }}>
              Access up-to-date market prices submitted by market officers across different regions.
            </p>
          </div>

          <div style={{
            backgroundColor: '#f0f0f0',
            padding: '1.5rem',
            borderRadius: '8px',
            borderLeft: '4px solid #2e7d32'
          }}>
            <h3 style={{ color: '#2e7d32', marginBottom: '0.5rem' }}>Transparent Pricing</h3>
            <p style={{ color: '#555', lineHeight: '1.5' }}>
              Fair and transparent pricing information helps farmers negotiate better deals.
            </p>
          </div>

          <div style={{
            backgroundColor: '#f0f0f0',
            padding: '1.5rem',
            borderRadius: '8px',
            borderLeft: '4px solid #2e7d32'
          }}>
            <h3 style={{ color: '#2e7d32', marginBottom: '0.5rem' }}>Easy to Use</h3>
            <p style={{ color: '#555', lineHeight: '1.5' }}>
              User-friendly interface designed for farmers with varying levels of digital literacy.
            </p>
          </div>

          <div style={{
            backgroundColor: '#f0f0f0',
            padding: '1.5rem',
            borderRadius: '8px',
            borderLeft: '4px solid #2e7d32'
          }}>
            <h3 style={{ color: '#2e7d32', marginBottom: '0.5rem' }}>Trusted by Many</h3>
            <p style={{ color: '#555', lineHeight: '1.5' }}>
              Thousands of agricultural stakeholders rely on our platform daily for market insights.
            </p>
          </div>

          <div style={{
            backgroundColor: '#f0f0f0',
            padding: '1.5rem',
            borderRadius: '8px',
            borderLeft: '4px solid #2e7d32'
          }}>
            <h3 style={{ color: '#2e7d32', marginBottom: '0.5rem' }}>Secure Platform</h3>
            <p style={{ color: '#555', lineHeight: '1.5' }}>
              Your data is protected with modern security measures and encrypted communications.
            </p>
          </div>

          <div style={{
            backgroundColor: '#f0f0f0',
            padding: '1.5rem',
            borderRadius: '8px',
            borderLeft: '4px solid #2e7d32'
          }}>
            <h3 style={{ color: '#2e7d32', marginBottom: '0.5rem' }}>Continuous Support</h3>
            <p style={{ color: '#555', lineHeight: '1.5' }}>
              Our team is always ready to help with technical support and platform guidance.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        backgroundColor: '#2e7d32',
        color: 'white',
        padding: '2rem',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h2 style={{ marginBottom: '1rem' }}>Ready to Get Started?</h2>
        <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
          Join thousands of farmers and agrodealers using Agri Price Hub today
        </p>
        <Link href="/signup" style={{
          display: 'inline-block',
          backgroundColor: 'white',
          color: '#2e7d32',
          padding: '0.75rem 2rem',
          borderRadius: '4px',
          textDecoration: 'none',
          fontWeight: 'bold',
          fontSize: '1rem'
        }}>
          Sign Up Now
        </Link>
      </section>

      {/* Footer CTA */}
      <section style={{ 
        marginTop: '3rem', 
        padding: '2rem', 
        textAlign: 'center',
        borderTop: '1px solid #eee'
      }}>
        <p style={{ color: '#555', marginBottom: '1rem' }}>
          Have questions? <Link href="/contact" style={{ color: '#2e7d32', textDecoration: 'none', fontWeight: 'bold' }}>
            Contact us
          </Link>
        </p>
      </section>
    </div>
  );
}
