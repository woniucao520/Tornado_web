window.fn.User = {}

window.fn.User.register = function(){
    var username = $('#user-create #username').val();
    var password = $('#user-create #password').val();
    var confirm_pass = $('#user-create #confirm-password').val();
    var realname = $('#user-create #realname').val();
    var mobile = $('#user-create #mobile').val();
    var id_no = $('#user-create #id_no').val();
    var referrer = $('#user-create #referrer').val().trim();    //这个字段的作用是什么？

    var rname = /^[A-Za-z0-9]{6,16}$/

    if(!rname.test(username)){
        ons.notification.alert('用户名只允许使用字母或数字(6~16位)');
        return;
    }

    if(username.length < 6){
        ons.notification.alert('用户名不得少于6个字符');
        return;
    }

    if(confirm_pass !== password){
        ons.notification.alert('两次输入的密码不一致');
        return;
    }

    if(password.length <6){
        ons.notification.alert('密码至少需要6个字符');
        return;
    }

    if(realname.length <2){
        ons.notification.alert('请正确输入真实姓名');
        return;
    }

    var ridno=/^[1-9]{1}[0-9]{14}$|^[1-9]{1}[0-9]{16}([0-9]|[xX])$/;
    if(!ridno.test(id_no)){
        ons.notification.alert('身份证号格式有误');
        return;
    }

    var reg = /^1[0-9]{10}$/;
    if(!reg.test(mobile)){
        ons.notification.alert('手机格式有误');
        return;
    }

    $.ajax({
        method:'post',
        url:'/user/create',
        data:{
            login_name:username,
            login_pass:password,
            realname:realname,
            mobile:mobile,
            id_no:id_no,
            referrer:referrer
            },
        dataType:'json'

    }).done(function(data){
        if(data.result == 'error'){
            ons.notification.alert(data.msg);
        }else{
            ons.notification.toast({message: 'Welcome ' + username, timeout: 1500}).then(function(){
                localStorage.setItem('wx-user-name',username);
                localStorage.setItem('wx-user-id',data.msg);
                localStorage.setItem('wx-user-profile',realname+'|'+mobile+'|'+id_no);

                fn.load('home.html');
            });

        }

    });

}

//验证用户注册的基本信息。
window.fn.User.numregister = function () {
    var username = $('#user-create #username').val();
    var password = $('#user-create #password').val();
    var confirm_password = $('#user-create #confirm-password').val();
    var id_no = $('#user-create #id_no').val();
    var moblie = $('#user-create #mobile').val();

    var rname = /^[A-Za-z0-9]{6,16}$/

    if(!rname.test(username)){
        ons.notification.alert('用户名只允许使用字母或数字(6~16位)');
        return;
    }

    if(username.length < 6){
        ons.notification.alert('用户名不得少于6个字符');
        return;
    }

    if(confirm_pass !== password){
        ons.notification.alert('两次输入的密码不一致');
        return;
    }

    if(password.length <6){
        ons.notification.alert('密码至少需要6个字符');
        return;
    }

    if(realname.length <2){
        ons.notification.alert('请正确输入真实姓名');
        return;
    }

    var ridno=/^[1-9]{1}[0-9]{14}$|^[1-9]{1}[0-9]{16}([0-9]|[xX])$/;
    if(!ridno.test(id_no)){
        ons.notification.alert('身份证号格式有误');
        return;
    }

    var reg = /^1[0-9]{10}$/;
    if(!reg.test(mobile)){
        ons.notification.alert('手机格式有误');
        return;
    }

    $.ajax({
        method:'post',
        url:'/user/create',
        data:{
            login_name:username,
            login_pass:password,
            realname:realname,
            mobile:mobile,
            id_no:id_no,
            referrer:referrer
            },
        dataType:'json'

    }).done(function(data){
        if(data.result == 'error'){
            ons.notification.alert(data.msg);
        }else{
            ons.notification.toast({message: 'Welcome ' + username, timeout: 1500}).then(function(){
                localStorage.setItem('wx-user-name',username);
                localStorage.setItem('wx-user-id',data.msg);
                localStorage.setItem('wx-user-profile',realname+'|'+mobile+'|'+id_no);

                fn.load('home.html');
            });

        }

    });
}


