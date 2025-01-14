import { useState, forwardRef, useImperativeHandle } from "react";
import DetailForm from "./DetailForm";
import DetailControls from "./DetailControls";
import DetailConfirmation from "./DetailConfirmation";
import { FormField, ChangeRecord } from "@/types/types";
import { createDocument } from "@/app/actions/create";
import { updateDocument } from "@/app/actions/update";
import { toast } from "sonner";

interface DetailHandlerProps {
  isNew: boolean;
  initialFormFields: any;
  type: string;
  documentId?: string;
  onUpdateSuccess?: () => void;
  onPendingChanges?: (
    hasPending: boolean,
    changes?: Record<string, ChangeRecord>
  ) => void;
}

const DetailHandler = forwardRef<
  {
    handleSave: () => Promise<void>;
    handleDiscard: () => void;
  },
  DetailHandlerProps
>(
  (
    { isNew, initialFormFields, type, onUpdateSuccess, onPendingChanges },
    ref
  ) => {
    const [formFields, setFormFields] = useState(initialFormFields);
    const [isBulkEditing, setIsBulkEditing] = useState(isNew);
    const [changedFields, setChangedFields] = useState<
      Record<string, ChangeRecord>
    >({});
    const [showConfirmation, setShowConfirmation] = useState(false);

    useImperativeHandle(ref, () => ({
      handleSave: async () => {
        await executeSave();
      },
      handleDiscard: () => {
        handleDiscard();
      },
    }));

    const updateFieldByPath = (obj: any, pathArray: string[], value: any): any => {
      // Handle array indices in the path
      const parsePathPart = (part: string) => {
        const match = part.match(/^(.*?)\[(\d+)\]$/);
        return match ? { key: match[1], index: parseInt(match[2], 10) } : { key: part };
      };

      // Base case: if we're at the end of the path
      if (pathArray.length === 0) return obj;

      const part = parsePathPart(pathArray[0]);
      const remaining = pathArray.slice(1);

      if (remaining.length === 0) {
        // We're at the final part, update the value
        if ('index' in part) {
          // Handle array update
          const array = Array.isArray(obj[part.key]) ? [...obj[part.key]] : [];
          array[part.index] = {
            ...array[part.index],
            value: {
              ...(array[part.index]?.value || {}),  // Preserve other field properties
              value: value  // Update only the value property
            }
          };
          return {
            ...obj,
            [part.key]: array
          };
        } else {
          // Handle regular field update
          return {
            ...obj,
            [part.key]: {
              ...(obj[part.key] || {}),  // Preserve other field properties
              value: value  // Update only the value property
            }
          };
        }
      }

      // Recursive case: keep traversing
      if ('index' in part) {
        // Handle array traversal
        const array = Array.isArray(obj[part.key]) ? [...obj[part.key]] : [];
        array[part.index] = updateFieldByPath(
          array[part.index] || {},
          remaining,
          value
        );
        return {
          ...obj,
          [part.key]: array
        };
      } else {
        // Handle object traversal
        return {
          ...obj,
          [part.key]: updateFieldByPath(
            obj[part.key] || {},
            remaining,
            value
          )
        };
      }
    };

    const handleFieldChange = (path: string, oldValue: any, newValue: any) => {
      // Split path into parts, handle empty parts and array notation
      const pathParts = path
        .split('.')
        .filter(Boolean)
        .map(part => {
          // Convert array index notation if present (e.g., 'array.0' to 'array[0]')
          const match = part.match(/^(\d+)$/);
          if (match) {
            return `[${match[0]}]`;
          }
          return part;
        });

      console.log('Processing path parts:', pathParts);

      // Create a new form fields object with the updated value
      const newFormFields = updateFieldByPath(formFields, pathParts, newValue);

      console.log('Updated form fields:', newFormFields);

      // Update the changed fields tracking
      const fieldId = path.replace(/\./g, '_');
      if (oldValue === newValue) {
        const { [fieldId]: _, ...rest } = changedFields;
        setChangedFields(rest);
      } else {
        setChangedFields(prev => ({
          ...prev,
          [fieldId]: {
            fieldId,
            label: path,
            oldValue: String(oldValue),
            newValue: String(newValue)
          }
        }));
      }

      // Set the new form fields
      setFormFields(newFormFields);

      // Notify parent of changes
      onPendingChanges?.(true, changedFields);
    };

    const handleDiscard = () => {
      setFormFields(initialFormFields);
      setChangedFields({});
      if (!isNew) setIsBulkEditing(false);
      onPendingChanges?.(false);
      toast.info("Changes discarded", {
        description: "All changes have been reset to original values.",
      });
    };

    const handleSave = () => {
      setShowConfirmation(true);
    };

    console.log("this is being updated:", type, formFields);

    const executeSave = async () => {

      toast.promise(
        isNew
          ? createDocument(type, formFields)
          : updateDocument(type, formFields),
        {
          loading: "Saving changes...",
          success: (result) => {
            if (result.success) {
              setChangedFields({});
              if (!isNew) {
                setIsBulkEditing(false);
              }
              setShowConfirmation(false);
              onPendingChanges?.(false);
              onUpdateSuccess?.();
              return isNew
                ? "New entry created successfully!"
                : "Changes saved successfully!";
            }
            throw new Error(result.error || "Failed to save changes");
          },
          error: (error) => {
            console.error("Error saving:", error);
            return "Failed to save changes. Please try again.";
          },
        }
      );
    };

    const handleConfirmSave = async () => {
      await executeSave();
    };

    const handleCancelSave = () => {
      setShowConfirmation(false);
      toast("Save operation cancelled");
    };

    const toggleEditing = () => {
      if (Object.keys(changedFields).length === 0 && !isNew) {
        setIsBulkEditing(!isBulkEditing);
      } else if (Object.keys(changedFields).length > 0) {
        toast.warning("Please save or discard your changes first", {
          description: "You have unsaved changes that need to be handled.",
        });
      }
    };

    return (
      <div className="details-panel relative">
        <DetailControls
          isNew={isNew}
          isBulkEditing={isBulkEditing}
          hasChanges={Object.keys(changedFields).length > 0}
          onEdit={toggleEditing}
          onSave={handleSave}
          onDiscard={handleDiscard}
        />

        <DetailForm
          fields={formFields}
          isEditing={isBulkEditing}
          onChange={handleFieldChange}
        />

        {showConfirmation && (
          <DetailConfirmation
            title={isNew ? "Create New Entry" : "Confirm changes"}
            message={isNew ? "Are you sure you want to create this new entry?" : undefined}
            confirm={isNew ? "Create" : "Save changes"}
            cancel="Cancel"
            changes={!isNew ? changedFields : undefined}
            onConfirm={handleConfirmSave}
            onCancel={handleCancelSave}
          />
        )}
      </div>
    );
  }
);

DetailHandler.displayName = "DetailHandler";

export default DetailHandler;