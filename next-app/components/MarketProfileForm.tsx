"use client";

interface MarketProfile {
  marketName?: string;
  location?: string;
  contactNumber?: string;
  email?: string;
  operatingHours?: string;
}

interface MarketProfileFormProps {
  title: string;
  profile: MarketProfile;
  onChange: (profile: MarketProfile) => void;
}

export default function MarketProfileForm({ 
  title, 
  profile, 
  onChange 
}: MarketProfileFormProps) {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange({
      ...profile,
      [name]: value
    });
  };

  return (
    <div className="market-profile-form">
      <h2>{title}</h2>
      <form>
        <div className="form-group">
          <label htmlFor="marketName">Market Name</label>
          <input
            type="text"
            id="marketName"
            name="marketName"
            value={profile.marketName || ''}
            onChange={handleChange}
            placeholder="Enter market name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={profile.location || ''}
            onChange={handleChange}
            placeholder="Enter market location"
          />
        </div>

        <div className="form-group">
          <label htmlFor="contactNumber">Contact Number</label>
          <input
            type="tel"
            id="contactNumber"
            name="contactNumber"
            value={profile.contactNumber || ''}
            onChange={handleChange}
            placeholder="Enter contact number"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={profile.email || ''}
            onChange={handleChange}
            placeholder="Enter email address"
          />
        </div>

        <div className="form-group">
          <label htmlFor="operatingHours">Operating Hours</label>
          <input
            type="text"
            id="operatingHours"
            name="operatingHours"
            value={profile.operatingHours || ''}
            onChange={handleChange}
            placeholder="e.g., Mon-Fri 8am-6pm"
          />
        </div>
      </form>
    </div>
  );
}