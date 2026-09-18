import React from 'react';
import Title from '../components/Title';

const PrivacyPolicy = () => {
  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <Title text1="PRIVACY" text2="POLICY" />
        <p className="text-xs sm:text-sm text-zinc-500 max-w-lg mx-auto mt-1">
          How we handle and protect your personal information at Kaviro.
        </p>
      </div>

      <div className="max-w-3xl mx-auto text-xs sm:text-sm text-zinc-600 space-y-6 leading-relaxed">
        <div className="p-5 bg-zinc-50 border border-zinc-200/80 rounded-2xl">
          <p className="text-zinc-900 font-medium">
            Kaviro (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is founded and operated by <strong>Mahim Afridi</strong>. We are committed to safeguarding your privacy and ensuring your personal information is strictly protected.
          </p>
          <p className="text-xs text-zinc-400 mt-1">Effective Date: 2025–2026 | Last Updated for Kaviro</p>
        </div>

        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-zinc-900 mb-2">1. Information We Collect</h3>
          <p>
            When you place an order or create an account on Kaviro, we collect necessary contact and delivery details including your full name, email address, physical delivery address, and telephone number (solely for parcel delivery dispatch and confirmation).
          </p>
        </div>

        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-zinc-900 mb-2">2. How We Use Your Data</h3>
          <ul className="list-disc list-inside space-y-1.5">
            <li>Processing, packing, and dispatching your gadget and tech orders.</li>
            <li>Providing shipping notifications and courier tracking updates via SMS or email.</li>
            <li>Responding to customer support inquiries via phone (01880172859 / 01742111888) or WhatsApp.</li>
            <li>Improving our site performance and catalog browsing experience.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-zinc-900 mb-2">3. Payment &amp; Security</h3>
          <p>
            We support secure Cash on Delivery (COD) alongside certified payment gateways. We never store or log your sensitive credit card credentials or banking PINs on our servers.
          </p>
        </div>

        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-zinc-900 mb-2">4. Questions &amp; Support</h3>
          <p>
            If you have questions regarding this Privacy Policy or wish to update your details, please contact founder Mahim Afridi directly at{' '}
            <a href="mailto:contact@kaviro.com" className="text-zinc-950 font-bold underline">contact@kaviro.com</a> or call{' '}
            <a href="tel:01880172859" className="text-zinc-950 font-bold underline">01880172859</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
