export default function Home() {
  return (
    <main className="min-h-screen flex flex-col dark">
      <header className="bg-card border-b border-border py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-primary neon-text">Quantum Charts</div>
          <nav className="hidden md:flex space-x-6">
            <a href="#" className="text-foreground hover:text-primary">Products</a>
            <a href="#" className="text-foreground hover:text-primary">Community</a>
            <a href="#" className="text-foreground hover:text-primary">Markets</a>
            <a href="#" className="text-foreground hover:text-primary">Brokers</a>
          </nav>
          <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md neon-box">Get Started</button>
        </div>
      </header>

      <section className="py-16 neon-gradient">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-4 text-xl md:text-2xl text-secondary neon-text">
              Same power. Lower cost. Quantum Charts.
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 neon-text">
              Where the world does markets
            </h1>
            <p className="text-xl mb-8 text-muted-foreground">
              Join millions of traders and investors taking the future into their own hands.
            </p>
            <button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-8 py-3 rounded-md text-lg font-medium neon-box">
              Explore features
            </button>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="chart-container w-full h-[400px] mb-8 p-4 relative">
            <div className="absolute top-4 left-4 z-10 text-white flex items-center space-x-2">
              <div className="font-bold neon-text">BTC/USD</div>
              <span className="text-primary">+1.23%</span>
            </div>
            <div className="absolute top-4 right-4 z-10 flex space-x-2">
              <button className="bg-card text-foreground px-3 py-1 rounded text-sm hover:bg-card/80">1D</button>
              <button className="bg-card text-foreground px-3 py-1 rounded text-sm hover:bg-card/80">1W</button>
              <button className="bg-muted text-foreground px-3 py-1 rounded text-sm hover:bg-muted/80">1M</button>
              <button className="bg-card text-foreground px-3 py-1 rounded text-sm hover:bg-card/80">1Y</button>
            </div>
            {/* Simulated chart graph with CSS */}
            <div className="w-full h-full flex items-end relative">
              <div className="absolute inset-0 flex items-end">
                <div className="w-full h-[60%] bg-[#111] relative overflow-hidden">
                  {/* Chart grid lines */}
                  <div className="absolute inset-0 border-t border-[rgba(255,255,255,0.05)] top-1/4"></div>
                  <div className="absolute inset-0 border-t border-[rgba(255,255,255,0.05)] top-2/4"></div>
                  <div className="absolute inset-0 border-t border-[rgba(255,255,255,0.05)] top-3/4"></div>

                  {/* Chart path - simulate with gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-[rgba(41,255,189,0.1)]" style={{clipPath: "polygon(0 80%, 10% 75%, 20% 85%, 30% 65%, 40% 70%, 50% 50%, 60% 45%, 70% 55%, 80% 30%, 90% 40%, 100% 20%, 100% 100%, 0 100%)"}}></div>

                  {/* Chart line */}
                  <div className="absolute h-full w-full" style={{
                    background: "linear-gradient(to right, transparent, transparent), linear-gradient(to right, #29ffbd, #29ffbd)",
                    backgroundSize: "100% 2px",
                    backgroundPosition: "0 calc(80% - 0px), 0 calc(75% - 0px), 0 calc(85% - 0px), 0 calc(65% - 0px), 0 calc(70% - 0px), 0 calc(50% - 0px), 0 calc(45% - 0px), 0 calc(55% - 0px), 0 calc(30% - 0px), 0 calc(40% - 0px), 0 calc(20% - 0px)",
                    backgroundRepeat: "no-repeat",
                    maskImage: "linear-gradient(to right, transparent 0%, transparent 0%, #fff 0%, #fff 10%, transparent 10%, transparent 10%, #fff 10%, #fff 20%, transparent 20%, transparent 20%, #fff 20%, #fff 30%, transparent 30%, transparent 30%, #fff 30%, #fff 40%, transparent 40%, transparent 40%, #fff 40%, #fff 50%, transparent 50%, transparent 50%, #fff 50%, #fff 60%, transparent 60%, transparent 60%, #fff 60%, #fff 70%, transparent 70%, transparent 70%, #fff 70%, #fff 80%, transparent 80%, transparent 80%, #fff 80%, #fff 90%, transparent 90%, transparent 90%, #fff 90%, #fff 100%)"
                  }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-4 neon-text">Advanced Charting Tools</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Analyze markets with professional-grade tools. Draw, annotate, and use technical indicators
              to make better trading decisions.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center neon-text">Key Features</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-lg shadow-sm border border-primary/20 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-primary">Real-time Data</h3>
              <p className="text-muted-foreground">
                Access real-time market data across stocks, forex, crypto, and more with zero delay.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-sm border border-secondary/20 hover:border-secondary/50 transition-colors">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-secondary">Advanced Analytics</h3>
              <p className="text-muted-foreground">
                Over 100+ indicators and drawing tools to perform thorough technical analysis.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-sm border border-accent/20 hover:border-accent/50 transition-colors">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-accent">Trading Community</h3>
              <p className="text-muted-foreground">
                Connect with millions of traders, share ideas, and learn from the best.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center neon-text">Market Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "S&P 500", value: "5,667.57 USD", change: "+0.08%" },
              { name: "BTC/USD", value: "68,245.12 USD", change: "+1.23%" },
              { name: "ETH/USD", value: "3,891.45 USD", change: "-0.42%" },
              { name: "Gold", value: "2,345.30 USD", change: "+0.63%" },
              { name: "EUR/USD", value: "1.0842", change: "-0.15%" },
              { name: "Tesla", value: "175.79 USD", change: "+2.14%" }
            ].map((item, index) => (
              <div key={index} className="bg-card border border-border rounded-md p-4 hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-medium">{item.name}</div>
                  <div className={item.change.startsWith('+') ? "text-primary" : "text-red-500"}>
                    {item.change}
                  </div>
                </div>
                <div className="text-2xl font-bold mb-2">{item.value}</div>
                <div className="h-12 bg-[#111] rounded-md overflow-hidden">
                  {/* Mini chart line */}
                  <div className="w-full h-full relative">
                    <div className="absolute inset-0 border-t border-[rgba(255,255,255,0.05)] top-1/2"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-transparent to-primary/10"
                         style={{
                           clipPath: item.change.startsWith('+')
                             ? "polygon(0 80%, 20% 70%, 40% 85%, 60% 60%, 80% 40%, 100% 30%, 100% 100%, 0 100%)"
                             : "polygon(0 30%, 20% 40%, 40% 20%, 60% 50%, 80% 60%, 100% 80%, 100% 100%, 0 100%)"
                         }}>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-card text-foreground py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <div className="text-2xl font-bold mb-4 text-primary neon-text">Quantum Charts</div>
              <p className="text-muted-foreground max-w-md">
                The best platform for charts, market analysis, and trading insights.
              </p>
              <div className="mt-4 text-secondary">Same power. Lower cost. Quantum Charts.</div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <h3 className="font-bold mb-4 text-foreground">Products</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-muted-foreground hover:text-primary">Charts</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-primary">Screener</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-primary">Alerts</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-4 text-foreground">Support</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-muted-foreground hover:text-primary">Help Center</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-primary">Feedback</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-primary">Contact</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground">
            © 2025 Quantum Charts. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
