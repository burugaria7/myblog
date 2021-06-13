// sidebar-toc というクラス名の要素のリストを取得し、その最初の要素を取得
var toc = document.getElementsByClassName('sidebar-toc')[0];

function getScrollBottom() {
    var body = window.document.body;
    var html = window.document.documentElement;
    var scrollTop = body.scrollTop || html.scrollTop;
    return html.scrollHeight - html.clientHeight - scrollTop;
}

if (toc) {
    // スクロールが起きたときに関数を実行
    window.addEventListener('scroll', function () {
        // スクロール量が一定値より大きいとき
        // sidebar-toc のクラスに show を追加
        (window.scrollY > 1500 && getScrollBottom() > 500) ? toc.classList.add('showw') : toc.classList.remove('showw');
    });
}