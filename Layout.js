
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Wallet, CreditCard, Send, QrCode, Settings, Home, TrendingUp, Building2, Network, Code, Shield, Award, Search, Target, Bell, Brain, Key } from "lucide-react"; // Added Brain and Key icons
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import NotificationPanel from "@/components/x402/NotificationPanel";
import OnboardingGuide from "@/components/x402/OnboardingGuide";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: Home,
  },
  {
    title: "Financial Advisor",
    url: createPageUrl("FinancialAdvisor"),
    icon: Brain,
  },
  {
    title: "Analytics",
    url: createPageUrl("Analytics"),
    icon: TrendingUp,
  },
  {
    title: "Goals",
    url: createPageUrl("Goals"),
    icon: Target,
  },
  {
    title: "Send Money",
    url: createPageUrl("SendMoney"),
    icon: Send,
  },
  {
    title: "Receive",
    url: createPageUrl("Receive"),
    icon: QrCode,
  },
  {
    title: "Budgets",
    url: createPageUrl("Budgets"),
    icon: Target,
  },
  {
    title: "Vaults",
    url: createPageUrl("Vaults"),
    icon: Building2,
  },
  {
    title: "Networks",
    url: createPageUrl("Networks"),
    icon: Network,
  },
  {
    title: "My Wallet",
    url: createPageUrl("WalletDetails"),
    icon: Wallet,
  },
  {
    title: "Sovereign Wallet",
    url: createPageUrl("SovereignWallet"),
    icon: Shield,
  },
  {
    title: "Key Management",
    url: createPageUrl("SecureKeyManagement"),
    icon: Key,
  },
  {
    title: "x402 Protocol",
    url: createPageUrl("X402Protocol"),
    icon: Code,
  },
  {
    title: "Notifications",
    url: createPageUrl("Notifications"),
    icon: Bell,
  },
  {
    title: "Dev Tools",
    url: createPageUrl("DevTools"),
    icon: Code,
  },
  {
    title: "Code Settlements",
    url: createPageUrl("CodeSettlements"),
    icon: Code,
  },
  {
    title: "Leaderboard",
    url: createPageUrl("EntropyLeaderboard"),
    icon: TrendingUp,
  },
  {
    title: "Compliance",
    url: createPageUrl("ProtocolCompliance"),
    icon: Shield,
  },
  {
    title: "Reputation",
    url: createPageUrl("ProtocolReputation"),
    icon: Award,
  },
  {
    title: "Onboarding",
    url: createPageUrl("ProtocolOnboarding"),
    icon: Search,
  },
  {
    title: "Cards",
    url: createPageUrl("Cards"),
    icon: CreditCard,
  },
  {
    title: "Transactions",
    url: createPageUrl("Transactions"),
    icon: TrendingUp,
  },
  {
    title: "Settings",
    url: createPageUrl("Settings"),
    icon: Settings,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  const { data: wallets } = useQuery({
    queryKey: ['userWallet'],
    queryFn: () => base44.entities.Wallet.filter({ created_by: user?.email }),
    enabled: !!user,
    initialData: [],
  });

  const wallet = wallets?.[0];

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --primary: 240 5.9% 10%;
          --primary-foreground: 0 0% 98%;
          --accent: 240 4.8% 95.9%;
          --accent-foreground: 240 5.9% 10%;
        }
      `}</style>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Sidebar className="border-r border-slate-200 bg-white/80 backdrop-blur-xl">
          <SidebarHeader className="border-b border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  GenZk-402
                </h2>
                <p className="text-xs text-slate-500">Universal Payments</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`rounded-xl mb-1 transition-all duration-200 ${
                          location.pathname === item.url 
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20' 
                            : 'hover:bg-slate-100'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {wallet && (
              <div className="mt-6 mx-3">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-4 text-white shadow-xl">
                  <p className="text-sm opacity-90 mb-1">Total Balance</p>
                  <p className="text-3xl font-bold">${wallet.total_balance_usd?.toFixed(2) || wallet.balance?.toFixed(2) || '0.00'}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <p className="text-xs opacity-75">AI-Protected</p>
                  </div>
                </div>
              </div>
            )}
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                {user?.full_name?.[0] || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 text-sm truncate">{user?.full_name || 'User'}</p>
                <p className="text-xs text-slate-500 truncate">@{user?.username || user?.email?.split('@')[0]}</p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 md:hidden">
                <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  GenZk-402
                </h1>
              </div>
              
              {/* Desktop Title */}
              <div className="hidden md:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {currentPageName || 'GenZk-402'}
                </h1>
              </div>

              {/* Notification Panel */}
              {user && <NotificationPanel user={user} />}
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>

          {/* AI Onboarding Guide */}
          {user && !user.onboarding_completed && (
            <OnboardingGuide user={user} currentPage={currentPageName} />
          )}
        </main>
      </div>
    </SidebarProvider>
  );
}