// 用户新增加收货地址
window.fn.User.checkaddress = function () {
    var consignee = $('#add-new-shopaddress #consignee').val();
    var mobile = $('#add-new-shopaddress #mobile').val()

    var province = $('#add-new-shopaddress #sel-province').val();
    var city =$('#add-new-shopaddress #sel-city').val();
    var area=$('#add-new-shopaddress #sel-district').val();

    //将获取的区的id存储到localstrom里
    localStorage.setItem('area_id',area);


    var address = $('#add-new-shopaddress #address').val();
    var zipcode =$('#add-new-shopaddress #zipcode').val();
    if(consignee.length <= 0){
        ons.notification.alert('请填写收件人');
        return;
    }

    if (mobile.length<=0){
        ons.notification.alert('请填写收货号码');
        return;
    }

    if(province == 0){
        ons.notification.alert('填写省');
        return;
    }
    if(city == 0){
        ons.notification.alert('选择市');
        return;
    }
    if (area == 0){
        ons.notification.alert('选择区');
        return;
    }

    if(address.length<=0){
        ons.notification.alert("请填写收货地址");
        return;
    }

    if(zipcode.length<=0){
        ons.notification.alert("注意填写邮政编码！");
        return;
    }
    $.ajax(
        {
            method:'post',
            url:'/user/address_to_database',
            data:{
                consignee:consignee,
                mobile:mobile,
                province:province,
                city:city,
                area:area,
                address:address,
                zipcode:zipcode,
                user_id:localStorage.getItem('wx-user-id')
            },
            dataType: 'json'
        }).done(function (data) {
            if (data.result=='success'){

                ons.notification.alert(data.msg)
             //todo:做一下页面的延时3s，再跳转到load页面，或者用pushPage()
            // fn.load('shop-address.html'
            fn.pushPage({id:'shop-address.html',title:'add_address_list'})

       }




    })

}



//存储选择省份的id
window.fn.User.Getprovince=function () {
    var provinceid = $('#sel-province').val()
    localStorage.setItem('provinceid',provinceid);
    //切换省市区的时候，得清除市和区的记录
    $("#sel-city option:not(:first)").remove()  //删除除第一个以外的元素
    $("#sel-district option:not(:first)").remove()   //隐藏第一个以外的元素

}

//存储选择市的id,并显示对应的城市
window.fn.User.Getcity = function (target) {
    $("#sel-city option:not(:first)").hide()   //删除除第一个以外的元素
    $("#sel-district option:not(:first)").remove()   //隐藏第一个以外的元素

    $.ajax({
        method: 'post',
        url: '/user/show_add_address',
        data: {
            provinceid: localStorage.getItem('provinceid'),

        },
        dataType: 'json'

    }).done(function (data) {
        //显示对应的市
        var select_city = $('#sel-city').children();
        // select_city.remove()
        var provinceid = localStorage.getItem('provinceid');
        var len_province = data.length;
        //alert(lencity);
        for (var i = 0; i < len_province; i++) {
            var len_city = data[i].citys.length
            for (var j = 0; j < len_city; j++) {
                var city_parent_id = data[i].province_id;

                if(city_parent_id == provinceid){
                    var option = '<option value="' + data[i].citys[j].city_id + '">' + data[i].citys[j].city_name + '</option>';
                    $('#sel-city').children().append(option)

                }
            }
        }

    })

}

//显示市下面对应的区
window.fn.User.Getdistrict=function () {
   $("#sel-district option:not(:first)").hide()   //隐藏第一个以外的元素
    var city_id = $("#sel-city").val()
    var provinceid = localStorage.getItem('provinceid',provinceid);

    $.ajax({
        method:'post',
        url: '/user/show_add_address',
        data: {provinceid: localStorage.getItem('provinceid'),
        },
        dataType: 'json'
    }).done(function (data) {
        var len_province = data.length;

        for(i=0; i< len_province; i++) {
            var len_city = data[i].citys.length;
            for (j = 0; j < len_province; j++) {
                if (data[i].province_id == provinceid)
            {

                    var district_length = data[i].citys[j].areas.length;
                    var sel_city_id = data[i].citys[j].city_id;
                    for (k = 0; k < district_length; k++) {
                        if (sel_city_id == city_id) {
                            var option = '<option value="' + data[i].citys[j].areas[k].area_id + '">' + data[i].citys[j].areas[k].area_name + '</option>';
                            $('#sel-district').children().append(option)

                        }
                    }
                }
            }
        }

    })

}

