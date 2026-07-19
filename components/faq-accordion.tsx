"use client";

import { useState } from "react";

type FaqItem = { question: string; answer: string };

export function FaqAccordion({ items }: { items: ReadonlyArray<FaqItem> }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="faq-list">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const questionId = `faq-question-${index}`;
        const answerId = `faq-answer-${index}`;

        return (
          <div className="faq-item" data-open={isOpen || undefined} key={item.question}>
            <button className="faq-question" id={questionId} type="button" aria-expanded={isOpen} aria-controls={answerId} onClick={() => setOpenIndex(isOpen ? null : index)}>
              <span className="faq-number">0{index + 1}</span>
              <span>{item.question}</span>
              <i className="faq-toggle" aria-hidden="true" />
            </button>
            <div className="faq-answer" id={answerId} role="region" aria-labelledby={questionId} aria-hidden={!isOpen}>
              <div><p>{item.answer}</p></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
