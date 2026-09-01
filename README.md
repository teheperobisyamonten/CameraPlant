# Camera Plant v0.1

平面図（Floor Map）上にカメラ・レンズ・被写体を配置し、実際のカメラとレンズのスペックから
撮影画角（FOV）を可視化する 2D 撮影プランナー。MV撮影・スタジオ撮影・インタビュー・
YouTube撮影・ロケハンなど、撮影前のカメラ配置検討を素早く行うためのブラウザアプリです。

3D プレビューや実写プレビューは扱いません。撮影前に「カメラ配置と実際の画角を素早く
確認できること」を最優先しています。

## Requirements

- Node.js 18 以上（開発時は v24 で動作確認）
- npm

## Install

```bash
npm install
```

## Run

```bash
npm run dev
```

`http://localhost:5173` を開きます。

## Build

```bash
npm run build
```

`dist/` に本番ビルドを出力します。

## Test

```bash
npm test
```

Vitest によるユニットテスト（Geometry層・Data層の互換性判定など）を実行します。

## Project Structure

```
src/
  ui/            UI コンポーネント（TopBar / LeftSidebar / PropertiesPanel / StatusBar / Canvas）
  state/         Zustand ストア（Camera / Subject / Drawing / Sequence / Undo / Scale / Tool ...）
  geometry/      座標変換・FOV・距離・回転計算などの純粋関数（px / meter / degree の変換はここに集約）
  data/          Camera / Lens 実機データベース（cameras.json / lenses.json）と互換性判定
  persistence/   IndexedDB 保存・Autosave・PNG/JPEG Export
  types/         各ドメインオブジェクトの型定義
```

## Implemented Features

- Floor Map（PNG / JPEG）読込、Zoom / Pan / Reset View
- Scale Calibration（2点指定 + 実距離入力による px/m 換算、異常値バリデーション）
- Camera Object の配置・選択・移動・回転・削除、実機 Camera / Lens データベースからの選択
  （Mount 互換性によるレンズ絞り込み、Zoomレンズの焦点距離スライダー）
- FOV（水平/垂直画角）の自動計算と Canvas 上への表示（回転・レンズ・焦点距離の変更に追従）
- Subject（Person / Object）の配置・選択・移動・回転・Rename・削除
- Camera ↔ Subject 間の実距離表示（Scale 未設定時は "Scale not configured"）
- Undo / Redo（Ctrl+Z / Ctrl+Shift+Z、Add・Move・Rotate・Delete・Property変更・Drawingが対象）
- Sequence（1〜10）の切替・複製
- Drawing Tools（Pen / Line / Arrow / Rectangle / Circle / Text / Eraser / Measure、色・線幅変更）
- IndexedDB へのローカル保存と Autosave（Saved / Save failed 表示）、リロード後の Project 復元
- PNG / JPEG Export（Clean / Technical モード、解像度選択、JPEG品質設定）

## Known Limitations

- v0.1 は単一 Project の常時オートセーブ運用（複数 Project の一覧・切替 UI は非対応）
- Drawing オブジェクトの作成後のドラッグ移動・リサイズは非対応（作成・選択・削除のみ）
- Grid 表示・Snap to Grid は未実装
- 3D Preview、実写Preview、被写界深度シミュレーション、AI自動配置、Cloud、Login、
  リアルタイム共同編集、動画書き出し、本格的なCAD/BIM機能は v0.1 の対象外
