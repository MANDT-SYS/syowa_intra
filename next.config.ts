import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  //自動メモ化 : useMemo / useCallback / React.memo を手で書かなくても、コンパイラが「再計算不要」と判断した箇所を自動でメモ化する
  //不要な再レンダリング抑制 props や state が変わっていないコンポーネントのレンダリングをスキップ
  reactCompiler: true,
};

export default nextConfig;
