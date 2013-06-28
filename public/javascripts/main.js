
$(function(){
    var MSG = $('#msg');
    var NAME = 'Guest';



    // 令畫面上所有 form 無效
    $('form').submit(function() {
        return false;
    });


    // 變更名字
    $('#btn_login').on('click', function(){
        var text_obj = $('#login');
        var text = $.trim(text_obj.val());

        if(text.length <= 0) {
            text_obj.val('');
            return false;
        }

        server.emit('r_name', {name:text});

        return false;
    });


    // 說話
    $('#btn_say').on('click', function(){
        var text_obj = $('#say');

        var text = $.trim(text_obj.val());
        if(text.length <= 0) {
            text_obj.val('');
            return false;
        }

        server.emit('client', {msg:text});

        text_obj.val('');
        return false;
    });


    // render 結果
    var talk = function(data){
        var type = data.type || '';
        var name = data.name || '';
        var label = '';
        var msg = '';

        switch(name){
            case 'Guest': label = 'label'; break;
            case 'me': label = 'label'; break;
            default: label = 'label label-warning'; break;
        }

        msg = '<p>';
        if(!data.type) {
            msg += '<span class="' + label + '">';
            msg += name;
            msg += '</span>';
        }
        else
        {
            msg += name;
        }

        msg += ' ' + data.msg + '</p>';


        if(MSG.html() === 'no message...') MSG.html('');
        MSG.prepend(msg);
    };


    // monitor server
    var server = io.connect('/im')
        .on("client connect", function(data) {
            talk(merge(data, {msg:'join us!', type:true}));
        })
        .on("client disconnect", function(data) {
            talk(merge(data, {msg:'out here!', type:true}));
        })
        .on("disconnect", function() {
            talk({msg:"server disconnect!", type:true});
        })
        .on('server', function (data) {
            // console.log(data);
            talk(data);
        });
});


// 兩個 obj 合併
var merge = function(obj1, obj2){
    var obj3 = {};
    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
    return obj3;
}