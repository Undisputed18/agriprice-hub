"use client";

import { useState } from "react";
import "../marketOfficer.css";

interface PriceSubmission {
  produceName: string;
  variety?: string;
  grade?: string;
  minPrice: number;
  maxPrice: number;
  unit: string;
  market: string;
  season?: string;
  notes?: string;
}

export default function SubmitPricePage() {
  const [formData, setFormData] = useState<PriceSubmission>({
    produceName: "",
    variety: "",
    grade: "",
    minPrice: 0,
    maxPrice: 0,
    unit: "kg",
    market: "Central Market",
    season: "",
    notes: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes("Price") ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log("Price submitted:", formData);
      setSubmitStatus("success");
      
      // Reset form after successful submission
      setFormData({
        produceName: "",
        variety: "",
        grade: "",
        minPrice: 0,
        maxPrice: 0,
        unit: "kg",
        market: "Central Market",
        season: "",
        notes: ""
      });
    } catch {
      // Error parameter removed since it's not used
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const produceItems = ["Maize", "Beans", "Potatoes", "Tomatoes", "Onions", "Cabbage", "Carrots", "Bananas"];
  const units = ["kg", "gram", "tonne", "bunch", "piece", "dozen", "crate"];
  const grades = ["Grade A", "Grade B", "Grade C", "Premium", "Standard"];
  const seasons = ["Rainy Season", "Dry Season", "Harvest Season", "Planting Season", "Off-Season"];

  return (
    <div className="officer-page">
      <h1>Submit Produce Price</h1>

      {submitStatus === "success" && (
        <div className="alert success">
          Price submitted successfully! Pending approval.
          <button onClick={() => setSubmitStatus("idle")} className="alert-close">×</button>
        </div>
      )}

      {submitStatus === "error" && (
        <div className="alert error">
          Failed to submit price. Please try again.
          <button onClick={() => setSubmitStatus("idle")} className="alert-close">×</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="price-submission-form">
        <div className="form-section">
          <h2>Produce Details</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="produceName">Produce Name *</label>
              <select
                id="produceName"
                name="produceName"
                value={formData.produceName}
                onChange={handleChange}
                required
              >
                <option value="">Select produce</option>
                {produceItems.map(item => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="variety">Variety (Optional)</label>
              <input
                type="text"
                id="variety"
                name="variety"
                value={formData.variety}
                onChange={handleChange}
                placeholder="e.g., Sweet, Irish"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="grade">Grade (Optional)</label>
              <select
                id="grade"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
              >
                <option value="">Select grade</option>
                {grades.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="season">Season (Optional)</label>
              <select
                id="season"
                name="season"
                value={formData.season}
                onChange={handleChange}
              >
                <option value="">Select season</option>
                {seasons.map(season => (
                  <option key={season} value={season}>{season}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Price Information</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="minPrice">Minimum Price (GHS) *</label>
              <input
                type="number"
                id="minPrice"
                name="minPrice"
                value={formData.minPrice || ''}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label htmlFor="maxPrice">Maximum Price (GHS) *</label>
              <input
                type="number"
                id="maxPrice"
                name="maxPrice"
                value={formData.maxPrice || ''}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label htmlFor="unit">Unit *</label>
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                required
              >
                {units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Additional Information</h2>
          
          <div className="form-group">
            <label htmlFor="market">Market *</label>
            <input
              type="text"
              id="market"
              name="market"
              value={formData.market}
              onChange={handleChange}
              required
              placeholder="Market name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes (Optional)</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Additional information about quality, availability, etc."
            />
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="secondary-btn"
            onClick={() => window.history.back()}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="primary-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit for Approval"}
          </button>
        </div>
      </form>
    </div>
  );
}