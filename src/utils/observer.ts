import { Dispatch, SetStateAction } from "react";

const observerOptions = {
  threshold: 0.4,
  rootMargin: "0px 0px -70% 0px",
};

export const getIntersectionObserver = (
  setState: Dispatch<SetStateAction<string>>
) => {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.intersectionRect.top !== 0) {
        setState(entry.target.id);
      }
    }
  }, observerOptions);

  return observer;
};
