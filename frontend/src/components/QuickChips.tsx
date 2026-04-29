interface QuickChipsProps {
  chips: string[];
  onSelect: (chip: string) => void;
}

export default function QuickChips({ chips, onSelect }: QuickChipsProps) {
  if (!chips.length) return null;
  return (
    <div className="quick-chips">
      {chips.map(chip => (
        <span key={chip} onClick={() => onSelect(chip)}>{chip}</span>
      ))}
    </div>
  );
}
