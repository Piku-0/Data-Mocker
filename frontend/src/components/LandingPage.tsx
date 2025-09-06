import { Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LandingPage({ onLoginClick }: { onLoginClick: () => void }) {
  return (
    <main className="flex flex-col h-screen bg-background text-foreground">
        <header className="flex justify-end p-4">
          <Button onClick={onLoginClick}>Sign In / Sign Up</Button>
        </header>
      <div className="flex-grow flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-2xl w-full">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-emerald-400 text-transparent bg-clip-text">
            Hello, Welcome
          </h1>
          <p className="text-muted-foreground mb-8 text-lg">How can I help you today?</p>
          <div className="relative mb-8">
            <Input
              type="text"
              placeholder="Describe the data you want to generate..."
              className="w-full p-6 text-center"
              disabled
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="text-left bg-secondary hover:bg-muted cursor-pointer" onClick={onLoginClick}>
              <CardHeader>
                <CardTitle className="text-base">Generate User Data</CardTitle>
                <CardDescription className="text-xs">Create a list of users with names and emails.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-left bg-secondary hover:bg-muted cursor-pointer" onClick={onLoginClick}>
              <CardHeader>
                <CardTitle className="text-base">Generate Product Listings</CardTitle>
                <CardDescription className="text-xs">Mock up an e-commerce inventory with prices.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-left bg-secondary hover:bg-muted cursor-pointer" onClick={onLoginClick}>
              <CardHeader>
                <CardTitle className="text-base">Generate Financial Records</CardTitle>
                <CardDescription className="text-xs">Simulate stock prices or transaction histories.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}