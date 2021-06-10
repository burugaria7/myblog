// sidebar-toc というクラス名の要素のリストを取得し、その最初の要素を取得
var toc = document.getElementsByClassName('sidebar-toc')[0];

if (toc) {
    // スクロールが起きたときに関数を実行
    window.addEventListener('scroll', function () {
        // スクロール量が一定値より大きいとき
        // sidebar-toc のクラスに show を追加
        window.scrollY > 1000 ? toc.classList.add('showw') : toc.classList.remove('showw');
    });
}