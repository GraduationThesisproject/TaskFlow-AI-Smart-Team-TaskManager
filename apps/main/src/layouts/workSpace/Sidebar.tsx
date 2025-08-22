import { NavLink, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const { search } = useLocation();
  return (
    <aside className="h-ful w-60 border-r border-border bg-[hsl(var(--neutral-200))] text-foreground/90 shadow-[0_0_10px_hsl(var(--accent))] 
             ring-1 ring-primary/20 
             backdrop-blur bg-neutral-100" >
      <div className="flex flex-col gap-3 p-4 ">
         {/* Section title */}
         <h3 className="px-2 text-[13px] font-medium tracking-wide text-primary-400" style={{color: "hsl(var(--accent))"}}>Workspace</h3>

         {/* Workspace card */}
         <div className="bg-neutral-200 rounded-xl p-3 
             shadow-[0_0_10px_hsl(var(--accent))] 
             backdrop-blur">
           <div className="flex items-center gap-3" >
             <div className="flex h-9 w-9 items-center justify-center rounded-full text-primary-500" style={{background: 'linear-gradient(90deg, hsl(var(--info)) 0%, hsl(var(--accent)) 100%)'}}>
             <svg width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9.84375 16H0.84375V0H9.84375V16Z" stroke="#E5E7EB"/>
<g clip-path="url(#clip0_222_498)">
<path d="M1.96875 1.5C1.34766 1.5 0.84375 2.00391 0.84375 2.625V12.375C0.84375 12.9961 1.34766 13.5 1.96875 13.5H4.21875V11.625C4.21875 11.0039 4.72266 10.5 5.34375 10.5C5.96484 10.5 6.46875 11.0039 6.46875 11.625V13.5H8.71875C9.33984 13.5 9.84375 12.9961 9.84375 12.375V2.625C9.84375 2.00391 9.33984 1.5 8.71875 1.5H1.96875ZM2.34375 7.125C2.34375 6.91875 2.5125 6.75 2.71875 6.75H3.46875C3.675 6.75 3.84375 6.91875 3.84375 7.125V7.875C3.84375 8.08125 3.675 8.25 3.46875 8.25H2.71875C2.5125 8.25 2.34375 8.08125 2.34375 7.875V7.125ZM4.96875 6.75H5.71875C5.925 6.75 6.09375 6.91875 6.09375 7.125V7.875C6.09375 8.08125 5.925 8.25 5.71875 8.25H4.96875C4.7625 8.25 4.59375 8.08125 4.59375 7.875V7.125C4.59375 6.91875 4.7625 6.75 4.96875 6.75ZM6.84375 7.125C6.84375 6.91875 7.0125 6.75 7.21875 6.75H7.96875C8.175 6.75 8.34375 6.91875 8.34375 7.125V7.875C8.34375 8.08125 8.175 8.25 7.96875 8.25H7.21875C7.0125 8.25 6.84375 8.08125 6.84375 7.875V7.125ZM2.71875 3.75H3.46875C3.675 3.75 3.84375 3.91875 3.84375 4.125V4.875C3.84375 5.08125 3.675 5.25 3.46875 5.25H2.71875C2.5125 5.25 2.34375 5.08125 2.34375 4.875V4.125C2.34375 3.91875 2.5125 3.75 2.71875 3.75ZM4.59375 4.125C4.59375 3.91875 4.7625 3.75 4.96875 3.75H5.71875C5.925 3.75 6.09375 3.91875 6.09375 4.125V4.875C6.09375 5.08125 5.925 5.25 5.71875 5.25H4.96875C4.7625 5.25 4.59375 5.08125 4.59375 4.875V4.125ZM7.21875 3.75H7.96875C8.175 3.75 8.34375 3.91875 8.34375 4.125V4.875C8.34375 5.08125 8.175 5.25 7.96875 5.25H7.21875C7.0125 5.25 6.84375 5.08125 6.84375 4.875V4.125C6.84375 3.91875 7.0125 3.75 7.21875 3.75Z" fill="white"/>
</g>
<defs>
<clipPath id="clip0_222_498">
<path d="M0.84375 1.5H9.84375V13.5H0.84375V1.5Z" fill="white"/>
</clipPath>
</defs>
</svg>

            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-small" style={{color: "hsl(var(--accent))"}}>Douzi Hazem's</span>
              <span className="truncate text-xs text-foreground/70" style={{color: "hsl(var(--accent))"}}>workspace</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="mt-1">
          <ul className="flex flex-col gap-1">
            {/* Boards */}
            <li>
              <NavLink
                to={`/workspace/boards${search}`}
                className={({ isActive }) =>
                  isActive
                    ? 'mx-1 flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/20 px-3 py-2 text-sm text-foreground shadow-[0_0_0_1px_rgba(0,232,198,0.15),_0_8px_30px_-12px_rgba(0,232,198,0.35)] ring-1 ring-accent/30'
                    : 'group mx-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground/85 hover:bg-muted/30 hover:text-foreground transition-colors'
                }
              >
<svg width="12" height="16" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_222_439)">
<path d="M6 0C4.69375 0 3.58125 0.834375 3.17188 2H2C0.896875 2 0 2.89687 0 4V14C0 15.1031 0.896875 16 2 16H10C11.1031 16 12 15.1031 12 14V4C12 2.89687 11.1031 2 10 2H8.82812C8.41875 0.834375 7.30625 0 6 0ZM6 2C6.26522 2 6.51957 2.10536 6.70711 2.29289C6.89464 2.48043 7 2.73478 7 3C7 3.26522 6.89464 3.51957 6.70711 3.70711C6.51957 3.89464 6.26522 4 6 4C5.73478 4 5.48043 3.89464 5.29289 3.70711C5.10536 3.51957 5 3.26522 5 3C5 2.73478 5.10536 2.48043 5.29289 2.29289C5.48043 2.10536 5.73478 2 6 2ZM3.5 6H8.5C8.775 6 9 6.225 9 6.5C9 6.775 8.775 7 8.5 7H3.5C3.225 7 3 6.775 3 6.5C3 6.225 3.225 6 3.5 6Z" fill="white"/>
</g>
<defs>
<clipPath id="clip0_222_439">
<path d="M0 0H12V16H0V0Z" fill="white"/>
</clipPath>
</defs>
</svg>

                <span className="font-medium" style={{color: "hsl(var(--primary-foreground))"}}>Boards</span>
              </NavLink>
            </li>

            {/* Members */}
            <li>
              <NavLink
                to={`/workspace${search}`}
                end
                className={({ isActive }) =>
                  isActive
                    ? 'mx-1 flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/20 px-3 py-2 text-sm text-foreground shadow-[0_0_0_1px_rgba(0,232,198,0.15),_0_8px_30px_-12px_rgba(0,232,198,0.35)] ring-1 ring-accent/30'
                    : 'group mx-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground/85 hover:bg-muted/30 hover:text-foreground transition-colors'
                }
              >
                <svg className="outline-none [&>path:first-of-type]:hidden" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M20 20H0V0H20V20Z" stroke="#E5E7EB"/>
<g >
<path d="M4.5 2C5.16304 2 5.79893 2.26339 6.26777 2.73223C6.73661 3.20107 7 3.83696 7 4.5C7 5.16304 6.73661 5.79893 6.26777 6.26777C5.79893 6.73661 5.16304 7 4.5 7C3.83696 7 3.20107 6.73661 2.73223 6.26777C2.26339 5.79893 2 5.16304 2 4.5C2 3.83696 2.26339 3.20107 2.73223 2.73223C3.20107 2.26339 3.83696 2 4.5 2ZM16 2C16.663 2 17.2989 2.26339 17.7678 2.73223C18.2366 3.20107 18.5 3.83696 18.5 4.5C18.5 5.16304 18.2366 5.79893 17.7678 6.26777C17.2989 7.73661 16.663 7 16 7C15.337 7 14.7011 6.73661 14.2322 6.26777C13.7634 5.79893 13.5 5.16304 13.5 4.5C13.5 3.83696 13.7634 3.20107 14.2322 2.73223C14.7011 2.26339 15.337 2 16 2ZM0 11.3344C0 9.49375 1.49375 8 3.33437 8H4.66875C5.16562 8 5.6375 8.10938 6.0625 8.30312C6.02187 8.52812 6.00313 8.7625 6.00313 9C6.00313 10.1938 6.52812 11.2656 7.35625 12C7.35 12 7.34375 12 7.33437 12H0.665625C0.3 12 0 11.7 0 11.3344ZM12.6656 12C12.6594 12 12.6531 12 12.6438 12C13.475 11.2656 13.9969 10.1938 13.9969 9C13.9969 8.7625 13.975 8.53125 13.9375 8.30312C14.3625 8.10625 14.8344 8 15.3313 8H16.6656C18.5063 8 20 9.49375 20 11.3344C20 11.7031 19.7 12 19.3344 12H12.6656ZM7 9C7 8.20435 7.31607 7.44129 7.87868 6.87868C8.44129 6.31607 9.20435 6 10 6C10.7956 6 11.5587 6.31607 12.1213 6.87868C12.6839 7.44129 13 8.20435 13 9C13 9.79565 12.6839 10.5587 12.1213 11.1213C11.5587 11.6839 10.7956 12 10 12C9.20435 12 8.44129 11.6839 7.87868 11.1213C7.31607 10.5587 7 9.79565 7 9ZM4 17.1656C4 14.8656 5.86562 13 8.16562 13H11.8344C14.1344 13 16 14.8656 16 17.1656C16 17.625 15.6281 18 15.1656 18H4.83437C4.375 18 4 17.6281 4 17.1656Z" fill="#00EBCB"/>
</g>
<defs>
<clipPath id="clip0_222_442">
<path d="M0 2H20V18H0V2Z" fill="white"/>
</clipPath>
</defs>
</svg>

                <span className="font-medium" style={{color: "hsl(var(--primary-foreground))"}}>Members</span>
              </NavLink>
            </li>

            {/* Settings */}
            <li>
              <NavLink
                to={`/workspace/settings${search}`}
                className={({ isActive }) =>
                  isActive
                    ? 'mx-1 flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/20 px-3 py-2 text-sm text-foreground shadow-[0_0_0_1px_rgba(0,232,198,0.15),_0_8px_30px_-12px_rgba(0,232,198,0.35)] ring-1 ring-accent/30'
                    : 'group mx-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground/85 hover:bg-muted/30 hover:text-foreground transition-colors'
                }
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_222_448)">
<g clip-path="url(#clip1_222_448)">
<path d="M15.4977 5.20625C15.5977 5.47813 15.5133 5.78125 15.2977 5.975L13.9445 7.20625C13.9789 7.46563 13.9977 7.73125 13.9977 8C13.9977 8.26875 13.9789 8.53438 13.9445 8.79375L15.2977 10.025C15.5133 10.2188 15.5977 10.5219 15.4977 10.7937C15.3602 11.1656 15.1945 11.5219 15.0039 11.8656L14.857 12.1187C14.6508 12.4625 14.4195 12.7875 14.1664 13.0938C13.982 13.3188 13.6758 13.3937 13.4008 13.3062L11.6602 12.7531C11.2414 13.075 10.7789 13.3438 10.2852 13.5469L9.89454 15.3313C9.83204 15.6156 9.61329 15.8406 9.32579 15.8875C8.89454 15.9594 8.45079 15.9969 7.99766 15.9969C7.54454 15.9969 7.10079 15.9594 6.66954 15.8875C6.38204 15.8406 6.16329 15.6156 6.10079 15.3313L5.71016 13.5469C5.21641 13.3438 4.75391 13.075 4.33516 12.7531L2.59766 13.3094C2.32266 13.3969 2.01641 13.3188 1.83204 13.0969C1.57891 12.7906 1.34766 12.4656 1.14141 12.1219L0.994539 11.8687C0.803914 11.525 0.638289 11.1687 0.500789 10.7969C0.400789 10.525 0.485164 10.2219 0.700789 10.0281L2.05391 8.79688C2.01954 8.53438 2.00079 8.26875 2.00079 8C2.00079 7.73125 2.01954 7.46563 2.05391 7.20625L0.700789 5.975C0.485164 5.78125 0.400789 5.47813 0.500789 5.20625C0.638289 4.83438 0.803914 4.47813 0.994539 4.13438L1.14141 3.88125C1.34766 3.5375 1.57891 3.2125 1.83204 2.90625C2.01641 2.68125 2.32266 2.60625 2.59766 2.69375L4.33829 3.24688C4.75704 2.925 5.21954 2.65625 5.71329 2.45312L6.10391 0.66875C6.16641 0.384375 6.38516 0.159375 6.67266 0.1125C7.10391 0.0375 7.54766 0 8.00079 0C8.45391 0 8.89767 0.0375 9.32891 0.109375C9.61642 0.15625 9.83517 0.38125 9.89767 0.665625L10.2883 2.45C10.782 2.65313 11.2445 2.92188 11.6633 3.24375L13.4039 2.69062C13.6789 2.60312 13.9852 2.68125 14.1695 2.90313C14.4227 3.20938 14.6539 3.53437 14.8602 3.87812L15.007 4.13125C15.1977 4.475 15.3633 4.83125 15.5008 5.20312L15.4977 5.20625ZM8.00079 10.5C8.66383 10.5 9.29972 10.2366 9.76856 9.76777C10.2374 9.29893 10.5008 8.66304 10.5008 8C10.5008 7.33696 10.2374 6.70107 9.76856 6.23223C9.29972 5.76339 8.66383 5.5 8.00079 5.5C7.33775 5.5 6.70186 5.76339 6.23302 6.23223C5.76418 6.70107 5.50079 7.33696 5.50079 8C5.50079 8.66304 5.76418 9.29893 6.23302 9.76777C6.70186 10.2366 7.33775 10.5 8.00079 10.5Z" fill="white"/>
</g>
</g>
<defs>
<clipPath id="clip0_222_448">
<rect width="16" height="16" fill="white"/>
</clipPath>
<clipPath id="clip1_222_448">
<path d="M0 0H16V16H0V0Z" fill="white"/>
</clipPath>
</defs>
</svg>

                <span className="font-medium" style={{color: "hsl(var(--primary-foreground))"}}>Settings</span>
              </NavLink>
            </li>

            {/* Upgrade */}
            <li>
              <NavLink
                to={`/workspace/upgrade${search}`}
                className={({ isActive }) =>
                  isActive
                    ? 'mx-1 flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/20 px-3 py-2 text-sm text-foreground shadow-[0_0_0_1px_rgba(0,232,198,0.15),_0_8px_30px_-12px_rgba(0,232,198,0.35)] ring-1 ring-accent/30'
                    : 'group mx-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground/85 hover:bg-muted/30 hover:text-foreground transition-colors'
                }
              >
                <svg width="12" height="16" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_222_452)">
