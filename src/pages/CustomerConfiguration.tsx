import { useNavigate, useParams } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Settings, Shield, Bell, Palette, Database } from "lucide-react";

const initialMockCustomers = [
  { id: 1, name: "101abc1" },
  { id: 2, name: "1258c11" },
  { id: 3, name: "56785555" },
  { id: 4, name: "66y" },
  { id: 5, name: "9test" },
];

const configSections = [
  {
    title: "General Settings",
    description: "Basic customer configuration and preferences.",
    icon: Settings,
  },
  {
    title: "Security & Access",
    description: "Manage permissions, roles, and authentication policies.",
    icon: Shield,
  },
  {
    title: "Notifications",
    description: "Configure alerts, emails, and event triggers.",
    icon: Bell,
  },
  {
    title: "Branding",
    description: "Customize logo, theme colors, and visual identity.",
    icon: Palette,
  },
  {
    title: "Data & Integrations",
    description: "API keys, data retention, and third-party connectors.",
    icon: Database,
  },
];

const CustomerConfiguration = () => {
  const navigate = useNavigate();
  const { customerId } = useParams<{ customerId: string }>();
  const customer = initialMockCustomers.find((c) => c.id === Number(customerId));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="outline"
          onClick={() => navigate("/customers")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" focusable="false" />
          Back to Customers
        </Button>

        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
          <ol className="flex items-center gap-2 flex-wrap">
            <li>
              <button
                onClick={() => navigate("/admin-module")}
                className="hover:text-primary transition-colors"
              >
                Admin Module
              </button>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <button
                onClick={() => navigate("/customers")}
                className="hover:text-primary transition-colors"
              >
                Customers
              </button>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-foreground font-medium">Configuration</li>
          </ol>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Configuration {customer ? `– ${customer.name}` : ""}
          </h1>
          <p className="text-muted-foreground">
            Manage configuration settings for this customer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {configSections.map((section) => {
            const Icon = section.icon;
            return (
              <Card
                key={section.title}
                className="hover:shadow-lg transition-all hover:border-primary/50"
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" aria-hidden="true" focusable="false" />
                    </div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                  </div>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Configure
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default CustomerConfiguration;
