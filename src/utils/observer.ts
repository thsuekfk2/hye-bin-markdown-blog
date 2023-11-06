import { Dispatch, SetStateAction } from "react";

const observerOption = {
  threshold: 0.4,
  rootMargin: "0px 0px -70% 0px",
};

export const getIntersectionObserver = (
  setState: Dispatch<SetStateAction<string>>
) => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.intersectionRect.top !== 0) {
        setState(entry.target.id);
      }
    });
  }, observerOption);

  return observer;
};
