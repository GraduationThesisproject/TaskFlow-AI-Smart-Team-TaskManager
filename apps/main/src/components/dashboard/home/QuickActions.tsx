import { Card, CardHeader, CardTitle, CardContent, Button } from "@taskflow/ui";
import { Plus, Users, Calendar } from "lucide-react";

export const QuickActions: React.FC = () => (
  <Card>
    <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
    <CardContent className="space-y-3">
      <Button variant="outline" className="w-full justify-start"><Plus className="h-4 w-4 mr-2" /> Create New Task</Button>
      <Button variant="outline" className="w-full justify-start"><Users className="h-4 w-4 mr-2" /> Invite Team Member</Button>
      <Button variant="outline" className="w-full justify-start"><Calendar className="h-4 w-4 mr-2" /> Schedule Meeting</Button>
    </CardContent>
  </Card>
);
