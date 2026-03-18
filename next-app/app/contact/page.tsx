'use client';

export default function ContactPage() {
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
          Contact Us
        </h1>
        <p style={{ 
          fontSize: '1.1rem', 
          color: '#555', 
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          Have questions or feedback? We'd love to hear from you. Reach out to our team through any of the channels below.
        </p>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '3rem' }}>
        {/* Email Providers Section */}
        <section>
          <h2 style={{ 
            fontSize: '1.8rem', 
            color: '#2e7d32', 
            marginBottom: '1.5rem',
            borderBottom: '2px solid #2e7d32',
            paddingBottom: '0.5rem'
          }}>
            Email Us Directly
          </h2>
          <p style={{ color: '#555', marginBottom: '2rem', lineHeight: '1.6' }}>
            For the fastest response, please use your preferred email provider to send us a message at <strong>support@agripricehub.com</strong>.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Gmail Button */}
            <a 
              href="https://mail.google.com/mail/?view=cm&fs=1&to=support@agripricehub.com" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                backgroundColor: '#ffffff',
                border: '1px solid #dadce0',
                padding: '0.75rem 1.5rem',
                borderRadius: '4px',
                textDecoration: 'none',
                color: '#3c4043',
                fontWeight: '500',
                fontSize: '1rem',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
                width: '100%',
                maxWidth: '300px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
                e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)';
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path d="M20,4H4C2.89,4,2,4.89,2,6v12c0,1.1,0.89,2,2,2h16c1.1,0,2-0.89,2-2V6C22,4.89,21.11,4,20,4z M20,18H4V8l8,5l8,-5V18z M12,11L4,6h16L12,11z" fill="#EA4335"/>
              </svg>
              <span>Gmail</span>
            </a>

            {/* Outlook Button */}
            <a 
              href="https://outlook.live.com/mail/0/deeplink/compose?to=support@agripricehub.com" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                backgroundColor: '#ffffff',
                border: '1px solid #dadce0',
                padding: '0.75rem 1.5rem',
                borderRadius: '4px',
                textDecoration: 'none',
                color: '#3c4043',
                fontWeight: '500',
                fontSize: '1rem',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
                width: '100%',
                maxWidth: '300px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
                e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)';
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path d="M12,2L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,2Z" fill="#0078D4"/>
              </svg>
              <span>Outlook</span>
            </a>
          </div>
        </section>

        {/* Contact Information */}
        <section>
          <h2 style={{ 
            fontSize: '1.8rem', 
            color: '#2e7d32', 
            marginBottom: '1.5rem',
            borderBottom: '2px solid #2e7d32',
            paddingBottom: '0.5rem'
          }}>
            Contact Information
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Email */}
            <div>
              <h3 style={{ color: '#2e7d32', marginBottom: '0.5rem' }}>📧 Official Email</h3>
              <p style={{ color: '#555', margin: 0 }}>
                <a href="mailto:support@agripricehub.com" style={{ color: '#2e7d32', textDecoration: 'none', fontWeight: 'bold' }}>
                  support@agripricehub.com
                </a>
              </p>
              <p style={{ color: '#999', fontSize: '0.9rem', margin: '0.5rem 0 0' }}>
                We respond within 24 hours
              </p>
            </div>

            {/* Phone */}
            <div>
              <h3 style={{ color: '#2e7d32', marginBottom: '0.5rem' }}>📱 Phone</h3>
              <p style={{ color: '#555', margin: 0 }}>
                <a href="tel:+1234567890" style={{ color: '#2e7d32', textDecoration: 'none' }}>
                  +254 712 567-890
                </a>
              </p>
              <p style={{ color: '#999', fontSize: '0.9rem', margin: '0.5rem 0 0' }}>
                Monday - Friday, 9:00 AM - 5:00 PM (EAT)
              </p>
            </div>

            {/* Office Address */}
            <div>
              <h3 style={{ color: '#2e7d32', marginBottom: '0.5rem' }}>📍 Office Address</h3>
              <p style={{ color: '#555', margin: 0, lineHeight: '1.6' }}>
                AgriPrice Hub HQ<br />
                123 Agricultural Lane<br />
                Market District<br />
                Kenya
              </p>
            </div>

            {/* Business Hours */}
            <div>
              <h3 style={{ color: '#2e7d32', marginBottom: '0.5rem' }}>🕐 Business Hours</h3>
              <p style={{ color: '#555', margin: 0, lineHeight: '1.6' }}>
                Monday - Friday: 9:00 AM - 6:00 PM<br />
                Saturday: 10:00 AM - 4:00 PM<br />
                Sunday: Closed
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* FAQ Section */}
      <section style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #eee' }}>
        <h2 style={{ 
          fontSize: '1.8rem', 
          color: '#2e7d32', 
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          Frequently Asked Questions
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
          <div style={{ 
            backgroundColor: '#f9f9f9', 
            padding: '1.5rem', 
            borderRadius: '4px',
            borderLeft: '4px solid #2e7d32'
          }}>
            <h4 style={{ color: '#2e7d32', marginBottom: '0.5rem' }}>How do I create an account?</h4>
            <p style={{ color: '#555', margin: 0 }}>
              You can sign up on our platform by clicking the "Sign Up" button and filling in your details as a farmer, dealer, or market officer.
            </p>
          </div>

          <div style={{ 
            backgroundColor: '#f9f9f9', 
            padding: '1.5rem', 
            borderRadius: '4px',
            borderLeft: '4px solid #2e7d32'
          }}>
            <h4 style={{ color: '#2e7d32', marginBottom: '0.5rem' }}>Is my data secure?</h4>
            <p style={{ color: '#555', margin: 0 }}>
              Yes, we use industry-standard encryption and security protocols to protect your personal and business data.
            </p>
          </div>

          <div style={{ 
            backgroundColor: '#f9f9f9', 
            padding: '1.5rem', 
            borderRadius: '4px',
            borderLeft: '4px solid #2e7d32'
          }}>
            <h4 style={{ color: '#2e7d32', marginBottom: '0.5rem' }}>Is there a fee to use the platform?</h4>
            <p style={{ color: '#555', margin: 0 }}>
              Basic features are free for all users. Premium features and analytics are available for a small subscription fee.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
