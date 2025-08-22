import { useState } from "react";
import { Input } from "@taskflow/ui";

export default function Navbar() {
  const [searchFocused, setSearchFocused] = useState(false);
  const [notificationCount] = useState(3);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="w-full h-[67px] bg-card border-b border-border flex items-center px-4 relative font-inter text-foreground">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setMenuOpen(!menuOpen)} 
          className="w-10 h-10 rounded-full border-2 border-transparent flex items-center justify-center hover:bg-secondary/60 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.5 10H17.5M2.5 5H17.5M2.5 15H17.5" stroke="url(#paint0_linear_menu)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
            <defs>
              <linearGradient id="paint0_linear_menu" x1="2.5" y1="5" x2="17.5" y2="15" gradientUnits="userSpaceOnUse">
                <stop stopColor="#007ADF"></stop>
                <stop offset="1" stopColor="#00EBCB"></stop>
              </linearGradient>
            </defs>
          </svg>
        </button>
        <div className="text-foreground text-xl font-bold">Taskflow</div>
      </div>

      <div className="flex items-center gap-4 ml-8">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary/60 transition-colors cursor-pointer">
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.5 7.50033L10 1.66699L17.5 7.50033V16.667C17.5 17.109 17.3244 17.5329 17.0118 17.8455C16.6993 18.1581 16.2754 18.3337 15.8333 18.3337H4.16667C3.72464 18.3337 3.30072 18.1581 2.98816 17.8455C2.67559 17.5329 2.5 17.109 2.5 16.667V7.50033Z" stroke="url(#paint0_linear_home)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
            <path d="M7.5 18.3333V10H12.5V18.3333" stroke="url(#paint1_linear_home)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
            <defs>
              <linearGradient id="paint0_linear_home" x1="2.5" y1="1.66699" x2="17.5" y2="18.3337" gradientUnits="userSpaceOnUse">
                <stop stopColor="#007ADF"></stop>
                <stop offset="1" stopColor="#00EBCB"></stop>
              </linearGradient>
              <linearGradient id="paint1_linear_home" x1="7.5" y1="10" x2="12.5" y2="18.3333" gradientUnits="userSpaceOnUse">
                <stop stopColor="#007ADF"></stop>
                <stop offset="1" stopColor="#00EBCB"></stop>
              </linearGradient>
            </defs>
          </svg>
          <span className="text-foreground text-sm">Home</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary/60 transition-colors cursor-pointer">
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.00065 3.33301V12.6663M3.33398 7.99967H12.6673" stroke="url(#paint0_linear_create)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
            <defs>
              <linearGradient id="paint0_linear_create" x1="3.33398" y1="3.33301" x2="12.6673" y2="12.6663" gradientUnits="userSpaceOnUse">
                <stop stopColor="#007ADF"></stop>
                <stop offset="1" stopColor="#00EBCB"></stop>
              </linearGradient>
            </defs>
          </svg>
          <span className="text-foreground text-sm">Create</span>
        </div>
      </div>

      <div className="flex-1 max-w-[275px] mx-8">
        <div className="relative">
          <Input
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            type="text"
            placeholder="Search..."
            className={`h-[42px] bg-secondary border rounded-lg pl-10 pr-4 text-foreground text-base placeholder:!text-muted-foreground focus-visible:outline-none transition-colors ${
              searchFocused ? 'border-primary' : 'border-input'
            }`}
          />
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="url(#paint0_linear_search)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
            <path d="M13.9996 13.9996L11.0996 11.0996" stroke="url(#paint1_linear_search)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
            <defs>
              <linearGradient id="paint0_linear_search" x1="2" y1="2" x2="12.6667" y2="12.6667" gradientUnits="userSpaceOnUse">
                <stop stopColor="#007ADF"></stop>
                <stop offset="1" stopColor="#00EBCB"></stop>
              </linearGradient>
              <linearGradient id="paint1_linear_search" x1="11.0996" y1="11.0996" x2="13.9996" y2="13.9996" gradientUnits="userSpaceOnUse">
                <stop stopColor="#007ADF"></stop>
                <stop offset="1" stopColor="#00EBCB"></stop>
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-secondary/60 transition-colors cursor-pointer">
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_upgrade)">
              <path d="M8.66667 1.33301L2 9.33301H8L7.33333 14.6663L14 6.66634H8L8.66667 1.33301Z" stroke="url(#paint0_linear_upgrade)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
            </g>
            <defs>
              <linearGradient id="paint0_linear_upgrade" x1="2" y1="1.33301" x2="14" y2="14.6663" gradientUnits="userSpaceOnUse">
                <stop stopColor="#007ADF"></stop>
                <stop offset="1" stopColor="#00EBCB"></stop>
              </linearGradient>
              <clipPath id="clip0_upgrade">
                <rect width="16" height="16" fill="white"></rect>
              </clipPath>
            </defs>
          </svg>
          <span className="text-white text-sm">Upgrade</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.6673 14V12.6667C10.6673 11.9594 10.3864 11.2811 9.88627 10.781C9.38617 10.281 8.70789 10 8.00065 10H4.00065C3.29341 10 2.61513 10.281 2.11503 10.781C1.61494 11.2811 1.33398 11.9594 1.33398 12.6667V14" stroke="url(#paint0_linear_invite)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
            <path d="M6.00065 7.33333C7.47341 7.33333 8.66732 6.13943 8.66732 4.66667C8.66732 3.19391 7.47341 2 6.00065 2C4.52789 2 3.33398 3.19391 3.33398 4.66667C3.33398 6.13943 4.52789 7.33333 6.00065 7.33333Z" stroke="url(#paint1_linear_invite)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
            <path d="M14.666 14.0002V12.6669C14.6656 12.0761 14.4689 11.5021 14.1069 11.0351C13.7449 10.5682 13.2381 10.2346 12.666 10.0869M10.666 2.08691C11.2396 2.23378 11.748 2.56738 12.1111 3.03512C12.4742 3.50286 12.6712 4.07813 12.6712 4.67025C12.6712 5.26236 12.4742 5.83763 12.1111 6.30537C11.748 6.77311 11.2396 7.10671 10.666 7.25358" stroke="url(#paint2_linear_invite)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
            <defs>
              <linearGradient id="paint0_linear_invite" x1="1.33398" y1="10" x2="10.6673" y2="14" gradientUnits="userSpaceOnUse">
                <stop stopColor="#007ADF"></stop>
                <stop offset="1" stopColor="#00EBCB"></stop>
              </linearGradient>
              <linearGradient id="paint1_linear_invite" x1="3.33398" y1="2" x2="8.66732" y2="7.33333" gradientUnits="userSpaceOnUse">
                <stop stopColor="#007ADF"></stop>
                <stop offset="1" stopColor="#00EBCB"></stop>
              </linearGradient>
              <linearGradient id="paint2_linear_invite" x1="10.666" y1="2.08691" x2="14.666" y2="14.0002" gradientUnits="userSpaceOnUse">
                <stop stopColor="#007ADF"></stop>
                <stop offset="1" stopColor="#00EBCB"></stop>
              </linearGradient>
            </defs>
          </svg>
          <span className="text-white text-sm">Invite</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.00065 11.3337H4.66732C3.78326 11.3337 2.93542 10.9825 2.3103 10.3573C1.68517 9.73223 1.33398 8.88438 1.33398 8.00033C1.33398 7.11627 1.68517 6.26842 2.3103 5.6433C2.93542 5.01818 3.78326 4.66699 4.66732 4.66699H6.00065M6.00065 11.3337V8.00033C6.00065 7.11627 6.35184 6.26842 6.97696 5.6433C7.60208 5.01818 8.44993 4.66699 9.33398 4.66699H10.6673C11.5514 4.66699 12.3992 5.01818 13.0243 5.6433C13.6495 6.26842 14.0007 7.11627 14.0007 8.00033V11.3337C14.0007 12.2177 13.6495 13.0656 13.0243 13.6907C12.3992 14.3158 11.5514 14.667 10.6673 14.667H9.33398C8.44993 14.667 7.60208 14.3158 6.97696 13.6907C6.35184 13.0656 6.00065 12.2177 6.00065 11.3337Z" stroke="url(#paint0_linear_reports)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
            <path d="M6 8H10" stroke="url(#paint1_linear_reports)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
            <defs>
              <linearGradient id="paint0_linear_reports" x1="1.33398" y1="4.66699" x2="14.0007" y2="14.667" gradientUnits="userSpaceOnUse">
                <stop stopColor="#007ADF"></stop>
                <stop offset="1" stopColor="#00EBCB"></stop>
              </linearGradient>
              <linearGradient id="paint1_linear_reports" x1="6" y1="8" x2="10" y2="8" gradientUnits="userSpaceOnUse">
                <stop stopColor="#007ADF"></stop>
                <stop offset="1" stopColor="#00EBCB"></stop>
              </linearGradient>
            </defs>
          </svg>
          <span className="text-white text-sm">Reports</span>
        </div>
      </div>

      <div className="flex items-center gap-4 ml-8">
        <button className="relative w-10 h-10 rounded-full border-2 border-transparent flex items-center justify-center hover:bg-gray-800 transition-colors">
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_notification)">
              <path d="M15 6.66699C15 5.34091 14.4732 4.06914 13.5355 3.13146C12.5979 2.19378 11.3261 1.66699 10 1.66699C8.67392 1.66699 7.40215 2.19378 6.46447 3.13146C5.52678 4.06914 5 5.34091 5 6.66699C5 12.5003 2.5 14.167 2.5 14.167H17.5C17.5 14.167 15 12.5003 15 6.66699Z" stroke="url(#paint0_linear_notification)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
              <path d="M11.4419 17.5C11.2954 17.7526 11.0851 17.9622 10.8321 18.1079C10.5791 18.2537 10.2922 18.3304 10.0003 18.3304C9.70828 18.3304 9.42142 18.2537 9.1684 18.1079C8.91539 17.9622 8.7051 17.7526 8.55859 17.5" stroke="url(#paint1_linear_notification)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
            </g>
            <defs>
              <linearGradient id="paint0_linear_notification" x1="2.5" y1="1.66699" x2="17.5" y2="17.5" gradientUnits="userSpaceOnUse">
                <stop stopColor="#007ADF"></stop>
                <stop offset="1" stopColor="#00EBCB"></stop>
              </linearGradient>
              <linearGradient id="paint1_linear_notification" x1="8.55859" y1="17.5" x2="11.4419" y2="17.5" gradientUnits="userSpaceOnUse">
                <stop stopColor="#007ADF"></stop>
                <stop offset="1" stopColor="#00EBCB"></stop>
              </linearGradient>
              <clipPath id="clip0_notification">
                <rect width="20" height="20" fill="white"></rect>
              </clipPath>
            </defs>
          </svg>
          {notificationCount > 0 && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"></div>
          )}
        </button>

        <button className="w-10 h-10 rounded-full border-2 border-transparent flex items-center justify-center hover:bg-secondary/60 transition-colors">
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_settings)">
              <path d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z" stroke="url(#paint0_linear_settings)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
              <path d="M16.1673 12.4997C16.0564 12.751 16.0233 13.0298 16.0723 13.3002C16.1213 13.5705 16.2502 13.8199 16.4423 14.0163L16.4923 14.0663C16.6473 14.2211 16.7702 14.4049 16.8541 14.6073C16.938 14.8096 16.9811 15.0265 16.9811 15.2455C16.9811 15.4645 16.938 15.6814 16.8541 15.8837C16.7702 16.0861 16.6473 16.2699 16.4923 16.4247C16.3375 16.5796 16.1537 16.7026 15.9514 16.7864C15.7491 16.8703 15.5322 16.9135 15.3132 16.9135C15.0941 16.9135 14.8772 16.8703 14.6749 16.7864C14.4726 16.7026 14.2888 16.5796 14.134 16.4247L14.084 16.3747C13.8876 16.1826 13.6381 16.0537 13.3678 16.0047C13.0975 15.9557 12.8187 15.9887 12.5673 16.0997C12.3208 16.2053 12.1106 16.3807 11.9626 16.6043C11.8145 16.8279 11.7351 17.0899 11.734 17.358V17.4997C11.734 17.9417 11.5584 18.3656 11.2458 18.6782C10.9333 18.9907 10.5093 19.1663 10.0673 19.1663C9.62529 19.1663 9.20137 18.9907 8.88881 18.6782C8.57625 18.3656 8.40065 17.9417 8.40065 17.4997V17.4247C8.3942 17.1488 8.30492 16.8813 8.14441 16.6569C7.9839 16.4325 7.7596 16.2616 7.50065 16.1663C7.2493 16.0554 6.97049 16.0223 6.70016 16.0713C6.42983 16.1204 6.18038 16.2492 5.98398 16.4413L5.93398 16.4913C5.7792 16.6463 5.59538 16.7692 5.39305 16.8531C5.19072 16.937 4.97384 16.9802 4.75482 16.9802C4.53579 16.9802 4.31891 16.937 4.11658 16.8531C3.91425 16.7692 3.73044 16.6463 3.57565 16.4913C3.42069 16.3366 3.29776 16.1527 3.21388 15.9504C3.13001 15.7481 3.08684 15.5312 3.08684 15.3122C3.08684 15.0931 3.13001 14.8763 3.21388 14.6739C3.29776 14.4716 3.42069 14.2878 3.57565 14.133L3.62565 14.083C3.81777 13.8866 3.94664 13.6372 3.99565 13.3668C4.04467 13.0965 4.01158 12.8177 3.90065 12.5663C3.79502 12.3199 3.61961 12.1097 3.39604 11.9616C3.17246 11.8135 2.91047 11.7341 2.64232 11.733H2.50065C2.05862 11.733 1.6347 11.5574 1.32214 11.2449C1.00958 10.9323 0.833984 10.5084 0.833984 10.0663C0.833984 9.62431 1.00958 9.20039 1.32214 8.88783C1.6347 8.57527 2.05862 8.39967 2.50065 8.39967H2.57565C2.85148 8.39322 3.11899 8.30394 3.3434 8.14343C3.56781 7.98293 3.73875 7.75862 3.83398 7.49967C3.94491 7.24833 3.978 6.96951 3.92899 6.69918C3.87997 6.42886 3.7511 6.17941 3.55898 5.98301L3.50898 5.93301C3.35402 5.77822 3.23109 5.59441 3.14722 5.39208C3.06334 5.18974 3.02017 4.97287 3.02017 4.75384C3.02017 4.53482 3.06334 4.31794 3.14722 4.11561C3.23109 3.91328 3.35402 3.72946 3.50898 3.57467C3.66377 3.41971 3.84759 3.29678 4.04992 3.21291C4.25225 3.12903 4.46913 3.08586 4.68815 3.08586C4.90718 3.08586 5.12405 3.12903 5.32639 3.21291C5.52872 3.29678 5.71253 3.41971 5.86732 3.57467L5.91732 3.62467C6.11372 3.81679 6.36316 3.94566 6.63349 3.99468C6.90382 4.04369 7.18264 4.0106 7.43398 3.89967H7.50065C7.74713 3.79404 7.95733 3.61864 8.1054 3.39506C8.25346 3.17149 8.33292 2.9095 8.33398 2.64134V2.49967C8.33398 2.05765 8.50958 1.63372 8.82214 1.32116C9.1347 1.0086 9.55862 0.833008 10.0007 0.833008C10.4427 0.833008 10.8666 1.0086 11.1792 1.32116C11.4917 1.63372 11.6673 2.05765 11.6673 2.49967V2.57467C11.6684 2.84283 11.7478 3.10482 11.8959 3.3284C12.044 3.55197 12.2542 3.72737 12.5007 3.83301C12.752 3.94394 13.0308 3.97703 13.3011 3.92801C13.5715 3.879 13.8209 3.75012 14.0173 3.55801L14.0673 3.50801C14.2221 3.35305 14.4059 3.23012 14.6083 3.14624C14.8106 3.06237 15.0275 3.0192 15.2465 3.0192C15.4655 3.0192 15.6824 3.06237 15.8847 3.14624C16.087 3.23012 16.2709 3.35305 16.4257 3.50801C16.5806 3.6628 16.7035 3.84661 16.7874 4.04894C16.8713 4.25127 16.9145 4.46815 16.9145 4.68717C16.9145 4.9062 16.8713 5.12308 16.7874 5.32541C16.7035 5.52774 16.5806 5.71155 16.4257 5.86634L16.3757 5.91634C16.1835 6.11274 16.0547 6.36219 16.0056 6.63252C15.9566 6.90285 15.9897 7.18166 16.1007 7.43301V7.49967C16.2063 7.74615 16.3817 7.95636 16.6053 8.10442C16.8288 8.25248 17.0908 8.33194 17.359 8.33301H17.5007C17.9427 8.33301 18.3666 8.5086 18.6792 8.82116C18.9917 9.13372 19.1673 9.55765 19.1673 9.99967C19.1673 10.4417 18.9917 10.8656 18.6792 11.1782C18.3666 11.4907 17.9427 11.6663 17.5007 11.6663H17.4257C17.1575 11.6674 16.8955 11.7469 16.6719 11.8949C16.4484 12.043 16.273 12.2532 16.1673 12.4997Z" stroke="url(#paint1_linear_settings)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
            </g>
            <defs>
              <linearGradient id="paint0_linear_settings" x1="7.5" y1="7.5" x2="12.5" y2="12.5" gradientUnits="userSpaceOnUse">
                <stop stopColor="#007ADF"></stop>
                <stop offset="1" stopColor="#00EBCB"></stop>
              </linearGradient>
              <linearGradient id="paint1_linear_settings" x1="0.833984" y1="0.833008" x2="19.1673" y2="19.1663" gradientUnits="userSpaceOnUse">
                <stop stopColor="#007ADF"></stop>
                <stop offset="1" stopColor="#00EBCB"></stop>
              </linearGradient>
              <clipPath id="clip0_settings">
                <rect width="20" height="20" fill="white"></rect>
              </clipPath>
            </defs>
          </svg>
        </button>

        <button className="w-10 h-10 rounded-full border-2 border-transparent flex items-center justify-center hover:bg-secondary/60 transition-colors">
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.16667 5.83333C5.08714 5.83333 5.83333 5.08714 5.83333 4.16667C5.83333 3.24619 5.08714 2.5 4.16667 2.5C3.24619 2.5 2.5 3.24619 2.5 4.16667C2.5 5.08714 3.24619 5.83333 4.16667 5.83333Z" fill="url(#paint0_linear_grid)"></path>
            <path d="M10.0007 5.83333C10.9211 5.83333 11.6673 5.08714 11.6673 4.16667C11.6673 3.24619 10.9211 2.5 10.0007 2.5C9.08018 2.5 8.33398 3.24619 8.33398 4.16667C8.33398 5.08714 9.08018 5.83333 10.0007 5.83333Z" fill="url(#paint1_linear_grid)"></path>
            <path d="M15.8327 5.83333C16.7532 5.83333 17.4993 5.08714 17.4993 4.16667C17.4993 3.24619 16.7532 2.5 15.8327 2.5C14.9122 2.5 14.166 3.24619 14.166 4.16667C14.166 5.08714 14.9122 5.83333 15.8327 5.83333Z" fill="url(#paint2_linear_grid)"></path>
            <path d="M4.16667 11.6663C5.08714 11.6663 5.83333 10.9201 5.83333 9.99967C5.83333 9.0792 5.08714 8.33301 4.16667 8.33301C3.24619 8.33301 2.5 9.0792 2.5 9.99967C2.5 10.9201 3.24619 11.6663 4.16667 11.6663Z" fill="url(#paint3_linear_grid)"></path>
            <path d="M10.0007 11.6663C10.9211 11.6663 11.6673 10.9201 11.6673 9.99967C11.6673 9.0792 10.9211 8.33301 10.0007 8.33301C9.08018 8.33301 8.33398 9.0792 8.33398 9.99967C8.33398 10.9201 9.08018 11.6663 10.0007 11.6663Z" fill="url(#paint4_linear_grid)"></path>
            <path d="M15.8327 11.6663C16.7532 11.6663 17.4993 10.9201 17.4993 9.99967C17.4993 9.0792 16.7532 8.33301 15.8327 8.33301C14.9122 8.33301 14.166 9.0792 14.166 9.99967C14.166 10.9201 14.9122 11.6663 15.8327 11.6663Z" fill="url(#paint5_linear_grid)"></path>
            <defs>
              <linearGradient id="paint0_linear_grid" x1="2.5" y1="2.5" x2="5.83333" y2="5.83333" gradientUnits="userSpaceOnUse">
                <stop stopColor="#007ADF"></stop>
                <stop offset="1" stopColor="#00EBCB"></stop>
              </linearGradient>
              <linearGradient id="paint1_linear_grid" x1="8.33398" y1="2.5" x2="11.6673" y2="5.83333" gradientUnits="userSpaceOnUse">
                <stop stopColor="#007ADF"></stop>
                <stop offset="1" stopColor="#00EBCB"></stop>
              </linearGradient>
              <linearGradient id="paint2_linear_grid" x1="14.166" y1="2.5" x2="17.4993" y2="5.83333" gradientUnits="userSpaceOnUse">
                <stop stopColor="#007ADF"></stop>
                <stop offset="1" stopColor="#00EBCB"></stop>
              </linearGradient>
              <linearGradient id="paint3_linear_grid" x1="2.5" y1="8.33301" x2="5.83333" y2="11.6663" gradientUnits="userSpaceOnUse">
                <stop stopColor="#007ADF"></stop>
                <stop offset="1" stopColor="#00EBCB"></stop>
              </linearGradient>
              <linearGradient id="paint4_linear_grid" x1="8.33398" y1="8.33301" x2="11.6673" y2="11.6663" gradientUnits="userSpaceOnUse">
                <stop stopColor="#007ADF"></stop>
                <stop offset="1" stopColor="#00EBCB"></stop>
              </linearGradient>
              <linearGradient id="paint5_linear_grid" x1="14.166" y1="8.33301" x2="17.4993" y2="11.6663" gradientUnits="userSpaceOnUse">
                <stop stopColor="#007ADF"></stop>
                <stop offset="1" stopColor="#00EBCB"></stop>
              </linearGradient>
            </defs>
          </svg>
        </button>
      </div>
    </div>
  );
}
