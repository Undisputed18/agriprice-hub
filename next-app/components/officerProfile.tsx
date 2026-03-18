"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface OfficerProfile {
  marketName?: string;
  location?: string;
  contactNumber?: string;
  email?: string;
  operatingHours?: string;
}

interface OfficerProfileContextType {
  profile: OfficerProfile;
  setProfile: (profile: OfficerProfile) => void;
}

const OfficerProfileContext = createContext<OfficerProfileContextType | null>(null);

export function OfficerProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<OfficerProfile>({
    marketName: "Central Market",
    location: "Downtown",
    contactNumber: "+1234567890",
    email: "central@market.com",
    operatingHours: "Mon-Sat 8am-8pm"
  });

  return (
    <OfficerProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </OfficerProfileContext.Provider>
  );
}

export function useOfficerProfile() {
  const context = useContext(OfficerProfileContext);
  
  if (!context) {
    console.warn("useOfficerProfile must be used within an OfficerProfileProvider");
    return {
      profile: {
        marketName: "",
        location: "",
        contactNumber: "",
        email: "",
        operatingHours: ""
      },
      setProfile: () => console.warn("setProfile called without Provider")
    };
  }
  
  return context;
}