<g clip-path="url(#clip1_222_452)">
<path d="M6.70664 1.2937C6.31602 0.903076 5.68164 0.903076 5.29102 1.2937L0.291016 6.2937C-0.0996094 6.68433 -0.0996094 7.3187 0.291016 7.70933C0.681641 8.09995 1.31602 8.09995 1.70664 7.70933L5.00039 4.41245V14C5.00039 14.5531 5.44727 15 6.00039 15C6.55352 15 7.00039 14.5531 7.00039 14V4.41245L10.2941 7.7062C10.6848 8.09683 11.3191 8.09683 11.7098 7.7062C12.1004 7.31558 12.1004 6.6812 11.7098 6.29058L6.70977 1.29058L6.70664 1.2937Z" fill="white"/>
</g>
</g>
<defs>
<clipPath id="clip0_222_452">
<rect width="12" height="16" fill="white"/>
</clipPath>
<clipPath id="clip1_222_452">
<path d="M0 0H12V16H0V0Z" fill="white"/>
</clipPath>
</defs>
</svg>

                <span className="font-medium" style={{color: "hsl(var(--primary-foreground))"}}>Upgrade</span>
              </NavLink>
            </li>

            {/* Reports */}
            <li>
              <NavLink
                to={`/workspace/reports${search}`}
                className={({ isActive }) =>
                  isActive
                    ? 'mx-1 flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/20 px-3 py-2 text-sm text-foreground shadow-[0_0_0_1px_rgba(0,232,198,0.15),_0_8px_30px_-12px_rgba(0,232,198,0.35)] ring-1 ring-accent/30'
                    : 'group mx-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground/85 hover:bg-muted/30 hover:text-foreground transition-colors'
                }
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16 16H0V0H16V16Z" stroke="#E5E7EB"/>
<path d="M2 2C2 1.44687 1.55313 1 1 1C0.446875 1 0 1.44687 0 2V12.5C0 13.8813 1.11875 15 2.5 15H15C15.5531 15 16 14.5531 16 14C16 13.4469 15.5531 13 15 13H2.5C2.225 13 2 12.775 2 12.5V2ZM14.7063 4.70625C15.0969 4.31563 15.0969 3.68125 14.7063 3.29063C14.3156 2.9 13.6812 2.9 13.2906 3.29063L10 6.58437L8.20625 4.79063C7.81563 4.4 7.18125 4.4 6.79063 4.79063L3.29063 8.29062C2.9 8.68125 2.9 9.31563 3.29063 9.70625C3.68125 10.0969 4.31563 10.0969 4.70625 9.70625L7.5 6.91563L9.29375 8.70938C9.68437 9.1 10.3188 9.1 10.7094 8.70938L14.7094 4.70937L14.7063 4.70625Z" fill="white"/>
</svg>

                <span className="font-medium" style={{color: "hsl(var(--primary-foreground))"}}>Reports</span>
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