//编辑用户地址
window.fn.User.EditAddress = function (target) {
    var edit_address_id = $(target).attr('data-edit-address-id');
    localStorage.setItem('edit_address_id', edit_address_id);

    $.ajax({
        method: 'post',
        url: '/user/edit_user_address',
        data: {edit_address_id: localStorage.getItem('edit_address_id')},
        dataType: 'json'
    }).done(function (data) {
        fn.load('edit_address.html');
    })
}





//显示单个用户的地址
window.fn.User.edit_user_address= function (target) {
    $.ajax({
        method:'get',
        url:'/user/edit_user_address',
        data:{ edit_address_id:localStorage.getItem('edit_address_id')},
        dataType:'html'
    }).done(function (data) {
        $(target).html(data);
    })


}


//删除用户地址
window.fn.User.AddressDelete = function (target) {
    var area_delete_id = $(target).attr('data-delete-address-id')
     localStorage.setItem('area_delete_id',area_delete_id);
    alert(area_delete_id)

    
    $.ajax({
        method:'post',
        url:'/user/delete_user_address',
        data:{area_delete_id:localStorage.getItem('area_delete_id')},
        dataType:'json'

    }).done(function (data) {
        if(data.result=='success'){
            ons.notification.alert(data.msg);
                $(target).parent().parent().prev().prev().remove()
                $(target).parent().parent().prev().remove()
                $(target).parent().parent().remove()
        }
        else{
             ons.notification.alert(data.msg)
        }


    })


}



window.fn.User.login = function(){
    var username = $('#user-login #username').val()
    var password = $('#user-login #password').val()

    $.ajax({
        method: 'post',
        url:'/user/login',
        data: {login_name: username,login_pass: password},
        dataType:'json'
    }).done(function(data){
        if(data.result == 'success'){
            localStorage.setItem('wx-user-name',username);
            localStorage.setItem('wx-user-id',data.msg);

            fn.load('profile.html');
        }else{
            ons.notification.alert(data.msg).then(function(){
                fn.User.clear()
            })
        }
    });

}

//忘记密码

window.fn.forget_password = function () {
    $.ajax(
        {
            method:'get',
            url:'user/forget_password',
            dataType:'html',
        }
    ).done(function (data) {
        $(target).html(data);
    });
    
}

//发送验证码

window.fn.User.sendcode = function () {
    var mobile = $('#forget-password #mobile').val()

    $.ajax({
        method : 'post',
        url :'/url/sendcode',
        data:{mobile: mobile},
        dataType:'json',
        }
    ).done(function (data) {

       if (data.result=='success'){
             ons.notification.alert("稍等,正在发送~~~~")
       }
        else{
           ons.notification.alert("未知错误，请联系平台~~~")
       }
    });

}
//提交按钮的验证：验证码，以及密码

window.fn.User.identity_check = function () {

    var mobile = $('#forget-password #mobile').val()
    var code = $('#forget-password #code').val()
    var newpassword = $('#forget-password #newpassword').val()
    var confirmnewpassword = $('#forget-password #confirmnewpassword').val()

    if(newpassword.length < 6){
    ons.notification.alert('密碼不得少于6个字符');
    return;
    }


    var reg = /^1[0-9]{10}$/;
    if(!reg.test(mobile)){
    ons.notification.alert('手机格式有误');
    return;
    }

    if(mobile.length==0){
        alert('填寫手機號')
    }
    else if (code.length == 0){
        alert('驗證碼爲輸入')
    }
    else if(newpassword != confirmnewpassword){
        alert('兩次密碼輸入不一致')
    }
    else{
        $.ajax({
            type:'post',
            url:'/url/identity_check',
            data: {mobile: mobile,code:code,newpassword:newpassword,confirmnewpassword:confirmnewpassword,user_id:localStorage.getItem('wx-user-name')},
        }).done(function () {
            alert(data.msg)
        })
    }

}



