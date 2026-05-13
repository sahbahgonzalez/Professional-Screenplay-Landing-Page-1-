import { useState, useEffect } from "react";
import { Shield, FileCheck } from "lucide-react";
import { Link } from "react-router";
import * as api from "../utils/api";

interface CopyrightData {
  title: string;
  subtitle: string;
  copyrightNotice: {
    year: string;
    owner: string;
    description: string;
  };
  wgaRegistration: string;
  copyrightOfficeDate: string;
  rightsStatement: string;
  ndaNotice: string;
}

export function Copyright() {
  const [copyrightData, setCopyrightData] = useState<CopyrightData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const content = await api.fetchContent();
        if (content.copyright) {
          setCopyrightData(content.copyright);
        } else {
          // Use default data
          const defaultData = await api.fetchCopyright();
          setCopyrightData({
            title: defaultData.title,
            subtitle: defaultData.subtitle,
            copyrightNotice: defaultData.copyrightNotice,
            wgaRegistration: defaultData.wgaRegistration,
            copyrightOfficeDate: defaultData.copyrightOfficeDate,
            rightsStatement: [
              defaultData.reproduction,
              defaultData.adaptationRights,
              defaultData.commercialUse,
              defaultData.confidentiality
            ].join('\n\n'),
            ndaNotice: defaultData.ndaNotice
          });
        }
      } catch (error) {
        console.error("Failed to load copyright data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();

    window.addEventListener('contentDataUpdated', loadData);
    return () => {
      window.removeEventListener('contentDataUpdated', loadData);
    };
  }, []);

  if (isLoading || !copyrightData) {
    return (
      <div className="min-h-screen py-16 px-4 flex items-center justify-center">
        <p className="text-white text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl mb-4 text-center text-white">{copyrightData.title}</h1>
        <p className="text-center text-white mb-12 text-lg">
          {copyrightData.subtitle}
        </p>

        <div className="space-y-8">
          {/* Copyright Notice */}
          <div className="bg-gray-50 p-8 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-primary flex-shrink-0" />
              <h2 className="text-2xl font-semibold text-black">Copyright Notice</h2>
            </div>
            <p className="text-lg mb-2 font-medium text-black">
              © {copyrightData.copyrightNotice.year} {copyrightData.copyrightNotice.owner}. All Rights Reserved.
            </p>
            <p className="text-gray-700 leading-relaxed">
              {copyrightData.copyrightNotice.description}
            </p>
          </div>

          {/* NDA Notice */}
          <div className="bg-gray-50 p-8 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <FileCheck className="w-8 h-8 text-primary flex-shrink-0" />
              <h2 className="text-2xl font-semibold text-black">NDA Notice</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              {copyrightData.ndaNotice}
            </p>
            <div className="mt-6 pt-6 border-t border-gray-300">
              <p className="text-gray-700">
                For questions regarding copyright, permissions, rights acquisition, or other legal matters, please use the{" "}
                <Link to="/request-script" className="text-primary hover:underline font-medium">
                  Request Script
                </Link>{" "}
                form for all correspondence.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}