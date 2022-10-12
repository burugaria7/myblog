---
title: "YouTubeのピアノ演奏動画の全自動採譜（MIDI化）"
date: 2022-09-18T16:11:12+09:00
draft: true
image: /img/cover/midis.png
description: WSLでMagentaを使ったピアノ耳コピの自動化ouTube のチャンネルを指定することで、そのチャンネルに上がっている演奏動画を一括 MIDI ファイルに変換する便利な道具を作成しました。
slug: youtube_to_magenta
tags:
  - Python
  - Docker
  - MIDI
  - 深層学習
  - magenta
categories:
  - 技術
---

# はじめに
_YouTube_ には沢山のピアノ演奏動画が上がっているかと思います。

ま○しぃさんとか、よみ○さんとか、事務員○さん、けいちゃ○さんなどが有名ですかね。
海外勢だとAni○enzさんが凄く凄いです（語彙力

この人達みたいにピアノを弾きたい！...は無理でも真似事がしたいですよね。
そうです楽譜...楽譜があれば、 _MIDI_ ファイルがあれば！

そこで、 _YouTube_ のチャンネルを指定することで、そのチャンネルに上がっている演奏動画を一括 _MIDI_ ファイルに変換する便利な道具を作成しました。
（~~著作権とか色々怪しそうなので公開はしません...許して）~~

# 内容

## フロー図
大まかな流れを図にしました。
![9974aa20bef20004b0980bc6903a91a4.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/279482/30f89dfc-ce97-dc9b-9b5c-8822c69a8e21.png)

## 流れの説明
1\. _youtube data api v3_ というAPIでチャンネル名から各動画のIDを抜きます。

2\. _yt_dlp_ を使用し、先程抜いたIDからURLを作成し、渡してあげることでmp3形式のファイルをダウンロードします。

:::note warn
_YouTube_ ダウンロードのメジャーな _API_ である _youtube_dl_ は _YouTube_ 側から帯域幅制限されるみたいです。解決策の一つである _yt_dlp_ を代替として用いることで回避しました。
:::

3\. _Pydub_ を使用し、ダウンロードしたmp3ファイルをwav形式に変換します。

4\.  _Google_ さんの _Magenta_ の _Onsets and Frames_ モデルを使用しMIDIファイルに変換します。

今回は _WSL_ の上で _Ubuntu_ を動かして、その中で _Docker_ を使用することで環境構築をしました。


***_Magenta_ については以下の記事に詳しくまとめているので参照ください。***

{{< BlogCard "WSLでMagentaを使ったピアノ耳コピの自動化" "https://qiita.com/burugaria7/items/4005724c5d1b5228327e">}}


# 結果

ま○しぃさんのチャンネルURLを指定することで画像のように203個のmidファイルを獲ることができました。やったね！

![f506bb9906ac9d06b66db977a5eb01a0.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/279482/3efaf1af-4763-3ebc-872c-28d8e034eed6.png)


# 困った点

## Magentaの環境構築
_Magenta_ を動かすには色々なものをインストールして、条件を満たさなければいけないです。（特にGPUをアクティブにしようとすると...)

そこで今回は _Docker_ を使用することで楽しました。（環境構築で手間取るのは嫌ですからね＾）

使用した _Docker_ ファイルは以下のリンクからお借りしました。

私の _Magenta_ の記事を見て作ってくれたみたいです。有能すぎる..

{{< BlogCard "\"WSLでMagentaを使ったピアノ耳コピの自動化\"をDockerfileに落とし込んだ" "https://qiita.com/hisashisatake@github/items/91c41593ddb86f4cbc99">}}


## 複数の _wav_ ファイルを _Magenta_ に食わせる方法
_Magenta_ に渡すファイル名を指定するところでメタキャラを使いました。

" _*.wav_ " のように渡すと全ファイル処理してくれます。絶対エラー吐くと思っていたのでラッキーでした笑

ちゃんとコード読んで、コードで実装できるようにしないとですね...

# 課題とこれから

- Dockerfileを書いて本当に全自動化
- 動画のURLを渡したらmidにしてくれるWebサービス

今回作成したプログラムではほとんどの作業を自動化できましたが、
フローでのそれぞれのプログラムが分かれています（環境も違うから...）。

よって全部自動化してWebサービスにできれば..  **乞うご期待**

