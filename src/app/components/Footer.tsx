import { Link } from "react-router";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold mb-4">About the Project</h3>
            <p className="text-gray-400 text-sm">
              An original screenplay seeking production partners and industry
              professionals interested in bringing this story to life.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <div className="flex flex-col gap-2">
              <Link to="/synopsis" className="text-gray-400 hover:text-white text-sm transition-colors">
                Synopsis
              </Link>
              <Link to="/pitch-deck" className="text-gray-400 hover:text-white text-sm transition-colors">
                Pitch Deck
              </Link>
              <Link to="/request-script" className="text-gray-400 hover:text-white text-sm transition-colors">
                Request Script
              </Link>
              <Link to="/copyright" className="text-gray-400 hover:text-white text-sm transition-colors">
                Copyright
              </Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <p className="text-gray-400 text-sm">
              For inquiries, please use the{" "}
              <Link to="/request-script" className="text-white hover:underline">
                Request Script
              </Link>{" "}
              form.
            </p>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; 2026 All Rights Reserved. See <Link to="/copyright" className="hover:text-white transition-colors">Copyright</Link> page for details.</p>
        </div>
      </div>
    </footer>
  );
}