//     $.ajax(
//         {
//             method :'post',
//             url:'/url/identity_check',
//             data: {mobile: mobile,code:code,newpassword:newpassword,confirmnewpassword:confirmnewpassword},
//             dataType:'json'
//         }).done(function (data) {
//         if (data.result =='success'){
//             ons.notification.alert(data.msg).then(function () {
//                 fn.load('login.html');
//             })
//         }
//         else{
//             ons.notification.alert(data.msg)
//         }
//     });
//
// }

 // demo登录
window.fn.User.ajaxlogin = function () {
    var username = $('#ajax-user-login #username').val()
    var password = $('#ajax-user-login #password').val()

    $.ajax(
        {
            method:'post',
            url:'/user/ajax_login',
            data:{login_name: username,login_pass:password},
            dataType:'json'
    }).done(function(data){
        if(data.result == 'successful'){
            localStorage.setItem('wx-user-name',username); //存储用户名
            localStorage.setItem('wx-user-id',data.msg); // user.id是判断用户是否登录的重要标准   存储msg,data.msg=user.id
            fn.load('profile.html');
            // ons.notification.alert('欢迎进入我的网站')

        }else{
            ons.notification.alert("测试用户不存在").then(function(){
                fn.User.clear()
            })
        }
    });

}


//



window.fn.User.message = function () {

    var comments = $('#message #comments').val()
    var user_name = $('#message #user_name').val()

    if (user_name.length ==0){
        alert("请输入昵称");
    }
    else if(comments.length ==0){
        alert("请输入留言内容")
    }
    else{
        $.ajax({
            type: 'post',
            url:"/user/message",
            data:{
                user_name:user_name,
                comments: comments,
                check_status:'0',


            },
            dataType:'json'
        }).done(function (data) {

            ons.notification.alert('留言成功')


            // var html ="";
            // for(var i=0;i<data.length;i++){
            //     var ls = data[i];
            //     html +="<li><a href=''>"+ls.comment+"</a><p>"+ls.user_name+" </p></li>"
            //     alert(html)
            // }
            // html_new="<div id=\"message-list-content\" style=\"text-align:center; margin-top:30px;\"<li><p>名字："+data.user_name+"</p><p>内容:"+data.comments+"</p><p>内容:"+data.create_time+"</p></li></div>"

            html_new="<ons-list-item >\n" +
                "     <div class=\"left\" onclick=\"fn.load('user-update.html')\">\n" +
                "            <img class=\"list-item__thumbnail\" src=\"http://placekitten.com/g/40/40\" />\n" +
                "        </div>\n" +
                "        <div class=\"center\" onclick=\"fn.load('user-update.html')\">\n" +
                "            <span class=\"list-item__title\" id=\"h-user-title\">"+data.user_name+"</span>\n" +
                "            <span class=\"list-item__subtitle\" id=\"h-user-subtitle\">"+data.comments+"</span>\n" +
                "            <span class=\"list-item__subtitle\" id=\"h-user-subtitle\">"+data.create_time+"</span>\n" +
                "        </div>\n" +
                "        <div class=\"right\">\n" +
                "            <ons-icon icon=\"fa-qrcode\" size=\"20px\" onclick=\"showQRCode()\"></ons-icon>\n" +
                "        </div>\n" +
                "    </ons-list-item>"



            // localStorage.setItem('message_id',data.msg);   //localStorage存儲id

            $('#add-new-event').after(html_new);
            $('#comments').val('');    //清楚textarea文本域的内容
            $('#user_name').val('');

        })
    }

}

//获取留言列表
window.fn.User.getComment = function (target) {
     $.ajax({
            method: 'get',
            url:'/user/message',
            data:{top_flag_id: localStorage.getItem('top_flag_id'),addition_id:localStorage.getItem('addition_id'), user_id: localStorage.getItem('wx-user-id')},
            dataType:'html'
        }).done(function(data){
            $(target).html(data);
        });
}


//留言详情显示
window.fn.User.Commentdetail=function (target) {
    $.ajax(
        {
            method: 'get',
            url:'/user/message_details',
            data:{message_id: localStorage.getItem('message_id')},
            dataType:'html'
        }
    ).done(function (data) {
        $(target).html(data);
    })
}


