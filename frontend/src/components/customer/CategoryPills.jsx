import { FilterPill } from '../ui';

export default function CategoryPills({ categories, selected, onSelect }) {
  return (
    <div className="flex flex-wrap gap-space-md mb-space-lg">
      <FilterPill active={!selected} onClick={() => onSelect(null)}>
        Semua
      </FilterPill>
      {categories.map((cat) => (
        <FilterPill
          key={cat.id_category}
          active={selected === cat.id_category}
          onClick={() => onSelect(cat.id_category)}
        >
          {cat.name_category}
        </FilterPill>
      ))}
    </div>
  );
}
