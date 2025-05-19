"use client";
import { useEffect, useState } from "react";

import { searchDocuments } from "@/app/actions/crudActions";
import { Flame, ReceiptEuro, Trash2, Volume1 } from "lucide-react";
import { toast } from "sonner";
import {
  deleteProfile,
  getSavedProfiles,
} from "./residenceProfile/saveProfile";

interface ProfileMeasure {
  id: string;
  name: string;
  group?: string;
  price?: number;
  heatDemandValue?: number;
  maintenanceCostPerYear?: number;
}

interface Profile {
  _id: string;
  name: string;
  woningId: string;
  typeId: string;
  measures: ProfileMeasure[];
  totalBudget: number;
  totalHeatDemand: number;
  savedAt: string;
  woningName?: string; // Added after fetching woning details
  typeName?: string; // Added after fetching type details
}

const CompareProfiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [residenceDetails, setResidenceDetails] = useState<Record<string, any>>(
    {}
  );
  const [typeDetails, setTypeDetails] = useState<Record<string, any>>({});

  const loadProfiles = async () => {
    setIsLoading(true);
    try {
      const result = await getSavedProfiles();
      if (result.success && result.data) {
        setProfiles(result.data as Profile[]);

        // Load residence and type details for all profiles
        const woningIds = [...new Set(result.data.map((p) => p.woningId))];
        const typeIds = [...new Set(result.data.map((p) => p.typeId))];

        await loadResidenceDetails(woningIds);
        await loadTypeDetails(typeIds);
      } else {
        setError(result.message || "Failed to load profiles");
      }
    } catch (error) {
      console.error("Error loading profiles:", error);
      setError("An error occurred while loading profiles");
    } finally {
      setIsLoading(false);
    }
  };

  const loadResidenceDetails = async (ids: string[]) => {
    try {
      for (const id of ids) {
        const response = await searchDocuments("woningen", id, "_id");
        if (response && response.length > 0) {
          setResidenceDetails((prev) => ({
            ...prev,
            [id]: response[0],
          }));
        }
      }
    } catch (error) {
      console.error("Error loading residence details:", error);
    }
  };

  const loadTypeDetails = async (ids: string[]) => {
    try {
      for (const id of ids) {
        const response = await searchDocuments("types", id, "_id");
        if (response && response.length > 0) {
          setTypeDetails((prev) => ({
            ...prev,
            [id]: response[0],
          }));
        }
      }
    } catch (error) {
      console.error("Error loading type details:", error);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const handleDeleteProfile = async (id: string) => {
    if (confirm("Weet je zeker dat je dit profiel wilt verwijderen?")) {
      try {
        const result = await deleteProfile(id);
        if (result.success) {
          toast.success(result.message || "Profiel verwijderd");
          // Remove from selected profiles if it was selected
          setSelectedProfiles((prev) =>
            prev.filter((profileId) => profileId !== id)
          );
          // Reload profiles
          loadProfiles();
        } else {
          toast.error(result.message || "Kon profiel niet verwijderen");
        }
      } catch (error) {
        console.error("Error deleting profile:", error);
        toast.error("Er is een fout opgetreden bij het verwijderen");
      }
    }
  };

  const toggleProfileSelection = (id: string) => {
    setSelectedProfiles((prev) => {
      if (prev.includes(id)) {
        return prev.filter((profileId) => profileId !== id);
      } else {
        // Limit to maximum 3 profiles for comparison
        if (prev.length >= 3) {
          toast.info("Je kunt maximaal 3 profielen vergelijken");
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  // Get the selected profiles for comparison
  const profilesForComparison = profiles.filter((profile) =>
    selectedProfiles.includes(profile._id)
  );

  // Sort profiles by saved date (newest first)
  const sortedProfiles = [...profiles].sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
  );

  // Format price as Euro
  const formatPrice = (price: number) => {
    return price.toLocaleString("nl-NL", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("nl-NL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Group measures by category for comparison
  const getMeasureGroups = (selectedProfiles: Profile[]) => {
    const allGroups = new Set<string>();

    // Collect all unique groups
    selectedProfiles.forEach((profile) => {
      profile.measures.forEach((measure) => {
        if (measure.group) {
          allGroups.add(measure.group);
        } else {
          allGroups.add("Overig");
        }
      });
    });

    // Return sorted array of groups
    return Array.from(allGroups).sort();
  };

  // Get measures for a specific group and profile
  const getMeasuresForGroup = (profile: Profile, group: string) => {
    return profile.measures.filter((measure) =>
      group === "Overig" ? !measure.group : measure.group === group
    );
  };

  // Calculate total maintenance cost per year
  const getTotalMaintenanceCost = (profile: Profile) => {
    return profile.measures.reduce(
      (sum, measure) => sum + (measure.maintenanceCostPerYear || 0),
      0
    );
  };

  if (isLoading) {
    return <div className="compare-profiles loading">Profielen laden...</div>;
  }

  if (error) {
    return <div className="compare-profiles error">Fout: {error}</div>;
  }

  if (profiles.length === 0) {
    return (
      <div className="compare-profiles empty">
        <div className="empty-message">
          <h3>Geen opgeslagen profielen</h3>
          <p>
            Ga naar de <a href="/kosten-berekening">Kosten berekening</a> pagina
            om een profiel op te slaan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="compare-profiles">
      <div className="profiles-container">
        <h3 className="section-title">Opgeslagen profielen</h3>
        <p className="section-description">
          Selecteer maximaal 3 profielen om te vergelijken
        </p>

        <div className="profiles-grid">
          {sortedProfiles.map((profile) => {
            const residence = residenceDetails[profile.woningId];
            const type = typeDetails[profile.typeId];
            const isSelected = selectedProfiles.includes(profile._id);

            return (
              <div
                key={profile._id}
                className={`profile-card ${isSelected ? "selected" : ""}`}
                onClick={() => toggleProfileSelection(profile._id)}
              >
                <div className="profile-header">
                  <h3 className="profile-name">{profile.name}</h3>
                  <button
                    className="delete-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProfile(profile._id);
                    }}
                    title="Verwijder profiel"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="profile-details">
                  <div className="detail-row">
                    <span className="detail-label">Woning:</span>
                    <span className="detail-value">
                      {residence?.projectInformation?.adres || "Onbekend"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Type:</span>
                    <span className="detail-value">
                      {type?.naam || "Onbekend"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Maatregelen:</span>
                    <span className="detail-value">
                      {profile.measures.length}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Kosten:</span>
                    <span className="detail-value">
                      {formatPrice(profile.totalBudget)}
                    </span>
                  </div>
                  <div className="detail-row highlight-row">
                    <span className="detail-label">
                      <Flame size={14} className="detail-icon" />
                      Warmtebehoefte:
                    </span>
                    <span className="detail-value heat-value">
                      {profile.totalHeatDemand.toFixed(1)} kWh/m²
                    </span>
                  </div>
                  {/* <div className="detail-row">
                    <span className="detail-label">Opgeslagen:</span>
                    <span className="detail-value">
                      {formatDate(profile.savedAt)}
                    </span>
                  </div> */}
                </div>

                <div className="selection-status">
                  {isSelected ? "Geselecteerd ✓" : "Klik om te selecteren"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {profilesForComparison.length > 0 && (
        <div className="comparison-container">
          <h2 className="tile-title">Vergelijking</h2>

          <div className="comparison-table">
            {/* Table header - profile names */}
            <div className="comparison-header">
              <div className="header-cell category-header">Profielnaam</div>
              {profilesForComparison.map((profile) => (
                <div key={profile._id} className="header-cell profile-header">
                  {profile.name}
                </div>
              ))}
            </div>

            {/* Main stats comparison section */}
            <div className="comparison-section">
              <div className="section-title-row">
                <div className="category-header">Resultaten</div>
                {Array(profilesForComparison.length)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="header-cell empty-cell"></div>
                  ))}
              </div>

              {/* Totale kosten row */}
              <div className="comparison-row">
                <div className="category-cell">
                  <ReceiptEuro size={16} className="indicator-icon" />
                  <span>Totale kosten</span>
                </div>
                {profilesForComparison.map((profile) => (
                  <div key={profile._id} className="data-cell">
                    {formatPrice(profile.totalBudget)}
                  </div>
                ))}
              </div>

              {/* Onderhoudskosten row */}
              <div className="comparison-row">
                <div className="category-cell">
                  <ReceiptEuro size={16} className="indicator-icon" />
                  <span>Onderhoudskosten per jaar</span>
                </div>
                {profilesForComparison.map((profile) => (
                  <div key={profile._id} className="data-cell">
                    {formatPrice(getTotalMaintenanceCost(profile))}
                  </div>
                ))}
              </div>

              {/* Warmtebehoefte row */}
              <div className="comparison-row">
                <div className="category-cell">
                  <Flame size={16} className="indicator-icon" />
                  <span>Warmtebehoefte reductie</span>
                </div>
                {profilesForComparison.map((profile) => (
                  <div key={profile._id} className="data-cell">
                    {profile.totalHeatDemand.toFixed(1)} kWh/m²
                  </div>
                ))}
              </div>

              {/* Aantal maatregelen row */}
              <div className="comparison-row">
                <div className="category-cell">
                  <Volume1 size={16} className="indicator-icon" />
                  <span>Aantal maatregelen</span>
                </div>
                {profilesForComparison.map((profile) => (
                  <div key={profile._id} className="data-cell">
                    {profile.measures.length}
                  </div>
                ))}
              </div>
            </div>

            {/* Measures comparison by group */}
            {getMeasureGroups(profilesForComparison).map((group) => (
              <div key={group} className="comparison-section measures-section">
                {/* <div className="section-title-row">
                  <div className="category-header">{group}</div>
                  {Array(profilesForComparison.length)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="header-cell empty-cell"></div>
                    ))}
                </div> */}

                {/* Create columns for each profile */}
                <div className="measures-grid">
                  {/* Column for each profile */}
                  {profilesForComparison.map((profile) => {
                    const measures = getMeasuresForGroup(profile, group);

                    return (
                      <div
                        key={profile._id}
                        className="profile-measures-column"
                      >
                        {/* <h4 className="profile-column-header">
                          {profile.name}
                        </h4> */}

                        {measures.length > 0 ? (
                          <ul className="measures-list">
                            {measures.map((measure) => (
                              <li key={measure.id} className="measure-item">
                                <div className="measure-name">
                                  {measure.name}
                                </div>
                                <div className="measure-details">
                                  {measure.price && (
                                    <div className="measure-price">
                                      {formatPrice(measure.price)}
                                    </div>
                                  )}
                                  {measure.heatDemandValue && (
                                    <div className="measure-heat">
                                      <Flame size={12} />
                                      {measure.heatDemandValue} kWh/m²
                                    </div>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="no-measures">
                            Geen maatregelen in deze categorie
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .compare-profiles {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
          padding-top:4em;
        }


        .section-description {
          font-size: 16px;
          color: #666;
          margin-bottom: 20px;
        }

        .profiles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .profile-card {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: 20px;
          transition: all 0.3s ease;
          cursor: pointer;
          border: 2px solid transparent;
        }

        .profile-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }

        .profile-card.selected {
          border-color: var(--accent-color, #4361ee);
          background-color: rgba(67, 97, 238, 0.05);
        }

        .profile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .profile-name {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
        }

        .delete-button {
          background: none;
          border: none;
          color: #ff4d4f;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .delete-button:hover {
          background-color: rgba(255, 77, 79, 0.1);
        }

        .profile-details {
          margin-bottom: 15px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .detail-label {
          color: #666;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .detail-icon {
          color: #ff7d00;
        }

        .highlight-row {
          background-color: rgba(255, 125, 0, 0.08);
          padding: 6px 8px;
          border-radius: 4px;
          margin-top: 10px;
          margin-bottom: 10px;
        }

        .heat-value {
          color: #ff7d00;
        }

        .selection-status {
          text-align: center;
          font-size: 14px;
          color: var(--accent-color, #4361ee);
          margin-top: 10px;
          font-weight: 500;
        }

        .comparison-container {
          margin-top: 40px;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: 20px;
          overflow-x: auto;
        }

        .comparison-table {
          width: 100%;
          border-collapse: collapse;
        }

        .comparison-header {
          display: grid;
          grid-template-columns: 280px 1fr 1fr 1fr;

          background-color: #f5f5f5;
          border-radius: 6px 6px 0 0;
          font-weight: 600;
          border-bottom: 1px solid #e0e0e0;
        }

        .header-cell {
          padding: 12px 16px;
          text-align: center;
        }

        .category-header {
          text-align: left;
          font-weight: 600;
          padding: 12px 16px;
        }

        .section-title-row {
          display: grid;
          grid-template-columns: 280px 1fr 1fr 1fr;

          background-color: #f9f9f9;
          font-weight: 600;
        }

        .comparison-row {
          display: grid;
          grid-template-columns: 280px 1fr 1fr 1fr;

          border-bottom: 1px solid #eeeeee;
        }

        .comparison-row:last-child {
          border-bottom: none;
        }

        .category-cell {
          padding: 10px 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .data-cell {
          padding: 10px 16px;
          text-align: start;
        }

        .indicator-icon {
          color: var(--accent-color, #4361ee);
        }

        /* Horizontal measures layout */
        .measures-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          margin-left: 280px;
          gap: 20px;
          padding: 16px;
        }

        .profile-measures-column {
          border-radius: 8px;
        }

        .profile-column-header {
          font-size: 16px;
          font-weight: 600;
          text-align: center;
          margin: 0 0 16px 0;
          padding-bottom: 8px;
          border-bottom: 1px solid #e0e0e0;
          color: var(--accent-color, #4361ee);
        }

        .measures-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .measure-item {
          background-color: white;
          margin-bottom: 10px;
          padding: 12px;
          border-radius: 6px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .measure-name {
          font-weight: 500;
          margin-bottom: 8px;
        }

        .measure-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .measure-price {
          font-weight: 600;
        }

        .measure-heat {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #ff7d00;
          font-size: 12px;
        }

        .no-measures {
          text-align: center;
          padding: 20px;
          color: #999;
          font-style: italic;
        }

        .empty-message {
          text-align: center;
          padding: 40px;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .empty-message h2 {
          margin-bottom: 10px;
          color: #666;
        }

        .empty-message a {
          color: var(--accent-color, #4361ee);
          text-decoration: none;
          font-weight: 600;
        }

        .empty-message a:hover {
          text-decoration: underline;
        }

        .loading,
        .error {
          text-align: center;
          padding: 40px;
          font-size: 18px;
        }

        .error {
          color: #ff4d4f;
        }
      `}</style>
    </div>
  );
};

export default CompareProfiles;