// 留言的删除
window.fn.User.MessageDelete = function(target) {

    delete_id = $(target).attr('remove_id')
    localStorage.setItem('delete_id',delete_id);

    $.ajax(
        {
            method:'post',
            url:'/user/message_delete',
            data:{delete_id: localStorage.getItem('delete_id')},
            dataType:'json'
        }
    ).done(function (data) {
        if(data.result=='success'){
            ons.notification.alert(data.msg);
           $(target).parent().parent().remove()

        }
        else{
             ons.notification.alert(data.msg)
        }
    })
}



//置顶操作
window.fn.User.MessageTop = function (target) {
    top_flag_id = $(target).attr('top_message_id')
    localStorage.setItem('top_flag_id',top_flag_id);
    alert(top_flag_id)
// 置定的dom操作
    var  $top_item_list =$(target).parent().parent();
        $top_item_list.fadeOut().fadeIn();
            $('.list').prepend($top_item_list)

}



//追加评论的功能
window.fn.User.Addition = function (target) {
    addition_id = $(target).attr('addition_id')
    localStorage.setItem('addition_id', addition_id)
    alert(addition_id)
    var addtion_comment = "\n" +
        "<div id=\"add_message\" style=\"text-align:left;margin-left: 50px;margin-top: 30px\">\n" +
        "    <a>请输入昵称:</a>\n" +
        "    <a> <ons-input id=\"user_name\" name=\"user_name\" modifier=\"underbar\" placeholder=\"昵称\" float></ons-input></a>\n" +
        "    <p > 請輸入您的留言:</p>\n" +
        "\n" +
        "     <textarea  rows=\"10\" cols=\"40\" id='comments' name=\"comments\" placeholder=\"请填写~~~~~\"></textarea> <!--將textarea居中显示-->\n" +
        "\n" +
        "\n" +
        "\n" +
        "        <p id=\"add-new-event\" style=\"margin-left: 6.5cm\">\n" +
        "            <ons-button id =\"reply-commit-button\" onclick=\"fn.User.addmessage(this)\">提交</ons-button>\n" +
        "        </p>\n" +
        "\n" +
        "</div>"

    $(target).parent().prev().children('#reply_message_list').children().children().children('span').hide();
    $(target).parent().prev().append(addtion_comment);

    $.ajax({
                method:'get',
                url:'/user/message_addition',
                data:{

                    addition_id:localStorage.getItem('addition_id'),
                },
                dataType:'html'

            }).done(function (data) {

                 $(target).html(data)
    })
}


//追加评论的功能
window.fn.User.addmessage = function (target) {
    // alert('******'+addition_id)
    var comments = $('#add_message #comments').val()
    var user_name = $('#add_message #user_name').val()

        if (user_name.length ==0){
        ons.notification.alert("******请输入昵称*****");
        }
        else if(comments.length ==0){
        ons.notification.alert("*****请输入留言内容*****")
        }
        else{

            $.ajax({
                method:'post',
                url:'/user/message_addition',
                data:{
                    user_name:user_name,
                    comments: comments,
                    check_status:'2',

                    parentid:localStorage.getItem('addition_id'),
                },
                dataType:'json'

            }).done(function (data) {
                 ons.notification.alert("测试成功");
                $('#add_message').hide()    //

                 var reply_comment =
                     " <div id=\"list_add_message\" >\n" +

                            // "            <span class=\"list-item__title\" id=\"h-user-title\">"+data.user_name+"</span>\n" +
                            // "            <span class=\"list-item__subtitle\" id=\"h-user-subtitle\">"+data.comments+"</span>\n" +
                            // "            <span class=\"list-item__subtitle\" id=\"h-user-subtitle\">"+data.create_time+"</span>\n" +
                     "<ul>\n" +
                     "                                <li>回复人："+data.user_name+"\n" +
                     "                                回复内容："+data.comments+"\n" +
                     "                                回复时间："+data.create_time+"</li>\n" +
                     "                            </ul>"
                            "        </div>"


                // $(target).parent().parent().after(reply_comment)  //插入节点的位置。
                //$(target).parent().parent().prev().children('[data-topic-id]').children('#reply_message_list').children().append(reply_comment)
    $(target).parent().parent().prev().children().children().append(reply_comment)



            })
        }
}

// 文章点赞功能

