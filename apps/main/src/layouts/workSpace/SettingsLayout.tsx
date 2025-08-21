import Sidebar from "./Sidebar";
import GlobeIcon from "../../components/workspace/settings-page/GlobeIcon";
import BuildingIcon from "../../components/workspace/settings-page/BuildingIcon";
import LockIcon from "../../components/workspace/settings-page/LockIcon";
import SlidersIcon from "../../components/workspace/settings-page/SlidersIcon";

import {
  Card,
  CardTitle,
  CardDescription,
  Button,
  Typography,
  Gradient,
} from "@taskflow/ui";

function SettingsLayout() {
  const sections = [
    {
      key: "visibility",
      title: "Workspace Visibility",
      description:
        "Private – This Workspace is private. It's not indexed or visible to those outside the Workspace.",
      cta: "Change",
    },
    {
      key: "slack",
      title: "Slack Workspaces Linking",
      description:
        "Link your Slack and Trello Workspaces together to collaborate on Trello projects from within Slack.",
      cta: "Add to Slack",
      learnMore: true,
    },
    {
      key: "membership",
      title: "Workspace Membership Restrictions",
      description: "Any can be added to this Workspace.",
      cta: "Change",
    },
    {
      key: "creation",
      title: "Board Creation Restrictions",
      bullets: [
        "Any Workspace member can create public boards.",
        "Any Workspace member can create Workspace visible boards.",
        "Any Workspace member can create private boards.",
      ],
      cta: "Change",
    },
    {
      key: "deletion",
      title: "Board Deletion Restrictions",
      bullets: [
        "Any Workspace member can delete public boards.",
        "Any Workspace member can delete Workspace visible boards.",
        "Any Workspace member can delete private boards.",
      ],
      cta: "Change",
    },
    {
      key: "guests",
      title: "Sharing Boards with Guests",
      description:
        "Anybody can send or receive invitations to boards in this Workspace.",
      cta: "Change",
    },
    {
      key: "slack-restrictions",
      title: "Slack Workspaces Restrictions",
      description:
        "Any Workspace member can link and unlink this Trello Workspace with Slack workspaces.",
      cta: "Change",
    },
  ];

  return (
    <div className="flex min-h-screen  text-[hsl(var(--foreground))]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto ">
        <div>
          <div className="bg-neutral-0 shadow-[0_0_0_1px_rgba(0,232,198,0.12),_0_8px_30px_-12px_rgba(0,232,198,0.25)] ring-1 ring-accent/10 px-5 sm:px-6 lg:px-8 py-6">
            {/* Page Header */}
            <header className="mb-6 flex flex-row items-center border-b border-[hsl(var(--neutral-200))]">
            <div className="flex h-9 w-9 items-center justify-center rounded-full text-primary-500" style={{background: 'linear-gradient(90deg, hsl(var(--info)) 0%, hsl(var(--accent)) 100%)'}}>
             <svg width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9.84375 16H0.84375V0H9.84375V16Z" stroke="#E5E7EB"/>
<g clip-path="url(#clip0_222_498)">
<path d="M1.96875 1.5C1.34766 1.5 0.84375 2.00391 0.84375 2.625V12.375C0.84375 12.9961 1.34766 13.5 1.96875 13.5H4.21875V11.625C4.21875 11.0039 4.72266 10.5 5.34375 10.5C5.96484 10.5 6.46875 11.0039 6.46875 11.625V13.5H8.71875C9.33984 13.5 9.84375 12.9961 9.84375 12.375V2.625C9.84375 2.00391 9.33984 1.5 8.71875 1.5H1.96875ZM2.34375 7.125C2.34375 6.91875 2.5125 6.75 2.71875 6.75H3.46875C3.675 6.75 3.84375 6.91875 3.84375 7.125V7.875C3.84375 8.08125 3.675 8.25 3.46875 8.25H2.71875C2.5125 8.25 2.34375 8.08125 2.34375 7.875V7.125ZM4.96875 6.75H5.71875C5.925 6.75 6.09375 6.91875 6.09375 7.125V7.875C6.09375 8.08125 5.925 8.25 5.71875 8.25H4.96875C4.7625 8.25 4.59375 8.08125 4.59375 7.875V7.125ZM6.84375 7.125C6.84375 6.91875 7.0125 6.75 7.21875 6.75H7.96875C8.175 6.75 8.34375 6.91875 8.34375 7.125V7.875C8.34375 8.08125 8.175 8.25 7.96875 8.25H7.21875C7.0125 8.25 6.84375 8.08125 6.84375 7.875V7.125ZM2.71875 3.75H3.46875C3.675 3.75 3.84375 3.91875 3.84375 4.125V4.875C3.84375 5.08125 3.675 5.25 3.46875 5.25H2.71875C2.5125 5.25 2.34375 5.08125 2.34375 4.875V4.125C2.34375 3.91875 2.5125 3.75 2.71875 3.75ZM4.59375 4.125C4.59375 3.91875 4.7625 3.75 4.96875 3.75H5.71875C5.925 3.75 6.09375 3.91875 6.09375 4.125V4.875C6.09375 5.08125 5.925 5.25 5.71875 5.25H4.96875C4.7625 5.25 4.59375 5.08125 4.59375 4.875V4.125ZM7.21875 3.75H7.96875C8.175 3.75 8.34375 3.91875 8.34375 4.125V4.875C8.34375 5.08125 8.175 5.25 7.96875 5.25H7.21875C7.0125 5.25 6.84375 5.08125 6.84375 4.875V4.125C6.84375 3.91875 7.0125 3.75 7.21875 3.75Z" fill="white"/>
</g>
<defs>
<clipPath id="clip0_222_498">
<path d="M0.84375 1.5H9.84375V13.5H0.84375V1.5Z" fill="white"/>
</clipPath>
</defs>
</svg>

            </div>
              <div className="flex flex-col items-start gap-3 ml-2 mb-4">

                <Typography variant="h1" className="text-3xl font-bold">
                  Workspace Settings
                </Typography>
                <span className="inline-flex items-center gap-1 rounded-md bg-neutral-100 text-neutral-200 text-xs font-medium px-2 py-0.5">
                  Private
                </span>
              </div>
            </header>

            <div className="space-y-4">
              {/* Settings sections (first two) */}
              {sections.slice(0, 2).map((s) => (
                <Card
                  key={s.key}
                  className="bg-[hsl(var(--neutral-100))] border border-[hsl(var(--neutral-200))] rounded-md"
                >
                  <div className="flex items-start justify-between gap-4 p-5">
                    <div className="min-w-0">
                      <CardTitle className="text-base mb-1">{s.title}</CardTitle>

                      {Array.isArray((s as any).bullets) ? (
                        <ul className="mt-1 space-y-1 text-[13px] text-foreground/80">
                          {(s as any).bullets.map((b: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              {s.key === "creation" || s.key === "deletion" ? (
                                <span className="mt-[2px] inline-flex h-4 w-4 items-center justify-center" aria-hidden>
                                  {i === 0 ? (
                                    <GlobeIcon size={16} className="text-[hsl(var(--accent))]" />
                                  ) : i === 1 ? (
                                    <BuildingIcon size={16} className="text-[hsl(var(--accent))]" />
                                  ) : (
                                    <LockIcon size={16} className="text-[hsl(var(--accent))]" />
                                  )}
                                </span>
                              ) : (
                                <span
                                  className={
                                    i === 0
                                      ? "mt-1 inline-flex h-4 w-4 items-center justify-center rounded-sm bg-[hsl(var(--accent))]/20 text-[hsl(var(--accent))]"
                                      : i === 1
                                      ? "mt-1 inline-flex h-4 w-4 items-center justify-center rounded-sm bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))]"
                                      : "mt-1 inline-flex h-4 w-4 items-center justify-center rounded-sm bg-foreground/10"
                                  }
                                  aria-hidden
                                >
                                  ●
                                </span>
                              )}
                              <span className="flex-1 leading-relaxed">{b}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <CardDescription className="mt-1">
                          {s.description}
                          {(s as any).learnMore && (
                            <a href="#" className="ml-2 text-[13px] text-[hsl(var(--info))] hover:underline">
                              Learn more
                            </a>
                          )}
                        </CardDescription>
                      )}
                    </div>

                    <div className="shrink-0 pt-1">
                      <Button size="sm" className="rounded-md px-4 bg">
                        {s.key === "slack" && (
                          <span className="mr-2 inline-flex items-center">
                            <SlidersIcon size={16} className="text-white" />
                          </span>
                        )}
                        {s.cta}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Upgrade banner (now 3rd row) */}
              <Card className="overflow-hidden border-0 rounded-md shadow-[0_0_10px_hsl(var(--accent))]">
                <Gradient
                  variant="primary"
                  direction="to-r"
                  className="p-0 rounded-md shadow-[0_0_0_1px_rgba(0,232,198,0.18),_0_8px_30px_-12px_rgba(0,122,223,0.45)]"
                >
                  <div className="flex items-center justify-between p-5 shadow-[0_0_10px_hsl(var(--accent))] ">
                    <div>
                      <Typography variant="h3" className="text-white">
                        Upgrade to Premium for more settings
                      </Typography>
                      <Typography variant="caption" className="text-white/90">
                        Unlock advanced workspace management features
                      </Typography>
                    </div>
                    <Button
                      variant="secondary"
                      className="bg-white text-primary hover:bg-white/90 rounded-md px-5"
                      size="sm"
                    >
                      Upgrade
                    </Button>
                  </div>
                </Gradient>
              </Card>

              {/* Settings sections (remaining) */}
              {sections.slice(2).map((s) => (
                <Card
                  key={s.key}
                  className="bg-[hsl(var(--neutral-100))] border border-[hsl(var(--neutral-200))] rounded-md"
                >
                  <div className="flex items-start justify-between gap-4 p-5">
                    <div className="min-w-0">
                      <CardTitle className="text-base mb-1">{s.title}</CardTitle>

                      {Array.isArray((s as any).bullets) ? (
                        <ul className="mt-1 space-y-1 text-[13px] text-foreground/80">
                          {(s as any).bullets.map((b: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              {s.key === "creation" || s.key === "deletion" ? (
                                <span className="mt-[2px] inline-flex h-4 w-4 items-center justify-center" aria-hidden>
                                  {i === 0 ? (
                                    <GlobeIcon size={16} className="text-[hsl(var(--accent))]" />
                                  ) : i === 1 ? (
                                    <BuildingIcon size={16} className="text-[hsl(var(--accent))]" />
                                  ) : (
                                    <LockIcon size={16} className="text-[hsl(var(--accent))]" />
                                  )}
                                </span>
                              ) : (
                                <span
                                  className={
                                    i === 0
                                      ? "mt-1 inline-flex h-4 w-4 items-center justify-center rounded-sm bg-[hsl(var(--accent))]/20 text-[hsl(var(--accent))]"
                                      : i === 1
                                      ? "mt-1 inline-flex h-4 w-4 items-center justify-center rounded-sm bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))]"
                                      : "mt-1 inline-flex h-4 w-4 items-center justify-center rounded-sm bg-foreground/10"
                                  }
                                  aria-hidden
                                >
                                  ●
                                </span>
                              )}
                              <span className="flex-1 leading-relaxed">{b}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <CardDescription className="mt-1">
                          {s.description}
                          {(s as any).learnMore && (
                            <a href="#" className="ml-2 text-[13px] text-[hsl(var(--info))] hover:underline">
                              Learn more
                            </a>
                          )}
                        </CardDescription>
                      )}
                    </div>

                    <div className="shrink-0 pt-1">
                      <Button size="sm" className="rounded-md px-4">
                        {s.key === "slack" && (
                          <span className="mr-2 inline-flex items-center">
                            <SlidersIcon size={16} className="text-white" />
                          </span>
                        )}
                        {s.cta}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SettingsLayout;