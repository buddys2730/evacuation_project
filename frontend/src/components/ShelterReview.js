import React, { useState } from "react";
import PropTypes from "prop-types";

/**
 * 避難所レビュー投稿UI
 */
const ShelterReview = ({ shelterId, onSubmit, initialValue }) => {
  const [review, setReview] = useState(initialValue?.review || "");
  const [rating, setRating] = useState(initialValue?.rating || 3);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!review || !rating) {
      alert("レビュー本文・評価を入力してください。");
      return;
    }
    onSubmit && onSubmit({ shelterId, review, rating });
    setReview("");
    setRating(3);
  };

  return (
    <form className="shelter-review" onSubmit={handleSubmit}>
      <label>
        評価:
        <select value={rating} onChange={e => setRating(Number(e.target.value))}>
          {[1, 2, 3, 4, 5].map((val) => (
            <option key={val} value={val}>{val}</option>
          ))}
        </select>
      </label>
      <label>
        レビュー:
        <textarea
          value={review}
          onChange={e => setReview(e.target.value)}
          rows={3}
        />
      </label>
      <button type="submit">投稿</button>
    </form>
  );
};

ShelterReview.propTypes = {
  shelterId: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialValue: PropTypes.shape({
    review: PropTypes.string,
    rating: PropTypes.number,
  }),
};

export default ShelterReview;
