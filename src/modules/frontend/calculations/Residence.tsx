import { searchDocuments } from "@/app/actions/crudActions";
import { useEffect, useState } from "react";
import { Pencil } from "lucide-react"; // Import the Pencil icon from lucide-react

interface ProjectInformation {
  projectNumber: string;
  complexName: string;
  aantalVHE: number;
  adres: string;
  postcode: string;
  plaats: string;
  renovatieJaar: number;
  bouwPeriode: string;
}

interface EnergyDetails {
  huidigLabel: string;
  huidigEnergie: number;
  voorkostenScenario: string;
  nieuwLabel: string;
  labelStappen: string;
  huidigVerbruik: number;
  huidigEnergieprijs: number;
}

interface Woning {
  _id: string;
  projectInformation: ProjectInformation;
  energyDetails: EnergyDetails;
  typeId: string;
  isGrondgebonden: boolean;
  isPortiekflat: boolean;
  isGalerieflat: boolean;
}

interface RoomDimensions {
  breedte?: number;
  hoogte?: number;
}

interface WoningType {
  _id: string;
  naam: string;
  voorGevelKozijnen: {
    voordeur: RoomDimensions;
    toilet: RoomDimensions;
    woonkamer: RoomDimensions;
    slaapkamer: RoomDimensions;
  };
  achterGevelKozijnen: {
    achterdeur: RoomDimensions;
    keuken: RoomDimensions;
    woonkamer: RoomDimensions;
    slaapkamer1: RoomDimensions;
    slaapkamer2: RoomDimensions;
  };
  ruimten: {
    woonkamer: RoomDimensions;
    achterkamer: RoomDimensions;
    slaapkamer: RoomDimensions;
    slaapkamer2: RoomDimensions;
    keuken: RoomDimensions;
    badkamer: RoomDimensions;
    hal: RoomDimensions;
    toilet: RoomDimensions;
  };
}

interface ResidenceProps {
  selectedResidence: (
    residence: Woning,
    type: WoningType,
    residenceType: string
  ) => void;
  onTypeSelect?: (type: WoningType) => void;
  residenceType?: string;
}

export default function Residence({
  selectedResidence,
  onTypeSelect,
  residenceType,
}: ResidenceProps) {
  const [woningen, setWoningen] = useState<Woning[]>([]);
  const [selectedWoning, setSelectedWoning] = useState<Woning | null>(null);
  const [typeDetails, setTypeDetails] = useState<WoningType | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false); // New state to track edit mode

  const fetchTypeDetails = async (typeId: string) => {
    if (!typeId) return;

    try {
      const response = await searchDocuments<WoningType>(
        "types",
        typeId,
        "_id"
      );
      if (Array.isArray(response) && response.length > 0) {
        const typeData = response[0];
        setTypeDetails(typeData);
        // Pass type data up to parent
        if (onTypeSelect) {
          onTypeSelect(typeData);
        }
      }
    } catch (error) {
      console.error("Failed to fetch type details:", error);
      setError("Failed to load type details");
    }
  };

  const fetchWoningen = async () => {
    try {
      const response = await searchDocuments<Woning>("woningen");
      if (Array.isArray(response)) {
        setWoningen(response);
        if (!selectedId && response.length > 0) {
          setSelectedId(response[0]._id);
          await fetchWoning(response[0]._id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch woningen:", error);
      setError("Failed to load woningen");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWoning = async (id: string) => {
    if (!id) return;

    try {
      const response = await searchDocuments<Woning>("woningen", id, "_id");
      if (Array.isArray(response) && response.length > 0) {
        const residence = response[0];
        setSelectedWoning(residence);

        if (residence.typeId) {
          const typeResponse = await searchDocuments<WoningType>(
            "types",
            residence.typeId,
            "_id"
          );
          if (Array.isArray(typeResponse) && typeResponse.length > 0) {
            const typeData = typeResponse[0];
            setTypeDetails(typeData);
            selectedResidence(residence, typeData, residenceType || "");
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch residence:", error);
      setError("Failed to load residence details");
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      if (hasInitialized) return;
      await fetchWoningen();
      setHasInitialized(true);
    };

    initializeData();
  }, [hasInitialized]);

  const handleResidenceChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newId = event.target.value;
    setSelectedId(newId);
    fetchWoning(newId);
    // Automatically disable edit mode after selection
    setIsEditing(false);
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!woningen.length) return <div>No woningen found</div>;

  return (
    <div className="residence tile">
      <div className="residence__header">
        <h4 className="tile-title">Woning</h4>
      </div>
      <div className="residence__controls">
        {isEditing ? (
          <div className="residence__selector">
            <select value={selectedId} onChange={handleResidenceChange}>
              {woningen.map((woning) => (
                <option key={woning._id} value={woning._id}>
                  {woning.projectInformation.adres}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="residence__address">
            {selectedWoning && selectedWoning.projectInformation.adres}
          </div>
        )}

        <button
          onClick={toggleEditMode}
          className="edit-button"
          aria-label="Edit residence"
        >
          <Pencil size={18} />
        </button>
      </div>
      {residenceType && (
        <div className="residence__type">
          Type woning: <span>{residenceType}</span>
        </div>
      )}
    </div>
  );
}
