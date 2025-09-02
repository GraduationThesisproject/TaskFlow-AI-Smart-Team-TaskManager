import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Typography, Badge, Progress, Avatar, AvatarFallback, Container, Grid, Flex, Stack, getInitials, getAvatarColor } from '../index';

// Example usage of the design system components
export function DashboardExample() {
  const tasks = [
    {
      id: 1,
      title: "Set up database schema",
      status: "to-do" as const,
      priority: "very-high" as const,
      progress: 70,
      assignees: ["Alex Chen", "Sarah Kim"],
      dueDate: "2024-01-15"
    },
    {
      id: 2,
      title: "Launch new email campaign",
      status: "completed" as const,
      priority: "low" as const,
      progress: 100,
      assignees: ["Mike Johnson"],
      dueDate: "2024-01-12"
    },
    {
      id: 3,
      title: "Implement user feedback from surveys",
      status: "in-progress" as const,
      priority: "high" as const,
      progress: 67,
      assignees: ["Emma Wilson", "John Smith", "Lisa Park"],
      dueDate: "2024-01-25"
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Container size="7xl" className="py-8">
        <div className="mb-8">
          <Typography variant="heading-xl" className="mb-2">
            Finance Dashboard
          </Typography>
          <Typography variant="body-large" textColor="muted">
            Manage your tasks and track progress across all projects
          </Typography>
        </div>

        <Flex justify="between" align="center" className="mb-6">
          <Flex align="center" gap="sm">
            <Button variant="default" size="default">
              + Add Task
            </Button>
            <Button variant="outline" size="default">
              Filter
            </Button>
          </Flex>
          <Typography variant="body-medium" textColor="muted">
            {tasks.length} tasks
          </Typography>
        </Flex>

        <Grid cols={3} gap="md">
          {tasks.map((task) => (
            <Card key={task.id} variant="default" className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Badge variant={task.status} size="sm">
                    {task.status.replace('-', ' ')}
                  </Badge>
                  <Badge variant={task.priority} size="sm">
                    {task.priority.replace('-', ' ')}
                  </Badge>
                </div>
                <CardTitle className="mt-3">{task.title}</CardTitle>
                <CardDescription>
                  Due: {task.dueDate}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Stack spacing="md">
                  <div>
                    <Flex justify="between" align="center" className="mb-2">
                      <Typography variant="small" textColor="muted">
                        Progress
                      </Typography>
                      <Typography variant="small" textColor="muted">
                        {task.progress}%
                      </Typography>
                    </Flex>
                    <Progress 
                      value={task.progress} 
                      variant={task.status === 'completed' ? 'success' : 'default'}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <Typography variant="small" textColor="muted" className="mb-2">
                      Assignees
                    </Typography>
                    <Flex align="center" gap="xs">
                      {task.assignees.slice(0, 3).map((assignee, index) => (
                        <Avatar key={index} size="sm">
                          <AvatarFallback variant={getAvatarColor(assignee)} size="sm">
                            {getInitials(assignee)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {task.assignees.length > 3 && (
                        <Typography variant="small" textColor="muted">
                          +{task.assignees.length - 3} more
                        </Typography>
                      )}
                    </Flex>
                  </div>
                </Stack>
              </CardContent>
              <CardFooter>
                <Flex gap="sm" className="w-full">
                  <Button variant="ghost" size="sm" className="flex-1">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    View
                  </Button>
                </Flex>
              </CardFooter>
            </Card>
          ))}
        </Grid>

        <div className="mt-8 text-center">
          <Button variant="gradient" size="lg">
            Create New Project
          </Button>
        </div>

        <Card className="mt-8" padding="default">
          <CardHeader>
            <CardTitle>Typography Scale</CardTitle>
            <CardDescription>
              All typography tokens using Inter font family
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Stack spacing="lg">
              <div>
                <Typography variant="heading-xl">Heading XL</Typography>
                <Typography variant="caption" textColor="muted">
                  Inter Bold, 36px, font-bold text-36
                </Typography>
              </div>
              <div>
                <Typography variant="heading-large">Heading Large</Typography>
                <Typography variant="caption" textColor="muted">
                  Inter Bold, 20px, font-bold text-20
                </Typography>
              </div>
              <div>
                <Typography variant="body-large">
                  This is a large body text example that shows how the 18px Inter Regular looks in context with other typography elements.
                </Typography>
                <Typography variant="caption" textColor="muted">
                  Inter Regular, 18px, text-18
                </Typography>
              </div>
              <div>
                <Typography variant="body-medium">
                  This is medium body text at 16px Inter Regular, commonly used for standard paragraph content.
                </Typography>
                <Typography variant="caption" textColor="muted">
                  Inter Regular, 16px, text-16
                </Typography>
              </div>
              <div>
                <Typography variant="body-small">
                  Small body text at 14px Inter Regular for captions, labels, and secondary information.
                </Typography>
                <Typography variant="caption" textColor="muted">
                  Inter Regular, 14px, text-14
                </Typography>
              </div>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}

export default DashboardExample;
