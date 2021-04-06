dispLoading();
var roomkey = "ROOM1";
$(document).ready(function(){
    $('.post-textbox').blur(function() {
        if($(this).val().length === 0){
            $('.post-label').removeClass("focus");
        } else { return; }
    })
    .focus(function() {
        $('.post-label').addClass("focus")
    });
});

var ws;
window.onload = function () {
    if (ws) return;
    // WebSocketサーバーに接続
    ws = new WebSocket("wss://cloud.achex.ca/10secondsns");

    //接続通知
    ws.onopen = function(event) {
        var name = Math.floor( Math.random() * (99999 + 1 - 11111) ) + 11111;
        if ($.cookie("nickname")) {
            name = $.cookie("nickname");
        }
        ws.send(JSON.stringify({"auth":String(name), "passwd":String(name)}));
        removeLoading();
        //メッセージ受信
        ws.onmessage = function(event) {
            var data = JSON.parse(event.data, true);
            if (data.error) {
                swal("エラー", data.error, "error");
                return;
            }
            if (data.content) {
                add(String(data.content), data.FROM);
                return;
            }
            if (data.auth) {
                if (data.auth == "OK") {
                    ws.send(JSON.stringify({"joinHub": roomkey}))
                } else {
                    swal("エラー", "認証に失敗しました。", "error");
                    return;
                }
            }
        };

        //切断
        ws.onclose = function() {
            swal({
                title: "切断されました",
                text: "サーバーから切断されました。",
                icon: "error",
            });
        };
    };

    //エラー発生
    ws.onerror = function(error) {
        console.error(error);
        swal({
            title: "サーバーエラー",
            text: "サーバーエラーが発生しました。",
            icon: "error",
        });
    };
};

function dispLoading() {
    if($("#loading").length == 0){
        $("body").append("<div id='loading'>接続中...</div>");
    }
}
   
function removeLoading() {
    $("#loading").remove();
}

$("#pco").keypress(function(e){
    if(e.which == 13){
        post_f();
    }
});

function post_f () {
    var content = String($("#pco").val());
    if (content.startsWith("setnick:")) {
        var nick_ = "";
        nick_ = content.replace("setnick:", "");
        if (nick_ == "") {
            swal({
                title: "エラー",
                text: "ニックネームを空白にすることは出来ません。",
                icon: "error",
            });
            return;
        }
        $.cookie("nickname", nick_, { expires: 360, path: '/3SecondSNS/',domain: 'narikakun.github.io', secure: true });
        swal({
            title: "成功",
            text: "変更に成功したよ！",
            icon: "success",
        }).then((value) => {
            location.reload();
        });
        return;
    }
    ws.send(JSON.stringify({"toH":roomkey, "content":content}));
    add(content, "自分");
    $("#pco").val("");
}

function add (text, user) {
    if (!text) return;
    var id = String(Math.floor( Math.random() * (99999 + 1 - 11111) ) + 11111);
    $('#board').prepend(`<div class="board-box" id="${id}">${escapeHTML(text)}<span class="box-user">${user}</span></div>`);
    $(`#${id}`).hide().fadeIn('slow');
    setTimeout(() => {
        $(`#${id}`).fadeOut('slow');
        setTimeout(() => {
            $(`#${id}`).remove();            
        }, 500);
    }, 3000);
}

function escapeHTML(string){
    return string.replace(/\&/g, '&amp;')
    .replace(/\</g, '&lt;')
    .replace(/\>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/\'/g, '&#x27');
}