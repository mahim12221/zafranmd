import React from 'react';
import Title from '../components/Title';

const PrivacyPolicy = () => {
  return (
    <div className="py-8 border-t border-gray-200">
      <div className="text-center text-2xl mb-8">
        <Title text1="PRIVACY" text2="POLICY" />
      </div>

      <div className="max-w-3xl mx-auto text-sm text-gray-600 space-y-6 leading-relaxed">
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-gray-900 font-medium">
            Zafran (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is founded and operated by <strong>Mahim Afridi</strong>. We are committed to safeguarding your privacy and ensuring your personal information is protected.
          </p>
          <p className="text-xs text-gray-500 mt-1">Effective Date: January 1, 2025 | Last Updated: 2026</p>
        </div>

        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-2">1. Information We Collect</h3>
          <p>
            When you place an order or create an account on Zafran, we collect necessary contact and shipping details including your full name, email address, physical delivery address, and telephone number (e.g. for delivery dispatch and verification).
          </p>
        </div>

        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-2">2. How We Use Your Data</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Processing, dispatching, and fulfilling your apparel orders.</li>
            <li>Providing order notifications and courier tracking updates via SMS and email.</li>
            <li>Responding to customer service inquiries via phone (01880172859 / 01742111888).</li>
            <li>Improving our website browsing speed, security, and catalog recommendations.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-2">3. Payment Security</h3>
          <p>
            We support secure Cash on Delivery (COD) as well as certified encrypted digital payment gateways. We never store or log your credit card numbers or banking PINs on our servers.
          </p>
        </div>

        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-2">4. Data Protection &amp; Third Parties</h3>
          <p>
            We do not sell, trade, or rent your personal identification information to third parties. Data is shared exclusively with certified logistical and courier partners solely to execute parcel delivery.
          </p>
        </div>

        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-2">5. Contact Our Privacy Lead</h3>
          <p>
            If you have questions regarding this Privacy Policy or wish to request data removal, please contact founder Mahim Afridi directly at{' '}
            <a href="mailto:contact@zafran.com" className="text-black font-medium underline">contact@zafran.com</a> or call{' '}
            <a href="tel:01880172859" className="text-black font-medium underline">01880172859</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
