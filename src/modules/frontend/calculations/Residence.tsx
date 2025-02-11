import { searchDocuments } from "@/app/actions/crudActions";
import { useEffect, useState } from "react";

function flattenObject(obj: any): Record<string, any> {
  if (!obj || typeof obj !== 'object') {
    return {};
  }
  const safeObj = { ...obj };
  const result: Record<string, any> = {};
  try {
    for (const key in safeObj) {
      const value = safeObj[key];
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const flattened = flattenObject(value);
        Object.assign(result, flattened);
      } else {
        result[key] = value;
      }
    }
  } catch (error) {
    console.error('Error flattening object:', error);
    return {};
  }
  return result;
}

interface Woning {
  _id: string;
  projectInformation: {
    adres: string;
    huisnummer?: string;
  };
}

export default function Residence({
  selectedResidence,
}: {
  selectedResidence: (data: any) => void;
}) {
  const [woningen, setWoningen] = useState<Woning[]>([]);
  const [flattenedData, setFlattenedData] = useState<any>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all woningen
  const fetchWoningen = async () => {
    try {
      const response = await searchDocuments<Woning>("woningen");
      if (Array.isArray(response)) {
        setWoningen(response);
        // Select first woning by default if none selected
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

  // Fetch specific woning details
  const fetchWoning = async (id: string) => {
    if (!id) {
      console.error("No ID provided");
      return;
    }
    try {
      const response = await searchDocuments<any>("woningen", id, "_id");
      if (Array.isArray(response) && response.length > 0) {
        const residence = response[0];
        console.log("Selected woning:", residence); // Simple log of the entire woning object
        const flattened = flattenObject(residence);
        setFlattenedData(flattened);
        selectedResidence(flattened);
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

  const handleResidenceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = event.target.value;
    setSelectedId(newId);
    fetchWoning(newId);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!woningen.length) {
    return <div>No woningen found</div>;
  }

  // Format address for display
  const formatAddress = (woning: Woning) => {
    const address = woning.projectInformation?.adres || 'Unknown address';
    return address;
  };

  return (
    <div className="residence tile">
      <div className="residence__header">
        <div className="residence__title">
          <h3>Woning:</h3>
        </div>
        <div className="residence__button">
          <select 
            value={selectedId}
            onChange={handleResidenceChange}
          >
            {woningen.map((woning) => (
              <option key={woning._id} value={woning._id}>
                {formatAddress(woning)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="residence__street">
        {flattenedData?.adres && flattenedData.adres}
      </div>
      <div className="residence__type">{flattenedData?.typeFlat}</div>
    </div>
  );
}