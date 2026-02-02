import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserCog, Database, ArrowLeft } from "lucide-react";

const AdminModule = () => {
  const navigate = useNavigate();

  const modules = [
    {
      title: "Customers",
      description: "Manage customer records and details.",
      icon: Users,
      path: "/customers",
    },
    {
      title: "Users",
      description: "Add, remove, or update user access.",
      icon: UserCog,
      path: "/users",
    },
    {
      title: "Token Management",
      description: "Manage authentication tokens securely.",
      icon: Database,
      path: "/token-management",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="default"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Module</h1>
          <p className="text-muted-foreground">Manage system settings and access controls</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Card
                key={module.title}
                className="cursor-pointer hover:shadow-lg transition-all hover:border-primary/50"
                onClick={() => navigate(module.path)}
              >
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-xl">{module.title}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminModule;
