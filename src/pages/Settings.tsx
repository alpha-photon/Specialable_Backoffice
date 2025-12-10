import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export default function Settings() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground">Settings</h2>
        <p className="text-muted-foreground mt-2">Platform configuration and settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Settings page coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}

