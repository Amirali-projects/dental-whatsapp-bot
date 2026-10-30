const faqs = [
  {
    keywords: [
      "children",
      "kids",
      "child",
      "pediatric",
    ],
    answer:
      "Yes, dental care for children can be discussed with the clinic team. If you're looking for a pediatric appointment, tell me the child's age and what you'd like help with.",
  },

  {
    keywords: [
      "walk in",
      "walk-in",
      "walkin",
    ],
    answer:
      "Walk-in availability can vary. To avoid an unnecessary wait, we recommend contacting the clinic first or requesting an appointment.",
  },

  {
    keywords: [
      "insurance",
      "insurance accepted",
      "do you accept insurance",
    ],
    answer:
      "Insurance plans and coverage can vary. Our team can verify whether your plan is accepted and help explain the next steps.",
  },

  {
    keywords: [
      "payment",
      "pay",
      "financing",
      "payment plans",
    ],
    answer:
      "Payment options can vary by treatment and patient. Our team can provide the most accurate information for your situation.",
  },

  {
    keywords: [
      "price",
      "pricing",
      "cost",
      "how much",
      "fee",
    ],
    answer:
      "Treatment costs can vary depending on the procedure and what the dentist finds during an examination. I don't want to give you an inaccurate estimate. Our team can provide treatment-specific pricing information.",
  },

  {
    keywords: [
      "whitening",
      "teeth whitening",
    ],
    answer:
      "Teeth whitening is a cosmetic dental treatment intended to brighten the appearance of your smile. The dentist or dental team can discuss which whitening option may be appropriate for you.",
  },

  {
    keywords: [
      "wisdom tooth",
      "wisdom teeth",
    ],
    answer:
      "If you're having pain, swelling, or another concern involving a wisdom tooth, a dental examination can help determine the appropriate next step.",
  },

  {
    keywords: [
      "gum",
      "gums",
      "bleeding gums",
      "gum bleeding",
    ],
    answer:
      "Bleeding or irritated gums can have several possible causes. A dental professional should evaluate persistent or significant symptoms.",
  },

  {
    keywords: [
      "bad breath",
      "breath smell",
      "halitosis",
    ],
    answer:
      "Persistent bad breath can have different causes, including oral-health issues. A dental evaluation can help identify the cause and appropriate treatment.",
  },

  {
    keywords: [
      "sensitive teeth",
      "tooth sensitivity",
      "sensitivity",
    ],
    answer:
      "Tooth sensitivity can have several possible causes. If it is persistent, worsening, or painful, a dental examination is recommended.",
  },

  {
    keywords: [
      "braces",
      "orthodontic",
      "orthodontics",
    ],
    answer:
      "If you're interested in braces or orthodontic treatment, the clinic team can discuss available options and whether a consultation is appropriate.",
  },

  {
    keywords: [
      "how long",
      "appointment duration",
      "visit duration",
    ],
    answer:
      "Appointment length can vary depending on the reason for the visit and the treatment required. The clinic team can provide a more accurate estimate when scheduling.",
  },

  {
    keywords: [
      "first visit",
      "new patient",
      "new patient appointment",
    ],
    answer:
      "For a first visit, the dental team may ask for basic patient information and the reason for your visit. If you'd like, I can help you start an appointment request.",
  },
];

function findFaq(text = "") {
  const value = text.toLowerCase();

  return faqs.find((faq) =>
    faq.keywords.some((keyword) =>
      value.includes(keyword)
    )
  );
}

module.exports = {
  faqs,
  findFaq,
};