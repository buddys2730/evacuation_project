import React from 'react';

const hazardCategories = [
  { label: '洪水（計画規模）', value: '洪水_01_計画規模' },
  { label: '洪水（最大規模）', value: '洪水_02_想定最大規模' },
  { label: '洪水（浸水継続）', value: '洪水_03_浸水継続時間' },
  { label: '洪水（家屋倒壊）', value: '洪水_04_家屋倒壊等氾濫想定区域' },
  { label: '土砂災害', value: '土砂災害警戒区域' },
  { label: '津波', value: '津波浸水想定' },
  { label: '高潮', value: '高潮想定区域' },
  { label: '急傾斜地', value: '急傾斜地崩壊危険区域' },
];

export default function CategoryFilter({ selectedCategories, toggleCategory }) {
  return (
    <div style={{ padding: '10px' }}>
      <h4>災害カテゴリを選択:</h4>
      {hazardCategories.map((cat) => (
        <label key={cat.value} style={{ marginRight: '12px' }}>
          <input
            type="checkbox"
            checked={selectedCategories.includes(cat.value)}
            onChange={() => toggleCategory(cat.value)}
          />
          {cat.label}
        </label>
      ))}
    </div>
  );
}
