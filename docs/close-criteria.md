# dmm-seli close criteria

## close / not close

- close: `/` と `/works/:workId` がキンセリ利用者にとって自然に使える
- close: 更新時刻が不自然に古くなく、主要導線で空データや壊れ表示がない
- close: DMM への成果報酬リンクを価格情報の流れで自然に押せる
- close: 兄弟サイトとして一文で説明でき、見た目でも違和感が少ない
- not close: 上のどれか 1 つでも未達

## judge order

1. 画面の既視感
2. 更新の鮮度と壊れ方
3. 送客導線
4. 紹介しやすさ

## issue priority mirror

1. FDS-137 / FDS-138: `/` の既視感を先に揃える
2. FDS-139 / FDS-140: `/works/:workId` の既視感を揃える
3. FDS-141 / FDS-142: 更新欠損と deploy blocker を潰す
4. FDS-143: 全パクリ後レビューでノイズだけ削る
5. FDS-145: DMM 送客導線を押しやすくする
6. FDS-144: 紹介前 QA と兄弟サイト導線の最終確認

## evidence

- local verify: `/api/healthz`, `/api/products`, `/api/products/:workId`, `/`, `/works`
- build verify: `npm run build`
- live smoke: `npm run test:live`
