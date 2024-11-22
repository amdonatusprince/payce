import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-6xl font-bold mb-6">
              The Future of <span className="text-primary-600">Payments</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              First entirely on-chain autonomous and decentralised payment infrastructure for businesses and merchants.
            </p>
            <div className="flex gap-4 justify-center">
              <Link 
                href="/dashboard" 
                className="px-6 py-3 bg-primary-600 text-white rounded-lg"
              >
                Get Started
              </Link>
              <Link 
                href="/marketplace" 
                className="px-6 py-3 border border-primary-600 text-primary-600 rounded-lg"
              >
                Explore Marketplace
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything you need to manage payments
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div 
                key={feature.title} 
                className="bg-white p-6 rounded-xl shadow-sm"
              >
                <div className="text-2xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

const features = [
  {
    icon: "💳",
    title: "Accept Payments",
    description: "Accept crypto payments from anywhere in the world with low fees"
  },
  {
    icon: "📊",
    title: "Track Analytics",
    description: "Real-time insights into your payment flows and business metrics"
  },
  {
    icon: "🔒",
    title: "Secure Escrow",
    description: "Safe and secure payments with built-in escrow functionality"
  }
];