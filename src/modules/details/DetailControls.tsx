interface DetailControlsProps {
  isNew: boolean;
  isEditing: boolean;
  hasChanges: boolean;
  onEdit: () => void;
  onSave: () => void;
  onDiscard: () => void;
}

export default function DetailControls({
  isNew,
  isEditing,
  hasChanges,
  onEdit,
  onSave,
  onDiscard,
}: DetailControlsProps) {
  if (!isEditing && !isNew) {
    return (
      <div className="detail-controls">
        <button
          onClick={onEdit}
          className="detail-controls__button button button--md  button--with-text"
        >
          Edit
        </button>
      </div>
    );
  }

  return (
    <div className="detail-controls">
      <div className="detail-controls__buttons">
        {hasChanges && (
          <button
            onClick={onDiscard}
            className="detail-controls__button detail-controls__button--discard"
          >
            {isNew ? "Clear fields" : "Discard"}
          </button>
        )}
        {hasChanges && (
          <button
            onClick={onSave}
            className="detail-controls__button detail-controls__button--save"
          >
            {isNew ? "Create" : "Save"}
          </button>
        )}
        {!hasChanges && (
          <button
            onClick={onEdit}
            className="detail-controls__button detail-controls__button--cancel"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
