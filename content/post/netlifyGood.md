---
title: 鍵盤に降ってくる動画を楽譜化(midi化)
date: 2021-05-30T22:54:52+09:00
image: https://camo.qiitausercontent.com/52b9e0a792d63d35a2c9d6757f07a36d0dd4e1db/68747470733a2f2f71696974612d696d6167652d73746f72652e73332e61702d6e6f727468656173742d312e616d617a6f6e6177732e636f6d2f302f3237393438322f34353531636336612d383766332d353039332d346133302d3632383163626432326264312e706e67
tags:
  - MIDI
  - Synthesia
  - piano
  - SMF
  - OpenCV
  - C++
categories:
  - プログラミング
---
# やりたいこと
YouTubeにある**鍵盤にノーツが降ってくる動画**を解析し、midiファイルとして出力する。
midiファイル(SMF)で出力できれば、それをSynthesiaに読み込ませてうはうはしたり、
別途プログラムを使用すれば楽譜（ドとかレとかの）に変換できる。



## 今回 ”もと”となる動画について
以下の動画は自分が以前YouTubeにアップロードしたものです。
[![IMAGE ALT TEXT HERE](http://img.youtube.com/vi/0GULQZ_ONCk/0.jpg)](http://www.youtube.com/watch?v=0GULQZ_ONCk)

この動画は、midiファイル(SMF形式)をSynthesiaというプログラム(アプリケーション)に読み込ませて、その画面をキャプチャしたものです。このような動画を解析するのが目標です。

# どのように実装するか

実装は大きく分けて、

- OpenCVによる動画解析
- 解析したデータをSMF形式で書き出す

という２段階に分けることができる。

細かい実装はGitのURLを貼っておくので、そちらをご覧ください。
すごく読みにくいコードだと自負しているのでご注意を😌

[GitHubへのリンク](https://github.com/burugaria7/makeSMF)

自分がコード実装時に書きなぐったメモも参考に貼っておきます。（~~参考になるとは言ってない~~）

[Googleドキュメントのメモ](https://docs.google.com/document/d/1t9L9b_ICyIiXoWTtuOj_yHkG_1TiLLVhf1YhXYlwCNM/edit?usp=sharing)
[Google図形描画のメモ]
(https://docs.google.com/drawings/d/1XgYOstmYxNJl2NMCJ76BKYRAbH8ErLW4F2I7503au4k/edit?usp=sharing)

# OpenCVによる動画解析

動画解析...以前にプログラミング自体ほぼほぼ素人な私ですが、
チュートリアルなどを見ながらどうにか実装することができるレベルでした。

## OpenCVによる解析の流れ

1. 黒鍵、白鍵それぞれの座標を設定する。
2. 初期状態（どの鍵盤も押されていない状態）の黒鍵、白鍵それぞれのRGB値を記録する。
3. フレームごとに画像を呼び出し、最初に記録したRGB値からの変化を監視する。（変化があれば鍵盤が押されていると判定）



## 動画の準備
まず解析する動画の準備をする。
ここは何でもいいのですが、自分の環境ではちょうちょ（童謡）のmidiファイルを適当にDAWで作成し、
それをSynthesiaで読み込ませて、その様子をキャプチャした。


それらをプロジェクトフォルダ内に配置した様子↓


![2fa5f5d5667803738d75ea766b2fa0e1.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/279482/417864ec-6bca-f489-5a0a-6cc4d6f356a8.png)

画面キャプチャは設定を複数用意し、YouTubeでいう1080p,720p,480pの３種類を使用した。

YouTubeから動画をほげほげしてきて、それを使用ということも可能だが、
著作権など色々あると思うのその際は注意しましょう。

## 解析する鍵盤の座標設定
座標設定の難しさは、**読み込ませる動画の解像度**、**鍵盤がいくつ表示されているか**、
によって座標が変わってくる点である。
解像度はいうまでもなく、表示される鍵盤数は、
Synthesiaの設定や読み込ませるmidiファイルによって変わってしまう。

それらを踏まえ座標設定は、以下のような方法が考えられた。

- OpenCVを使って鍵盤部分を探し出し、自動的に設定する
- プログラム実行後マニュアル（ユーザー操作）で設定する。
- 最初から座標を定義したプリセットを用意しておく。

とりあえず、一番楽そうなプリセットを準備してみる。
例えば、以下のコードでは720p88鍵表示として白鍵の座標をゴリゴリ設定している。
黒鍵部分は一定間隔に配置されている訳ではないので、もっと汚いコードになっていたりする...

```c++

this->key_white_y = 665;

for (int i = 0; i < 52; i++) {
	this->key_white_x[i] = (24.5 / 2.0) + i * 24.6;
}
```

以下の画像はプログラム実行時、座標を確認できるようにしたもの
![551378448245a326c10dea63e7f83ee5.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/279482/427087b8-66de-e982-64f5-090e0b4d2abd.png)

##鍵盤が押されてない状態のRGBを記録
座標の設定が終わったら、黒鍵、白鍵それぞれの、鍵盤が押されてない状態（以下 初期状態）のRGBを記録する。

```c++
void Analysis::Set_Color()
{
	cout << "Set_Color() デフォルトカラー取得関数" << endl;

	this->def_w_clrB = frame.at<Vec3b>(key_white_y, key_white_x[0])[0];
	this->def_w_clrG = frame.at<Vec3b>(key_white_y, key_white_x[0])[1];
	this->def_w_clrR = frame.at<Vec3b>(key_white_y, key_white_x[0])[2];

	this->def_b_clrB = frame.at<Vec3b>(key_black_y, key_black_x[0])[0];
	this->def_b_clrG = frame.at<Vec3b>(key_black_y, key_black_x[0])[1];
	this->def_b_clrR = frame.at<Vec3b>(key_black_y, key_black_x[0])[2];

	cout << "B:" << def_w_clrB << ",G:" << def_w_clrG << ",R:" << def_w_clrR << endl;
	cout << "B:" << def_b_clrB << ",G:" << def_b_clrG << ",R:" << def_b_clrR << endl;

}
```
↑みたいな感じで書いてみた。RGB取得はOpenCVの関数を呼び出すだけなので簡単に行える。

##映像の解析
面倒な、座標設定や初期状態のRGBも取得したところで、メインの解析作業を実装する。

```c++
void Analysis::Analyze()
{
	const static double fps = movie.Get_FPS();

	int frame_count = 1;

	for (;;frame = movie.Get_Next_Frame()) {
		
		if (frame.empty()) break;

		this->Check_Key();//ここでキーイベントをアップデート

		double time_now =((double)frame_count / fps);

		//同時発音数が一定以下でイベント本登録
		if (str.size() > 0&&str.size() < 30) { 

			cout << std::to_string(time_now) << endl;

			this->str_ += std::to_string(time_now);
			this->str_ += "ms";
			this->str_ += str;
			this->str_ += "\n";
			//cout << str.size() << endl;;
		}

		str = "";

		frame_count++;
		this->first_key = 0;
		this->active_key_sum = 0;
		cv::imshow("movie", frame);

		//ここのコメントアウトはずすと動画速度になる
		//if ((char)cv::waitKey((int)1000 / fps) >= 0) break;
	}

	//最後にファイルに書き出し
	this->Output_txt();
	smf.Test();
}
```

いきなり意味がわからなくなったかもねうん。ややこしい。
コードがややこしい原因は、midiファイル作成が互換性の理由でうまくいかなくって、
一旦オリジナルの形式で書き出しているコードが混じっているせい。

主にやっていることは、
***毎ループ新しいフレームに更新***し、そのフレームに対し***解析関数を呼び出す***。上のコードでは、this->Check_Key() を呼び出している。
その関数の処理は、それぞれの鍵盤の座標のRGBを初期状態のRGBと比較して、一定以上の差異が認められれば、鍵盤がアクティブになったと判定する、というもの。
コードが更に汚いので、詳しくはGitの方を参照してください。（あまりにもコードが残念なのでとても貼れなかった）

そして１フレーム文の解析が完了すると、そのフレームが何フレーム目か、
動画のフレームレートより何秒目のフレームなのかを計算しその数値とイベント（鍵盤の状態）を記録しておく。

以下の画像は実際に実行して、鍵盤の状態がちゃんと認識されてる様子
（ちゃんと動くとやっぽり嬉しいですね♪）
![def17de4ff098eb5dff44c20c56a665f.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/279482/4551cc6a-87f3-5093-4a30-6281cbd22bd1.png)


# 解析したデータをSMF形式で書き出す

## SMF(Standard MIDI File)とは
SMF(Standard MIDI File)とはファイルのフォーマット形式の一種で簡単に説明すると、
一般的な音源ファイル(mp3,wav)などは音の波形をサンプリングして記録したものに対し、
SMF形式はドだとレだとか音程をバイナリ形式で書き出したものである。拡張子は.smfだとか.midだとかです。

## どのようにSMFを扱うか
SMF形式はバイナリ形式であるため形式をきちんと理解すれば、自分でパースすることも可能です。
もう一つの手として、SMFをパースできるライブラリを利用することもできます。~~楽したい~~あるものは使おう！の精神で、ライブラリを使用することにしました。

## ライブラリを使おうとして発生した問題
上に書いたような理由でライブラリを使うことにしたのでライブラリをいくつか引っ張ってきて利用させてもらいました。しかしエラーが。結論から言うと、OpenCVを使うためここまで64bitベースでコードを書き進めてきたのですが、SMFを扱えるライブラリは32bitのものばかり。そうです、互換性がない...色々試したものの残念ながら自分にはこれを解決する自力がありませんでした。よろしければどなたかアドバイスを頂けると 🙇‍♀️🙇‍♂️

## オリジナル形式によるゴリ押し実装
ライブラリ互換の問題を解決しようとして心が折れた...:persevere:
SMFを自分でパースするのが理想なのだが、少し覗いてみたところ時間がかかりそうということに気がついた。
ここは一旦置いておいて **とりあえず動くようにしたい！**ということで、

64bit実装で解析、オリジナル形式(.txt)で書き出し
　　　　　　　　　　　↓
32bit実装で、上のファイルを読み込み、ライブラリを用いてSMFで書き出す

という方法を取ることに。

オリジナル形式などと大げさに言っているが仕様は、


- アクティブ、非アクティブが切り替わるタイミング（ms）
- アクティブか非アクティブか
- 鍵盤番号

を単純に書きなぐっていくだけである。

以下の画像は実際に出力したテキストファイル

![0fc245fda6af897d90f2e825a050f997.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/279482/760e8a5e-aa7b-ae60-fb15-786f7c68e7d6.png)


## SMFを吐き出すプログラムを新規実装
上で書いた理由の通り、新しくプロジェクトをデプロイする。
[このプロジェクトのGitへのリンク](https://github.com/burugaria7/toSMF)
(一応c++プロジェクトなのですが、c++ファイルが少ないせいかhtmlプロジェクトとGithubに判定されているのが少し面白い)

このプログラムは単純で、SMFをパースするライブラリを用いて、オリジナル形式からSMFにパースしてやる。

特に失敗もなくちゃんと書き出されました。
![65e5ca91aa2153c1ba9e894fcbc589c6.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/279482/6083d70f-a797-85dc-bb8e-d9441f89b69d.png)

この後、複雑なアレンジなどが入った動画や、そこそこ長い動画なども試しましたが、ちゃんと動作しました。


# まとめ
問題は色々発生したけど、どうにか動く形にできた。
当初の目的であった **動画を解析してSMFで書き出す** ということが、
一応動く形はなったので満足だ。これからの目標としては、

- 座標の設定方法の多種化
- SMFパーサーを自分で実装する

がある。座標設定に関しては、マニュアルで設定できるようにしたり、自動で鍵盤を検出できれば一番理想だと考える。SMFパーサーの実装は、バイナリデータを扱ういい勉強になりそうなので頑張りたい。

すごく読みづらい記事だったと思うけど、読んで頂いた方に圧倒的感謝を！

