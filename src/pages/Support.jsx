import React from 'react';
import { base44 } from "@/api/base44Client";
import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { ArrowLeft, Mail } from 'lucide-react';
import BigButton from "@/components/ui/BigButton";

export default function Support() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-2xl mx-auto space-y-8">
        <Link to={createPageUrl('Home')}>
          <div className="inline-flex items-center gap-2 text-slate-500 hover:text-sky-600 transition-colors font-bold mb-4">
            <ArrowLeft className="w-5 h-5" /> Back to Home
          </div>
        </Link>

        <header className="space-y-4">
          <h1 className="text-4xl font-black text-slate-800">Support & Contact</h1>
          <p className="text-xl text-slate-600">We're here to help you and your child have the best experience with MathBits.</p>
        </header>

        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-sky-100 rounded-xl text-sky-600">
              <Mail className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Contact Us</h3>
              <p className="text-slate-500 mb-4">For any questions, bug reports, or feedback, please email us directly.</p>
              <a href="mailto:support@mathbits.app" className="text-xl font-bold text-sky-600 hover:underline">
                support@mathbits.app
              </a>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-800">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            {[
              { q: "Is MathBits free?", a: "MathBits is currently in beta and free to use." },
              { q: "Is my child's data safe?", a: "Yes. We prioritize privacy and do not sell data. See our Privacy Policy for details." },
              { q: "How do I reset progress?", a: "You can manage profiles and settings from the Parent Dashboard." }
            ].map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-2">{faq.q}</h3>
                <p className="text-slate-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}