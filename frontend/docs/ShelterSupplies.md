# ShelterSupplies コンポーネント定義書

| プロパティ名      | 型    | 必須 | 説明                          |
|-------------------|-------|------|-------------------------------|
| `shelterId`       | String| ✅   | 避難所ID                      |
| `supplies`        | Array | ❌   | 物資状況[{item, quantity}]配列 |
| `onUpdate`        | Func  | ❌   | 物資編集時コールバック         |
