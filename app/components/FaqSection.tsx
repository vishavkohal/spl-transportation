'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import Link from 'next/link';

// Brand colors
const PRIMARY_COLOR = '#18234B'; // Dark Navy
const ACCENT_COLOR = '#A61924';  // Deep Red;

// Types
type FaqItem = {
  question: string;
  answer: string | React.ReactNode;
};

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'How do I book a transfer?',
    answer: (
      <>
        You can book directly through our <button onClick={() => document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' })} className="text-blue-700 hover:underline font-medium">online booking form</button> or <Link href="/contact" className="text-blue-700 hover:underline font-medium">contact our team</Link> by phone or email. Once your booking is confirmed, you will receive a confirmation email with all the details.
      </>
    ) as any,
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
    answer: (
      <>
        Cancellations made with reasonable notice before the scheduled pickup time can usually be refunded or credited, subject to our <Link href="/terms" className="text-blue-700 hover:underline font-medium">booking terms</Link>. Late cancellations or no-shows may incur a fee. Full details are provided in your booking confirmation.
      </>
    ) as any,
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 40, damping: 20 },
  },
};

const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleIndex = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <section className="py-6 md:py-12 bg-[#F8F9FA] mx-3 md:mx-6 rounded-[2.5rem] shadow-[0_0_50px_-12px_rgba(0,0,0,0.25)] overflow-hidden">
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
        <motion.div
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={item.question}
                variants={itemVariants}
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
                    className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
                      }`}
                    style={{ color: ACCENT_COLOR }}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 md:px-6 pb-4 md:pb-5 pt-0 text-sm md:text-base text-gray-600 border-t border-gray-100">
                    {item.answer}
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default FaqSection;
