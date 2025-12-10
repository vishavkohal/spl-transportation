'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

// Brand colors
const PRIMARY_COLOR = '#18234B'; // Dark Navy
const ACCENT_COLOR = '#A61924';  // Deep Red;

// Types
type FaqItem = {
  question: string;
  answer: string;
};

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'How do I book a transfer?',
    answer:
      'You can book directly through our online booking form or contact our team by phone or email. Once your booking is confirmed, you will receive a confirmation email with all the details.',
  },
  {
    question: 'Can I make changes to my booking?',
    answer:
      'Yes. If you need to update your pickup time, location, or passenger details, please contact us as soon as possible. Changes are subject to vehicle availability and may require a fare adjustment.',
  },
  {
    question: 'What happens if my flight is delayed?',
    answer:
      'We actively monitor flight arrival times. If your flight is delayed, your driver will adjust the pickup time accordingly. In most cases, there is no additional charge for reasonable delays.',
  },
  {
    question: 'Is your service available 24/7?',
    answer:
      'Yes. We operate 24 hours a day, 7 days a week for pre-booked transfers, including early-morning departures and late-night arrivals.',
  },
  {
    question: 'Do you provide child seats?',
    answer:
      'Child and booster seats can be provided on request, subject to availability. Please let us know the age and weight of the child at the time of booking so we can arrange the correct seat.',
  },
  {
    question: 'How much luggage can I bring?',
    answer:
      'As a guide, each passenger may bring one standard suitcase and one small carry-on bag. If you are travelling with oversized items, such as surfboards or golf bags, please advise us in advance so we can allocate a suitable vehicle.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept major credit and debit cards via our secure online payment gateway. In some cases, corporate clients may be able to arrange invoicing by prior agreement.',
  },
  {
    question: 'What is your cancellation policy?',
    answer:
      'Cancellations made with reasonable notice before the scheduled pickup time can usually be refunded or credited, subject to our booking terms. Late cancellations or no-shows may incur a fee. Full details are provided in your booking confirmation.',
  },
];

const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleIndex = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p
            className="font-semibold tracking-[0.24em] uppercase text-xs sm:text-[11px] mb-2"
            style={{ color: ACCENT_COLOR }}
          >
               Answers to Common Questions
          </p>

          <h2
            className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3"
            style={{ color: PRIMARY_COLOR }}
          >
            Frequently Asked Questions
            <div
            className="w-20 h-1.5 mx-auto mt-3 rounded-full"
            style={{ backgroundColor: ACCENT_COLOR }}
          />
          </h2>

          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
            If you can&apos;t find the information you&apos;re looking for here,
            please contact our team and we&apos;ll be happy to assist.
          </p>
        </div>

        {/* FAQ list */}
        <div className="space-y-4">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={item.question}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleIndex(index)}
                  className="w-full flex items-center justify-between px-5 md:px-6 py-4 md:py-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                >
                  <span className="text-sm md:text-base font-semibold" style={{ color: PRIMARY_COLOR }}>
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    style={{ color: ACCENT_COLOR }}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 md:px-6 pb-4 md:pb-5 pt-0 text-sm md:text-base text-gray-600 border-t border-gray-100">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
