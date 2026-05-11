//四角い枠の表示コンポーネント
import React, { ReactNode } from 'react'

type propsType = {                            // propsType型を定義。子要素(children)を持つ
    children: ReactNode                       // childrenプロパティはReactNode型。ReactNodeはReactの要素を表す型。
}
const Box = ({children}: propsType) => {      // Boxコンポーネントを定義、propsType型のchildrenを受け取る
  return (   
    // divにクラスでstyle装飾（パディング、マージン、ボーダーなど）                                 // JSXを返す
    <div className='p-5 m-5 border-2 border-gray-300 rounded-md flex flex-col items-center justify-center gap-2'> 
    {/* 子要素をここで描画 */}
        {children}
    </div>                        
  )                                  
} // コンポーネント定義終了

export default Box