"use client";
import type { LevelUpOption } from "../internal";

interface LevelUpScreenProps {
  options: LevelUpOption[];
  onSelectOption: (option: LevelUpOption) => void;
}

export function LevelUpScreen({ options, onSelectOption }: LevelUpScreenProps) {
  return (
    <div className="min-h-screen bg-black/90 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-orange-400 rounded-full animate-ping delay-300"></div>
        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-yellow-300 rounded-full animate-ping delay-700"></div>
        <div className="absolute bottom-1/4 right-1/3 w-3 h-3 bg-orange-300 rounded-full animate-ping delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-yellow-500 rounded-full animate-ping delay-500"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-red-500/20 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 max-w-5xl w-full">
        <div className="bg-gradient-to-br from-amber-500/95 via-orange-500/95 to-red-500/95 backdrop-blur-xl rounded-3xl border-2 border-yellow-300/50 shadow-2xl shadow-orange-500/50 overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 p-2">
            <div className="flex justify-center items-center gap-2">
              <div className="w-8 h-1 bg-yellow-300 rounded-full animate-pulse"></div>
              <div className="w-4 h-1 bg-orange-300 rounded-full animate-pulse delay-200"></div>
              <div className="w-8 h-1 bg-yellow-300 rounded-full animate-pulse delay-400"></div>
            </div>
          </div>

          <div className="p-10">
            <div className="text-center mb-12 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-4 border-yellow-300/30 rounded-full animate-spin-slow"></div>
                <div
                  className="absolute w-32 h-32 border-2 border-orange-300/40 rounded-full animate-spin-slow"
                  style={{ animationDirection: "reverse" }}
                ></div>
              </div>

              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-6 shadow-lg shadow-yellow-500/50 animate-bounce">
                  <span className="text-5xl">🎉</span>
                </div>

                <h2 className="text-7xl font-black text-white mb-4 drop-shadow-lg animate-pulse">
                  LEVEL UP!
                </h2>

                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="w-16 h-1 bg-gradient-to-r from-transparent via-yellow-300 to-transparent rounded-full"></div>
                  <span className="text-3xl animate-spin">⭐</span>
                  <div className="w-16 h-1 bg-gradient-to-r from-transparent via-yellow-300 to-transparent rounded-full"></div>
                </div>

                <p className="text-2xl text-yellow-100 font-semibold tracking-wide">
                  ✨ 업그레이드를 선택하여 더 강해지세요 ✨
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {options.map((option, index) => {
                const IconComponent = option.icon;
                return (
                  <div
                    key={index}
                    onClick={() => onSelectOption(option)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        onSelectOption(option);
                      }
                    }}
                    className="group relative bg-black/40 backdrop-blur-sm p-8 rounded-2xl cursor-pointer hover:bg-black/60 transition-all duration-500 hover:scale-110 border-2 border-yellow-400/60 hover:border-yellow-300 shadow-lg hover:shadow-2xl hover:shadow-yellow-400/30"
                    style={{
                      animationDelay: `${index * 200}ms`,
                      animation: "fadeInUp 0.6s ease-out forwards",
                    }}
                  >
                    <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-yellow-300 transition-all duration-300">
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400/0 via-yellow-400/20 to-yellow-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>

                    <div className="absolute top-2 right-2 w-3 h-3 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping"></div>
                    <div className="absolute bottom-2 left-2 w-2 h-2 bg-orange-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping delay-300"></div>

                    <div className="relative text-center">
                      <div className="relative mb-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                          <IconComponent
                            className="text-white group-hover:animate-pulse"
                            size={40}
                          />
                        </div>
                        <div className="absolute inset-0 bg-yellow-400/30 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </div>

                      <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-yellow-200 transition-colors duration-300">
                        {option.name}
                      </h3>

                      <p className="text-yellow-100 text-sm mb-4">
                        {option.description}
                      </p>

                      {option.currentLevel && option.maxLevel && (
                        <div className="flex justify-center items-center gap-1 mb-2">
                          {Array.from({ length: option.maxLevel }, (_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full ${
                                i < option.currentLevel!
                                  ? "bg-yellow-400"
                                  : i < option.currentLevel! + 1
                                    ? "bg-orange-400"
                                    : "bg-gray-600"
                              }`}
                            />
                          ))}
                        </div>
                      )}

                      {option.isNew && (
                        <div className="inline-block bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                          NEW!
                        </div>
                      )}

                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center shadow-lg">
                        <span className="text-white text-sm font-bold">✓</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-400/20 to-red-400/20 p-3">
            <div className="flex justify-center items-center gap-1">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 100}ms` }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