window.fn.User.GivePraise = function (target) {
    praise_id = $(target).attr('praise_id')
    localStorage.setItem('praise_id', praise_id)  //存储留言的id
    //将颜色变成红色
    $.ajax({
        method: 'get',
        url:'/user/getpraise',
        data: {praise_id:localStorage.getItem('praise_id'),username: localStorage.getItem('wx-user-name'), user_id: localStorage.getItem('wx-user-id')},
        dataType:'json'
    }).done(function(data){
//$(target).html(data);
         if(data.result == 'success'){
                ons.notification.alert(data.msg)
                var text_num = $(target).children().text()    //text()获取里面的数字

                $(target).children().replaceWith("<ons-icon style='color: red' size=\"20px\" icon='md-face'><a style=\"color: red\">["+data.praise_num+"]</a></ons-icon>")

            }
            else{
                ons.notification.alert(data.msg);
                var praise_num = "<ons-icon size=\"20px\"  icon=\"md-face\"><a style=\"color: #0d6aad\">["+data.praise_num+"]</a>\n"
                $(target).children().replaceWith(praise_num)

            }

    });
}





window.fn.User.clear = function(){   //localstorage里 清出记录
    localStorage.removeItem('wx-user-name');
    localStorage.removeItem('wx-user-id');
    localStorage.removeItem('wx-user-profile')
}

window.fn.User.getLoginId = function(){
    return localStorage.getItem('wx-user-id')
}

window.fn.User.getCreateForm = function(target){
    $.ajax({
            method: 'get',
            url:'/user/create',
            dataType:'html'
        }).done(function(data){
            $(target).html(data);
        });
}

//实现用户注册的ajax的接口

window.fn.User.getNumRegistered = function (target) {
    $.ajax({
        method:'get',
        url:'url/numregistered',
        dataType:'html',
    }).done(function (data) {
        $(target).html(data);
    })

}

window.fn.User.getConsoleHtml = function(target){
    $.ajax({
            method: 'post',
            url:'/user/console',
            data: {username: localStorage.getItem('wx-user-name'), user_id: localStorage.getItem('wx-user-id')},
            dataType:'html'
        }).done(function(data){
            $(target).html(data);
        });
}

window.fn.User.ajaxGetProfileHtml = function(target){
    $.ajax({
            method: 'post',
            url:'/user/profile',
            data: {username: localStorage.getItem('wx-user-name'), user_id: localStorage.getItem('wx-user-id')},
            dataType:'html'
        }).done(function(data){
            $(target).html(data);
        });
}

window.fn.User.ajaxUpdateProfile = function(f, v){
    var msg = '姓名';
    if(f == 'mobile')
        msg = '手机号码';
    if(f == 'id_no')
        msg = '身份证编号';

    ons.notification.prompt(msg,{defaultValue:v}).then(function(value){
        if(value == v)
            return;

        $.ajax({
            method:'post',
            url:'/user/update',
            data:{user_id: localStorage.getItem('wx-user-id'),flag:f,value:value},
            dataType:'json'
        }).done(function(data){
            if(data.result == 'success'){
                $('#user-update #'+f).html(value);
            }else{
                ons.notification.alert(data.msg);
            }
        });
    });
}

window.fn.User.ajaxWalletHtml = function(target){
    $.ajax({
            method: 'post',
            url:'/user/wallet',
            data: {username: localStorage.getItem('wx-user-name'), user_id: localStorage.getItem('wx-user-id')},
            dataType:'html'
        }).done(function(data){
            $(target).html(data);
        });
}

window.fn.User.ajaxOrdersHtml = function(target){
    $.ajax({
            method: 'post',
            url:'/user/orders',
            data: {username: localStorage.getItem('wx-user-name'), user_id: localStorage.getItem('wx-user-id')},
            dataType:'html'
        }).done(function(data){
            $(target).html(data);
        });
}

//第一步：显示添加地址按钮
window.fn.User.start_add_address = function (target) {
    $.ajax({
        method:'get',
        url:'/user/start_add_address',
        data:{user_id: localStorage.getItem('wx-user-id')},
        dataType:'html'
    }).done(function (data) {
        $(target).html(data);
    })

}
//第二步：渲染出填写页面
window.fn.User.show_shop_address = function (target) {
    $.ajax({
        method :'get',
        url :'/user/show_add_address',
        data:{user_id: localStorage.getItem('wx-user-id')},
        dataType:'html'
    }).done(function (data) {
       $(target).html(data);
        // // 将对应的市显示出来
        // var selcity = $('#sel-city');
        // provinceid = localStorage.getItem('provinceid');
        // selcity.empty();

        //
        // var lencity = data['area_citys'].length;
        // alert(data.test)
        // for (var i = 0; i<lencity; i++){
        //     if(data.area_citys[1] == provinceid){
        //         var option = '<option value="'+data.area_citys[0]+'">'+data.area_citys[2]+'</option>';
        //         selcity.append(option);
        //     }
        // }


    })
}






