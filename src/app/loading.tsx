import React from 'react'
import Box from '@/components/elements/Box'

// 今風のおしゃれなローディングアニメーション
const Loading: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 mt-27">
          <div className="flex items-center gap-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="w-3 h-8 rounded bg-[#86171F] animate-bar-wave"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
          <p className="text-xl text-gray-400 tracking-wide mt-4">読み込み中...</p>
        </div>
      );

}

export default Loading;