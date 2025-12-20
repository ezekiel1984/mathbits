import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { ArrowLeft, Shield } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link to={createPageUrl('Home')}>
          <div className="inline-flex items-center gap-2 text-slate-500 hover:text-sky-600 transition-colors font-bold mb-4">
            <ArrowLeft className="w-5 h-5" /> Back to Home
          </div>
        </Link>

        <header className="space-y-4 border-b border-slate-200 pb-8">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black text-slate-800">Privacy Policy</h1>
          <p className="text-slate-500 font-medium">Last updated: December 20, 2025</p>
        </header>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-600">
          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">1. Introduction</h2>
            <p>
              MathBits ("we", "our", or "us") is committed to protecting the privacy of our users ("you"), especially children. 
              This Privacy Policy explains how we collect, use, and safeguard your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">2. Data Collection</h2>
            <p>We collect minimal data necessary to provide our educational service:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Parent Account Info:</strong> Email address for authentication.</li>
              <li><strong>Child Profiles:</strong> Nicknames/Display names and learning preferences (e.g., stimulus level). We do not require real names.</li>
              <li><strong>Usage Data:</strong> Progress, scores, and app interaction data to improve the learning experience.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">3. Children's Privacy</h2>
            <p>
              We comply with COPPA (Children's Online Privacy Protection Act). We do not knowingly collect personal contact information from children under 13 without parental consent. 
              All account management is handled by the parent/guardian.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">4. Data Usage</h2>
            <p>Your data is used solely for:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Providing and personalizing the educational content.</li>
              <li>Tracking progress for the Parent Dashboard.</li>
              <li>Improving app performance and fixing bugs.</li>
            </ul>
            <p className="mt-4 font-bold">We do NOT sell your data to third parties or use it for advertising.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">5. Contact Us</h2>
            <p>
              If you have questions about this policy, please contact us at <a href="mailto:support@mathbits.app" className="text-sky-600 font-bold hover:underline">support@mathbits.app</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}