window.fn.User.ajaxWithdrawHtml = function(target){
    $.ajax({
            method: 'get',
            url:'/user/withdraw',
            data: {username: localStorage.getItem('wx-user-name'), user_id: localStorage.getItem('wx-user-id')},
            dataType:'html'
        }).done(function(data){
            $(target).html(data);
        });
}

window.fn.User.saveBankInfo = function(){
    var bank_no = $('#user-new-bank #bank_no').val();
    var bank_account_name = $('#user-new-bank #bank_account_name').val();
    var bank_province = $('#user-new-bank #bank_province').val();
    var bank_city = $('#user-new-bank #bank_city').val();
    var bank_name = $('#user-new-bank #bank_name').val();
    var bank_branch_name = $('#user-new-bank #bank_branch_name').val();
    var is_default = document.getElementById('check-is-default-bank').checked ? 1 : 0;

    var reg = /^\d+$/g

    if(!reg.test(bank_no)){
       ons.notification.alert('银行帐号格式有误!');
       return;
    }

    if(bank_account_name.length < 2){
       ons.notification.alert('帐号名称格式有误!');
       return;
    }

    if(bank_province.length<2){
       ons.notification.alert('所在省份格式有误!');
       return;
    }

    if(bank_city.length<2){
       ons.notification.alert('所在城市格式有误!');
       return;
    }

    if(bank_name.length<2){
       ons.notification.alert('开户银行格式有误!');
       return;
    }

    if(bank_branch_name.length<4){
       ons.notification.alert('所在支行格式有误!');
       return;
    }

    $.ajax({
            method: 'post',
            url:'/bank/create',
            data: {bank_no: bank_no, bank_account_name:bank_account_name,bank_province:bank_province,bank_city:bank_city,bank_name:bank_name,bank_branch_name:bank_branch_name,is_default:is_default, user_id: localStorage.getItem('wx-user-id')},
            dataType:'json'
        }).done(function(data){
            if(data.result=='success'){
                fn.load('user-update.html');
            }else{
                ons.notification.alert(data.msg);
            }
        });

}

window.fn.User.doWithdraw = function(maxValue){
    var bank_id = $('#user-withdraw #choose-bank-id').val();
    var amount = parseFloat($('#user-withdraw #withdraw-amount').val());

    if(isNaN(amount)){
        ons.notification.alert('提现金额格式有误!');
        return;
    }

    if(amount > parseFloat(maxValue)){
        ons.notification.alert('提现金额不得大于:'+maxValue+'!');
        return;
    }

    $.ajax({
        method:'post',
        url:'/user/withdraw',
        data:{user_id: localStorage.getItem('wx-user-id'),bank_id:bank_id,amount:amount},
        dataType:'json'
    }).done(function(data){
        if(data.result == 'success'){
            ons.notification.alert('您的提现申请已提交，我们会在T+1个工作日内处理完成，请耐心等待！').then(function(){
                fn.load('user-withdraw-history.html');
            });
        }else{
            ons.notification.alert(data.msg);
        }
    });
}

window.fn.User.ajaxWithdrawHistoryHtml = function(target){
    $.ajax({
            method: 'post',
            url:'/user/withdraw-history',
            data: {username: localStorage.getItem('wx-user-name'), user_id: localStorage.getItem('wx-user-id')},
            dataType:'html'
        }).done(function(data){
            $(target).html(data);
        });
}

window.fn.User.ajaxDepositHistoryHtml = function(target){
    $.ajax({
            method: 'post',
            url:'/user/deposit-history',
            data: {username: localStorage.getItem('wx-user-name'), user_id: localStorage.getItem('wx-user-id')},
            dataType:'html'
        }).done(function(data){
            $(target).html(data);
        });
}