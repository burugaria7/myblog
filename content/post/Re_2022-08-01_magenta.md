---
title: "WSLでMagentaを使ったピアノ耳コピの自動化"
date: 2022-08-01T18:11:47+09:00
image: /img/cover/Google-Magenta.png
description: WSLでMagentaを使ったピアノ耳コピの自動化
slug: magenta
tags:
  - Python
  - google
  - 機械学習
  - 深層学習
  - magenta
categories:
  - 技術
draft: false
---
# はじめに
**耳コピがしたい！** でも **絶対音感なんてない！** そんなあなたに...

Googleさんがピアノ演奏の音源(.wav)をMIDIファイル(.mid)に変換してくれるツールを用意してくれています。実際に使ってみて精度の高さに驚いたので紹介します。

# Magentaって？
作曲、音楽の解析、音楽制作の支援などを目的とした、Googleの機械学習プロジェクト

## Onsets and Frames モデル
Magentaには複数のモデルが含まれている。
その中でもピアノ演奏の音源を解析し、MIDIに変換するモデル。


# 環境
MagentaのOnsets and Frames モデルはローカルで動かす他、Web版、Colab版が用意されています。以下にリンクを貼っておきます。
[Web版](https://piano-scribe.glitch.me/)
[Colab版](https://colab.research.google.com/notebooks/magenta/onsets_frames_transcription/onsets_frames_transcription.ipynb)

自分の環境ではWeb版、Colab版が上手くいかなかったのでローカルで試すことにしました。

Microsoftのストアからインストールした以下のバージョンのUbuntuを環境として使いました。このUbuntuはどうやらWSL2で動いてくれるみたい。

ホストOS: Windows10\
コンソール: Ubuntu 20.04.4 LTS (GNU/Linux 5.4.72-microsoft-standard-WSL2 x86_64)\
CPU: Intel(R) Core(TM) i7-8700 CPU @ 3.2GHz\
メモリ: DDR4 3200MHz 32.0GB\
GPU: NVIDIA GeForce RTX 2080ti


# 手順

1. 作業前に以下のコマンドは実行しておきましょう。（おまじない）
    ```sh
    $ sudo apt-get update
    ```
1. `apt-get install`を使ってライブラリをインストールしておきます。
   ```sh
   $ sudo apt-get install build-essential libasound2-dev libjack-dev portaudio19-dev
   ```
1. Anacondaをインストールします。
右のリンクを見ながら行いました。　[Ubuntu(WSL)にAnacondaをインストール - Erikr's diary](https://erikr.hatenablog.com/entry/2021/01/01/201957)

    3-1.  Anacondaのインストール用ファイルをダウンロードします。URLは環境によって変わるかと思います。
    ```sh
    $ wget https://repo.anaconda.com/archive/Anaconda3-2022.05-Linux-x86_64.sh
    ```

    3-2. `bash`コマンドでダウンロードしたファイルを実行します。
    ```sh
    $ bash Anaconda3-2022.05-Linux-x86_64.sh
    ```

    3-3. `source`コマンドで変更内容を実行中のシェルに反映させます。
    ```sh
    $ source ~/.bashrc
    ```

    3-4. `anaconda-navigator`でインストールができているか確認します。今回はCUI環境の為起動出来ないよ！と怒られましたが問題ないです。

    ```sh
    $ anaconda-navigator
    ```

1. Magentaを構築していきます。

    4-1. `conda`コマンドで "magenta" という名前の仮想環境を作成し、作成した仮想環境をアクティブにします。シェルの先頭に (magenta) と表示されるかと思います。
    ```sh
    $ conda create -n magenta python=3.7
    ```

    ```sh
    $ conda activate magenta
    ```

    4-2. magentaをGitHubからCloneします。

    ```sh
    $ git clone https://github.com/tensorflow/magenta.git
    ```
    
    4-3. Cloneしたディレクトリに移動し、インストールしていきます。
    ここのインストールはものすごく時間がかかるので気長に待ちましょう。
    ２,３時間待っても全然終わる気配がしなかったので、寝ることに...
    次の日には終わってました笑

    ```sh
    $ cd magenta
    ```

    ```sh
    $ pip install -e .
    ```
    4-4. Googleさんが公開してくれている、最新のモデルをダウンロードします。
    ```sh
    $ wget https://storage.googleapis.com/magentadata/models/onsets_frames_transcription/maestro_checkpoint.zip
    ```
    4-5. ダウンロードしたファイルは圧縮されているので、解凍する為に`unzip`コマンドをインストールします。
    ```sh
    $ sudo apt install unzip
    ```
    4-6. `unzip`コマンドでモデルファイルを解凍します。
    ```sh
    $ unzip maestro_checkpoint.zip
    ```
1. 実際にwav音源ファイルを読み込んで、MIDIに変換していきます。

    5-1. モデルのディレクトリを変数に入れておきます。

    ```sh
    $ MODEL_DIR=./train
    ```

    5-2. 音源ファイルを準備し作業ディレクトリに配置します。

    今回はホストOSのWindows上のエクスプローラーから`\\wsl$`にアクセスし、作業ディレクトリを探しファイルを配置しました。

    5-3. 以下のコマンドで実際に変換していきます。`hoge.wav`が配置した音源ファイルです。mp3は駄目みたい...

    実行が完了し、作業ディレクトリを確認すれば、`.mid`が配置されているかと思います。

    時間がかかるかなと思ったのですが、５分ほどの音源ファイルで１分もかかりませんでした。
    ```sh
    python3 magenta/models/onsets_frames_transcription/onsets_frames_transcription_transcribe.py --model_dir="${MODEL_DIR}" hoge.wav
    ```

追記
最後の変換の処理でメモリ不足のエラーを吐くことがありました。\
もしメモリ不足と警告が出ていたら、一度ホストOSの再起動をしてからリトライすると解決するかもしれないです。\
何度も変換を繰り返していると、メモリ使用量が少しずづ増えている感じがしたので、メモリリークしてる...?

~~あちこち参照しながらインストールしていたので、不要な手順が入っているかもです~~

# 最後に

色々なパターンの演奏動画で試してみたのですが、どれも精度の高いといえる変換がされました。

流石にバンド演奏などのピアノ以外の楽器が混ざっている音源においては、相当精度が落ちます。それでもある程度音を拾えている感じはしたけど...

結論: **機械学習凄い！**

最後まで読んでくださって、ありがとうございましたー！

# 参考
以下を参考にしながら作業を行いました。\
[Magentaによるピアノ自動採譜のやり方 - Qiita](https://qiita.com/kurumatu/items/c49bb35a3e1fcd2b5aab)\
[【耳コピ自動化】機械学習で三味線の自動採譜をしてみた](https://jonkara.com/2021/05/04/magenta/)

自分の過去記事、よかったら読んでください。\
[鍵盤に降ってくる動画を楽譜化(midi化)したい...できた - Qiita](https://qiita.com/burugaria7/items/c8685d22f31b9a8be3f3)
