import React, { useState } from "react";
// Using standard icons for the accordion toggle
import { FaPlus, FaMinus } from "react-icons/fa";

const faqData = [
  {
    title: "What is Nexa Pay?",
    content: "Nexa Pay is a secure digital payment platform that allows users to make payments, manage wallets, track analytics, apply for loans, and monitor their credit score in one place.",
  },
  {
    title: "How do I make a payment?",
    content: "Go to the Payments section from the sidebar, enter the recipient details, amount, and confirm the transaction. Payments are processed instantly.",
  },
  {
    title: "What is Wallet and how does it work?",
    content: "Your wallet stores your available balance. You can add money, receive funds, and use it for payments and loan repayments.",
  },
  {
    title: "How is my Credit Score calculated?",
    content: "Your credit score is calculated based on repayment history, wallet activity, loan behavior, and transaction consistency. Scores range from 300 to 900.",
  },
  {
    title: "Can I apply for a loan?",
    content: "Yes. Navigate to the Loans section. Loan eligibility depends on your wallet balance, credit score, and past repayment behavior.",
  },
  {
    title: "Where can I see my transaction history?",
    content: "All transactions are available in the Payments and Analytics sections, including detailed breakdowns and trends.",
  },
  {
    title: "Is my data secure?",
    content: "Yes. Nexa Pay uses secure authentication, encrypted APIs, and protected databases to ensure user data safety.",
  },
];

const Help = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Page Header - Original Content */}
        <div className="mb-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Help & Support</h1>
          <p className="text-slate-500 font-medium mt-2">
            Find answers to common questions and learn how to use Nexa Pay effectively.
          </p>
        </div>

        {/* FAQ Section - Original Logic */}
        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center p-6 text-left hover:bg-slate-50 transition-colors"
              >
                <span className={`font-bold ${openIndex === index ? "text-indigo-600" : "text-slate-800"}`}>
                  {faq.title}
                </span>
                <span className="text-indigo-600">
                  {openIndex === index ? <FaMinus size={14} /> : <FaPlus size={14} />}
                </span>
              </button>

              {/* Answer - Logic remains same */}
              {openIndex === index && (
                <div className="px-6 pb-6 text-slate-500 text-sm leading-relaxed border-t border-slate-50 pt-4 animate-in fade-in slide-in-from-top-2">
                  {faq.content}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Extra Help Box - Original Content */}
        <div className="mt-12 bg-indigo-600 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-100">
          <h2 className="text-xl font-black mb-2">
            Still need help?
          </h2>
          <p className="text-indigo-100 mb-6 font-medium">
            Our support team is always available to assist you.
          </p>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 text-sm font-bold bg-white/10 p-3 rounded-xl border border-white/10">
              <span className="h-2 w-2 bg-indigo-300 rounded-full"></span>
              Use the Chat section for instant support
            </li>
            <li className="flex items-center gap-3 text-sm font-bold bg-white/10 p-3 rounded-xl border border-white/10">
              <span className="h-2 w-2 bg-indigo-300 rounded-full"></span>
              Review Payments & Wallet for transaction issues
            </li>
          </ul>
        </div>
        
      </div>
    </div>
  );
};

export default Help;